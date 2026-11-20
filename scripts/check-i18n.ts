// CI check: en.json and fr.json must have exactly the same keys and the same {placeholders}.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'web', 'src', 'locales');
const load = (l: string): Record<string, string> => JSON.parse(readFileSync(join(dir, `${l}.json`), 'utf8')) as Record<string, string>;
const en = load('en');
const fr = load('fr');
const vars = (s: string): string => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

const problems: string[] = [];
for (const k of Object.keys(en)) {
  if (!(k in fr)) problems.push(`missing in fr: ${k}`);
  else {
    if (!fr[k]!.trim()) problems.push(`empty in fr: ${k}`);
    if (vars(en[k]!) !== vars(fr[k]!)) problems.push(`placeholder mismatch: ${k}`);
  }
}
for (const k of Object.keys(fr)) if (!(k in en)) problems.push(`extra in fr: ${k}`);

// Every key used in the UI code must exist (a missing key fails CI, not a student's screen).
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
for (const file of walk(join(dir, '..')).filter((f) => /\.tsx?$/.test(f))) {
  for (const m of readFileSync(file, 'utf8').matchAll(/\bt\('([\w.]+)'/g)) if (!(m[1]! in en)) problems.push(`used but undefined: ${m[1]} (${file.split('/web/')[1]})`);
}
// Keys built at run time (t(`map.${state}`) and friends) cannot be found by scanning, so list their families.
const families: Record<string, string[]> = {
  map: ['mastered', 'in_progress', 'needs_review', 'new', 'locked', 'soon'],
  phase: ['stepdown', 'micro', 'lesson', 'buildup'],
  tier: ['1', '2', '3'],
  event: ['advance', 'stepdown', 'micro', 'lesson', 'buildup', 'recovered', 'help'],
};
for (const [fam, names] of Object.entries(families)) for (const n of names) if (!(`${fam}.${n}` in en)) problems.push(`missing ${fam}.${n}`);
for (const st of ['idle', 'queued', 'validating', 'running', 'succeeded', 'failed', 'rolled_back']) if (!(`state.${st}` in en)) problems.push(`missing state.${st}`);

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`i18n ok: ${Object.keys(en).length} keys in en and fr`);
