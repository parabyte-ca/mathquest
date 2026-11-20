import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, existsSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

// Exercises ensure_cosign and the verify_image error path from scripts/lib.sh with stand-in binaries.
function root(opts: { installer: 'works' | 'fails' }): string {
  const r = mkdtempSync(join(tmpdir(), 'mq-cosign-'));
  mkdirSync(join(r, 'scripts'));
  copyFileSync(join('scripts', 'lib.sh'), join(r, 'scripts', 'lib.sh'));
  const installer =
    opts.installer === 'works'
      ? '#!/usr/bin/env bash\nmkdir -p "$(dirname "$0")/../.state/bin"\nprintf \'#!/usr/bin/env bash\\necho "signature mismatch" >&2\\nexit 1\\n\' > "$(dirname "$0")/../.state/bin/cosign"\nchmod 755 "$(dirname "$0")/../.state/bin/cosign"\n'
      : '#!/usr/bin/env bash\nexit 1\n';
  writeFileSync(join(r, 'scripts', 'install-cosign.sh'), installer, { mode: 0o755 });
  return r;
}
const bash = (r: string, script: string) =>
  spawnSync('bash', ['-c', `source "${join(r, 'scripts', 'lib.sh')}"; ${script}`], { encoding: 'utf8', env: { ...process.env, PATH: '/usr/bin:/bin' } });

describe('cosign handling in lib.sh', () => {
  it('installs cosign into .state/bin the first time it is needed, then reuses it', () => {
    const r = root({ installer: 'works' });
    const first = bash(r, 'ensure_cosign');
    expect(first.status).toBe(0);
    expect(first.stdout.trim()).toBe(join(r, '.state', 'bin', 'cosign'));
    expect(existsSync(join(r, '.state', 'bin', 'cosign'))).toBe(true);
    writeFileSync(join(r, 'scripts', 'install-cosign.sh'), '#!/usr/bin/env bash\necho SHOULD-NOT-RUN >&2\nexit 9\n', { mode: 0o755 });
    chmodSync(join(r, 'scripts', 'install-cosign.sh'), 0o755);
    const second = bash(r, 'ensure_cosign');
    expect(second.status).toBe(0);
    expect(second.stderr).not.toContain('SHOULD-NOT-RUN');
  });

  it('fails clearly when cosign cannot be installed', () => {
    const r = root({ installer: 'fails' });
    const res = bash(r, 'ensure_cosign');
    expect(res.status).not.toBe(0);
  });

  it('verify_image reports cosign\'s own reason when the signature check fails', () => {
    const r = root({ installer: 'works' });
    const res = bash(r, 'LOG_FILE=/dev/null; verify_image 9.9.9');
    expect(res.status).not.toBe(0);
    expect(res.stdout + res.stderr).toContain('signature check failed');
    expect(res.stdout + res.stderr).toContain('signature mismatch');
  });

  it('skips verification only when explicitly told to', () => {
    const r = root({ installer: 'fails' });
    const res = bash(r, 'LOG_FILE=/dev/null; MATHQUEST_SKIP_VERIFY=1 verify_image 9.9.9');
    expect(res.status).toBe(0);
  });
});
