import { describe, it, expect } from 'vitest';
import { generate } from '../shared/generators/index.js';
import type { Item } from '../shared/items/types.js';

// Independent check of the Grade 7 completion generators: each test reads the English prompt of a generated item, recomputes the
// answer by a different method and compares it with the stored answer.

const SEEDS = 250;
const clean = (s: string): string => s.replace(/\\,/g, '').replace(/\\ /g, ' ').replace(/\$/g, '').replace(/\\%/g, '%').replace(/\\times/g, '*');
const nums = (s: string): number[] => [...clean(s).matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
const val = (it: Item): number => (it.answer as { value: number }).value;
const idx = (it: Item): number => (it.answer as { index: number }).index;
const rightRaw = (it: Item): string => it.options![idx(it)]!.en;
const each = (skill: string, tiers: number[], fn: (it: Item, tier: number) => void): void => {
  for (const tier of tiers) for (let seed = 1; seed <= SEEDS; seed++) fn(generate(skill, tier, seed), tier);
};
const near = (a: number, b: number, id: string, tol = 1e-6): void => expect(Math.abs(a - b), id).toBeLessThanOrEqual(tol);
const frac = (s: string): number => { const m = /\\frac\{(\d+)\}\{(\d+)\}/.exec(s)!; return Number(m[1]) / Number(m[2]); };

describe('Grade 7 Number completion', () => {
  it('large numbers and expanded form', () => {
    each('MS.G7.B1.1.a', [1], (it) => {
      const terms = [...it.prompt.en.matchAll(/(\d) \\times 10\^\{(\d)\}/g)];
      expect(terms.length, it.id).toBe(3);
      expect(val(it), it.id).toBe(terms.reduce((s, m) => s + Number(m[1]) * 10 ** Number(m[2]), 0));
    });
    each('MS.G7.B1.1.a', [2], (it) => {
      const [d, n] = nums(it.prompt.en.replace(/\s/g, '')).length ? [Number(/digit \$(\d)\$/.exec(it.prompt.en)![1]), clean(/in \$([^$]+)\$\?/.exec(it.prompt.en)![1]!).replace(/\s/g, '')] : [0, ''];
      expect(val(it), it.id).toBe(d * 10 ** (n.length - 1 - n.indexOf(String(d))));
    });
    each('MS.G7.B1.1.a', [3], (it) => {
      const n = nums(it.prompt.en.replace(/standard number\./, '')), hasThousand = /thousand/.test(it.prompt.en);
      const [a, b, c] = hasThousand ? [n[0]!, n[1]!, n[2]!] : [n[0]!, 0, n[1]!];
      expect(val(it), it.id).toBe(a * 1e6 + b * 1e3 + c);
    });
  });
  it('numbers between two quantities', () => {
    each('MS.G7.B1.5.a', [1, 2, 3], (it, tier) => {
      const parse = (s: string): number => (tier === 3 ? frac(s) : Number(clean(s)));
      const [lo, hi] = [...it.prompt.en.matchAll(/\$([^$]+)\$/g)].map((m) => parse(m[1]!));
      const inside = it.options!.map((o) => { const v = parse(o.en); return v > lo! && v < hi!; });
      expect(inside.filter(Boolean).length, it.id).toBe(1); expect(inside[idx(it)], it.id).toBe(true);
    });
  });
  it('rounding', () => {
    each('MS.G7.B1.6.a', [1], (it) => {
      const digits = clean(/Round \$([^$]+)\$/.exec(it.prompt.en)![1]!), h = Math.round(Number(digits) * 100), tenth = /tenth/.test(it.prompt.en);
      near(val(it), tenth ? Math.floor((h + 5) / 10) / 10 : Math.floor((h + 50) / 100), it.id);
    });
    each('MS.G7.B1.6.a', [2], (it) => { const th = Math.round(Number(clean(/Round \$([^$]+)\$/.exec(it.prompt.en)![1]!)) * 1000); near(val(it), Math.floor((th + 5) / 10) / 100, it.id); });
    each('MS.G7.B1.6.a', [3], (it) => {
      const x = nums(it.prompt.en.replace(/[a-z]+ /g, ' '))[0]!; const unit = /hundred thousand/.test(it.prompt.en) ? 1e5 : /ten thousand/.test(it.prompt.en) ? 1e4 : 1e3;
      expect(val(it), it.id).toBe(Math.floor(x / unit + 0.5) * unit);
    });
  });
  it('equivalents', () => {
    each('MS.G7.B2.2.a', [1, 2], (it) => { const m = /\\frac\{(\d+)\}\{(\d+)\}/.exec(it.prompt.en)!; near(val(it), (100 * Number(m[1])) / Number(m[2]), it.id); });
    each('MS.G7.B2.2.a', [3], (it) => { near(val(it), nums(it.prompt.en)[0]! / 100, it.id); });
  });
});

describe('Grade 7 Algebra completion', () => {
  it('patterns with decimals', () => {
    each('MS.G7.C1.2.a', [1], (it) => {
      const seq = nums(it.prompt.en.split('starts')[1]!.split('?')[0]!.replace('What is the next term', ''));
      const step = seq[1]! - seq[0]!;
      expect(seq.every((v, i) => i === 0 || Math.abs(v - seq[i - 1]! - step) < 1e-9), it.id).toBe(true);
      near(val(it), seq[3]! + step, it.id);
    });
    each('MS.G7.C1.2.a', [2], (it) => { const [m, b, n] = nums(it.prompt.en.replace('C =', '')) as [number, number, number]; near(val(it), m * n + b, it.id); });
    each('MS.G7.C1.2.a', [3], (it) => { const [m, b, val0] = nums(it.prompt.en.replace('C =', '')) as [number, number, number]; near(m * val(it) + b, val0, it.id); expect(Number.isInteger(val(it)), it.id).toBe(true); });
  });
  it('sub-programs', () => {
    each('MS.G7.C3.1.a', [1], (it) => { const [c, x0, k] = nums(it.prompt.en) as [number, number, number]; expect(val(it), it.id).toBe(x0 * c ** k); });
    each('MS.G7.C3.1.a', [2], (it) => {
      const [a, b, , , k] = nums(it.prompt.en.replace(/cost\(n\)/g, 'c').replace(/n × /, '')) as [number, number, number, number, number];
      let total = 0; for (let n = 1; n <= k; n++) total += a * n + b;
      expect(val(it), it.id).toBe(total);
    });
    each('MS.G7.C3.1.a', [3], (it) => { const k = nums(it.prompt.en)[1]!; void k; const top = Number(/to (\d+): if/.exec(clean(it.prompt.en))![1]); let t = 0; for (let n = 1; n <= top; n++) t += n % 2 === 1 ? n * n : -1; expect(val(it), it.id).toBe(t); });
  });
  it('reading and altering code', () => {
    each('MS.G7.C3.2.a', [1], (it) => { const n = nums(it.prompt.en); const [a, n2] = [n[0]!, n[n.length - 1]!]; expect(val(it), it.id).toBe((a * n2 * (n2 + 1)) / 2); });
    each('MS.G7.C3.2.a', [2], (it) => { const n = nums(it.prompt.en); expect(val(it), it.id).toBe(n[2]! * n[4]! + n[3]!); });
    each('MS.G7.C3.2.a', [3], (it) => { const [start, add, goal] = nums(it.prompt.en.replace(/"add /, ' ').replace(/ to x"/, '')) as [number, number, number]; const t = Math.ceil((goal - start) / add); expect(val(it), it.id).toBe(t); expect(start + add * t).toBeGreaterThanOrEqual(goal); expect(start + add * (t - 1)).toBeLessThan(goal); });
  });
});

describe('Grade 7 Data, Spatial and Financial completion', () => {
  it('percents and why', () => {
    each('MS.G7.D1.1.a', [1], (it) => { const [N, k] = nums(it.prompt.en) as [number, number]; near(val(it), (100 * k) / N, it.id); });
    each('MS.G7.D1.1.a', [2], (it) => { const [k1, N1, k2, N2] = nums(it.prompt.en) as [number, number, number, number]; near(val(it), Math.abs((100 * k1) / N1 - (100 * k2) / N2), it.id); });
    each('MS.G7.D1.1.a', [3], (it) => { expect(rightRaw(it)).toMatch(/percent from each group/); expect(it.options!.length).toBe(4); });
  });
  it('infographics', () => {
    each('MS.G7.D1.4.a', [1], (it) => {
      const present = ['a title', 'labelled axes with units', 'the source of the data', 'the date of the data', 'a key for the colours'].filter((p) => it.prompt.en.includes(p));
      expect(present.length, it.id).toBe(4);
      expect(it.prompt.en.includes(rightRaw(it)), it.id).toBe(false);
    });
    each('MS.G7.D1.4.a', [2], (it) => { const [k, N] = nums(it.prompt.en) as [number, number]; near(val(it), (100 * k) / N, it.id); });
    each('MS.G7.D1.4.a', [3], (it) => { const [a, b] = nums(it.prompt.en) as [number, number]; expect(nums(rightRaw(it))[0], it.id).toBeCloseTo(((b - a) / a) * 100, 6); });
  });
  it('misleading graphs and statistics', () => {
    each('MS.G7.D1.6.a', [2], (it) => { const [base, v1, v2] = nums(it.prompt.en) as [number, number, number]; near(val(it), (v2 - base) / (v1 - base), it.id); });
    each('MS.G7.D1.6.a', [3], (it) => {
      const list = nums(it.prompt.en.split('in thousands, are')[1]!.split('What')[0]!), sorted = [...list].sort((a, b) => a - b);
      expect(list.length, it.id).toBe(7); expect(val(it), it.id).toBe(sorted[3]);
    });
  });
  it('views to scale, and circles', () => {
    const grid = (s: string): number[][] => { const m = /front row: ([\d, ]+); back row: ([\d, ]+)/.exec(clean(s))!; return [m[1]!, m[2]!].map((r) => r.split(',').map(Number)); };
    each('MS.G7.E1.2.a', [1], (it) => { expect(val(it), it.id).toBe(grid(it.prompt.en).flat().filter((h) => h > 0).length); });
    each('MS.G7.E1.2.a', [2], (it) => { const g = grid(it.prompt.en); expect(val(it), it.id).toBe([0, 1, 2].reduce((s, c) => s + Math.max(g[0]![c]!, g[1]![c]!), 0)); });
    each('MS.G7.E1.2.a', [3], (it) => { const [, k, d] = nums(it.prompt.en) as [number, number, number]; near(val(it), k * d, it.id); });
    each('MS.G7.E2.4.a', [1], (it) => { expect(val(it), it.id).toBe(nums(it.prompt.en)[0]! / 2); });
    each('MS.G7.E2.4.a', [2], (it) => { near(val(it), 2 * nums(it.prompt.en)[0]!, it.id); });
    each('MS.G7.E2.4.a', [3], (it) => {
      const [a, b, d] = nums(it.prompt.en) as [number, number, number];
      const common = d > a + b || d < Math.abs(a - b) ? 0 : d === a + b || d === Math.abs(a - b) ? 1 : 2;
      expect(val(it), it.id).toBe(common);
    });
  });
  it('sources and decisions', () => {
    each('MS.G7.F1.2.a', [1, 2], (it) => { expect(rightRaw(it), it.id).toMatch(/independent|official|several independent|national statistics|bank's official/); });
    each('MS.G7.F1.2.a', [3], (it) => { expect(rightRaw(it)).toMatch(/Who made it/); });
    each('MS.G7.F1.4.a', [1], (it) => { const [qa, pa, qb, pb] = nums(it.prompt.en) as [number, number, number, number]; near(val(it), Math.min(pa / qa, pb / qb), it.id, 1e-6); });
    each('MS.G7.F1.4.a', [2], (it) => {
      const [priceA, d, priceB, ship] = nums(it.prompt.en.replace(/Store [AB]/g, '')) as [number, number, number, number];
      near(val(it), Math.min(priceA * (1 - d / 100), priceB + ship), it.id, 1e-6);
    });
    each('MS.G7.F1.4.a', [3], (it) => { const [ca, ya, cb, yb] = nums(it.prompt.en.replace(/Backpack [AB]/g, '')) as [number, number, number, number]; near(val(it), Math.min(ca / ya, cb / yb), it.id, 1e-6); });
  });
});
