import { describe, it, expect } from 'vitest';
import { generate } from '../shared/generators/index.js';
import type { Item } from '../shared/items/types.js';

// Independent check of the Grade 8 Number generators: each test reads the English prompt of a generated item, recomputes the
// answer by a different method (JavaScript evaluation of the expression, exact fractions) and compares it with the stored answer.

const SEEDS = 250;
const clean = (s: string): string => s.replace(/\\,/g, '').replace(/\{,\}/g, '.');
const nums = (s: string): number[] => [...clean(s).matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
const val = (it: Item): number => (it.answer as { value: number }).value;
const each = (skill: string, tiers: number[], fn: (it: Item, tier: number) => void): void => {
  for (const tier of tiers) for (let seed = 1; seed <= SEEDS; seed++) fn(generate(skill, tier, seed), tier);
};
const close = (a: number, b: number, id = ''): void => expect(Math.abs(a - b), id).toBeLessThan(1e-6);
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const maths = (s: string): string => /\$([^$]*)\$/.exec(clean(s))![1]!;
/** Evaluates the TeX the generators write (times, divide, fractions, powers, roots) with JavaScript. */
const evalTex = (tex: string): number => {
  const js = tex
    .replace(/\\times/g, '*').replace(/\\div/g, '/')
    .replace(/\\frac\{(-?\d+)\}\{(-?\d+)\}/g, '(($1)/($2))')
    .replace(/\\sqrt\{(\d+(?:\.\d+)?)\}/g, 'Math.sqrt($1)')
    .replace(/\^\{(\d+)\}/g, '**$1').replace(/\^(\d)/g, '**$1');
  return Function(`"use strict"; return (${js});`)() as number;
};
const run = (s: string): number => evalTex(maths(s));

/** A fraction token: mixed number, fraction or whole number, as exact [n, d]. */
const tok = (s: string): [number, number] => {
  const m = /^(\d+)?\\frac\{(\d+)\}\{(\d+)\}$/.exec(s.trim());
  if (m) return [Number(m[1] ?? 0) * Number(m[3]) + Number(m[2]), Number(m[3])];
  return [Number(s.trim()), 1];
};
const sameFraction = (it: Item, n: number, d: number): void => {
  const a = it.answer as { n: number; d: number };
  expect(a.n * d, it.id).toBe(n * a.d);
  expect(gcd(a.n, a.d), it.id).toBe(1);
  expect(a.d).toBeGreaterThan(1);
};

describe('Grade 8 number generators compute correct answers', () => {
  it('writes numbers in scientific notation', () => {
    each('MS.G8.B1.1.a', [1, 3], (it) => { const N = nums(it.prompt.en)[0]!; expect(val(it), it.id).toBe(Math.floor(Math.log10(N))); });
    each('MS.G8.B1.1.a', [2], (it) => { const [a, , e] = nums(it.prompt.en) as [number, number, number]; close(val(it), a * 10 ** e, it.id); });
  });

  it('classifies real numbers', () => {
    each('MS.G8.B1.2.a', [1, 2, 3], (it) => {
      const list = maths(it.prompt.en).split(',\\ ');
      const irrational = (x: string): boolean => { const m = /^\\sqrt\{(\d+)\}$/.exec(x); return x === '\\pi' || (!!m && !Number.isInteger(Math.sqrt(Number(m[1])))); };
      expect(val(it), it.id).toBe(list.filter(irrational).length);
    });
  });

  it('estimates and calculates square roots', () => {
    each('MS.G8.B1.3.a', [1], (it) => expect(val(it) ** 2).toBe(nums(it.prompt.en)[0]!));
    each('MS.G8.B1.3.a', [2], (it) => { const n = nums(it.prompt.en)[0]!; expect(val(it), it.id).toBe(Math.round(Math.sqrt(n))); });
    each('MS.G8.B1.3.a', [3], (it) => close(val(it) ** 2, nums(it.prompt.en)[0]!, it.id));
  });

  it('works with percents above 100 and below 1', () => {
    each('MS.G8.B1.4.a', [1, 2], (it) => { const [p, N] = nums(it.prompt.en) as [number, number]; close(val(it), (N * p) / 100, it.id); });
    each('MS.G8.B1.4.a', [3], (it) => { const [a, b] = nums(it.prompt.en) as [number, number]; close(val(it), (b / a) * 100, it.id); });
  });

  it('follows the order of operations with rational numbers', () => {
    each('MS.G8.B2.1.a', [1, 2, 3], (it) => close(val(it), run(it.prompt.en), it.id));
  });

  it('recalls squares and square roots', () => {
    each('MS.G8.B2.2.a', [1], (it) => expect(val(it)).toBe(nums(it.prompt.en)[0]! ** 2));
    each('MS.G8.B2.2.a', [2], (it) => expect(val(it) ** 2).toBe(nums(it.prompt.en)[0]!));
    each('MS.G8.B2.2.a', [3], (it) => close(val(it), run(it.prompt.en), it.id));
  });

  it('multiplies and divides by powers of ten', () => {
    each('MS.G8.B2.3.a', [1, 2, 3], (it) => close(val(it), run(it.prompt.en), it.id));
  });

  it('adds and subtracts integers', () => {
    each('MS.G8.B2.4.a', [1, 2], (it) => close(val(it), run(it.prompt.en), it.id));
    each('MS.G8.B2.4.a', [3], (it) => { const [s, u, d] = nums(it.prompt.en) as [number, number, number]; expect(val(it)).toBe(s + u - d); });
  });

  it('adds and subtracts fractions and mixed numbers exactly', () => {
    each('MS.G8.B2.5.a', [1, 2, 3], (it) => {
      const parts = maths(it.prompt.en).split(/ ([+-]) /);
      let [n, d] = tok(parts[0]!);
      for (let i = 1; i < parts.length; i += 2) {
        const [n2, d2] = tok(parts[i + 1]!);
        n = parts[i] === '+' ? n * d2 + n2 * d : n * d2 - n2 * d;
        d *= d2;
      }
      sameFraction(it, n, d);
    });
  });

  it('multiplies and divides fractions, whole numbers and mixed numbers exactly', () => {
    each('MS.G8.B2.6.a', [1, 2, 3], (it) => {
      const m = /^(.*) \\(times|div) (.*)$/.exec(maths(it.prompt.en))!;
      const [n1, d1] = tok(m[1]!), [n2, d2] = tok(m[3]!);
      if (m[2] === 'times') sameFraction(it, n1 * n2, d1 * d2); else sameFraction(it, n1 * d2, d1 * n2);
    });
  });

  it('multiplies and divides integers', () => {
    each('MS.G8.B2.7.a', [1, 2, 3], (it) => close(val(it), run(it.prompt.en), it.id));
  });

  it('compares proportional situations and finds unknown values', () => {
    each('MS.G8.B2.8.a', [1], (it) => { const [a, b, c] = nums(it.prompt.en) as [number, number, number]; close(val(it), (a * c) / b, it.id); });
    each('MS.G8.B2.8.a', [2], (it) => { const [q1, P1, q2, P2] = nums(it.prompt.en) as [number, number, number, number]; close(val(it), Math.abs(P2 / q2 - P1 / q1), it.id); });
    each('MS.G8.B2.8.a', [3], (it) => { const [s1, cups, s2] = nums(it.prompt.en) as [number, number, number]; close(val(it), (cups / s1) * s2, it.id); });
  });
});
