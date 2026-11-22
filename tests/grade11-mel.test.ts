import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { generate } from '../shared/generators/index.js';
import type { Item } from '../shared/items/types.js';

// Independent check of the new MEL3E generators: each test reads the English prompt of a generated item and recomputes the
// answer by a different method.

const SEEDS = 250;
const M = 'MS.G11.MEL3E.';
const nums = (s: string): number[] => [...s.replace(/per 100 km|per 100 g|100 g/g, 'per hundred').replace(/\\,/g, '').replace(/\$/g, '').matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
const val = (it: Item): number => (it.answer as { value: number }).value;
const each = (skill: string, tiers: number[], fn: (n: number[], it: Item) => void): void => {
  for (const tier of tiers) for (let seed = 1; seed <= SEEDS; seed++) { const it = generate(M + skill, tier, seed); fn(nums(it.prompt.en), it); }
};
const near = (a: number, b: number, id: string, tol = 1e-6): void => expect(Math.abs(a - b), id).toBeLessThanOrEqual(tol);

describe('Grade 11 MEL3E', () => {
  it('lists 10 skills, each with a generator', () => {
    const ids = (JSON.parse(readFileSync('content/microskills.json', 'utf8')) as { microskills: { id: string }[] }).microskills.map((m) => m.id).filter((i) => i.startsWith(M));
    expect(ids).toHaveLength(10);
    for (const id of ids) for (const tier of [1, 2, 3]) expect(generate(id, tier, 1).id.startsWith(id)).toBe(true);
  });
  it('pay', () => {
    each('A1.1.a', [1], ([w, h], it) => near(val(it), w! * h!, it.id));
    each('A1.1.a', [2], ([w, , hours], it) => near(val(it), w! * 40 + 1.5 * w! * (hours! - 40), it.id));
    each('A1.1.a', [3], ([base, rate, sales], it) => near(val(it), base! + (sales! * rate!) / 100, it.id));
  });
  it('net pay', () => {
    each('A2.1.a', [1], ([g, a, b, c], it) => near(val(it), g! - a! - b! - c!, it.id));
    each('A2.1.a', [2], ([g, a, b, c], it) => near(val(it), g! * (1 - (a! + b! + c!) / 100), it.id));
    each('A2.1.a', [3], ([g, p, cost], it) => near(val(it), cost! / (g! * (1 - p! / 100)), it.id));
  });
  it('sale prices', () => {
    each('A3.1.a', [1], ([p, d], it) => near(val(it), p! - (p! * d!) / 100, it.id));
    each('A3.1.a', [2], ([p, tax], it) => near(val(it), p! + (p! * tax!) / 100, it.id, 0.006));
    each('A3.1.a', [3], ([p, d, tax, paid], it) => near(val(it), paid! - (p! - (p! * d!) / 100) * (1 + tax! / 100), it.id, 0.006));
  });
  it('unit prices', () => {
    each('A3.2.a', [1], ([q, p], it) => near(val(it), p! / (q! / 100), it.id));
    each('A3.2.a', [2], ([q1, p1, q2, p2], it) => near(val(it), Math.abs(p1! / (q1! / 100) - p2! / (q2! / 100)), it.id, 0.006));
    each('A3.2.a', [3], ([q1, p1, q2, p2, need], it) => near(val(it), Math.min(p1! / (q1! / 100), p2! / (q2! / 100)) * (need! / 100), it.id, 0.006));
  });
  it('savings', () => {
    each('B1.1.a', [1], ([P, r, y], it) => near(val(it), (P! * r! * y!) / 100, it.id));
    each('B1.1.a', [2], ([P, r, y], it) => near(val(it), P! + (P! * r! * y!) / 100, it.id));
    each('B1.1.a', [3], ([P, I, r], it) => near(val(it), I! / ((P! * r!) / 100), it.id));
  });
  it('buying against leasing', () => {
    each('C1.2.a', [1], ([m, n, down], it) => near(val(it), m! * n! + down!, it.id));
    each('C1.2.a', [2], ([price, , resale], it) => near(val(it), price! - resale!, it.id));
    each('C1.2.a', [3], ([m, n, down, price, , resale], it) => near(val(it), Math.abs(m! * n! + down! - (price! - resale!)), it.id));
  });
  it('map scales and trips', () => {
    each('C2.1.a', [1], ([, k, d], it) => near(val(it), k! * d!, it.id));
    each('C2.1.a', [2], ([, k, d, use, price], it) => near(val(it), ((k! * d!) / 100) * use! * price!, it.id, 0.006));
    each('C2.1.a', [3], ([d, , k, cpk, fare], it) => { near(val(it), d! * k! * cpk! - fare!, it.id, 0.006); expect(val(it), it.id).toBeGreaterThan(0); });
  });
});
