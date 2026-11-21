import { describe, it, expect } from 'vitest';
import { generate } from '../shared/generators/index.js';
import type { Item } from '../shared/items/types.js';

// Independent check of the Grade 8 spatial sense and financial literacy generators: each test reads the English prompt of a
// generated item, recomputes the answer by a different method and compares it with the stored answer.

const SEEDS = 250;
const clean = (s: string): string => s.replace(/\\,/g, '').replace(/\{,\}/g, '.').replace(/\\ /g, ' ').replace(/\$/g, '');
const nums = (s: string): number[] => [...clean(s).matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
const val = (it: Item): number => (it.answer as { value: number }).value;
const each = (skill: string, tiers: number[], fn: (it: Item, tier: number) => void): void => {
  for (const tier of tiers) for (let seed = 1; seed <= SEEDS; seed++) fn(generate(skill, tier, seed), tier);
};
const close = (a: number, b: number, id = ''): void => expect(Math.abs(a - b), id).toBeLessThan(1e-6);
const PI = 3.14;
const interior = (n: number): number => 180 - 360 / n;
const SIDES: Record<string, number> = { triangle: 3, triangles: 3, square: 4, squares: 4, hexagon: 6, hexagons: 6, dodecagons: 12, quadrilateral: 4, pentagon: 5 };
const EXP: Record<string, number> = { mega: 6, giga: 9, tera: 12, micro: -6, nano: -9, pico: -12 };

describe('Grade 8 spatial sense generators compute correct answers', () => {
  it('works with tessellations', () => {
    each('MS.G8.E1.1.a', [1], (it) => { const n = nums(it.prompt.en)[0]!; close(val(it), interior(n), it.id); });
    each('MS.G8.E1.1.a', [2], (it) => {
      const text = it.prompt.en.replace(/\$/g, '');
      const fill = /At a vertex, (\d+) regular (\w+) meet/.exec(text);
      if (fill) { close(val(it), (360 - Number(fill[1]) * interior(SIDES[fill[2]!]!)) / 60, it.id); return; }
      const simple = /Regular (\w+) tessellate/.exec(text)!;
      close(val(it), 360 / interior(SIDES[simple[1]!]!), it.id);
      expect(Number.isInteger(val(it))).toBe(true);
    });
    each('MS.G8.E1.1.a', [3], (it) => { const [p, q] = nums(it.prompt.en) as [number, number]; close(val(it), 360 - interior(p) - interior(q), it.id); });
  });

  it('reads scale drawings', () => {
    each('MS.G8.E1.3.a', [1], (it) => { const [, k, d] = nums(it.prompt.en) as [number, number, number]; close(val(it), k * d, it.id); });
    each('MS.G8.E1.3.a', [2], (it) => { const [, n, cm] = nums(it.prompt.en) as [number, number, number]; close(val(it), cm / n, it.id); });
    each('MS.G8.E1.3.a', [3], (it) => { const [d, real] = nums(it.prompt.en) as [number, number]; close(val(it), real / d, it.id); });
  });

  it('applies transformations including dilations', () => {
    const point = (it: Item): [number, number] => { const m = /\((-?\d+), (-?\d+)\)/.exec(clean(it.prompt.en))!; return [Number(m[1]), Number(m[2])]; };
    const askX = (it: Item): boolean => /the x-coordinate/.test(it.prompt.en);
    each('MS.G8.E1.4.a', [1], (it) => { const [x, y] = point(it); const k = Number(/scale factor of (\d+)/.exec(clean(it.prompt.en))![1]); expect(val(it)).toBe((askX(it) ? x : y) * k); });
    each('MS.G8.E1.4.a', [2], (it) => { const [x, y] = point(it); const m = /translated (\d+) units right and (\d+) units up/.exec(clean(it.prompt.en))!; const ix = -x + Number(m[1]), iy = y + Number(m[2]); expect(val(it)).toBe(askX(it) ? ix : iy); });
    each('MS.G8.E1.4.a', [3], (it) => { const [x, y] = point(it); close(val(it), -(askX(it) ? x : y) / 2, it.id); });
  });

  it('knows the prefixes and converts between them', () => {
    each('MS.G8.E2.1.a', [1, 2], (it) => { const w = /One (\w+?)(metre|gram|second|litre|byte) is/.exec(it.prompt.en)!; expect(val(it)).toBe(EXP[w[1]!]); });
    each('MS.G8.E2.1.a', [3], (it) => { const m = /is ([\d.]+) (\w+?)metres\. How many (\w+?)metres/.exec(clean(it.prompt.en))!; close(val(it), Number(m[1]) * 10 ** (EXP[m[2]!]! - EXP[m[3]!]!), it.id); });
  });

  it('uses angle properties of lines and polygons', () => {
    each('MS.G8.E2.2.a', [1], (it) => { const a = nums(it.prompt.en)[0]!; expect(val(it)).toBe(/adjacent/.test(it.prompt.en) ? 180 - a : a); });
    each('MS.G8.E2.2.a', [2], (it) => { const a = nums(it.prompt.en)[0]!; expect(val(it)).toBe(/co-interior angle/.test(it.prompt.en) ? 180 - a : a); });
    each('MS.G8.E2.2.a', [3], (it) => { const [ext, a] = nums(it.prompt.en) as [number, number]; expect(val(it)).toBe(ext - a); expect(val(it)).toBeGreaterThan(0); });
    each('MS.G8.E2.2.b', [1], (it) => { const n = nums(it.prompt.en)[0]!; expect(val(it)).toBe((n - 2) * 180); });
    each('MS.G8.E2.2.b', [2], (it) => { const word = /(quadrilateral|pentagon|hexagon)/.exec(it.prompt.en)![1]!; const n = word === 'quadrilateral' ? 4 : word === 'pentagon' ? 5 : 6; const known = nums(it.prompt.en); expect(val(it), it.id).toBe((n - 2) * 180 - known.reduce((a, b) => a + b, 0)); expect(val(it)).toBeGreaterThan(0); });
    each('MS.G8.E2.2.b', [3], (it) => { const angle = nums(it.prompt.en)[0]!; close(val(it), 360 / (180 - angle), it.id); expect(Number.isInteger(val(it))).toBe(true); });
  });

  it('finds the area, volume and surface area of composite shapes', () => {
    each('MS.G8.E2.3.a', [1], (it) => { const [L, W, l, w] = nums(it.prompt.en) as [number, number, number, number]; expect(val(it)).toBe(L * W - l * w); });
    each('MS.G8.E2.3.a', [2], (it) => { const [W, H] = nums(it.prompt.en) as [number, number]; close(val(it), W * H + (PI * (W / 2) ** 2) / 2, it.id); });
    each('MS.G8.E2.3.a', [3], (it) => { const [W, H, b, h] = nums(it.prompt.en) as [number, number, number, number]; close(val(it), W * H + (b * h) / 2, it.id); });
    each('MS.G8.E2.3.b', [1], (it) => { const [a, b, h1, c, d, h2] = nums(it.prompt.en.replace(/Box \d/g, 'Box')) as number[]; expect(val(it)).toBe(a! * b! * h1! + c! * d! * h2!); });
    each('MS.G8.E2.3.b', [2], (it) => { const [s] = nums(it.prompt.en) as [number]; expect(val(it)).toBe(6 * s * s); });
    each('MS.G8.E2.3.b', [3], (it) => { const [L, W, H, rad, h] = nums(it.prompt.en) as number[]; close(val(it), L! * W! * H! + PI * rad! * rad! * h!, it.id); });
  });

  it('applies the Pythagorean theorem', () => {
    each('MS.G8.E2.4.a', [1, 2], (it) => { const [a, b] = nums(it.prompt.en) as [number, number]; close(val(it), Math.hypot(a, b), it.id); });
    each('MS.G8.E2.4.a', [3], (it) => { const [x1, y1, x2, y2] = nums(it.prompt.en) as number[]; close(val(it), Math.hypot(x2! - x1!, y2! - y1!), it.id); });
    each('MS.G8.E2.4.b', [1, 2], (it) => { const [c, a] = nums(it.prompt.en) as [number, number]; close(val(it), Math.sqrt(c * c - a * a), it.id); });
    each('MS.G8.E2.4.b', [3], (it) => { const [a, c] = nums(it.prompt.en) as [number, number]; close(val(it), Math.sqrt(c * c - a * a), it.id); });
  });
});

describe('Grade 8 financial literacy generators compute correct answers', () => {
  it('pays across currencies', () => {
    each('MS.G8.F1.1.a', [1], (it) => { const [usd, , rate] = nums(it.prompt.en) as [number, number, number]; close(val(it), usd * rate, it.id); });
    each('MS.G8.F1.1.a', [2], (it) => { const [usd, , rate, fee] = nums(it.prompt.en) as [number, number, number, number]; close(val(it), usd * rate * (1 + fee / 100), it.id); });
    each('MS.G8.F1.1.a', [3], (it) => { const [usd, , rate, f1, f2] = nums(it.prompt.en) as number[]; close(val(it), (usd! * rate! * (f1! - f2!)) / 100, it.id); });
  });

  it('plans with taxes', () => {
    each('MS.G8.F1.2.a', [1], (it) => { const [gross, tax] = nums(it.prompt.en) as [number, number]; close(val(it), (gross * (100 - tax)) / 100, it.id); });
    each('MS.G8.F1.2.a', [2], (it) => { const [gross, tax, save] = nums(it.prompt.en) as [number, number, number]; close(val(it), (((gross * (100 - tax)) / 100) * save) / 100, it.id); });
    each('MS.G8.F1.2.a', [3], (it) => { const [gross, tax, save, goal] = nums(it.prompt.en) as [number, number, number, number]; close(val(it) * (((gross * (100 - tax)) / 100) * save) / 100, goal, it.id); expect(Number.isInteger(val(it))).toBe(true); });
  });

  it('balances budgets', () => {
    each('MS.G8.F1.3.a', [1], (it) => { const [income, a, b, c, d] = nums(it.prompt.en) as number[]; expect(val(it)).toBe(income! - a! - b! - c! - d!); expect(val(it)).toBeGreaterThanOrEqual(0); });
    each('MS.G8.F1.3.a', [2], (it) => { const [needs, wants, income] = nums(it.prompt.en) as [number, number, number]; close(val(it), (income * (100 - needs - wants)) / 100, it.id); });
    each('MS.G8.F1.3.a', [3], (it) => { const [, over, wants] = nums(it.prompt.en) as [number, number, number]; close(val(it), (over / wants) * 100, it.id); });
  });

  it('compares simple and compound growth', () => {
    each('MS.G8.F1.4.a', [1], (it) => { const [P, r, y] = nums(it.prompt.en) as [number, number, number]; close(val(it), P * (1 + (r * y) / 100), it.id); });
    each('MS.G8.F1.4.a', [2], (it) => { const [P, r, y] = nums(it.prompt.en) as [number, number, number]; close(val(it), Math.round(P * (1 + r / 100) ** y * 100) / 100, it.id); });
    each('MS.G8.F1.4.a', [3], (it) => { const [P, y, r] = nums(it.prompt.en) as [number, number, number]; close(val(it), Math.round((P * (1 + r / 100) ** y - P * (1 + (r * y) / 100)) * 100) / 100, it.id); expect(val(it)).toBeGreaterThan(0); });
  });

  it('works out sales and loyalty offers', () => {
    each('MS.G8.F1.5.a', [1], (it) => { const [price, d] = nums(it.prompt.en) as [number, number]; close(val(it), price * (1 - d / 100) * 1.13, it.id); });
    each('MS.G8.F1.5.a', [2], (it) => { const [per, , , spend] = nums(it.prompt.en) as [number, number, number, number]; close(val(it), ((spend * per) / 1000) * 10, it.id); });
    each('MS.G8.F1.5.a', [3], (it) => { const [price, d] = nums(it.prompt.en) as [number, number]; close(val(it), price * 1.5 - 2 * price * (1 - d / 100), it.id); expect(val(it)).toBeGreaterThan(0); });
  });

  it('compares credit cards and contracts', () => {
    each('MS.G8.F1.6.a', [1], (it) => { const [balance, apr] = nums(it.prompt.en) as [number, number]; close(val(it), (balance * apr) / 1200, it.id); });
    each('MS.G8.F1.6.a', [2], (it) => { const [balance, m, pay] = nums(it.prompt.en) as [number, number, number]; close(val(it), balance * (1 + m / 100) - pay, it.id); });
    each('MS.G8.F1.6.a', [3], (it) => { const [monthly, months, upfront, outright] = nums(it.prompt.en) as [number, number, number, number]; expect(val(it)).toBe(monthly * months + upfront - outright); expect(val(it)).toBeGreaterThan(0); });
  });
});
