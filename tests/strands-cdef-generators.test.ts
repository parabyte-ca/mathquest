import { describe, it, expect } from 'vitest';
import { generate } from '../shared/generators/index.js';
import type { Item } from '../shared/items/types.js';

// Independent check of the arithmetic for the Grade 5-6 Algebra, Data, Spatial Sense and Financial Literacy generators:
// each test parses the English prompt, recomputes the answer a different way, and compares.

const SEEDS = 250;
const clean = (s: string): string => s.replace(/\$/g, '').replace(/\\,/g, '').replace(/\\ /g, ' ').replace(/\{,\}/g, '.');
const nums = (s: string): number[] => [...clean(s).matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
const val = (it: Item): number => (it.answer as { value: number }).value;
const each = (skill: string, tiers: number[], fn: (it: Item, tier: number) => void): void => {
  for (const tier of tiers) for (let seed = 1; seed <= SEEDS; seed++) fn(generate(skill, tier, seed), tier);
};
const close = (a: number, b: number): void => expect(Math.abs(a - b)).toBeLessThan(1e-6);
const choiceText = (it: Item): string => it.options![(it.answer as { index: number }).index]!.en;

describe('algebra generators (strand C)', () => {
  it('finds next, nth and missing terms of growing patterns', () => {
    each('MS.G5.C1.3.a', [1], (it) => { const n = nums(it.prompt.en); expect(val(it)).toBe(n[3]! + (n[1]! - n[0]!)); expect(n[3]! - n[2]!).toBe(n[1]! - n[0]!); });
    each('MS.G5.C1.3.a', [2], (it) => { const [a, d, n] = nums(it.prompt.en) as [number, number, number]; expect(val(it)).toBe(a + (n - 1) * d); });
    each('MS.G5.C1.3.a', [3], (it) => {
      // 5 terms with one missing: the other four, with the jump from any adjacent pair, must rebuild the pattern around the answer
      const shown = nums(it.prompt.en.split(': ')[1]!);
      expect(shown).toHaveLength(4);
      const all = [...shown, val(it)].sort((a, b) => a - b);
      const diffs = all.slice(1).map((v, i) => v - all[i]!);
      expect(new Set(diffs).size).toBe(1);
    });
  });

  it('continues decimal patterns', () => {
    each('MS.G5.C1.4.a', [1, 2, 3], (it) => {
      const n = nums(it.prompt.en).slice(0, 4);
      const jump = Math.round((n[1]! - n[0]!) * 1e6) / 1e6;
      close(n[3]! - n[2]!, jump);
      close(val(it), n[3]! + jump);
    });
  });

  it('evaluates expressions', () => {
    each('MS.G5.C2.2.a', [1], (it) => { const [a, n] = nums(it.prompt.en.replace(/^Find the value of /, '')) as [number, number]; void a; expect(val(it)).toBe(Number(/\+ (\d+)\$/.exec(it.prompt.en)![1]) + n); });
    each('MS.G5.C2.2.a', [2], (it) => { const [a, b, n] = nums(it.prompt.en) as [number, number, number]; expect(val(it)).toBe(a * n + b); });
    each('MS.G5.C2.2.a', [3], (it) => { const [a, b, c, n] = nums(it.prompt.en) as [number, number, number, number]; expect(val(it)).toBe(a * (n + b) - c); });
    each('MS.G6.C2.2.a', [1], (it) => { const [a, x] = nums(it.prompt.en.replace(/^Find the value of /, '')) as [number, number]; close(val(it), x + Number(/\+ (\d+)\$/.exec(it.prompt.en)![1])); void a; });
    each('MS.G6.C2.2.a', [2], (it) => { const [a, b, x] = nums(it.prompt.en) as [number, number, number]; close(val(it), a * x + b); });
    each('MS.G6.C2.2.a', [3], (it) => { const [a, b, x, y] = nums(it.prompt.en) as [number, number, number, number]; close(val(it), a * x + b * y); });
  });

  it('solves equations and verifies the solution', () => {
    each('MS.G5.C2.3.a', [1], (it) => { const [a, c] = nums(it.prompt.en) as [number, number]; expect(val(it) + a).toBe(c); });
    each('MS.G5.C2.3.a', [2], (it) => { const [a, c] = nums(it.prompt.en) as [number, number]; expect(a * val(it)).toBe(c); });
    each('MS.G5.C2.3.a', [3], (it) => { const [a, b, c] = nums(it.prompt.en) as [number, number, number]; expect(a * val(it) + b).toBe(c); });
    each('MS.G6.C2.3.a', [1], (it) => { const [a, b, c] = nums(it.prompt.en) as [number, number, number]; expect(a * val(it) + b).toBe(c); });
    each('MS.G6.C2.3.a', [2], (it) => { const [a, b, c] = nums(it.prompt.en) as [number, number, number]; expect(a * val(it) - b).toBe(c); });
    each('MS.G6.C2.3.a', [3], (it) => { const [a, b, c] = nums(it.prompt.en) as [number, number, number]; expect((a + b) * val(it)).toBe(c); });
  });

  it('finds the greatest or least whole number for an inequality', () => {
    each('MS.G5.C2.4.a', [1], (it) => { const [a, b] = nums(it.prompt.en) as [number, number]; const x = val(it); expect(x + a < b).toBe(true); expect(x + 1 + a < b).toBe(false); });
    each('MS.G5.C2.4.a', [2], (it) => { const [a, b] = nums(it.prompt.en) as [number, number]; const x = val(it); expect(a * x <= b).toBe(true); expect(a * (x + 1) <= b).toBe(false); });
    each('MS.G5.C2.4.a', [3], (it) => { const [a, b] = nums(it.prompt.en) as [number, number]; const x = val(it); expect(x - a > b).toBe(true); expect(x - 1 - a > b).toBe(false); });
  });

  it('predicts values in linear patterns', () => {
    each('MS.G6.C1.3.a', [1], (it) => { const [m, c, n] = nums(it.prompt.en) as [number, number, number]; expect(val(it)).toBe(m * n + c); });
    each('MS.G6.C1.3.a', [2], (it) => { const [m, c, v] = nums(it.prompt.en) as [number, number, number]; expect(m * val(it) + c).toBe(v); });
    each('MS.G6.C1.3.a', [3], (it) => {
      const [n1, v1, n2, v2, target] = nums(it.prompt.en) as [number, number, number, number, number];
      const m = (v2 - v1) / (n2 - n1);
      expect(Number.isInteger(m)).toBe(true);
      expect(val(it)).toBe(v1 + m * (target - n1));
    });
  });

  it('picks the value that satisfies the inequality, never the boundary', () => {
    each('MS.G6.C2.4.a', [1, 2, 3], (it) => {
      const [a, b, c] = nums(it.prompt.en) as [number, number, number];
      const greater = it.prompt.en.includes('>');
      const ok = (x: number): boolean => (greater ? a * x + b > c : a * x + b < c);
      const values = it.options!.map((o) => nums(o.en)[0]!);
      const right = (it.answer as { index: number }).index;
      expect(ok(values[right]!)).toBe(true);
      values.forEach((v, i) => { if (i !== right) expect(ok(v), `${it.id} option ${v}`).toBe(false); });
    });
  });
});

describe('data generators (strand D)', () => {
  const sortedMedian = (xs: number[]): number => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2; };
  it('computes mean, median and range', () => {
    each('MS.G5.D1.5.a', [1], (it) => { const xs = nums(it.prompt.en); expect(val(it) * xs.length).toBeCloseTo(xs.reduce((a, b) => a + b, 0), 9); });
    each('MS.G5.D1.5.a', [2], (it) => close(val(it), sortedMedian(nums(it.prompt.en))));
    each('MS.G5.D1.5.a', [3], (it) => { const n = nums(it.prompt.en); const known = n.slice(0, 4); const mean = n[4]!; expect(val(it) + known.reduce((a, b) => a + b, 0)).toBeCloseTo(5 * mean, 9); });
    each('MS.G6.D1.5.a', [1], (it) => { const xs = nums(it.prompt.en); expect(val(it)).toBe(Math.max(...xs) - Math.min(...xs)); });
    each('MS.G6.D1.5.a', [2], (it) => { const xs = nums(it.prompt.en); close(val(it) * xs.length, xs.reduce((a, b) => a + b, 0)); });
    each('MS.G6.D1.5.a', [3], (it) => close(val(it), sortedMedian(nums(it.prompt.en))));
  });

  it('gives probabilities as fractions, percents and decimals', () => {
    each('MS.G5.D2.1.a', [1, 2, 3], (it) => {
      const counts = [...it.prompt.en.split(': ')[1]!.split('.')[0]!.matchAll(/(\d+) (red|blue|green|yellow)/g)].map((m) => ({ n: Number(m[1]), c: m[2]! }));
      const total = counts.reduce((a, b) => a + b.n, 0);
      const asked = [...it.prompt.en.split('probability it is ')[1]!.split('?')[0]!.matchAll(/red|blue|green|yellow/g)].map((m) => m[0]);
      const fav = counts.filter((c) => asked.includes(c.c)).reduce((a, b) => a + b.n, 0);
      const a = it.answer as { n: number; d: number };
      expect(a.n / a.d).toBeCloseTo(fav / total, 9);
    });
    each('MS.G6.D2.1.a', [1], (it) => { const [total, fav] = nums(it.prompt.en); expect(val(it)).toBeCloseTo((fav! / total!) * 100, 9); });
    each('MS.G6.D2.1.a', [2], (it) => close(val(it), nums(it.prompt.en)[0]! / 100));
    each('MS.G6.D2.1.a', [3], (it) => { const [total, fav] = nums(it.prompt.en); expect(val(it)).toBeCloseTo((fav! / total!) * 100, 9); });
  });

  it('multiplies independent probabilities and uses experimental results', () => {
    each('MS.G6.D2.2.a', [1, 2, 3], (it) => {
      const m = /has (\d+) equal sections.*has (\d+) equal sections/.exec(it.prompt.en)!;
      const a = it.answer as { n: number; d: number };
      const spin = Number(m[1]); const die = Number(m[2]);
      const favB = /number from 1 to (\d)/.exec(it.prompt.en)?.[1];
      expect(a.n / a.d).toBeCloseTo((1 / spin) * ((favB ? Number(favB) : 1) / die), 9);
    });
    each('MS.G5.D2.2.a', [1], (it) => { const [trials, heads] = nums(it.prompt.en); expect(val(it)).toBe(trials! - heads!); });
    each('MS.G5.D2.2.a', [2], (it) => { const [trials, heads] = nums(it.prompt.en); expect(val(it)).toBe(Math.abs(heads! - trials! / 2)); expect(val(it)).toBeGreaterThan(0); });
    each('MS.G5.D2.2.a', [3], (it) => { const [d, trials] = nums(it.prompt.en.replace('\\frac{1}{', '').replace('}', '')); expect(val(it)).toBe(trials! / d!); });
  });
});

describe('spatial sense and financial literacy generators (strands E and F)', () => {
  it('converts metric units both ways', () => {
    each('MS.G5.E2.2.a', [1, 2, 3], (it) => {
      const m = /How many (\w+) are in ([\d.]+) (\w+)\?/.exec(clean(it.prompt.en))!;
      const f = ({ 'm>cm': 100, 'km>m': 1000, 'kg>g': 1000, 'L>mL': 1000, 'cm>mm': 10 } as Record<string, number>)[`${m[3]}>${m[1]}`]!;
      expect(f).toBeDefined();
      close(val(it), Number(m[2]) * f);
    });
    each('MS.G6.E2.1.a', [1, 2, 3], (it) => {
      const m = /Convert ([\d.]+) (\w+) to (\w+)\./.exec(clean(it.prompt.en))!;
      const F: Record<string, number> = { 'm>cm': 100, 'km>m': 1000, 'kg>g': 1000, 'L>mL': 1000, 'cm>mm': 10 };
      const down = F[`${m[2]}>${m[3]}`];
      const up = F[`${m[3]}>${m[2]}`];
      close(val(it), down ? Number(m[1]) * down : Number(m[1]) / up!);
    });
  });

  it('finds areas, perimeters and surface areas', () => {
    each('MS.G5.E2.5.a', [1], (it) => { const [b, h] = nums(it.prompt.en); expect(val(it)).toBe(b! * h!); });
    each('MS.G5.E2.5.a', [2], (it) => { const [b, h] = nums(it.prompt.en); expect(val(it)).toBe((b! * h!) / 2); });
    each('MS.G5.E2.5.a', [3], (it) => { const [area, b] = nums(it.prompt.en.replace('cm²', 'cm')); expect(val(it) * b!).toBe(area); });
    each('MS.G5.E2.6.a', [1], (it) => { const [l, w] = nums(it.prompt.en); expect(val(it)).toBe(2 * (l! + w!)); });
    each('MS.G5.E2.6.a', [2], (it) => { const [area, w] = nums(it.prompt.en.replace('cm²', 'cm')); expect(val(it)).toBe(2 * (area! / w! + w!)); });
    each('MS.G5.E2.6.a', [3], (it) => {
      const [area, l1, w1, l2, w2] = nums(it.prompt.en.replace(/cm²/g, 'cm')) as [number, number, number, number, number];
      expect(l1 * w1).toBe(area); expect(l2 * w2).toBe(area);
      expect(val(it)).toBe(2 * (l1 + w1) - 2 * (l2 + w2));
      expect(val(it)).toBeGreaterThan(0);
    });
    each('MS.G6.E2.4.a', [1], (it) => { const [a, b, h] = nums(it.prompt.en); expect(val(it)).toBe(((a! + b!) * h!) / 2); });
    each('MS.G6.E2.4.a', [2], (it) => { const [d1, d2] = nums(it.prompt.en); expect(val(it)).toBe((d1! * d2!) / 2); });
    each('MS.G6.E2.4.a', [3], (it) => { const n = nums(it.prompt.en); const [l, w, th] = [n[0]!, n[1]!, n[4]!]; expect(val(it)).toBe(l * w + (w * th) / 2); });
    each('MS.G6.E2.6.a', [1, 2], (it) => { const [l, w, h] = nums(it.prompt.en); expect(val(it)).toBe(2 * (l! * w! + l! * h! + w! * h!)); });
    each('MS.G6.E2.6.a', [3], (it) => { const [l, w, h] = nums(it.prompt.en); expect(val(it)).toBe(l! * w! + 2 * l! * h! + 2 * w! * h!); });
  });

  it('finds unknown angles and sides', () => {
    each('MS.G6.E2.3.a', [1], (it) => expect(val(it) + nums(it.prompt.en)[0]!).toBe(90));
    each('MS.G6.E2.3.a', [2], (it) => expect(val(it) + nums(it.prompt.en)[0]!).toBe(180));
    each('MS.G6.E2.3.a', [3], (it) => { const [a, b] = nums(it.prompt.en); expect(val(it)).toBe(a! + b!); expect(val(it)).toBeLessThan(180); });
    each('MS.G5.E1.1.a', [1], (it) => { const [a, b] = nums(it.prompt.en); expect(val(it) + a! + b!).toBe(180); expect(val(it)).toBeGreaterThan(0); });
    each('MS.G5.E1.1.a', [2], (it) => { const [apex] = nums(it.prompt.en); expect(apex! + 2 * val(it)).toBe(180); });
    each('MS.G5.E1.1.a', [3], (it) => { const [s, p] = nums(it.prompt.en); expect(2 * s! + val(it)).toBe(p); expect(val(it)).toBeLessThan(2 * s!); });
    each('MS.G6.E1.1.a', [1], (it) => { const [a, b, c] = nums(it.prompt.en); expect(val(it) + a! + b! + c!).toBe(360); expect(val(it)).toBeGreaterThan(0); });
    each('MS.G6.E1.1.a', [2], (it) => expect(val(it) + nums(it.prompt.en)[0]!).toBe(180));
    each('MS.G6.E1.1.a', [3], (it) => expect(val(it) * 4).toBe(nums(it.prompt.en)[0]!));
  });

  it('places points in quadrants and applies reflections and translations', () => {
    each('MS.G6.E1.3.a', [1], (it) => {
      const [x, y] = nums(it.prompt.en);
      const quad = x! > 0 ? (y! > 0 ? 'I' : 'IV') : (y! > 0 ? 'II' : 'III');
      expect(choiceText(it)).toBe(`Quadrant ${quad}`);
    });
    each('MS.G6.E1.3.a', [2], (it) => {
      const [x, y] = nums(it.prompt.en.split('is reflected')[0]!);
      const overX = it.prompt.en.includes('x-axis');
      expect(nums(choiceText(it))).toEqual(overX ? [x, -y!] : [-x!, y]);
    });
    each('MS.G6.E1.3.a', [3], (it) => {
      const [x, y, dx, dy] = nums(it.prompt.en);
      const sx = /units left/.test(it.prompt.en) ? -1 : 1;
      const sy = /units down/.test(it.prompt.en) ? -1 : 1;
      expect(nums(choiceText(it))).toEqual([x! + sx * dx!, y! + sy * dy!]);
    });
  });

  it('adds up purchases with tax, compares unit rates and finds simple interest', () => {
    each('MS.G5.F1.2.a', [1], (it) => { const [a, b] = nums(it.prompt.en); close(val(it), a! + b!); });
    each('MS.G5.F1.2.a', [2], (it) => { const [sub] = nums(it.prompt.en); close(val(it), Math.round(sub! * 113) / 100); });
    each('MS.G5.F1.2.a', [3], (it) => { const [qa, pa, qb, pb] = nums(it.prompt.en); close(val(it), Math.round((qa! * pa! + qb! * pb!) * 113) / 100); });
    each('MS.G5.F1.5.a', [1, 2, 3], (it) => {
      const [q1, p1, q2, p2] = nums(it.prompt.en.replace(/Pack [AB]/g, ''));
      const betterA = p1! / q1! < p2! / q2!;
      expect(choiceText(it).startsWith(betterA ? 'Pack A' : 'Pack B')).toBe(true);
      expect(p1! / q1!).not.toBeCloseTo(p2! / q2!, 9);
    });
    each('MS.G6.F1.4.a', [1], (it) => { const [P, r] = nums(it.prompt.en); expect(val(it)).toBe((P! * r!) / 100); });
    each('MS.G6.F1.4.a', [2], (it) => { const [P, r, y] = nums(it.prompt.en); expect(val(it)).toBe((P! * r! * y!) / 100); });
    each('MS.G6.F1.4.a', [3], (it) => { const [P, r, y] = nums(it.prompt.en); expect(val(it)).toBe(P! + (P! * r! * y!) / 100); });
  });
});
