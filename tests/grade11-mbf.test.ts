import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { generate } from '../shared/generators/index.js';
import type { Item } from '../shared/items/types.js';

// Independent check of the new MBF3C generators: each test reads the English prompt of a generated item and recomputes the
// answer by a different method.

const SEEDS = 250;
const M = 'MS.G11.MBF3C.';
const clean = (s: string): string => s.replace(/\\,/g, '').replace(/\$/g, '');
const nums = (s: string): number[] => [...clean(s.replace(/per 100 km/g, 'per hundred km')).matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
const math = (it: Item): string[] => [...it.prompt.en.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]!);
const val = (it: Item): number => (it.answer as { value: number }).value;
const each = (skill: string, tiers: number[], fn: (it: Item, tier: number) => void): void => {
  for (const tier of tiers) for (let seed = 1; seed <= SEEDS; seed++) fn(generate(skill, tier, seed), tier);
};
const near = (a: number, b: number, id: string, tol = 1e-9): void => expect(Math.abs(a - b), id).toBeLessThanOrEqual(tol);

describe('Grade 11 MBF3C', () => {
  it('the course lists 16 skills, each with a generator', () => {
    const ids = (JSON.parse(readFileSync('content/microskills.json', 'utf8')) as { microskills: { id: string }[] }).microskills.map((m) => m.id).filter((i) => i.startsWith(M));
    expect(ids).toHaveLength(16);
    for (const id of ids) for (const tier of [1, 2, 3]) expect(generate(id, tier, 1).id.startsWith(id)).toBe(true);
  });

  it('zero exponents', () => {
    each(M + 'A2.1.a', [1], (it) => {
      const m = /(\d+)\^\{0\} \+ (\d+)\^\{(\d+)\}/.exec(math(it)[0]!)!;
      near(val(it), 1 + Math.pow(Number(m[2]), Number(m[3])), it.id);
    });
  });
  it('negative exponents', () => {
    each(M + 'A2.1.a', [2], (it) => {
      const m = /(\d+)\^\{-(\d+)\}/.exec(math(it)[0]!)!;
      near(val(it), 1 / Math.pow(Number(m[1]), Number(m[2])), it.id);
    });
  });
  it('combined exponent rules', () => {
    each(M + 'A2.1.a', [3], (it) => {
      const m = /\\frac\{(\d+)\^\{(\d+)\} \\times \d+\^\{-(\d+)\}\}\{\d+\^\{-(\d+)\}\}/.exec(math(it)[0]!)!;
      const b = Number(m[1]), p = Number(m[2]), q = Number(m[3]), s = Number(m[4]);
      near(val(it), (Math.pow(b, p) * Math.pow(b, -q)) / Math.pow(b, -s), it.id);
    });
  });

  it('fuel for a trip', () => {
    each(M + 'B3.1.a', [1], (it) => {
      const [use, price, km] = nums(it.prompt.en) as [number, number, number];
      near(val(it), (km / 100) * use * price, it.id, 1e-6);
    });
  });
  it('yearly cost of owning a car', () => {
    each(M + 'B3.1.a', [2], (it) => {
      const [monthly, maint, km, use, price] = nums(it.prompt.en) as [number, number, number, number, number];
      near(val(it), monthly * 12 + maint + (km / 100) * use * price, it.id, 1e-6);
    });
  });
  it('cost per kilometre', () => {
    each(M + 'B3.1.a', [3], (it) => {
      const [pay, ins, maint, fuel, km] = nums(it.prompt.en) as [number, number, number, number, number];
      expect(fuel, it.id).toBeGreaterThanOrEqual(800);
      near(val(it), (pay * 12 + ins + maint + fuel) / km, it.id, 1e-6);
    });
  });
});
