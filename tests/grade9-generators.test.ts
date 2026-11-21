import { describe, it, expect } from 'vitest';
import { generate } from '../shared/generators/index.js';
import type { Item } from '../shared/items/types.js';

// Independent check of the Grade 9 (MTH1W) Number and Algebra generators: each test reads the English prompt of a generated item,
// recomputes the answer by a different method and compares it with the stored answer.

const SEEDS = 250;
const clean = (s: string): string => s.replace(/\\,/g, '').replace(/\{,\}/g, '.').replace(/\\ldots/g, '').replace(/\\ /g, ' ').replace(/\$/g, '');
const nums = (s: string): number[] => [...clean(s).matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
const val = (it: Item): number => (it.answer as { value: number }).value;
const idx = (it: Item): number => (it.answer as { index: number }).index;
const rightRaw = (it: Item): string => it.options![idx(it)]!.en;
const rightText = (it: Item): string => clean(rightRaw(it));
const each = (skill: string, tiers: number[], fn: (it: Item, tier: number) => void): void => {
  for (const tier of tiers) for (let seed = 1; seed <= SEEDS; seed++) fn(generate(skill, tier, seed), tier);
};
const close = (a: number, b: number, id = '', tol = 1e-6): void => expect(Math.abs(a - b), id).toBeLessThan(tol);
const isSquare = (n: number): boolean => Number.isInteger(Math.sqrt(n));
const evalExpr = (s: string, x: number): number => new Function('x', `return ${s.replace(/(\d)x/g, '$1*x').replace(/(\d)\(/g, '$1*(').replace(/\)\(/g, ')*(')};`)(x) as number;

describe('Grade 9 Number generators compute correct answers', () => {
  const SET_OF: [RegExp, string][] = [[/^7$|^12$/, 'natural numbers'], [/^0$/, 'whole numbers'], [/^-4$|^-15$/, 'integers'], [/frac|^0\.25$/, 'rational numbers'], [/sqrt|pi/, 'irrational numbers']];
  it('subsets of the number system', () => {
    each('MS.G9.B1.2.a', [1], (it) => { const x = /contains \$(.+?)\$\?/.exec(it.prompt.en)![1]!; const set = SET_OF.find(([re]) => re.test(x))![1]; expect(rightRaw(it), x).toBe(set); });
    const TRUE = ['Every integer is a rational number.', 'Every natural number is a whole number.', 'Every whole number is an integer.'];
    each('MS.G9.B1.2.a', [2], (it) => { const flags = it.options!.map((o) => TRUE.includes(o.en)); expect(flags.filter(Boolean).length).toBe(1); expect(flags[idx(it)]).toBe(true); });
    each('MS.G9.B1.2.a', [3], (it) => {
      const irr = it.options!.map((o) => { const m = /\\sqrt\{(\d+)\}/.exec(o.en); return m ? !isSquare(Number(m[1])) : false; });
      expect(irr.filter(Boolean).length, it.id).toBe(1); expect(irr[idx(it)]).toBe(true);
    });
  });

  it('density, infinity and limits', () => {
    each('MS.G9.B1.3.a', [1], (it) => { expect(rightText(it)).toBe('Infinitely many'); });
    each('MS.G9.B1.3.a', [2], (it) => {
      const [d2, d1] = [...it.prompt.en.matchAll(/\\frac\{1\}\{(\d+)\}/g)].map((m) => Number(m[1])) as [number, number];
      const lo = 1 / d2, hi = 1 / d1; const inside = it.options!.map((o) => { const v = Number(clean(o.en)); return v > lo && v < hi; });
      expect(inside.filter(Boolean).length, it.id).toBe(1); expect(inside[idx(it)]).toBe(true);
    });
    each('MS.G9.B1.3.a', [3], (it) => {
      const p = clean(it.prompt.en); const lim = /0\.9/.test(p) ? 1 : /2\.1/.test(p) ? 2 : /3\.9/.test(p) ? 4 : 0;
      close(Number(rightText(it)), lim, it.id);
    });
  });

  it('exponents and scientific notation', () => {
    each('MS.G9.B2.1.a', [1], (it) => { const [b, e] = nums(it.prompt.en) as [number, number]; close(val(it), b ** e, it.id); });
    each('MS.G9.B2.1.a', [2], (it) => { const v = Number(/Write \$([^$]+)\$ in scientific/.exec(it.prompt.en.replace(/\\,/g, '').replace(/\{,\}/g, '.'))![1]); close(val(it), Math.floor(Math.log10(Math.abs(v)) + 1e-12), it.id); });
    each('MS.G9.B2.1.a', [3], (it) => {
      const m = /\((\d+) \\times 10\^\{(-?\d+)\}\) \\times \((\d+) \\times 10\^\{(-?\d+)\}\)/.exec(it.prompt.en)!;
      let c = Number(m[1]) * Number(m[3]), p = Number(m[2]) + Number(m[4]); while (c >= 10) { c /= 10; p++; }
      close(val(it), p, it.id);
    });
  });

  it('exponent laws', () => {
    each('MS.G9.B2.2.a', [1], (it) => {
      const raw = it.prompt.en;
      let m = /(\d+)\^\{(\d+)\} \\times (\d+)\^\{(\d+)\}/.exec(raw);
      if (m) { close(val(it), Number(m[2]) + Number(m[4]), it.id); return; }
      m = /(\d+)\^\{(\d+)\} \\div (\d+)\^\{(\d+)\}/.exec(raw);
      if (m) { close(val(it), Number(m[2]) - Number(m[4]), it.id); return; }
      m = /\((\d+)\^\{(\d+)\}\)\^\{(\d+)\}/.exec(raw)!;
      close(val(it), Number(m[2]) * Number(m[3]), it.id);
    });
    each('MS.G9.B2.2.a', [2], (it) => {
      const m = /\\frac\{(\d+)\^\{(\d+)\} \\times \d+\^\{(\d+)\}\}\{\d+\^\{(\d+)\}\}/.exec(it.prompt.en)!;
      close(val(it), (Number(m[1]) ** Number(m[2]) * Number(m[1]) ** Number(m[3])) / Number(m[1]) ** Number(m[4]), it.id);
    });
    each('MS.G9.B2.2.a', [3], (it) => { const m = /\\frac\{\(x\^\{(\d+)\}\)\^\{(\d+)\}\}\{x\^\{(\d+)\}\}/.exec(it.prompt.en)!; close(val(it), Number(m[1]) * Number(m[2]) - Number(m[3]), it.id); expect(val(it)).toBeGreaterThan(0); });
  });

  it('integers in context', () => {
    each('MS.G9.B3.1.a', [1], (it) => { const [s, u, d] = nums(it.prompt.en) as [number, number, number]; close(val(it), s + u - d, it.id); });
    each('MS.G9.B3.1.a', [2], (it) => { const [below, above] = nums(it.prompt.en) as [number, number]; close(val(it), Math.abs(above - below), it.id); });
    each('MS.G9.B3.1.a', [3], (it) => { const [s, rate, mins] = nums(it.prompt.en) as [number, number, number]; let h = s; for (let i = 0; i < mins; i++) h += rate; close(val(it), h, it.id); });
  });

  it('unit fractions and measuring', () => {
    each('MS.G9.B3.2.a', [1], (it) => {
      const [a, b] = (/\$\\frac\{(\d+)\}\{(\d+)\}\$ cup/.exec(it.prompt.en)!).slice(1).map(Number) as [number, number];
      const d = Number(/\(\$\\frac\{1\}\{(\d+)\}\$\)/.exec(it.prompt.en)![1]);
      close(val(it), (a * d) / b, it.id); expect(Number.isInteger(val(it))).toBe(true);
    });
    each('MS.G9.B3.2.a', [2], (it) => { const m = /(\d+)\\frac\{(\d+)\}\{4\}\$ inches/.exec(it.prompt.en)!; close(val(it), (Number(m[1]) + Number(m[2]) / 4) * 16, it.id); });
    each('MS.G9.B3.2.a', [3], (it) => {
      const board = /A board is \$(\d+)(?:\\frac\{(\d+)\}\{(\d+)\})?\$ m/.exec(it.prompt.en)!; const piece = /\$\\frac\{(\d+)\}\{(\d+)\}\$ m are cut/.exec(it.prompt.en)!;
      const d = Number(piece[2]); const total = Number(board[1]) * d + Number(board[2] ?? 0) * (board[3] ? d / Number(board[3]) : 0);
      close(val(it), Math.floor(total / Number(piece[1])), it.id);
    });
  });

  it('signs in rates, ratios and decimals', () => {
    each('MS.G9.B3.3.a', [1], (it) => { const [total, n] = nums(it.prompt.en) as [number, number]; close(val(it), total / n, it.id); expect(val(it)).toBeLessThan(0); });
    each('MS.G9.B3.3.a', [2], (it) => { const m = /\$(-?[\d.]+) \\div \((-?[\d.]+)\)\$/.exec(it.prompt.en)!; close(val(it), Number(m[1]) / Number(m[2]), it.id); });
    each('MS.G9.B3.3.a', [3], (it) => { const [rate, days] = nums(it.prompt.en) as [number, number]; let total = 0; for (let i = 0; i < days; i++) total += rate; close(val(it), total, it.id); expect(val(it)).toBeLessThan(0); });
  });

  it('positive and negative fractions', () => {
    for (const tier of [1, 2, 3]) {
      each('MS.G9.B3.4.a', [tier], (it) => {
        const expr = /Calculate \$([^$]+)\$\./.exec(it.prompt.en)![1]!;
        const m = /^(-)?(\d+)?\\frac\{(\d+)\}\{(\d+)\} ([+-]) (\d+)?\\frac\{(\d+)\}\{(\d+)\}$/.exec(expr)!;
        const [w1, n1, d1, w2, n2, d2] = [Number(m[2] ?? 0), Number(m[3]), Number(m[4]), Number(m[6] ?? 0), Number(m[7]), Number(m[8])];
        const A = (m[1] ? -1 : 1) * (w1 + n1 / d1), B = w2 + n2 / d2; const exact = m[5] === '+' ? A + B : A - B;
        const a = it.answer as { n: number; d: number; mustReduce?: boolean };
        close(a.n / a.d, exact, it.id); expect(a.d).toBeGreaterThan(1); expect(a.mustReduce).toBe(true);
        const g = (x: number, y: number): number => (y ? g(y, x % y) : Math.abs(x)); expect(g(a.n, a.d)).toBe(1);
      });
    }
  });

  it('rates, percentages and proportions', () => {
    each('MS.G9.B3.5.a', [1], (it) => { const [litres, area] = nums(it.prompt.en) as [number, number]; close(val(it), area / litres, it.id); });
    each('MS.G9.B3.5.a', [2], (it) => { const [old, nw] = nums(it.prompt.en) as [number, number]; close(val(it), (Math.abs(nw - old) / old) * 100, it.id); });
    each('MS.G9.B3.5.a', [3], (it) => { const [a, b, c] = nums(it.prompt.en) as [number, number, number]; close(val(it), (b * c) / a, it.id); });
  });
});

describe('Grade 9 Algebra generators compute correct answers', () => {
  it('creating expressions', () => {
    each('MS.G9.C1.2.a', [1], (it) => { const [b, a] = nums(it.prompt.en) as [number, number]; expect(rightText(it)).toBe(`${a}n + ${b}`); });
    each('MS.G9.C1.2.a', [2], (it) => { const k = nums(it.prompt.en)[0]!; expect(rightText(it)).toBe(`6w + ${2 * k}`); });
    each('MS.G9.C1.2.a', [3], (it) => {
      const vals = nums(it.prompt.en).slice(0, 3); const f = (opt: string, n: number): number => evalExpr(opt.replace(/n/g, 'x'), n);
      const fits = it.options!.map((o) => [1, 2, 3].every((n, i) => f(clean(o.en), n) === vals[i]));
      expect(fits.filter(Boolean).length, it.id).toBe(1); expect(fits[idx(it)]).toBe(true);
    });
  });

  it('equivalent expressions', () => {
    each('MS.G9.C1.3.a', [1], (it) => { const [k, c] = nums(it.prompt.en) as [number, number]; for (const x of [1, 4, 9]) close(evalExpr(rightText(it), x), k * (x + c), it.id); });
    each('MS.G9.C1.3.a', [2], (it) => { const [a, b, c] = nums(it.prompt.en) as [number, number, number]; for (const x of [1, 4, 9]) close(evalExpr(rightText(it), x), a * (x + b) + c * x, it.id); });
    each('MS.G9.C1.3.a', [3], (it) => {
      const [a, b, c, d] = nums(it.prompt.en) as [number, number, number, number]; const base = (x: number): number => a * (x + b) + c * (x - d);
      const same = it.options!.map((o) => [1, 2, 3, 7].every((x) => evalExpr(clean(o.en), x) === base(x)));
      expect(same.filter((s) => !s).length, it.id).toBe(1); expect(same[idx(it)]).toBe(false);
    });
  });

  it('simplifying expressions', () => {
    each('MS.G9.C1.4.a', [1], (it) => { const [a, b, c] = nums(it.prompt.en) as [number, number, number]; close(val(it), a + b - c, it.id); });
    each('MS.G9.C1.4.a', [2], (it) => { const [a, b, c, d] = nums(it.prompt.en) as [number, number, number, number]; const f = (x: number): number => a * (x + b) + c * x - d; close(val(it), f(0), it.id); expect(f(1) - f(0)).toBe(a + c); });
    each('MS.G9.C1.4.a', [3], (it) => { const [a, b, c, d, k] = nums(it.prompt.en) as [number, number, number, number, number]; close(val(it), a * (k + b) + c * (k - d), it.id); });
  });

  it('creating and solving equations', () => {
    each('MS.G9.C1.5.a', [1], (it) => { const [m, b, total] = nums(it.prompt.en) as [number, number, number]; close(m * val(it) + b, total, it.id); });
    each('MS.G9.C1.5.a', [2], (it) => { const [call, rate, total] = nums(it.prompt.en) as [number, number, number]; close(call + rate * val(it), total, it.id); expect(Number.isInteger(val(it))).toBe(true); });
    each('MS.G9.C1.5.a', [3], (it) => { const [a, b, c, d] = nums(it.prompt.en) as [number, number, number, number]; close(a * val(it) + b, c * val(it) + d, it.id); });
  });

  const points = (s: string): [number, number][] => [...s.matchAll(/\((-?\d+),\\ (-?\d+)\)/g)].map((m) => [Number(m[1]), Number(m[2])]);
  const slopes = (ps: [number, number][]): number[] => ps.slice(1).map((p, i) => (p[1] - ps[i]![1]) / (p[0] - ps[i]![0]));
  it('linear and non-linear relations', () => {
    each('MS.G9.C3.1.a', [1], (it) => { const linear = new Set(slopes(points(it.prompt.en))).size === 1; expect(rightText(it).startsWith(linear ? 'Linear' : 'Non-linear'), it.id).toBe(true); });
    each('MS.G9.C3.1.a', [2], (it) => {
      const lin = it.options!.map((o) => new Set(slopes(points(o.en))).size === 1);
      expect(lin.filter(Boolean).length, it.id).toBe(1); expect(lin[idx(it)]).toBe(true);
    });
    each('MS.G9.C3.1.a', [3], (it) => { const ps = points(it.prompt.en); expect(new Set(slopes(ps)).size).toBe(1); close(val(it), slopes(ps)[0]!, it.id); });
  });

  it('rate of change and initial value', () => {
    each('MS.G9.C3.2.a', [1], (it) => { const [h0, rate, hrs] = nums(it.prompt.en) as [number, number, number]; let h = h0; for (let i = 0; i < hrs; i++) h -= rate; close(val(it), h, it.id); });
    each('MS.G9.C3.2.a', [2], (it) => { const [m1, p1, m2, p2] = nums(it.prompt.en) as [number, number, number, number]; close(val(it), (p2 - p1) / (m2 - m1), it.id); });
    each('MS.G9.C3.2.a', [3], (it) => { const [m1, p1, m2, p2] = nums(it.prompt.en) as [number, number, number, number]; const rate = (p2 - p1) / (m2 - m1); close(val(it) + rate * m1, p1, it.id); close(val(it) + rate * m2, p2, it.id); });
  });

  it('comparing two lines', () => {
    each('MS.G9.C3.3.a', [1], (it) => { const [a, b, c, d] = nums(it.prompt.en) as [number, number, number, number]; close(a * val(it) + b, c * val(it) + d, it.id); });
    each('MS.G9.C3.3.a', [2], (it) => { const [a, b, c, d] = nums(it.prompt.en) as [number, number, number, number]; const x = (d - b) / (a - c); close(val(it), a * x + b, it.id); close(val(it), c * x + d, it.id); });
    each('MS.G9.C3.3.a', [3], (it) => { const [b, a, fee2, c, cost] = nums(it.prompt.en) as [number, number, number, number, number]; close(a * val(it) + b, c * val(it) + fee2, it.id); close(a * val(it) + b, cost, it.id); });
  });

  it('lines x = k, y = k and ax + by = k', () => {
    each('MS.G9.C4.2.a', [1], (it) => { const [p, q] = points(it.prompt.en)[0]!; expect(rightText(it)).toBe(/vertical/.test(it.prompt.en) ? `x = ${p}` : `y = ${q}`); });
    each('MS.G9.C4.2.a', [2], (it) => { const [a, b, k] = nums(it.prompt.en).slice(0, 3) as [number, number, number]; close(val(it), /x-intercept/.test(it.prompt.en) ? k / a : k / b, it.id, 0.006); });
    each('MS.G9.C4.2.a', [3], (it) => { const [x2, a, b, k] = nums(it.prompt.en) as [number, number, number, number]; close(a * x2 + b * val(it), k, it.id); });
  });

  it('translating, reflecting and rotating y = ax', () => {
    each('MS.G9.C4.3.a', [1], (it) => { const [a] = nums(it.prompt.en) as [number]; close(val(it), -a, it.id); });
    each('MS.G9.C4.3.a', [2], (it) => { const [a, h] = nums(it.prompt.en) as [number, number]; close(val(it), a * (0 - h), it.id); });
    each('MS.G9.C4.3.a', [3], (it) => { const [a, deg] = nums(it.prompt.en) as [number, number]; expect(deg).toBe(90); close(val(it) * a, -1, it.id); });
  });

  it('equations of lines from tables and points', () => {
    each('MS.G9.C4.4.a', [1], (it) => { const [x1, y1, x2, y2] = nums(it.prompt.en) as [number, number, number, number]; close(val(it), (y2 - y1) / (x2 - x1), it.id); });
    each('MS.G9.C4.4.a', [2], (it) => { const [x1, y1, x2, y2, x3, y3] = nums(it.prompt.en).slice(0, 6) as number[]; const m = (y2! - y1!) / (x2! - x1!); expect((y3! - y2!) / (x3! - x2!)).toBe(m); close(val(it) + m * x1!, y1!, it.id); });
    each('MS.G9.C4.4.a', [3], (it) => { const [x1, y1, x2, y2] = nums(it.prompt.en) as [number, number, number, number]; const m = (y2 - y1) / (x2 - x1); close(m * val(it) + (y1 - m * x1), 0, it.id); });
  });
});
