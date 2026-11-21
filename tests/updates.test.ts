import { describe, it, expect, afterEach } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { mkdtempSync, existsSync, readFileSync, writeFileSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { addUser, makeEnv, signIn } from './helpers.js';
import { agentSeen, clearReleaseCache, readStatus } from '../server/routes/updates.js';

function envWithDirs() {
  const root = mkdtempSync(join(tmpdir(), 'mq-upd-'));
  const upgradeDir = join(root, 'upgrade');
  const statusDir = join(root, 'status');
  const env = makeEnv({ UPGRADE_DIR: upgradeDir, UPGRADE_STATUS_DIR: statusDir });
  return { env, upgradeDir, statusDir, root };
}

describe('admin upgrade requests', () => {
  it('writes a request file for an admin and rejects caregivers', async () => {
    const { env, upgradeDir } = envWithDirs();
    addUser(env, 'admin@example.com', 'admin');
    addUser(env, 'cg@example.com');
    const cg = await signIn(env, 'cg@example.com');
    await cg.agent.post('/api/admin/updates/request').set('x-csrf-token', cg.csrf).send({ version: '2.1.0' }).expect(403);
    const ad = await signIn(env, 'admin@example.com');
    await ad.agent.post('/api/admin/updates/request').set('x-csrf-token', ad.csrf).send({ version: '2.1.0' }).expect(202);
    const body = JSON.parse(readFileSync(join(upgradeDir, 'request.json'), 'utf8')) as { version: string; requestId: string };
    expect(body.version).toBe('2.1.0');
    expect(body.requestId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('refuses a second request while one is pending and rejects bad versions', async () => {
    const { env, upgradeDir } = envWithDirs();
    addUser(env, 'admin@example.com', 'admin');
    const ad = await signIn(env, 'admin@example.com');
    for (const v of ['2.1', '2.1.0; rm -rf /', '../x', '2.1.0-rc1', '']) {
      await ad.agent.post('/api/admin/updates/request').set('x-csrf-token', ad.csrf).send({ version: v }).expect(400);
    }
    expect(existsSync(join(upgradeDir, 'request.json'))).toBe(false);
    await ad.agent.post('/api/admin/updates/request').set('x-csrf-token', ad.csrf).send({ version: '2.1.0' }).expect(202);
    await ad.agent.post('/api/admin/updates/request').set('x-csrf-token', ad.csrf).send({ version: '2.2.0' }).expect(409);
  });

  it('records the request in the audit log', async () => {
    const { env } = envWithDirs();
    addUser(env, 'admin@example.com', 'admin');
    const ad = await signIn(env, 'admin@example.com');
    await ad.agent.post('/api/admin/updates/request').set('x-csrf-token', ad.csrf).send({ version: '2.1.0' }).expect(202);
    const rows = env.db.prepare("SELECT action, target FROM audit_log WHERE action = 'upgrade.request'").all();
    expect(rows).toEqual([{ action: 'upgrade.request', target: '2.1.0' }]);
  });
});

describe('status folder is treated as untrusted', () => {
  it('returns idle for missing, oversized, malformed or foreign content', () => {
    const { statusDir, env } = envWithDirs();
    void env;
    expect(readStatus(statusDir).state).toBe('idle');
    const dir = mkdtempSync(join(tmpdir(), 'mq-st-'));
    writeFileSync(join(dir, 'status.json'), 'not json');
    expect(readStatus(dir).state).toBe('idle');
    writeFileSync(join(dir, 'status.json'), JSON.stringify({ state: 'rm -rf', message: 'x'.repeat(5000), version: '1.0; x' }));
    expect(readStatus(dir)).toMatchObject({ state: 'idle', version: null });
    writeFileSync(join(dir, 'status.json'), JSON.stringify({ state: 'running', message: 'y'.repeat(9000), version: '2.1.0' }));
    const s = readStatus(dir);
    expect(s.state).toBe('idle'); // > 8 KB is ignored outright
    writeFileSync(join(dir, 'status.json'), JSON.stringify({ state: 'running', message: 'y'.repeat(2000), version: '2.1.0' }));
    expect(readStatus(dir).message.length).toBeLessThanOrEqual(300);
  });
});

describe('richer upgrade status', () => {
  it('reads the stage, reason, times and backup name, and ignores anything out of shape', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mq-st2-'));
    writeFileSync(join(dir, 'status.json'), JSON.stringify({
      state: 'failed', message: 'Update failed', version: '2.5.0', previousVersion: '2.4.0', step: 'verify', stepNumber: 3, stepCount: 5,
      error: 'e'.repeat(2000), startedAt: '2026-11-21T01:00:00Z', finishedAt: '2026-11-21T01:02:00Z', backupFile: 'mathquest-2026.db', updatedAt: '2026-11-21T01:02:00Z',
    }));
    expect(readStatus(dir)).toMatchObject({ state: 'failed', step: 'verify', stepNumber: 3, stepCount: 5, startedAt: '2026-11-21T01:00:00Z', finishedAt: '2026-11-21T01:02:00Z', backupFile: 'mathquest-2026.db' });
    expect(readStatus(dir).error!.length).toBe(300);
    writeFileSync(join(dir, 'status.json'), JSON.stringify({ state: 'failed', step: 'rm -rf /', stepNumber: 9999, stepCount: -1, startedAt: 'yesterday', finishedAt: '<script>', backupFile: '../../etc/passwd', error: 42 }));
    expect(readStatus(dir)).toMatchObject({ step: null, stepNumber: null, stepCount: null, startedAt: null, finishedAt: null, backupFile: null, error: null });
    writeFileSync(join(dir, 'status.json'), JSON.stringify({ state: 'failed', backupFile: '/etc/passwd' }));
    expect(readStatus(dir).backupFile).toBeNull(); // a path is never accepted
  });

  it('takes the live stage from progress.json only while an upgrade is running', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mq-st3-'));
    writeFileSync(join(dir, 'progress.json'), JSON.stringify({ step: 'deploy', stepNumber: 4, stepCount: 5 }));
    writeFileSync(join(dir, 'status.json'), JSON.stringify({ state: 'running', version: '2.5.0' }));
    expect(readStatus(dir)).toMatchObject({ step: 'deploy', stepNumber: 4, stepCount: 5 });
    writeFileSync(join(dir, 'status.json'), JSON.stringify({ state: 'succeeded', version: '2.5.0', step: 'done', stepNumber: 5, stepCount: 5 }));
    expect(readStatus(dir)).toMatchObject({ step: 'done', stepNumber: 5 }); // the final status wins once it is over
    writeFileSync(join(dir, 'progress.json'), JSON.stringify({ step: 'not-a-step', stepNumber: 4 }));
    writeFileSync(join(dir, 'status.json'), JSON.stringify({ state: 'running' }));
    expect(readStatus(dir).step).toBeNull();
  });

  it('tells whether the host agent has checked in lately', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mq-hb-'));
    const now = Date.now();
    expect(agentSeen(dir, now)).toEqual({ seenAt: null, ok: false });
    writeFileSync(join(dir, 'heartbeat'), '');
    expect(agentSeen(dir, now)).toMatchObject({ ok: true });
    utimesSync(join(dir, 'heartbeat'), new Date(now - 10 * 60_000), new Date(now - 10 * 60_000));
    const stale = agentSeen(dir, now);
    expect(stale.ok).toBe(false);
    expect(stale.seenAt).not.toBeNull();
  });
});

describe('release notes for every version in between', () => {
  let server: http.Server;
  let releases: { status: number; latest: object | null; list: object[] | null };
  const rel = (v: string, extra: object = {}) => ({ tag_name: `v${v}`, body: `Notes for ${v}`, html_url: `https://example.invalid/${v}`, ...extra });

  async function start() {
    server = http.createServer((req, res) => {
      const send = (status: number, body: unknown) => res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(body));
      if (releases.status !== 200) return send(releases.status, {});
      if (req.url === '/releases/latest') return send(200, releases.latest);
      if (req.url?.startsWith('/releases?')) return releases.list ? send(200, releases.list) : send(404, {});
      send(404, {});
    });
    await new Promise<void>((ok) => server.listen(0, '127.0.0.1', ok));
    return `http://127.0.0.1:${(server.address() as AddressInfo).port}/releases/latest`;
  }
  afterEach(() => server.close());
  const signedIn = new WeakMap<object, Awaited<ReturnType<typeof signIn>>>();
  const get = async (env: ReturnType<typeof makeEnv>) => {
    if (!signedIn.has(env)) {
      addUser(env, 'admin@x.ca', 'admin');
      signedIn.set(env, await signIn(env, 'admin@x.ca'));
    }
    return (await signedIn.get(env)!.agent.get('/api/admin/updates').expect(200)).body;
  };

  it('lists newer releases, newest first, without drafts, prereleases or older ones', async () => {
    clearReleaseCache();
    releases = { status: 200, latest: rel('99.0.0'), list: [rel('99.0.0'), rel('98.1.0'), rel('98.0.0', { draft: true }), rel('97.0.0', { prerelease: true }), rel('96.0.0'), rel('0.0.1')] };
    const env = makeEnv({ RELEASES_URL: await start() });
    const body = await get(env);
    expect(body.latest.version).toBe('99.0.0');
    expect(body.between.map((r: { version: string }) => r.version)).toEqual(['99.0.0', '98.1.0', '96.0.0']);
    expect(body.between[1].notes).toBe('Notes for 98.1.0');
    expect(body.updateAvailable).toBe(true);
  });

  it('falls back to the latest release alone when the list cannot be read', async () => {
    clearReleaseCache();
    releases = { status: 200, latest: rel('99.0.0'), list: null };
    const body = await get(makeEnv({ RELEASES_URL: await start() }));
    expect(body.between.map((r: { version: string }) => r.version)).toEqual(['99.0.0']);
  });

  it('explains a failing release check instead of failing the page', async () => {
    clearReleaseCache();
    releases = { status: 503, latest: null, list: null };
    const body = await get(makeEnv({ RELEASES_URL: await start() }));
    expect(body).toMatchObject({ latest: null, between: [], updateAvailable: false });
    expect(body.releaseError).toContain('503');
  });

  it('reports the agent heartbeat on the page', async () => {
    clearReleaseCache();
    releases = { status: 200, latest: rel('99.0.0'), list: [rel('99.0.0')] };
    const statusDir = mkdtempSync(join(tmpdir(), 'mq-hb2-'));
    const env = makeEnv({ RELEASES_URL: await start(), UPGRADE_STATUS_DIR: statusDir });
    expect((await get(env)).agent).toEqual({ seenAt: null, ok: false });
    writeFileSync(join(statusDir, 'heartbeat'), '');
    expect((await get(env)).agent.ok).toBe(true);
  });
});
