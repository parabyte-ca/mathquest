// Builds content/curriculum.json from the reference files in content/source/ontario.
// Run: npm run curriculum:build   (deterministic; output is committed so releases carry content).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface Expectation {
  code: string;
  grade: number;
  course: string | null; // null for Grades 5-8 (no course code)
  schema: 'strand-AF' | 'course-strand';
  strand: string; // A-F
  strandName: string;
  substrand: string | null;
  text: string;
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'content', 'source', 'ontario');

const COURSE_GRADE: Record<string, number> = {};
for (const c of ['MPM2D', 'MFM2P']) COURSE_GRADE[c] = 10;
for (const c of ['MCR3U', 'MCF3M', 'MBF3C', 'MEL3E']) COURSE_GRADE[c] = 11;
for (const c of ['MHF4U', 'MCV4U', 'MDM4U', 'MCT4C', 'MAP4C', 'MEL4E']) COURSE_GRADE[c] = 12;
COURSE_GRADE['MTH1W'] = 9;

const clean = (s: string) => s.replace(/\s+/g, ' ').replace(/[ ;.]+$/, '').trim();

export function parseFile(file: string, text: string): Expectation[] {
  const out: Expectation[] = [];
  const elem = /^grade([5-8])\.md$/.exec(file);
  const isG9 = file === 'grade9-mth1w.md';
  let course: string | null = isG9 ? 'MTH1W' : null;
  let grade = elem ? Number(elem[1]) : isG9 ? 9 : 0;
  let strand = '';
  let strandName = '';
  let substrand: string | null = null;
  let autoLetter = 0;
  let bulletIdx = 0;
  let active = elem !== null || false;

  for (const raw of text.split('\n')) {
    const line = raw.trimEnd();
    let m: RegExpExecArray | null;

    if (line.startsWith('## ')) {
      active = false;
      strand = '';
      if ((m = /^## ([A-F])\. (.+)$/.exec(line))) {
        if (elem || isG9) {
          strand = m[1]!;
          strandName = clean(m[2]!);
          substrand = null;
          active = true;
        }
      } else if ((m = /^## (M[A-Z0-9]{4})\s*(?:—|:|-)\s*(.+)$/.exec(line))) {
        course = m[1]!;
        grade = COURSE_GRADE[course] ?? 0;
        autoLetter = 0;
        strand = '';
        active = false; // wait for a strand heading
        substrand = null;
        // strands follow as **...** headings
        active = true;
      }
      continue;
    }

    if (line.startsWith('**')) {
      if (elem || isG9) {
        if ((m = /^\*\*([A-F]\d+)\s+(.+?):\*\*\s+(.+)$/.exec(line))) {
          // inline summary expectation, e.g. "**C3 Coding:** write and alter code ..."
          if (strand && !/no specific expectations/i.test(m[3]!)) out.push(mk(m[1]!, clean(`${m[2]}: ${m[3]}`)));
          substrand = clean(`${m[1]} ${m[2]}`);
        } else if ((m = /^\*\*([A-F]\d+)\s+(.+?)\*\*/.exec(line))) {
          substrand = clean(`${m[1]} ${m[2]}`);
        }
        continue;
      }
      // course files: **A. Name** or **Plain Name**
      if ((m = /^\*\*([A-F])\.\s*(.+?)\*\*\s*$/.exec(line))) {
        strand = m[1]!;
        strandName = clean(m[2]!);
        bulletIdx = 0;
      } else if ((m = /^\*\*([^*]+?)\*\*\s*$/.exec(line)) && active && course) {
        if (/omits|compared with/i.test(m[1]!)) continue;
        autoLetter += 1;
        strand = String.fromCharCode(64 + autoLetter);
        strandName = clean(m[1]!);
        bulletIdx = 0;
      }
      continue;
    }

    if (!active || !line.startsWith('- ')) continue;
    const body = line.slice(2);

    if (elem || isG9) {
      if (!strand) continue;
      // ranges such as D2.1-D2.5 expand to each code with the same text
      if ((m = /^([A-F]\d+)\.(\d+)-\1\.(\d+)\s+(.+)$/.exec(body)) || (m = /^([A-F]\d+)\.(\d+)-([A-F]\d+)\.(\d+)\s+(.+)$/.exec(body))) {
        const lo = Number(m[2]);
        const hi = Number(m.length === 5 ? m[3] : m[4]);
        const txt = clean(m[m.length - 1]!);
        for (let i = lo; i <= hi; i++) out.push(mk(`${m[1]}.${i}`, txt));
        continue;
      }
      if ((m = /^([A-F]\d+\.\d+)\s+(.+)$/.exec(body))) out.push(mk(m[1]!, clean(m[2]!)));
      continue;
    }

    if (!course || !strand) continue;
    if (/^(App note|Note|Routing)/i.test(body)) continue; // authoring notes, not expectations
    if ((m = /^([A-F]\d+):\s+(.+)$/.exec(body))) {
      out.push({
        code: `${course}.${m[1]}`, grade, course, schema: 'course-strand',
        strand: m[1]![0]!, strandName, substrand: null, text: clean(m[2]!),
      });
    } else {
      bulletIdx += 1;
      out.push({
        code: `${course}.${strand}${bulletIdx}`, grade, course, schema: 'course-strand',
        strand, strandName, substrand: null, text: clean(body),
      });
    }
  }
  return out;

  function mk(codeTail: string, txt: string): Expectation {
    const code = isG9 ? `MTH1W.${codeTail}` : `G${grade}.${codeTail}`;
    return {
      code, grade, course: isG9 ? 'MTH1W' : null, schema: 'strand-AF',
      strand: codeTail[0]!, strandName, substrand, text: txt,
    };
  }
}

export function buildCurriculum(): { version: string; expectations: Expectation[] } {
  const files = readdirSync(SRC).filter((f) => /^grade.*\.md$/.test(f)).sort();
  const expectations = files.flatMap((f) => parseFile(f, readFileSync(join(SRC, f), 'utf8')));
  const seen = new Set<string>();
  for (const e of expectations) {
    if (seen.has(e.code)) throw new Error(`duplicate expectation code ${e.code}`);
    seen.add(e.code);
  }
  return { version: '2026.11.1', expectations };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const data = buildCurriculum();
  writeFileSync(join(ROOT, 'content', 'curriculum.json'), JSON.stringify(data, null, 1) + '\n');
  const byGrade = new Map<string, number>();
  for (const e of data.expectations) byGrade.set(e.course ?? `G${e.grade}`, (byGrade.get(e.course ?? `G${e.grade}`) ?? 0) + 1);
  console.log(`expectations: ${data.expectations.length}`, Object.fromEntries(byGrade));
}
