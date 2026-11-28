// Secret scanner for MathQuest: finds credentials, keys, tokens, connection strings and other sensitive data in
//   - the tracked source files,
//   - the git history (every added line),
//   - the built browser bundle (dist/web), which must contain nothing sensitive, no source maps and no server-only code, and
//   - the built server output (dist/server), which must carry no source maps or secrets.
// It also looks for the actual VALUES of this machine's secret-like environment variables inside the bundle, so a key that is
// compiled in by mistake is caught even if it has no recognisable shape.
//
// Usage: npm run audit:secrets [-- --require-client] [--client DIR] [--server DIR] [--no-source] [--no-history]
// Exit code 1 when anything is found. Add "secret-scan:allow" on a line to accept a reviewed false positive.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface Finding {
  file: string;
  line: number;
  rule: string;
  sample: string;
}

interface Rule {
  id: string;
  re: RegExp;
}

/** Shapes of real credentials. Every one is checked in source, history and bundles. */
export const SECRET_RULES: Rule[] = [
  { id: 'anthropic-api-key', re: /\bsk-ant-[A-Za-z0-9_-]{20,}/ },
  { id: 'openai-style-api-key', re: /\bsk-(?:proj-)?[A-Za-z0-9]{32,}/ },
  { id: 'resend-api-key', re: /\bre_[A-Za-z0-9]{20,}\b/ },
  { id: 'github-token', re: /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{50,})/ },
  { id: 'aws-access-key-id', re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { id: 'google-api-key', re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { id: 'slack-token', re: /\bxox[abprs]-[A-Za-z0-9-]{10,}/ },
  { id: 'stripe-key', re: /\b[sr]k_(?:live|test)_[0-9a-zA-Z]{24,}/ },
  { id: 'private-key-block', re: /-----BEGIN (?:[A-Z]+ )*PRIVATE KEY-----/ },
  { id: 'json-web-token', re: /\beyJ[A-Za-z0-9_-]{15,}\.eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}/ },
  { id: 'url-with-credentials', re: /\b[a-z][a-z0-9+.-]{1,20}:\/\/[^\s/:@'"`]+:[^\s/@'"`]+@[A-Za-z0-9.-]+/ },
  { id: 'database-connection-string', re: /\b(?:postgres(?:ql)?|mysql|mariadb|mongodb(?:\+srv)?|redis|amqp):\/\/\S+/i },
];

/** Looser rule for assignments like password = "...", used on source files only (it can have false positives). */
const ASSIGNMENT_RULE: Rule = {
  id: 'hard-coded-credential-assignment',
  re: /\b(?:api[_-]?key|secret|passwd|password|access[_-]?token|auth[_-]?token|private[_-]?key)\b["']?\s*[:=]\s*["'][A-Za-z0-9+/_=.-]{20,}["']/i,
};

/** Text that must never appear in code shipped to a browser. */
const CLIENT_ONLY_MARKERS: { id: string; re: RegExp }[] = [
  { id: 'server-environment-access', re: /\bprocess\.env\b/ },
  { id: 'server-only-package', re: /better-sqlite3|require\(["']express["']\)/ },
  { id: 'secret-bearing-service-url', re: /api\.resend\.com|api\.anthropic\.com/ },
  { id: 'secret-header-name', re: /x-api-key/i },
  { id: 'build-machine-path', re: /(?:\/home\/[a-z0-9_-]+\/|\/root\/|\/Users\/[A-Za-z0-9_-]+\/|[A-Z]:\\Users\\)/ },
  { id: 'source-map-reference', re: /\/\/[#@]\s*sourceMappingURL=/ },
];

const CLIENT_ALLOWED_EXTENSIONS = new Set(['.html', '.js', '.css', '.json', '.webmanifest', '.svg', '.png', '.webp', '.ico', '.woff', '.woff2', '.txt']);
const FORBIDDEN_FILE = /(?:^|\/)\.env(?:\.|$)|\.(?:map|pem|key|p12|pfx|db|sqlite3?|log|ts|tsx)$|(?:^|\/)id_(?:rsa|ed25519)/i;
/** Files that should never be committed. */
const SENSITIVE_TRACKED = /(?:^|\/)\.env(?:\.|$)|\.(?:pem|key|p12|pfx|db|sqlite3?|map)$|(?:^|\/)id_(?:rsa|ed25519)/i;
const ENV_NAME_LOOKS_SECRET = /(?:KEY|SECRET|TOKEN|PASSWORD|PASSWD|DSN|PRIVATE|CREDENTIAL)/i;
const ALLOW_MARK = 'secret-scan:allow';
const MAX_FILE_BYTES = 2_000_000;

const redact = (s: string): string => (s.length <= 12 ? `${s.slice(0, 3)}...` : `${s.slice(0, 6)}...(${s.length} chars)`);

/** Scans text line by line against the credential shapes. */
export function scanText(file: string, text: string, opts: { assignments?: boolean } = {}): Finding[] {
  const out: Finding[] = [];
  const rules = opts.assignments ? [...SECRET_RULES, ASSIGNMENT_RULE] : SECRET_RULES;
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    if (line.includes(ALLOW_MARK)) return;
    // minified bundles are one huge line: examine it in slices so the sample stays small
    const slices = line.length > 4000 ? line.match(/.{1,4000}/g) ?? [] : [line];
    for (const slice of slices) {
      for (const rule of rules) {
        const m = rule.re.exec(slice);
        if (m) out.push({ file, line: i + 1, rule: rule.id, sample: redact(m[0]) });
      }
    }
  });
  return out;
}

/** Secret-like environment values worth looking for inside a bundle. */
export function secretValuesFromEnv(env: NodeJS.ProcessEnv): string[] {
  const out = new Set<string>();
  for (const [name, value] of Object.entries(env)) {
    if (!value || !ENV_NAME_LOOKS_SECRET.test(name)) continue;
    if (value.length < 12) continue; // too short to search for without false hits
    if (/^(true|false|none|null|undefined)$/i.test(value) || /^https?:\/\/[^@\s]*$/i.test(value)) continue;
    out.add(value);
  }
  return [...out];
}

/** Reports any appearance of a known secret value. */
export function scanForValues(file: string, text: string, values: string[]): Finding[] {
  const out: Finding[] = [];
  for (const v of values) {
    const at = text.indexOf(v);
    if (at !== -1) out.push({ file, line: text.slice(0, at).split('\n').length, rule: 'secret-environment-value', sample: redact(v) });
  }
  return out;
}

const isText = (buf: Buffer): boolean => !buf.subarray(0, 8000).includes(0);

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/** Scans every tracked source file (or every file under `root` when it is not a git checkout). */
export function scanSource(root: string, files?: string[]): Finding[] {
  let list = files;
  if (!list) {
    try {
      list = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).split('\0').filter(Boolean);
    } catch {
      list = walk(root).map((p) => relative(root, p)).filter((p) => !p.startsWith('node_modules') && !p.startsWith('.git/') && !p.startsWith('dist/'));
    }
  }
  const out: Finding[] = [];
  for (const rel of list) {
    if (rel === 'package-lock.json' || /\.(png|ico|woff2?|jpe?g|gif|pdf|zip)$/i.test(rel)) continue;
    const p = join(root, rel);
    if (!existsSync(p) || statSync(p).size > MAX_FILE_BYTES) continue;
    const buf = readFileSync(p);
    if (!isText(buf)) continue;
    const text = buf.toString('utf8');
    const isEnvExample = rel === '.env.example';
    out.push(...scanText(rel, text, { assignments: !isEnvExample }));
    if (SENSITIVE_TRACKED.test(rel) && !isEnvExample) out.push({ file: rel, line: 0, rule: 'sensitive-file-tracked', sample: rel });
  }
  return out;
}

/** Scans every line ever added to the repository, so a key that was committed and later removed is still found. */
export function scanHistory(root: string): Finding[] {
  let log: string;
  try {
    log = execFileSync('git', ['log', '--all', '-p', '--no-color', '--no-ext-diff', '--format=commit %h', '-U0'], { cwd: root, encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 });
  } catch {
    return [];
  }
  const out: Finding[] = [];
  let commit = '', file = '';
  for (const line of log.split('\n')) {
    if (line.startsWith('commit ')) commit = line.slice(7);
    else if (line.startsWith('+++ b/')) file = line.slice(6);
    else if (line.startsWith('+') && !line.startsWith('+++') && !line.includes(ALLOW_MARK) && file !== 'package-lock.json') {
      for (const f of scanText(`${file}@${commit}`, line.slice(1), { assignments: file !== '.env.example' })) out.push(f);
    }
  }
  return out;
}

/** The browser bundle: no credentials, no secret values, no source maps, no server-only code, no stray file types. */
export function scanClientBundle(dir: string, env: NodeJS.ProcessEnv = {}): Finding[] {
  const out: Finding[] = [];
  const values = secretValuesFromEnv(env);
  const root = resolve(process.cwd());
  for (const p of walk(dir)) {
    const rel = relative(dir, p).split('\\').join('/');
    const ext = extname(p).toLowerCase();
    if (FORBIDDEN_FILE.test(rel)) out.push({ file: rel, line: 0, rule: 'forbidden-file-in-client-bundle', sample: rel });
    else if (!CLIENT_ALLOWED_EXTENSIONS.has(ext)) out.push({ file: rel, line: 0, rule: 'unexpected-file-type-in-client-bundle', sample: ext || rel });
    if (statSync(p).size > 8_000_000 || ['.png', '.webp', '.ico', '.woff', '.woff2'].includes(ext)) continue;
    const buf = readFileSync(p);
    if (!isText(buf)) continue;
    const text = buf.toString('utf8');
    out.push(...scanText(rel, text), ...scanForValues(rel, text, values));
    for (const m of CLIENT_ONLY_MARKERS) {
      const hit = m.re.exec(text);
      if (hit) out.push({ file: rel, line: text.slice(0, hit.index).split('\n').length, rule: m.id, sample: redact(hit[0]) });
    }
    if (text.includes(root)) out.push({ file: rel, line: 0, rule: 'build-machine-path', sample: redact(root) });
  }
  return out;
}

/** The compiled server: it may name services and read the environment, but must carry no secrets or source maps. */
export function scanServerBundle(dir: string, env: NodeJS.ProcessEnv = {}): Finding[] {
  const out: Finding[] = [];
  const values = secretValuesFromEnv(env);
  for (const p of walk(dir)) {
    const rel = relative(dir, p).split('\\').join('/');
    if (FORBIDDEN_FILE.test(rel)) out.push({ file: rel, line: 0, rule: 'forbidden-file-in-server-build', sample: rel });
    if (statSync(p).size > MAX_FILE_BYTES) continue;
    const buf = readFileSync(p);
    if (!isText(buf)) continue;
    const text = buf.toString('utf8');
    out.push(...scanText(rel, text), ...scanForValues(rel, text, values));
    const map = /\/\/[#@]\s*sourceMappingURL=/.exec(text);
    if (map) out.push({ file: rel, line: text.slice(0, map.index).split('\n').length, rule: 'source-map-reference', sample: 'sourceMappingURL' });
  }
  return out;
}

export function formatFindings(findings: Finding[]): string {
  return findings.map((f) => `  ${f.file}${f.line ? `:${f.line}` : ''}  [${f.rule}]  ${f.sample}`).join('\n');
}

function main(): number {
  const args = process.argv.slice(2);
  const arg = (name: string): string | undefined => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
  const root = resolve(process.cwd());
  const clientDir = resolve(arg('--client') ?? join(root, 'dist', 'web'));
  const serverDir = resolve(arg('--server') ?? join(root, 'dist', 'server'));
  const results: [string, Finding[]][] = [];
  if (!args.includes('--no-source')) results.push(['source files', scanSource(root)]);
  if (!args.includes('--no-history')) results.push(['git history', scanHistory(root)]);
  if (existsSync(clientDir)) results.push([`client bundle (${relative(root, clientDir) || clientDir})`, scanClientBundle(clientDir, process.env)]);
  else if (args.includes('--require-client')) { console.error(`secret-scan: client bundle not found at ${clientDir}. Run npm run build first.`); return 1; }
  if (existsSync(serverDir) && !args.includes('--no-server')) results.push([`server build (${relative(root, serverDir) || serverDir})`, scanServerBundle(serverDir, process.env)]);
  let bad = 0;
  for (const [name, findings] of results) {
    if (findings.length === 0) console.log(`secret-scan: ${name}: clean`);
    else {
      bad += findings.length;
      console.error(`secret-scan: ${name}: ${findings.length} finding(s)\n${formatFindings(findings)}`);
    }
  }
  if (bad > 0) { console.error(`secret-scan: FAILED with ${bad} finding(s). Remove the secret, rotate it if it was ever pushed, and move it to server-side configuration.`); return 1; }
  console.log('secret-scan: passed');
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) process.exit(main());
