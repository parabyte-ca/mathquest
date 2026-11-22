import { describe, it, expect } from 'vitest';
import { generate } from '../shared/generators/index.js';
import { check } from '../shared/check.js';
import type { Item } from '../shared/items/types.js';

const SEEDS = Array.from({ length: 40 }, (_, i) => i + 1);
const value = (it: Item): number => (it.answer as { value: number }).value;
const optionText = (it: Item, lang: 'en' | 'fr' = 'en'): string => it.options![(it.answer as { index: number }).index]![lang];
const give = (n: number) => ({ kind: 'number' as const, text: String(n) });

/** Every $...$ token as a number: a decimal, or a fraction (with an optional minus sign). */
function tokens(s: string): number[] {
  const out: number[] = [];
  for (const m of s.matchAll(/\$([^$]+)\$/g)) {
    const body = m[1]!.replace(/\{,\}/g, '.');
    const f = /^(-?)\\frac\{(\d+)\}\{(\d+)\}$/.exec(body);
    if (f) out.push((f[1] ? -1 : 1) * Number(f[2]) / Number(f[3]));
    else if (/^-?\d+(\.\d+)?$/.test(body)) out.push(Number(body));
  }
  return out;
}
const r6 = (x: number): number => Math.round(x * 1e6) / 1e6;

describe('Grade 8 C1.2: patterns with rational numbers', () => {
  it('tier 1: the next term continues the common difference, in either language', () => {
    for (const seed of SEEDS) {
      const it = generate('MS.G8.C1.2.a', 1, seed);
      for (const lang of ['en', 'fr'] as const) {
        const seq = tokens(it.prompt[lang]);
        expect(seq).toHaveLength(4);
        expect(r6(seq[3]! + (seq[1]! - seq[0]!))).toBeCloseTo(value(it), 9);
        expect(seq[2]! - seq[1]!).toBeCloseTo(seq[1]! - seq[0]!, 9);
      }
      expect(check(it.answer, give(value(it)))).toBe(true);
    }
  });
  it('tier 2: evaluates the rule at the term number', () => {
    for (const seed of SEEDS) {
      const it = generate('MS.G8.C1.2.a', 2, seed);
      const m = /T = (-?[\d.]+)n ([+-]) ([\d.]+)/.exec(it.prompt.en.replace(/\$/g, ''))!;
      const n = Number(/n = (\d+)/.exec(it.prompt.en.replace(/\$/g, ''))![1]);
      expect(r6(Number(m[1]) * n + (m[2] === '-' ? -1 : 1) * Number(m[3]))).toBeCloseTo(value(it), 9);
    }
  });
  it('tier 3: the answer is the first whole term number with a negative term', () => {
    for (const seed of SEEDS) {
      const it = generate('MS.G8.C1.2.a', 3, seed);
      const m = /T = ([\d.]+) - ([\d.]+)n/.exec(it.prompt.en.replace(/\$/g, ''))!;
      let n = 1;
      while (Number(m[1]) - Number(m[2]) * n >= 0) n++;
      expect(value(it)).toBe(n);
      expect(Number(m[1]) - Number(m[2]) * (n - 1)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('Grade 8 D1.1: one- and two-variable data', () => {
  const twoVar = (s: string): boolean => / and /.test(s);
  it('classifies the situation, picks the two-variable question and chooses the graph', () => {
    for (const seed of SEEDS) {
      const a = generate('MS.G8.D1.1.a', 1, seed);
      expect(optionText(a)).toBe(twoVar(a.prompt.en) ? 'Two-variable data' : 'One-variable data');
      const b = generate('MS.G8.D1.1.a', 2, seed);
      expect(twoVar(optionText(b))).toBe(true);
      b.options!.forEach((o, i) => { if (i !== (b.answer as { index: number }).index) expect(twoVar(o.en)).toBe(false); });
      const c = generate('MS.G8.D1.1.a', 3, seed);
      expect(optionText(c)).toBe(twoVar(c.prompt.en) ? 'A scatter plot' : 'A bar graph or histogram');
    }
  });
});

describe('Grade 8 D1.3: scatter plots', () => {
  it('tier 1: the point to plot is the pair named in the prompt, on a grid big enough for it', () => {
    for (const seed of SEEDS) {
      const it = generate('MS.G8.D1.3.a', 1, seed);
      expect(it.format).toBe('point');
      const [x, y] = tokens(it.prompt.en);
      expect(it.answer).toMatchObject({ kind: 'point', x, y });
      const v = it.visual as { type: string; size: number; click?: boolean };
      expect(v.click).toBe(true);
      expect(Math.max(x!, y!)).toBeLessThanOrEqual(v.size);
    }
  });
  it('tier 2: counts the plotted points above the level in the prompt', () => {
    for (const seed of SEEDS) {
      const it = generate('MS.G8.D1.3.a', 2, seed);
      const k = tokens(it.prompt.en)[0]!;
      const pts = (it.visual as { points: { x: number; y: number }[] }).points;
      expect(new Set(pts.map((p) => p.x)).size).toBe(pts.length);
      expect(value(it)).toBe(pts.filter((p) => p.y > k).length);
    }
  });
  it('tier 3: the variable that might cause the change is the one on the horizontal axis', () => {
    const expected: [RegExp, string][] = [[/practice/, 'Hours of practice'], [/warmer days/, 'Temperature'], [/more sleep/, 'Hours of sleep'], [/rainfall/, 'Rainfall']];
    for (const seed of SEEDS) {
      const it = generate('MS.G8.D1.3.a', 3, seed);
      expect(optionText(it)).toBe(expected.find(([re]) => re.test(it.prompt.en))![1]);
    }
  });
});

describe('Grade 8 D1.4 and D1.6: infographics and analysis', () => {
  it('infographic: the missing part is not listed, the headline percent is part over whole, and a two-variable claim needs a scatter plot', () => {
    for (const seed of SEEDS) {
      const a = generate('MS.G8.D1.4.a', 1, seed);
      expect(a.prompt.en).not.toContain(optionText(a));
      const b = generate('MS.G8.D1.4.a', 2, seed);
      const [total, k] = tokens(b.prompt.en);
      expect(value(b)).toBeCloseTo((100 * k!) / total!, 6);
      expect(generate('MS.G8.D1.4.a', 3, seed).options![(generate('MS.G8.D1.4.a', 3, seed).answer as { index: number }).index]!.en).toMatch(/scatter plot/);
    }
  });
  it('analysis: matches the reason to the problem, the truncated axis ratio, and cause against trend', () => {
    const reasons: [RegExp, RegExp][] = [[/skip from 0 to 50/, /missing marks/], [/only the three highest/, /Leaving out the other points/], [/starts at 80/, /cut off at the bottom/], [/only 4 students/, /small sample/]];
    for (const seed of SEEDS) {
      const a = generate('MS.G8.D1.6.a', 1, seed);
      expect(optionText(a)).toMatch(reasons.find(([p]) => p.test(a.prompt.en))![1]);
      const b = generate('MS.G8.D1.6.a', 2, seed);
      const [base, v1, v2] = tokens(b.prompt.en);
      expect(value(b)).toBeCloseTo((v2! - base!) / (v1! - base!), 9);
      expect(optionText(generate('MS.G8.D1.6.a', 3, seed))).toMatch(/not cause|do not cause/);
    }
  });
});

describe('Grade 8 E1.2: models from views', () => {
  /** Brute force over every way to fill one column of `rows` squares (each at least 1 cube, tallest equal to h). */
  function columnRange(rows: number, h: number): [number, number] {
    let lo = Infinity, hi = -Infinity;
    const walk = (i: number, sum: number, tallest: number): void => {
      if (i === rows) { if (tallest === h) { lo = Math.min(lo, sum); hi = Math.max(hi, sum); } return; }
      for (let c = 1; c <= h; c++) walk(i + 1, sum + c, Math.max(tallest, c));
    };
    walk(0, 0, 0);
    return [lo, hi];
  }
  it('tier 1 adds every stack', () => {
    for (const seed of SEEDS) {
      const it = generate('MS.G8.E1.2.a', 1, seed);
      const nums = tokens(it.prompt.en);
      const [rows, cols] = nums.slice(0, 2) as [number, number];
      const heights = nums.slice(2);
      expect(heights).toHaveLength(rows * cols);
      expect(value(it)).toBe(heights.reduce((s, h) => s + h, 0));
    }
  });
  it('tiers 2 and 3 give the fewest and the most cubes, found by trying every arrangement of each column', () => {
    for (const seed of SEEDS) for (const tier of [2, 3] as const) {
      const it = generate('MS.G8.E1.2.a', tier, seed);
      const m = /(\d) by (\d) rectangle/.exec(it.prompt.en)!;
      const rows = Number(m[1]);
      const heights = tokens(it.prompt.en);
      expect(heights).toHaveLength(Number(m[2]));
      const ranges = heights.map((h) => columnRange(rows, h));
      expect(value(it)).toBe(ranges.reduce((s, [lo, hi]) => s + (tier === 2 ? lo : hi), 0));
    }
  });
});
