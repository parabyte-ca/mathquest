import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { generate } from '../shared/generators/index.js';
import type { Item } from '../shared/items/types.js';

// Independent check of the new MEL4E generators: each test reads the English prompt of a generated item and recomputes the
// answer by a different method.

const SEEDS = 250;
const M = 'MS.G12.MEL4E.';
const val = (it: Item): number => (it.answer as { value: number }).value;
const nums = (s: string): number[] => [...s.replace(/\\,/g, '').replace(/\$/g, '').matchAll(/\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
const each = (skill: string, tiers: number[], fn: (n: number[], it: Item) => void): void => {
  for (const tier of tiers) for (let seed = 1; seed <= SEEDS; seed++) { const it = generate(M + skill, tier, seed); fn(nums(it.prompt.en), it); }
};
const near = (a: number, b: number, id: string, tol = 1e-6): void => expect(Math.abs(a - b), id).toBeLessThanOrEqual(tol);
const sum = (xs: number[]): number => xs.reduce((a, b) => a + b, 0);

describe('Grade 12 MEL4E', () => {
  it('lists 11 skills, each with a generator', () => {
    const ids = (JSON.parse(readFileSync('content/microskills.json', 'utf8')) as { microskills: { id: string }[] }).microskills.map((m) => m.id).filter((i) => i.startsWith(M));
    expect(ids).toHaveLength(11);
    for (const id of ids) for (const tier of [1, 2, 3]) expect(generate(id, tier, 1).id.startsWith(id)).toBe(true);
  });
  it('mean, median and the mark needed', () => {
    each('A1.1.a', [1], (n, it) => near(val(it), sum(n) / n.length, it.id));
    each('A1.1.a', [2], (n, it) => {
      const xs = n.slice(1).sort((a, b) => a - b), k = xs.length;
      expect(k, it.id).toBe(n[0]);
      near(val(it), k % 2 ? xs[(k - 1) / 2]! : (xs[k / 2 - 1]! + xs[k / 2]!) / 2, it.id);
    });
    each('A1.1.a', [3], (n, it) => { near(val(it), 5 * n[4]! - sum(n.slice(0, 4)), it.id); expect(val(it), it.id).toBeLessThanOrEqual(100); });
  });
  it('chance', () => {
    each('A2.2.a', [1], ([r, b, g], it) => near(val(it), (r! / (r! + b! + g!)) * 100, it.id));
    each('A2.2.a', [2], ([n, c, v], it) => near(val(it), v! / n! - c!, it.id));
    each('A2.2.a', [3], ([, N, claim], it) => near(val(it), claim! / N!, it.id));
  });
  it('income tax', () => {
    each('B3.1.a', [1], ([income, rrsp, dues], it) => near(val(it), income! - rrsp! - dues!, it.id));
    each('B3.1.a', [2], ([source, owed], it) => near(val(it), source! - owed!, it.id));
    each('B3.1.a', [3], ([, first, , credit, ti], it) => near(val(it), 0.15 * first! + 0.2 * (ti! - first!) - credit!, it.id));
  });
  it('scale drawings and tile', () => {
    each('C2.1.a', [1], ([, k, d], it) => near(val(it), d! * k!, it.id));
    each('C2.1.a', [2], ([real, , k], it) => near(val(it), real! / k!, it.id));
    each('C2.1.a', [3], ([L, W, c], it) => near(val(it), L! * W! * c! + 0.1 * L! * W! * c!, it.id, 0.006));
  });
  it('proportional reasoning', () => {
    each('C3.1.a', [1], ([base, a, n], it) => near(val(it), (a! / base!) * n!, it.id));
    each('C3.1.a', [2], ([litres, area, big], it) => near(val(it), big! / (area! / litres!), it.id));
    each('C3.1.a', [3], ([w, days, w2], it) => { near(val(it), (w! * days!) / w2!, it.id); expect(Number.isInteger(val(it)), it.id).toBe(true); });
  });
});
