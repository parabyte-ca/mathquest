import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scanClientBundle, scanServerBundle, scanText, scanSource, scanForValues, secretValuesFromEnv } from '../scripts/secret-scan.js';

// The scanner is the safety net that runs on every build, so it must be proven to catch what it claims to catch. Fake secrets are
// assembled from pieces here so this file does not itself look like it holds one.

const filler = (n: number): string => 'x9Q'.repeat(Math.ceil(n / 3)).slice(0, n);
const FAKES: Record<string, string> = {
  'anthropic-api-key': ['sk', 'ant', 'api03', filler(40)].join('-'),
  'resend-api-key': ['re', filler(30)].join('_'),
  'github-token': ['ghp', filler(40)].join('_'),
  'aws-access-key-id': ['AKIA', 'ABCDEFGHIJKLMNOP'].join(''),
  'google-api-key': ['AIza', filler(35)].join(''),
  'slack-token': ['xoxb', '1234567890', filler(12)].join('-'),
  'stripe-key': ['sk', 'live', filler(28)].join('_'),
  'private-key-block': ['-----BEGIN', 'RSA PRIVATE KEY-----'].join(' '),
  'json-web-token': ['eyJhbGciOiJIUzI1NiJ9', 'eyJzdWIiOiIxMjM0NTY3ODkwIn0', 'abcdefghij1234567890'].join('.'),
  'url-with-credentials': ['https', '://user:hunter2pass@example.com/path'].join(''),
  'database-connection-string': ['postgres', '://app:pw@db.internal:5432/mathquest'].join(''),
};

let dirs: string[] = [];
const tmp = (): string => { const d = mkdtempSync(join(tmpdir(), 'mq-scan-')); dirs.push(d); return d; };
afterEach(() => { for (const d of dirs) rmSync(d, { recursive: true, force: true }); dirs = []; });
const put = (root: string, rel: string, text: string): void => { const p = join(root, rel); mkdirSync(join(p, '..'), { recursive: true }); writeFileSync(p, text); };

describe('secret scanner: credential shapes', () => {
  for (const [rule, fake] of Object.entries(FAKES)) {
    it(`finds ${rule}`, () => {
      const f = scanText('x.ts', `const v = "${fake}";`);
      expect(f.map((x) => x.rule), rule).toContain(rule);
      expect(JSON.stringify(f), 'the finding must not print the whole secret').not.toContain(fake);
    });
  }

  it('finds a hard-coded password assignment in source, but not an empty or environment-based one', () => {
    expect(scanText('a.ts', `const password = "${filler(24)}";`, { assignments: true }).map((x) => x.rule)).toContain('hard-coded-credential-assignment');
    expect(scanText('a.ts', 'RESEND_API_KEY=', { assignments: true })).toEqual([]);
    expect(scanText('a.ts', 'const key = process.env.RESEND_API_KEY ?? "";', { assignments: true })).toEqual([]);
  });

  it('accepts a reviewed false positive marked secret-scan:allow, and ordinary text', () => {
    expect(scanText('a.ts', `const v = "${FAKES['resend-api-key']}"; // secret-scan:allow`)).toEqual([]);
    expect(scanText('a.md', 'Open https://github.com/parabyte-ca/mathquest and set BASE_URL=https://mathquest.moot.es')).toEqual([]);
  });
});

describe('secret scanner: secret values from the environment', () => {
  it('picks secret-looking variables only, and finds their value in a bundle', () => {
    const env = { RESEND_API_KEY: filler(30), ANTHROPIC_API_KEY: filler(31), COOKIE_SECURE: 'true', BASE_URL: 'https://mathquest.moot.es', SHORT_TOKEN: 'abc', PATH: '/usr/bin' };
    const values = secretValuesFromEnv(env);
    expect(values).toEqual([filler(30), filler(31)]);
    expect(scanForValues('app.js', `var a="${filler(30)}";`, values).map((x) => x.rule)).toEqual(['secret-environment-value']);
    expect(scanForValues('app.js', 'var a="nothing here";', values)).toEqual([]);
  });
});

describe('secret scanner: browser bundle', () => {
  it('passes a clean bundle', () => {
    const d = tmp();
    put(d, 'index.html', '<!doctype html><div id="app"></div><script src="/assets/app.js"></script>');
    put(d, 'assets/app.js', 'console.log("hello");');
    put(d, 'assets/app.css', 'body{margin:0}');
    put(d, 'manifest.webmanifest', '{"name":"MathQuest"}');
    expect(scanClientBundle(d, {})).toEqual([]);
  });

  it('flags a source map, a map reference, an env file and an unexpected file type', () => {
    const d = tmp();
    put(d, 'assets/app.js', 'console.log(1);\n//# sourceMappingURL=app.js.map');
    put(d, 'assets/app.js.map', '{"version":3}');
    put(d, '.env', 'A=1');
    put(d, 'notes.ts', 'export {}');
    const rules = scanClientBundle(d, {}).map((x) => x.rule);
    expect(rules).toContain('forbidden-file-in-client-bundle');
    expect(rules).toContain('source-map-reference');
    expect(rules.filter((r) => r === 'forbidden-file-in-client-bundle').length).toBeGreaterThanOrEqual(3);
  });

  it('flags server-only code, service URLs, a build path, and an embedded credential', () => {
    const d = tmp();
    put(d, 'assets/a.js', `const k=process.env.RESEND_API_KEY; fetch("https://api.resend.com/emails",{headers:{"x-api-key":"${FAKES['anthropic-api-key']}"}}); const p="/home/builder/app/src/x.ts";`);
    const rules = scanClientBundle(d, {}).map((x) => x.rule);
    for (const r of ['server-environment-access', 'secret-bearing-service-url', 'secret-header-name', 'build-machine-path', 'anthropic-api-key']) expect(rules, r).toContain(r);
  });

  it('flags a configured secret value that was compiled in, even when it has no recognisable shape', () => {
    const d = tmp();
    const secret = `plainsecret${filler(20)}`;
    put(d, 'assets/a.js', `var cfg={token:"${secret}"};`);
    const found = scanClientBundle(d, { SESSION_SECRET: secret });
    expect(found.map((x) => x.rule)).toContain('secret-environment-value');
    expect(JSON.stringify(found)).not.toContain(secret);
  });
});

describe('secret scanner: server build and source files', () => {
  it('lets the server read its environment but flags source maps and credentials', () => {
    const d = tmp();
    put(d, 'config.js', 'export const k = process.env.RESEND_API_KEY ?? "";');
    expect(scanServerBundle(d, {})).toEqual([]);
    put(d, 'app.js', `x();\n//# sourceMappingURL=app.js.map`);
    put(d, 'leak.js', `const t = "${FAKES['github-token']}";`);
    const rules = scanServerBundle(d, {}).map((x) => x.rule);
    expect(rules).toContain('source-map-reference');
    expect(rules).toContain('github-token');
  });

  it('flags a committed env file and a credential in source, but accepts .env.example with empty values', () => {
    const d = tmp();
    put(d, '.env.example', 'RESEND_API_KEY=\nANTHROPIC_API_KEY=\n');
    put(d, 'src/ok.ts', 'export const a = 1;');
    expect(scanSource(d, ['.env.example', 'src/ok.ts'])).toEqual([]);
    put(d, '.env', `RESEND_API_KEY=${FAKES['resend-api-key']}`);
    put(d, 'src/bad.ts', `export const key = "${FAKES['anthropic-api-key']}";`);
    const rules = scanSource(d, ['.env', 'src/bad.ts']).map((x) => x.rule);
    expect(rules).toContain('sensitive-file-tracked');
    expect(rules).toContain('resend-api-key');
    expect(rules).toContain('anthropic-api-key');
  });
});
