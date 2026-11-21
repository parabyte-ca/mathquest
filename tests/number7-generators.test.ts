import { describe, it, expect } from 'vitest';
import { generate } from '../shared/generators/index.js';
import type { Item } from '../shared/items/types.js';

// Independent check of the Grade 7 Number generators: each test reads the English prompt of a generated item, recomputes the
// answer by a different method (brute force, JavaScript evaluation, exact fractions) and compares it with the stored answer.

const SEEDS = 250;
const clean = (s: string): string => s.replace(/\\,/g, '').replace(/\{,\}/g, '.');
const nums = (s: string): number[] => [...clean(s).matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
const val = (it: Item): number => (it.answer as { value: number }).value;
const each = (skill: string, tiers: number[], fn: (it: Item, tier: number) => void): void => {
  for (const tier of tiers) for (let seed = 1; seed <= SEEDS; seed++) fn(generate(skill, tier, seed), tier);
};
const close = (a: number, b: number): void => expect(Math.abs(a - b)).toBeLessThan(1e-6);
const maths = (s: string): string => /\$([^$]*)\$/.exec(clean(s))![1]!;
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const fr = (it: Item): { n: number; d: number } => it.answer as { n: number; d: number };
/** Every "$...$" fragment as an exact fraction: "2\frac{3}{4}" is 11/4, "\frac{1}{2}" is 1/2. */
const fractionsIn = (s: string): [number, number][] =>
  [...clean(s).matchAll(/(\d+)?\\frac\{(\d+)\}\{(\d+)\}/g)].map((m) => [Number(m[1] ?? 0) * Number(m[3]) + Number(m[2]), Number(m[3])]);
const sameFraction = (it: Item, n: number, d: number): void => {
  const a = fr(it);
  expect(a.n * d, it.id).toBe(n * a.d);
  expect(gcd(a.n, a.d), it.id).toBe(1);
};
const run = (expr: string): number => Function(`"use strict"; return (${expr});`)() as number;

describe('Grade 7 number generators compute correct answers', () => {
  it('squares and square roots', () => {
    each('MS.G7.B1.2.a', [1], (it) => { const N = nums(it.prompt.en)[0]!; expect(val(it) * val(it)).toBe(N); });
    each('MS.G7.B1.2.a', [2], (it) => { const k = nums(it.prompt.en)[0]!; expect(val(it)).toBe(k * k); });
    each('MS.G7.B1.2.a', [3], (it) => { const N = nums(it.prompt.en)[0]!; expect((val(it) / 4) ** 2).toBe(N); });
  });

  it('compares rational numbers', () => {
    for (let tier = 1; tier <= 3; tier++) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const it = generate('MS.G7.B1.3.a', tier, seed);
        const tokens = [...clean(maths(it.prompt.en)).matchAll(/-\\frac\{(\d+)\}\{(\d+)\}|-?\d+(?:\.\d+)?/g)]
          .map((m) => (m[1] ? -Number(m[1]) / Number(m[2]) : Number(m[0])));
        const [a, b] = tokens as [number, number];
        const sym = a < b - 1e-9 ? '<' : a > b + 1e-9 ? '>' : '=';
        expect(it.options![(it.answer as { index: number }).index]!.en, it.id).toBe(`$${sym}$`);
      }
    }
  });

  it('writes fractions in simplest form', () => {
    each('MS.G7.B1.4.a', [1, 2, 3], (it) => { const [[N, D]] = fractionsIn(it.prompt.en) as [[number, number]]; sameFraction(it, N, D); });
  });

  it('follows the order of operations', () => {
    each('MS.G7.B2.1.a', [1, 2, 3], (it) => {
      const e = maths(it.prompt.en).replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\^2/g, '**2');
      close(val(it), run(e));
    });
  });

  it('increases and decreases by a percent', () => {
    each('MS.G7.B2.3.a', [1, 2, 3], (it) => {
      const [base, p] = nums(it.prompt.en) as [number, number];
      const up = /Increase|goes up/.test(it.prompt.en);
      close(val(it), base * (up ? 1 + p / 100 : 1 - p / 100));
    });
  });

  it('adds and subtracts integers', () => {
    each('MS.G7.B2.4.a', [1, 2], (it) => close(val(it), run(maths(it.prompt.en))));
    each('MS.G7.B2.4.a', [3], (it) => { const [s, d, r] = nums(it.prompt.en) as [number, number, number]; expect(val(it)).toBe(s - d + r); });
  });

  it('adds and subtracts fractions and mixed numbers exactly', () => {
    each('MS.G7.B2.5.a', [1, 2, 3], (it) => {
      const [[n1, d1], [n2, d2]] = fractionsIn(it.prompt.en) as [[number, number], [number, number]];
      const sub = /^Subtract/.test(it.prompt.en);
      const n = sub ? n1 * d2 - n2 * d1 : n1 * d2 + n2 * d1;
      sameFraction(it, n, d1 * d2);
    });
  });

  it('finds greatest common factors and least common multiples by brute force', () => {
    each('MS.G7.B2.6.a', [1, 2, 3], (it) => {
      const [a, b] = nums(it.prompt.en) as [number, number];
      let best = 1;
      for (let k = 1; k <= Math.min(a, b); k++) if (a % k === 0 && b % k === 0) best = k;
      expect(val(it)).toBe(best);
    });
    each('MS.G7.B2.6.b', [1, 2, 3], (it) => {
      const xs = nums(it.prompt.en);
      let m = Math.max(...xs);
      while (!xs.every((x) => m % x === 0)) m += Math.max(...xs);
      expect(val(it)).toBe(m);
    });
  });

  it('evaluates powers', () => {
    each('MS.G7.B2.7.a', [1], (it) => { const [b, n] = nums(it.prompt.en) as [number, number]; expect(val(it)).toBe(b ** n); });
    each('MS.G7.B2.7.a', [2], (it) => {
      const factors = maths(it.prompt.en).split('\\times').length;
      expect(val(it)).toBe(factors);
    });
    each('MS.G7.B2.7.a', [3], (it) => { const [b, n] = nums(it.prompt.en) as [number, number]; expect(val(it)).toBe(b ** n); });
  });

  it('multiplies and divides fractions exactly', () => {
    each('MS.G7.B2.8.a', [1, 2, 3], (it) => {
      const [[n1, d1], [n2, d2]] = fractionsIn(it.prompt.en) as [[number, number], [number, number]];
      sameFraction(it, n1 * n2, d1 * d2);
    });
    each('MS.G7.B2.8.b', [1, 2], (it) => {
      const [[n1, d1], [n2, d2]] = fractionsIn(it.prompt.en) as [[number, number], [number, number]];
      sameFraction(it, n1 * d2, d1 * n2);
    });
    each('MS.G7.B2.8.b', [3], (it) => {
      const [[pn, pd], [tn, td]] = fractionsIn(it.prompt.en) as [[number, number], [number, number]];
      // servings = total / per serving, which must be a whole number
      expect((tn * pd) / (td * pn)).toBe(val(it));
      expect(Number.isInteger(val(it))).toBe(true);
    });
  });

  it('multiplies and divides decimals by decimals', () => {
    each('MS.G7.B2.9.a', [1, 2], (it) => { const [a, b] = nums(it.prompt.en) as [number, number]; close(val(it), a * b); });
    each('MS.G7.B2.9.a', [3], (it) => { const [a, b] = nums(it.prompt.en) as [number, number]; close(val(it) * b, a); });
  });

  it('solves proportional reasoning problems', () => {
    each('MS.G7.B2.10.a', [1, 2], (it) => { const [q1, cost, q2] = nums(it.prompt.en) as [number, number, number]; close(val(it), (cost / q1) * q2); });
    each('MS.G7.B2.10.a', [3], (it) => { const [d, t1, h] = nums(it.prompt.en) as [number, number, number]; close(val(it), (d / t1) * h); });
  });

  it('converts fractions and decimals to percents', () => {
    each('MS.G7.B1.7.a', [1, 3], (it) => { const [[n, d]] = fractionsIn(it.prompt.en) as [[number, number]]; close(val(it), (n / d) * 100); });
    each('MS.G7.B1.7.a', [2], (it) => close(val(it), nums(it.prompt.en)[0]! * 100));
  });
});
