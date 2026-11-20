import { describe, it, expect } from 'vitest';
import { mkdtempSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { addUser, makeEnv, signIn } from './helpers.js';
import { readStatus } from '../server/routes/updates.js';

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
