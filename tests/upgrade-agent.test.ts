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
