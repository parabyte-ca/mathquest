import { describe, it, expect } from 'vitest';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDb } from '../server/db.js';
import { loadCurriculum, chainEdges, hasCycle } from '../server/curriculum.js';
import { buildCurriculum } from '../scripts/build-curriculum.js';

const COURSES = ['MPM2D', 'MFM2P', 'MCR3U', 'MCF3M', 'MBF3C', 'MEL3E', 'MHF4U', 'MCV4U', 'MDM4U', 'MCT4C', 'MAP4C', 'MEL4E'];

describe('curriculum seed data', () => {
  const cur = JSON.parse(readFileSync('content/curriculum.json', 'utf8')) as { expectations: { code: string; grade: number; course: string | null; schema: string; text: string }[] };

  it('is up to date with the source files', () => {
    expect(cur.expectations).toEqual(buildCurriculum().expectations);
  });

  it('covers Grades 5-12 and all 12 senior courses plus MTH1W', () => {
    const grades = new Set(cur.expectations.map((e) => e.grade));
    expect([...grades].sort((a, b) => a - b)).toEqual([5, 6, 7, 8, 9, 10, 11, 12]);
    const courses = new Set(cur.expectations.map((e) => e.course));
    for (const c of [...COURSES, 'MTH1W']) expect(courses.has(c)).toBe(true);
  });

  it('uses the two tagging schemas', () => {
    for (const e of cur.expectations) {
      if (e.grade <= 8) expect(e.code).toMatch(new RegExp(`^G${e.grade}\\.[B-F]\\d+(\\.\\d+)?$`));
      else if (e.course === 'MTH1W') expect(e.code).toMatch(/^MTH1W\.[B-F]\d\.\d+$/);
      else expect(e.code).toMatch(/^M[A-Z]{2}\d[A-Z]\.[A-F]\d+$/);
      expect(e.text.length).toBeGreaterThan(2);
    }
  });

  it('has unique codes', () => {
    expect(new Set(cur.expectations.map((e) => e.code)).size).toBe(cur.expectations.length);
  });
});

describe('prerequisite graph and loading', () => {
  it('loads into SQLite, is acyclic and idempotent', () => {
    const db = openDb(':memory:');
    const first = loadCurriculum(db);
    expect(first.loaded).toBe(true);
    expect((db.prepare('SELECT COUNT(*) AS n FROM curriculum_expectation').get() as { n: number }).n).toBeGreaterThan(300);
    expect((db.prepare('SELECT COUNT(*) AS n FROM prereq_edge').get() as { n: number }).n).toBeGreaterThan(50);
    expect((db.prepare('SELECT COUNT(*) AS n FROM microskill').get() as { n: number }).n).toBeGreaterThan(10);
    expect(loadCurriculum(db).loaded).toBe(false);
    const edges = db.prepare('SELECT from_code AS "from", to_code AS "to" FROM prereq_edge').all() as { from: string; to: string }[];
    const nodes = (db.prepare('SELECT code FROM curriculum_expectation').all() as { code: string }[]).map((r) => r.code);
    expect(hasCycle(nodes, edges)).toBe(false);
  });

  it('reloads when the seed files change even if their version labels stay the same', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mq-content-'));
    try {
      cpSync('content', dir, { recursive: true });
      const db = openDb(':memory:');
      expect(loadCurriculum(db, dir).loaded).toBe(true);
      expect(loadCurriculum(db, dir).loaded).toBe(false);
      const file = join(dir, 'microskills.json');
      const data = JSON.parse(readFileSync(file, 'utf8')) as { version: string; microskills: { id: string; expectation: string; name: string; tiers: number; prereqs: string[] }[] };
      const first = data.microskills[0]!;
      data.microskills.push({ id: 'MS.G5.B1.1.z', expectation: first.expectation, name: 'A skill added without a version bump', tiers: 3, prereqs: [] });
      writeFileSync(file, JSON.stringify(data));
      expect(loadCurriculum(db, dir).loaded).toBe(true);
      expect((db.prepare("SELECT COUNT(*) AS n FROM microskill WHERE id = 'MS.G5.B1.1.z'").get() as { n: number }).n).toBe(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('recommends (never requires) prerequisite courses', () => {
    const db = openDb(':memory:');
    loadCurriculum(db);
    const rows = db.prepare("SELECT recommended FROM course_prereq WHERE course = 'MHF4U'").all() as { recommended: string }[];
    expect(rows.map((r) => r.recommended).sort()).toEqual(['MCR3U', 'MCT4C']);
  });

  it('detects cycles and builds chain edges', () => {
    expect(chainEdges({ c: ['a', 'b', 'c'] })).toEqual([{ from: 'a', to: 'b', chain: 'c' }, { from: 'b', to: 'c', chain: 'c' }]);
    expect(hasCycle(['a', 'b'], [{ from: 'a', to: 'b' }, { from: 'b', to: 'a' }])).toBe(true);
    expect(hasCycle(['a', 'b'], [{ from: 'a', to: 'b' }])).toBe(false);
  });

  it('every micro-skill has at least three tiers and a known expectation', () => {
    const db = openDb(':memory:');
    loadCurriculum(db);
    const bad = db.prepare('SELECT m.id FROM microskill m LEFT JOIN curriculum_expectation e ON e.code = m.expectation WHERE e.code IS NULL OR m.tiers < 3').all();
    expect(bad).toEqual([]);
  });
});
