import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { GENERATORS } from '../shared/generators/index.js';

const read = <T>(f: string): T => JSON.parse(readFileSync(`content/${f}`, 'utf8')) as T;
const micro = read<{ microskills: { id: string; prereqs: string[] }[] }>('microskills.json').microskills;
const ladders = read<{ ladders: Record<string, string[]> }>('placement.json').ladders;

describe('content links', () => {
  it('every placement ladder entry is a real micro-skill with a generator, with no repeats', () => {
    for (const [grade, ladder] of Object.entries(ladders)) {
      expect(new Set(ladder).size, `grade ${grade} repeats`).toBe(ladder.length);
      for (const id of ladder) {
        expect(micro.map((m) => m.id), `grade ${grade}: ${id}`).toContain(id);
        expect(GENERATORS[id], `grade ${grade}: no generator for ${id}`).toBeDefined();
      }
    }
  });

  it('a ladder never puts a skill before one of its own prerequisites', () => {
    for (const [grade, ladder] of Object.entries(ladders)) {
      ladder.forEach((id, i) => {
        for (const p of micro.find((m) => m.id === id)!.prereqs) {
          const j = ladder.indexOf(p);
          if (j >= 0) expect(j, `grade ${grade}: ${p} must come before ${id}`).toBeLessThan(i);
        }
      });
    }
  });

  it('the Grade 5-6 Number placement ladders reach the new skills', () => {
    const covered = new Set(Object.values(ladders).flat());
    for (const id of ['MS.G5.B1.1.a', 'MS.G5.B2.6.a', 'MS.G5.B2.9.a', 'MS.G6.B1.4.a', 'MS.G6.B2.12.a']) expect(covered.has(id), id).toBe(true);
  });

  it('every Grade 5 to 8 skill in strands C to F is on its strand\'s quick-check ladder, and only that strand\'s skills are', () => {
    const info = (id: string): { grade: number; strand: string } => { const m = /^MS\.G(\d+)\.([A-F])/.exec(id)!; return { grade: Number(m[1]), strand: m[2]! }; };
    for (const grade of [5, 6, 7, 8]) {
      for (const strand of ['C', 'D', 'E', 'F']) {
        const ladder = ladders[`${grade}.${strand}`] ?? [];
        const expected = micro.map((m) => m.id).filter((id) => info(id).strand === strand && info(id).grade <= grade);
        expect([...ladder].sort(), `${grade}.${strand}`).toEqual([...expected].sort());
      }
    }
  });

  it('prerequisites of micro-skills form no cycle', () => {
    const state = new Map<string, number>();
    const byId = new Map(micro.map((m) => [m.id, m]));
    const visit = (id: string, path: string[]): void => {
      if (state.get(id) === 2) return;
      expect(state.get(id), `cycle: ${[...path, id].join(' > ')}`).not.toBe(1);
      state.set(id, 1);
      for (const p of byId.get(id)!.prereqs) visit(p, [...path, id]);
      state.set(id, 2);
    };
    micro.forEach((m) => visit(m.id, []));
  });
});
