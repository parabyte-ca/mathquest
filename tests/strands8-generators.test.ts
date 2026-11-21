import { describe, it, expect } from 'vitest';
import { generate } from '../shared/generators/index.js';
import type { Item } from '../shared/items/types.js';

// Independent check of the Grade 8 algebra and data generators: each test reads the English prompt of a generated item,
// recomputes the answer by a different method (substitution, brute force, exact fractions, Pearson's r) and compares.

const SEEDS = 250;
const clean = (s: string): string => s.replace(/\\,/g, '').replace(/\{,\}/g, '.').replace(/\$/g, '');
const nums = (s: string): number[] => [...clean(s).matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
const val = (it: Item): number => (it.answer as { value: number }).value;
const each = (skill: string, tiers: number[], fn: (it: Item, tier: number) => void): void => {
  for (const tier of tiers) for (let seed = 1; seed <= SEEDS; seed++) fn(generate(skill, tier, seed), tier);
};
const close = (a: number, b: number, id = ''): void => expect(Math.abs(a - b), id).toBeLessThan(1e-6);
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const sameFraction = (it: Item, n: number, d: number): void => {
  const a = it.answer as { n: number; d: number };
  expect(a.n * d, it.id).toBe(n * a.d);
  expect(gcd(a.n, a.d), it.id).toBe(1);
};
const sg = (s: string): number => (s === '-' ? -1 : 1);

describe('Grade 8 algebra generators compute correct answers', () => {
  it('compares growing and shrinking patterns', () => {
    each('MS.G8.C1.1.a', [1], (it) => { const [S, d, w] = nums(it.prompt.en) as [number, number, number]; expect(val(it)).toBe(S - d * w); });
    each('MS.G8.C1.1.a', [2], (it) => { const [S1, d1, S2, d2] = nums(it.prompt.en) as [number, number, number, number]; expect(S1 - d1 * val(it), it.id).toBe(S2 + d2 * val(it)); expect(val(it)).toBeGreaterThan(0); });
    each('MS.G8.C1.1.a', [3], (it) => { const [S1, d1, S2, d2] = nums(it.prompt.en) as [number, number, number, number]; expect(S1 - d1 * val(it), it.id).toBe(S2 - d2 * val(it)); expect(val(it)).toBeGreaterThan(0); });
  });

  it('uses pattern rules and solves for unknowns', () => {
    const rule = (it: Item): [number, number] => { const m = /t = (-?[\d.]+)n ([+-]) ([\d.]+)/.exec(clean(it.prompt.en))!; return [Number(m[1]), sg(m[2]!) * Number(m[3])]; };
    each('MS.G8.C1.3.a', [1], (it) => { const [a, b] = rule(it); const n = nums(it.prompt.en).at(-1)!; close(val(it), a * n + b, it.id); });
    each('MS.G8.C1.3.a', [2], (it) => { const [a, b] = rule(it); const V = nums(it.prompt.en).at(-1)!; close(a * val(it) + b, V, it.id); expect(Number.isInteger(val(it))).toBe(true); });
    each('MS.G8.C1.3.a', [3], (it) => { const [x1, v1, x2, v2, T] = nums(it.prompt.en) as number[]; close(val(it), v1! + ((v2! - v1!) / (x2! - x1!)) * (T! - x1!), it.id); });
  });

  it('continues patterns among rational numbers', () => {
    each('MS.G8.C1.4.a', [1], (it) => { const v = nums(it.prompt.en); close(val(it), v[3]! + (v[1]! - v[0]!), it.id); });
    each('MS.G8.C1.4.a', [2], (it) => { const k = [...it.prompt.en.matchAll(/\\frac\{(\d+)\}\{4\}/g)].map((m) => Number(m[1])); close(val(it), (k[3]! + (k[1]! - k[0]!)) / 4, it.id); });
    each('MS.G8.C1.4.a', [3], (it) => { const v = nums(it.prompt.en); close(val(it), v[0]! / 2 ** (v.at(-1)! - 1), it.id); });
  });

  it('adds monomials and binomials', () => {
    each('MS.G8.C2.1.a', [1], (it) => {
      const m = /(\d+)x ([+-]) (\d+)x ([+-]) (\d+)x/.exec(clean(it.prompt.en))!;
      expect(val(it)).toBe(Number(m[1]) + sg(m[2]!) * Number(m[3]) + sg(m[4]!) * Number(m[5]));
    });
    const bin = (it: Item): { a: number; b: number; c: number; d: number } => {
      const m = /\((-?\d+)x ([+-]) (\d+)\) \+ \((-?\d+)x ([+-]) (\d+)\)/.exec(clean(it.prompt.en))!;
      return { a: Number(m[1]), b: sg(m[2]!) * Number(m[3]), c: Number(m[4]), d: sg(m[5]!) * Number(m[6]) };
    };
    each('MS.G8.C2.1.a', [2], (it) => { const { a, b, c, d } = bin(it); expect(val(it)).toBe(/number in front of x/.test(it.prompt.en) ? a + c : b + d); });
    each('MS.G8.C2.1.a', [3], (it) => { const { a, b, c, d } = bin(it); const x = Number(/x = (-?\d+)/.exec(clean(it.prompt.en))![1]); expect(val(it)).toBe((a + c) * x + b + d); });
  });

  it('evaluates expressions with rational numbers', () => {
    each('MS.G8.C2.2.a', [1], (it) => { const m = /(-?[\d.]+)n ([+-]) (\d+)/.exec(clean(it.prompt.en))!; const n = Number(/n = (-?\d+)/.exec(clean(it.prompt.en))![1]); close(val(it), Number(m[1]) * n + sg(m[2]!) * Number(m[3]), it.id); });
    each('MS.G8.C2.2.a', [2], (it) => { const m = /\\frac\{(\d+)\}\{2\}n \+ \\frac\{(\d+)\}\{4\}/.exec(it.prompt.en.replace(/\$/g, ''))!; const n = Number(/n = (-?\d+)/.exec(clean(it.prompt.en))![1]); close(val(it), (Number(m[1]) / 2) * n + Number(m[2]) / 4, it.id); });
    each('MS.G8.C2.2.a', [3], (it) => { const m = /([\d.]+)x - ([\d.]+)y/.exec(clean(it.prompt.en))!; const x = Number(/x = (-?\d+)/.exec(clean(it.prompt.en))![1]), y = Number(/y = (-?\d+)/.exec(clean(it.prompt.en))![1]); close(val(it), Number(m[1]) * x - Number(m[2]) * y, it.id); });
  });

  it('solves equations (checked by substitution)', () => {
    each('MS.G8.C2.3.a', [1, 2], (it) => { const m = /(-?\d+(?:\.\d+)?)x ([+-]) (\d+(?:\.\d+)?) = (-?\d+(?:\.\d+)?)/.exec(clean(it.prompt.en))!; close(Number(m[1]) * val(it) + sg(m[2]!) * Number(m[3]), Number(m[4]), it.id); });
    each('MS.G8.C2.3.a', [3], (it) => { const m = /(-?\d+)x ([+-]) (\d+) = (-?\d+)x ([+-]) (\d+)/.exec(clean(it.prompt.en))!; close(Number(m[1]) * val(it) + sg(m[2]!) * Number(m[3]), Number(m[4]) * val(it) + sg(m[5]!) * Number(m[6]), it.id); });
  });

  it('solves inequalities with integers (brute force)', () => {
    each('MS.G8.C2.4.a', [1, 2, 3], (it) => {
      const m = /(-?\d*)x ([+-]) (\d+) (<|\\leq|>) (-?\d+)/.exec(clean(it.prompt.en))!;
      const a = m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1]), b = sg(m[2]!) * Number(m[3]), c = Number(m[5]);
      const holds = (x: number): boolean => { const v = a * x + b; return m[4] === '<' ? v < c : m[4] === '>' ? v > c : v <= c; };
      let best = -999;
      for (let x = -300; x <= 300; x++) if (holds(x)) best = x;
      expect(val(it), it.id).toBe(best);
    });
  });
});

describe('Grade 8 data generators compute correct answers', () => {
  it('reads two-variable tables', () => {
    each('MS.G8.D1.2.a', [1, 2, 3], (it) => {
      const v = nums(it.prompt.en);
      const ys = v.slice(4, 8), last = v.at(-1)!;
      const m = ys[1]! - ys[0]!, c = ys[0]! - m;
      for (let i = 0; i < 4; i++) close(ys[i]!, m * (i + 1) + c, it.id);
      if (/For what value of x/.test(it.prompt.en)) close(val(it), (last - c) / m, it.id); else close(val(it), m * last + c, it.id);
    });
  });

  it('describes correlation (Pearson r, outliers ignored)', () => {
    const label = (r: number): string => { const a = Math.abs(r); const dir = r > 0 ? 'positive' : 'negative'; return a >= 0.9 ? `Strong ${dir} correlation` : a >= 0.4 && a <= 0.75 ? `Weak ${dir} correlation` : 'No correlation'; };
    each('MS.G8.D1.5.a', [1, 2, 3], (it) => {
      const text = it.prompt.en.replace(/\$/g, '').replace(/\\ /g, ' ');
      let pts = [...text.matchAll(/\((-?\d+), (-?\d+)\)/g)].map((m) => [Number(m[1]), Number(m[2])] as [number, number]);
      const o = /The point \((-?\d+), (-?\d+)\) is an outlier/.exec(text);
      if (o) pts = pts.filter((p) => !(p[0] === Number(o[1]) && p[1] === Number(o[2])));
      const n = pts.length, mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
      const r = pts.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / Math.sqrt(pts.reduce((s, p) => s + (p[0] - mx) ** 2, 0) * pts.reduce((s, p) => s + (p[1] - my) ** 2, 0));
      expect(it.options![(it.answer as { index: number }).index]!.en, it.id).toBe(label(r));
    });
  });

  it('counts with Venn diagrams', () => {
    each('MS.G8.D2.1.a', [1], (it) => { const [a, b, both] = nums(it.prompt.en) as [number, number, number]; expect(val(it)).toBe(a + b - both); });
    each('MS.G8.D2.1.a', [2], (it) => { const [N, a, b, none] = nums(it.prompt.en) as [number, number, number, number]; expect(val(it)).toBe(a + b - (N - none)); expect(val(it)).toBeLessThanOrEqual(Math.min(a, b)); });
    each('MS.G8.D2.1.a', [3], (it) => { const [N, a, b, both] = nums(it.prompt.en) as [number, number, number, number]; close(val(it), ((a + b - both) / N) * 100, it.id); });
  });

  it('multiplies probabilities of several events exactly', () => {
    each('MS.G8.D2.2.a', [1], (it) => { const m = /\\frac\{(\d+)\}\{(\d+)\}/.exec(it.prompt.en)!; sameFraction(it, Number(m[1]) ** 3, Number(m[2]) ** 3); });
    each('MS.G8.D2.2.a', [2], (it) => { const [red, blue] = nums(it.prompt.en) as [number, number]; const N = red + blue; sameFraction(it, red * (red - 1) * (red - 2), N * (N - 1) * (N - 2)); });
    each('MS.G8.D2.2.a', [3], (it) => { const [red, blue] = nums(it.prompt.en) as [number, number]; const N = red + blue; sameFraction(it, 2 * red * blue, N * (N - 1)); });
  });
});
