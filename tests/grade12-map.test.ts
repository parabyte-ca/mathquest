import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { generate } from '../shared/generators/index.js';
import type { Item } from '../shared/items/types.js';

// Independent check of the new MAP4C generators: each test reads the English prompt of a generated item and recomputes the
// answer by a different method.

const SEEDS = 250;
const M = 'MS.G12.MAP4C.';
const val = (it: Item): number => (it.answer as { value: number }).value;
const nums = (s: string): number[] => [...s.replace(/\\,/g, '').replace(/\$/g, '').matchAll(/\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
const each = (skill: string, tiers: number[], fn: (n: number[], it: Item) => void): void => {
  for (const tier of tiers) for (let seed = 1; seed <= SEEDS; seed++) { const it = generate(M + skill, tier, seed); fn(nums(it.prompt.en), it); }
};
const near = (a: number, b: number, id: string, tol = 1e-6): void => expect(Math.abs(a - b), id).toBeLessThanOrEqual(tol);

describe('Grade 12 MAP4C', () => {
  it('lists 16 skills, each with a generator', () => {
    const ids = (JSON.parse(readFileSync('content/microskills.json', 'utf8')) as { microskills: { id: string }[] }).microskills.map((m) => m.id).filter((i) => i.startsWith(M));
    expect(ids).toHaveLength(16);
    for (const id of ids) for (const tier of [1, 2, 3]) expect(generate(id, tier, 1).id.startsWith(id)).toBe(true);
  });
  it('compares two linear models', () => {
    each('A2.1.a', [1], ([a, r, , , m], it) => near(val(it), a! + r! * m!, it.id));
    each('A2.1.a', [2], ([a, r, b, s], it) => { near(val(it), (a! - b!) / (s! - r!), it.id); expect(Number.isInteger(val(it)), it.id).toBe(true); });
    each('A2.1.a', [3], ([a, r, b, s, m], it) => { near(val(it), b! + s! * m! - (a! + r! * m!), it.id); expect(val(it), it.id).toBeGreaterThan(0); });
  });
  it('mortgages', () => {
    each('B1.2.a', [1], ([P, p, y], it) => { near(val(it), p! * 12 * y! - P!, it.id); expect(val(it), it.id).toBeGreaterThan(0); });
    each('B1.2.a', [2], ([P, i, p], it) => near(val(it), P! * (1 + i! / 100) - p!, it.id));
    each('B1.2.a', [3], ([P, i, p], it) => { near(val(it), p! - (P! * i!) / 100, it.id); expect(val(it), it.id).toBeGreaterThan(0); });
  });
  it('owning against renting', () => {
    each('B2.1.a', [1], ([rent, ins], it) => near(val(it), rent! * 12 + ins!, it.id));
    each('B2.1.a', [2], ([pay, tax, ins, , value], it) => near(val(it), pay! * 12 + tax! + ins! + value! / 100, it.id));
    each('B2.1.a', [3], ([pay, tax, ins, , value, rent, rins], it) => near(val(it), pay! * 12 + tax! + ins! + value! / 100 - (rent! * 12 + rins!), it.id));
  });
  it('optimal dimensions', () => {
    const best = (P: number): number => { let m = 0; for (let w = 1; w < P / 2; w++) m = Math.max(m, w * (P / 2 - w)); return m; };
    each('C2.1.a', [1], ([P], it) => near(val(it), best(P!), it.id));
    const wall = (P: number): number => { let m = 0; for (let w = 1; w < P / 2; w++) m = Math.max(m, w * (P - 2 * w)); return m; };
    each('C2.1.a', [2], ([P], it) => near(val(it), wall(P!), it.id));
    each('C2.1.a', [3], ([A], it) => { let m = Infinity; for (let w = 1; w <= A!; w++) if (A! % w === 0) m = Math.min(m, 2 * (w + A! / w)); near(val(it), m, it.id); });
  });
});
