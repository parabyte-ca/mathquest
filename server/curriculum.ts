import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DB } from './db.js';

export interface ExpectationRow {
  code: string; grade: number; course: string | null; schema: string; strand: string; strandName: string; substrand: string | null; text: string;
}
interface CurriculumFile { version: string; expectations: ExpectationRow[] }
interface ChainsFile { chains: Record<string, string[]>; course_prerequisites: Record<string, { recommended: string[] }> }
interface MicroFile { version: string; microskills: { id: string; expectation: string; name: string; tiers: number; prereqs: string[] }[] }

const readJson = <T>(p: string): T => JSON.parse(readFileSync(p, 'utf8')) as T;

/** Returns edges (earlier -> later) from the ordered chains. */
export function chainEdges(chains: Record<string, string[]>): { from: string; to: string; chain: string }[] {
  const out: { from: string; to: string; chain: string }[] = [];
  for (const [chain, codes] of Object.entries(chains)) for (let i = 1; i < codes.length; i++) out.push({ from: codes[i - 1]!, to: codes[i]!, chain });
  return out;
}

/** True if the directed graph has a cycle. */
export function hasCycle(nodes: string[], edges: { from: string; to: string }[]): boolean {
  const adj = new Map<string, string[]>();
  for (const n of nodes) adj.set(n, []);
  for (const e of edges) adj.get(e.from)?.push(e.to);
  const state = new Map<string, 1 | 2>();
  const visit = (n: string): boolean => {
    if (state.get(n) === 2) return false;
    if (state.get(n) === 1) return true;
    state.set(n, 1);
    for (const m of adj.get(n) ?? []) if (visit(m)) return true;
    state.set(n, 2);
    return false;
  };
  return nodes.some(visit);
}

/**
 * Loads the versioned seed data into SQLite. Idempotent: skips when the stored content version matches,
 * otherwise replaces the curriculum tables in one transaction (student mastery rows are never touched).
 */
export function loadCurriculum(db: DB, contentDir = join(process.cwd(), 'content')): { loaded: boolean; version: string } {
  const cur = readJson<CurriculumFile>(join(contentDir, 'curriculum.json'));
  const chains = readJson<ChainsFile>(join(contentDir, 'prereq-chains.json'));
  const micro = readJson<MicroFile>(join(contentDir, 'microskills.json'));
  const version = `${cur.version}+${micro.version}`;
  const stored = db.prepare("SELECT value FROM kv WHERE key = 'content_version'").get() as { value: string } | undefined;
  if (stored?.value === version) return { loaded: false, version };

  const codes = new Set(cur.expectations.map((e) => e.code));
  const edges = chainEdges(chains.chains);
  for (const e of edges) if (!codes.has(e.from) || !codes.has(e.to)) throw new Error(`prereq chain "${e.chain}" references unknown code ${codes.has(e.from) ? e.to : e.from}`);
  if (hasCycle([...codes], edges)) throw new Error('prerequisite graph has a cycle');
  const msIds = new Set(micro.microskills.map((m) => m.id));
  for (const m of micro.microskills) {
    if (!codes.has(m.expectation)) throw new Error(`micro-skill ${m.id} references unknown expectation ${m.expectation}`);
    for (const p of m.prereqs) if (!msIds.has(p)) throw new Error(`micro-skill ${m.id} references unknown prerequisite ${p}`);
  }
  if (hasCycle([...msIds], micro.microskills.flatMap((m) => m.prereqs.map((p) => ({ from: p, to: m.id }))))) throw new Error('micro-skill graph has a cycle');

  db.transaction(() => {
    for (const t of ['curriculum_expectation', 'prereq_edge', 'course_prereq', 'microskill_prereq', 'microskill']) db.exec(`DELETE FROM ${t}`);
    const ie = db.prepare('INSERT INTO curriculum_expectation (code, grade, course, schema, strand, strand_name, substrand, text) VALUES (?,?,?,?,?,?,?,?)');
    for (const e of cur.expectations) ie.run(e.code, e.grade, e.course, e.schema, e.strand, e.strandName, e.substrand, e.text);
    const ig = db.prepare('INSERT INTO prereq_edge (from_code, to_code, chain) VALUES (?,?,?) ON CONFLICT DO NOTHING');
    for (const e of edges) ig.run(e.from, e.to, e.chain);
    const ic = db.prepare('INSERT INTO course_prereq (course, recommended) VALUES (?,?)');
    for (const [course, v] of Object.entries(chains.course_prerequisites)) if (!course.startsWith('_')) for (const rec of v.recommended) ic.run(course, rec);
    const im = db.prepare('INSERT INTO microskill (id, expectation, name, tiers) VALUES (?,?,?,?)');
    const ip = db.prepare('INSERT INTO microskill_prereq (microskill, prereq) VALUES (?,?)');
    for (const m of micro.microskills) {
      im.run(m.id, m.expectation, m.name, m.tiers);
      for (const p of m.prereqs) ip.run(m.id, p);
    }
    db.prepare("INSERT INTO kv (key, value) VALUES ('content_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(version);
  })();
  return { loaded: true, version };
}
