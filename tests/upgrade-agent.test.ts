import { describe, it, expect, beforeEach } from 'vitest';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, existsSync, symlinkSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

// Runs the real upgrade-agent.sh against a throwaway root with a stub update.sh.
let root: string;

function setup(stubExit: number, current = '2.0.0'): void {
  root = mkdtempSync(join(tmpdir(), 'mq-agent-'));
  mkdirSync(join(root, 'scripts'));
  for (const f of ['upgrade-agent.sh', 'lib.sh']) copyFileSync(join('scripts', f), join(root, 'scripts', f));
  chmodSync(join(root, 'scripts', 'upgrade-agent.sh'), 0o755);
  writeFileSync(join(root, 'update.sh'), `#!/usr/bin/env bash\necho "stub update $*" \nexit ${stubExit}\n`, { mode: 0o755 });
  mkdirSync(join(root, 'upgrade'));
  mkdirSync(join(root, 'upgrade-status'));
  writeFileSync(join(root, '.env'), `MATHQUEST_VERSION=${current}\n`);
}
const run = (): { code: number; status: Record<string, unknown> | null; log: string } => {
  const r = spawnSync('bash', [join(root, 'scripts', 'upgrade-agent.sh'), '--run'], { encoding: 'utf8' });
  const sp = join(root, 'upgrade-status', 'status.json');
  const lp = join(root, 'upgrade-status', 'upgrade.log');
  return { code: r.status ?? -1, status: existsSync(sp) ? (JSON.parse(readFileSync(sp, 'utf8')) as Record<string, unknown>) : null, log: existsSync(lp) ? readFileSync(lp, 'utf8') : '' };
};
const req = (o: Record<string, unknown>): void =>
  writeFileSync(join(root, 'upgrade', 'request.json'), JSON.stringify({ requestId: '3f2b8c1e-4d5a-4b6c-9d7e-1a2b3c4d5e6f', requestedAt: 'x', from: '2.0.0', ...o }));

describe('upgrade agent', () => {
  beforeEach(() => setup(0));

  it('does nothing without a request', () => {
    expect(run().status).toBeNull();
  });

  it('runs update.sh for a valid upgrade request and reports success', () => {
    req({ version: '2.1.0' });
    const r = run();
    expect(r.status).toMatchObject({ state: 'succeeded', version: '2.1.0' });
    expect(r.log).toContain('stub update --version 2.1.0');
    expect(existsSync(join(root, 'upgrade', 'request.json'))).toBe(false);
  });

  it('maps update.sh exit codes to status', () => {
    setup(20);
    req({ version: '2.1.0' });
    expect(run().status).toMatchObject({ state: 'rolled_back' });
    setup(21);
    req({ version: '2.1.0' });
    expect(run().status).toMatchObject({ state: 'failed' });
    setup(1);
    req({ version: '2.1.0' });
    expect(run().status).toMatchObject({ state: 'failed' });
  });

  it('refuses downgrades and same-version requests', () => {
    req({ version: '1.9.0' });
    const r = run();
    expect(r.status).toMatchObject({ state: 'failed' });
    expect(r.log).not.toContain('stub update');
    setup(0);
    req({ version: '2.0.0' });
    expect(run().log).not.toContain('stub update');
  });

  it.each([
    ['shell metacharacters in the version', { version: '2.1.0; touch /tmp/pwned' }],
    ['a prerelease version', { version: '2.1.0-rc1' }],
    ['path traversal', { version: '../../etc/passwd' }],
    ['an unexpected key', { version: '2.1.0', command: 'rm -rf /' }],
    ['a bad request id', { version: '2.1.0', requestId: 'not-a-uuid' }],
  ])('rejects %s without running anything', (_name, body) => {
    req(body);
    const r = run();
    expect(r.status).toMatchObject({ state: 'failed' });
    expect(r.log).not.toContain('stub update');
  });

  it('rejects non-JSON and oversized requests', () => {
    writeFileSync(join(root, 'upgrade', 'request.json'), 'version=2.1.0; rm -rf /');
    expect(run().log).not.toContain('stub update');
    setup(0);
    writeFileSync(join(root, 'upgrade', 'request.json'), JSON.stringify({ version: '2.1.0', pad: 'x'.repeat(5000) }));
    const r = run();
    expect(r.status).toMatchObject({ state: 'failed' });
    expect(r.log).not.toContain('stub update');
  });

  it('never follows a symlinked request', () => {
    writeFileSync(join(root, 'target.json'), JSON.stringify({ requestId: '3f2b8c1e-4d5a-4b6c-9d7e-1a2b3c4d5e6f', version: '2.1.0' }));
    symlinkSync(join(root, 'target.json'), join(root, 'upgrade', 'request.json'));
    const r = run();
    expect(r.status).toMatchObject({ state: 'failed' });
    expect(r.log).not.toContain('stub update');
    expect(existsSync(join(root, 'target.json'))).toBe(true); // the link was removed, not its target
  });

  it('does not copy request text into the status the container can read', () => {
    req({ version: '2.1.0', command: 'SECRET-PAYLOAD' });
    const r = run();
    expect(JSON.stringify(r.status)).not.toContain('SECRET-PAYLOAD');
    expect(r.log).not.toContain('SECRET-PAYLOAD');
  });
});

describe('upgrade agent: richer status', () => {
  /** A stub update.sh that reports a stage, logs a reason, and exits with `code`. */
  function stub(code: number, step: string, n: number, error?: string, backup = '/data/backups/mathquest-2026-11-21T01-00-00-000Z.db'): void {
    setup(code);
    mkdirSync(join(root, '.state'), { recursive: true });
    writeFileSync(
      join(root, 'update.sh'),
      `#!/usr/bin/env bash\nsource "$(dirname "$0")/scripts/lib.sh"\necho '${backup}' >"$ROOT_DIR/.state/last_backup"\nprogress ${n} 5 ${step}\n${error ? `log "ERROR: ${error}"\n` : ''}exit ${code}\n`,
      { mode: 0o755 },
    );
  }

  it('touches a heartbeat every run, even with nothing to do', () => {
    setup(0);
    expect(existsSync(join(root, 'upgrade-status', 'heartbeat'))).toBe(false);
    run();
    expect(existsSync(join(root, 'upgrade-status', 'heartbeat'))).toBe(true);
  });

  it('records the stage, start and finish times and the backup file name on success', () => {
    stub(0, 'health', 5);
    req({ version: '2.1.0' });
    const s = run().status!;
    expect(s).toMatchObject({ state: 'succeeded', step: 'done', stepNumber: 5, stepCount: 5, error: null, backupFile: 'mathquest-2026-11-21T01-00-00-000Z.db' });
    expect(s.startedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(s.finishedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('names the stage that failed and the reason, for a failure before anything changed', () => {
    stub(1, 'verify', 3, 'signature check failed for ghcr.io/parabyte-ca/mathquest:2.1.0: no matching signatures');
    req({ version: '2.1.0' });
    const s = run().status!;
    expect(s).toMatchObject({ state: 'failed', step: 'verify', stepNumber: 3, stepCount: 5 });
    expect(s.error).toBe('signature check failed for ghcr.io/parabyte-ca/mathquest:2.1.0: no matching signatures');
  });

  it('reports a rollback with the stage that went wrong', () => {
    stub(20, 'rollback', 5, 'v2.1.0 did not become healthy');
    req({ version: '2.1.0' });
    expect(run().status).toMatchObject({ state: 'rolled_back', step: 'rollback', error: expect.stringContaining('did not become healthy') });
  });

  it('keeps old progress and errors out of a new request, and out of rejected requests', () => {
    writeFileSync(join(root, 'upgrade-status', 'progress.json'), JSON.stringify({ step: 'deploy', stepNumber: 4, stepCount: 5 }));
    req({ version: '1.0.0' }); // a downgrade: refused before anything runs
    const s = run().status!;
    expect(s).toMatchObject({ state: 'failed', step: null, error: null });
    expect(existsSync(join(root, 'upgrade-status', 'progress.json'))).toBe(false);
  });

  it('does not blame a failure on an error left in the log by an earlier run', () => {
    stub(1, 'backup', 1); // fails without logging a reason this time
    writeFileSync(join(root, 'upgrade-status', 'upgrade.log'), '2026-11-01T00:00:00Z ERROR: an old problem\n');
    req({ version: '2.1.0' });
    expect(run().status).toMatchObject({ state: 'failed', error: null, step: 'backup' });
  });

  it('never puts a path in the status: only the backup file name', () => {
    stub(0, 'health', 5, undefined, '/mnt/pool/apps/mathquest/data/backups/mathquest-x.db');
    req({ version: '2.1.0' });
    const s = run().status!;
    expect(s.backupFile).toBe('mathquest-x.db');
    expect(JSON.stringify(s)).not.toContain('/mnt/');
  });
});
