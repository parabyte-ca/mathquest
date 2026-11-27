import { describe, it, expect } from 'vitest';
import { generate } from '../shared/generators/index.js';
import type { Item } from '../shared/items/types.js';

// Independent recomputation of every MDM4U answer from the prompt text alone. Counting answers use brute-force enumeration.
const SEEDS = Array.from({ length: 40 }, (_, i) => i + 1);
const value = (it: Item): number => (it.answer as { value: number }).value;
const optionText = (it: Item): string => it.options![(it.answer as { index: number }).index]!.en;
const g = (skill: string, tier: number, seed: number): Item => generate(`MS.G12.MDM4U.${skill}.a`, tier, seed);
const close = (a: number, b: number, tol = 1e-6): void => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol * Math.max(1, Math.abs(b)));
/** Every $...$ token that is a plain number. */
const nums = (s: string): number[] => [...s.replace(/\\,/g, '').replace(/\{,\}/g, '.').matchAll(/\$(?:\\dollar )?(-?\d+(?:\.\d+)?)(?:\\ \\dollar)?\$/g)].map((m) => Number(m[1]));
const plain = (s: string): string => s.replace(/\$/g, '').replace(/\\left|\\right|\\,/g, '').replace(/\{,\}/g, '.');

/** Pascal's triangle by addition, so the counting formulas are never used to check themselves. */
const row = (n: number): number[] => { let r = [1]; for (let i = 0; i < n; i++) r = [1, ...r.slice(1).map((x, j) => x + r[j]!), 1]; return r; };
const C = (n: number, k: number): number => row(n)[k]!;
const subsets = <T,>(items: T[], k: number): T[][] => (k === 0 ? [[]] : items.flatMap((x, i) => subsets(items.slice(i + 1), k - 1).map((rest) => [x, ...rest])));
const perms = (s: string): Set<string> => { if (s.length <= 1) return new Set([s]); const out = new Set<string>(); for (let i = 0; i < s.length; i++) for (const p of perms(s.slice(0, i) + s.slice(i + 1))) out.add(s[i] + p); return out; };
const median = (v: number[]): number => { const s = [...v].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2; };

describe('MDM4U A and B: probability and distributions', () => {
  it('A1.1 rules of probability', () => {
    for (const seed of SEEDS) {
      const a = g('A1.1', 1, seed); close(1 - nums(a.prompt.en)[0]!, value(a));
      const b = g('A1.1', 2, seed), [pa, pb, both] = [...plain(b.prompt.en).matchAll(/= (\d*\.?\d+)/g)].map((m) => Number(m[1]));
      close(pa! + pb! - both!, value(b));
      const c = g('A1.1', 3, seed), [x, y] = [...plain(c.prompt.en).matchAll(/= (\d*\.?\d+)/g)].map((m) => Number(m[1]));
      close(1 - (1 - x!) * (1 - y!), value(c));
    }
  });
  it('A1.2 conditional probability, including drawing two marbles by enumeration', () => {
    for (const seed of SEEDS) {
      const a = g('A1.2', 1, seed), [pb, both] = [...plain(a.prompt.en).matchAll(/= (\d*\.?\d+)/g)].map((m) => Number(m[1]));
      close(both! / pb!, value(a), 1e-3);
      const b = g('A1.2', 2, seed), [pbb, cond] = [...plain(b.prompt.en).matchAll(/= (\d*\.?\d+)/g)].map((m) => Number(m[1]));
      close(pbb! * cond!, value(b));
      const c = g('A1.2', 3, seed), [red, blue] = nums(c.prompt.en);
      const marbles = [...Array(red).fill('r'), ...Array(blue).fill('b')] as string[];
      let good = 0, total = 0;
      for (let i = 0; i < marbles.length; i++) for (let j = 0; j < marbles.length; j++) if (i !== j) { total++; if (marbles[i] === 'r' && marbles[j] === 'r') good++; }
      close(good / total, value(c));
    }
  });
  it('A2 counting by enumeration and by Pascal\'s triangle', () => {
    for (const seed of SEEDS) {
      const a = g('A2.1', 1, seed), m = /\\text\{([PC])\}\((\d+), (\d+)\)/.exec(plain(a.prompt.en))!, n = Number(m[2]), k = Number(m[3]);
      const idx = Array.from({ length: n }, (_, i) => i);
      expect(value(a)).toBe(m[1] === 'C' ? subsets(idx, k).length : subsets(idx, k).length * [...Array(k).keys()].reduce((p, i) => p * (k - i), 1));
      const b = g('A2.1', 2, seed), sb = b.prompt.en;
      if (/committees/.test(sb)) { const [k2, n2] = nums(sb); expect(value(b)).toBe(subsets(Array.from({ length: n2! }, (_, i) => i), k2!).length); }
      else { const word = /word ([A-Z]+)/.exec(sb)![1]!; expect(value(b)).toBe(perms(word).size); }
      const c = g('A2.1', 3, seed), [w, mm, aa, bb] = nums(c.prompt.en);
      expect(value(c)).toBe(subsets(Array.from({ length: w! }, (_, i) => i), aa!).length * subsets(Array.from({ length: mm! }, (_, i) => i), bb!).length);
      const p1 = g('A2.2', 1, seed), [rn, rk] = nums(p1.prompt.en);
      expect(value(p1)).toBe(row(rn!)[rk!]);
      const p2 = g('A2.2', 2, seed), s2 = plain(p2.prompt.en), [, nn, kk] = /Given \\text\{C\}\((\d+), (\d+)\)/.exec(s2)!.map(Number) as number[];
      void nn; void kk;
      const m2 = /find \\text\{C\}\((\d+), (\d+)\)/.exec(s2)!;
      expect(value(p2)).toBe(row(Number(m2[1]))[Number(m2[2])]);
      const p3 = g('A2.2', 3, seed), [rn3] = nums(p3.prompt.en);
      expect(value(p3)).toBe(row(rn3!).reduce((s, x) => s + x, 0));
    }
  });
  it('B1 expected value, binomial and hypergeometric counts', () => {
    for (const seed of SEEDS) {
      const a = g('B1.1', 1, seed), v = nums(a.prompt.en);
      const xs = v.slice(0, 3), ps = v.slice(3, 6);
      close(xs.reduce((s, x, i) => s + x * ps[i]!, 0), value(a));
      expect(ps.reduce((x, y) => x + y, 0)).toBeCloseTo(1, 9);
      const b = g('B1.1', 2, seed), [cost, prize, pw] = nums(b.prompt.en);
      close(prize! * pw! - cost!, value(b));
      const c = g('B1.1', 3, seed), [pz, pwin] = nums(c.prompt.en);
      close(pz! * pwin!, value(c));
      const q1 = g('B1.2', 1, seed), [n, k] = nums(q1.prompt.en);
      const seqs = Array.from({ length: 2 ** n! }, (_, i) => i.toString(2).replace(/0/g, '').length);
      close(seqs.filter((h) => h === k).length / 2 ** n!, value(q1));
      const q2 = g('B1.2', 2, seed), pp = /p = (\d*\.?\d+)/.exec(plain(q2.prompt.en))![1], nn = /n = (\d+)/.exec(plain(q2.prompt.en))![1];
      close(Number(nn) * Number(pp), value(q2));
      const q3 = g('B1.2', 3, seed), [n3, m3] = nums(q3.prompt.en), s3 = Array.from({ length: 2 ** n3! }, (_, i) => i.toString(2).replace(/0/g, '').length);
      close(s3.filter((h) => h >= m3!).length / 2 ** n3!, value(q3));
      const h1 = g('B1.3', 1, seed), [N1, K1, n1] = nums(h1.prompt.en);
      void K1;
      expect(value(h1)).toBe(subsets(Array.from({ length: N1! }, (_, i) => i), n1!).length);
      const h2 = g('B1.3', 2, seed), [N2, K2, n2, k2] = nums(h2.prompt.en);
      expect(value(h2)).toBe(subsets(Array.from({ length: N2! }, (_, i) => i), n2!).filter((s) => s.filter((i) => i < K2!).length === k2).length);
      const h3 = g('B1.3', 3, seed), [N3, K3, n3b] = nums(h3.prompt.en);
      close(value(h3), (n3b! * K3!) / N3!);
    }
  });
  it('B2 normal distribution, the 68-95-99.7 rule and the normal approximation', () => {
    const half: Record<number, number> = { 1: 34, 2: 47.5, 3: 49.85 };
    for (const seed of SEEDS) {
      const a = g('B2.1', 1, seed), [mu, sd, x] = nums(a.prompt.en); close((x! - mu!) / sd!, value(a));
      const b = g('B2.1', 2, seed), [mu2, sd2, z2] = nums(b.prompt.en); close(mu2! + z2! * sd2!, value(b));
      const c = g('B2.1', 3, seed), [lo, hi, mu3, sd3] = nums(c.prompt.en);
      close(half[(mu3! - lo!) / sd3!]! + half[(hi! - mu3!) / sd3!]!, value(c));
      const n1 = g('B2.2', 1, seed), [n, p] = [...plain(n1.prompt.en).matchAll(/= (\d*\.?\d+)/g)].map((m) => Number(m[1]));
      close(n! * p!, value(n1));
      const n2 = g('B2.2', 2, seed), [nn, pp] = [...plain(n2.prompt.en).matchAll(/= (\d*\.?\d+)/g)].map((m) => Number(m[1]));
      close(Math.sqrt(nn! * pp! * (1 - pp!)), value(n2));
      const n3 = g('B2.2', 3, seed), s3 = plain(n3.prompt.en), [n3n, n3p] = [...s3.matchAll(/ = (\d*\.?\d+)/g)].map((m) => Number(m[1])), xx = Number(/ge (\d+)/.exec(s3)![1]);
      close((xx - 0.5 - n3n! * n3p!) / Math.sqrt(n3n! * n3p! * (1 - n3p!)), value(n3));
    }
  });
});

describe('MDM4U C and D: studies and statistics', () => {
  it('C1.1 and C2.1 name the bias or the sampling technique from the description', () => {
    const technique: [RegExp, string][] = [[/random number generator/, 'Simple random sample'], [/every 10th/, 'Systematic sample'], [/split by grade/, 'Stratified sample'], [/homeroom/, 'Cluster sample'], [/walk past/, 'Convenience sample'], [/Four schools/, 'Multi-stage sample']];
    const bias: [RegExp, string][] = [[/eat in the cafeteria/, 'Sampling bias'], [/mailed survey/, 'Non-response bias'], [/Don't you agree/, 'Response bias'], [/2 kg too high/, 'Measurement bias'], [/online poll/, 'Voluntary response bias'], [/landline/, 'Undercoverage bias']];
    for (const seed of SEEDS) for (const tier of [1, 2, 3]) {
      const a = g('C2.1', tier, seed); expect(optionText(a)).toBe(technique.find(([re]) => re.test(a.prompt.en))![1]);
      const b = g('C1.1', tier, seed); expect(optionText(b)).toBe(bias.find(([re]) => re.test(b.prompt.en))![1]);
    }
  });
  it('D1.1 mean, population variance and sample standard deviation', () => {
    for (const seed of SEEDS) {
      const a = g('D1.1', 1, seed), va = nums(a.prompt.en); close(va.reduce((s, x) => s + x, 0) / va.length, value(a));
      const b = g('D1.1', 2, seed), vb = nums(b.prompt.en), mb = vb.reduce((s, x) => s + x, 0) / vb.length;
      close(vb.reduce((s, x) => s + (x - mb) ** 2, 0) / vb.length, value(b));
      const c = g('D1.1', 3, seed), vc = nums(c.prompt.en), mc = vc.reduce((s, x) => s + x, 0) / vc.length;
      close(Math.sqrt(vc.reduce((s, x) => s + (x - mc) ** 2, 0) / (vc.length - 1)), value(c));
    }
  });
  it('D1.2 quartiles, fences and outliers', () => {
    for (const tier of [1, 2, 3]) for (const seed of SEEDS) {
      const it = g('D1.2', tier, seed), v = nums(it.prompt.en);
      expect(v).toHaveLength(11);
      const s = [...v].sort((a, b) => a - b), q1 = median(s.slice(0, 5)), q3 = median(s.slice(6)), iqr = q3 - q1;
      if (tier === 1) close(iqr, value(it));
      else if (tier === 2) close(q3 + 1.5 * iqr, value(it));
      else expect(value(it)).toBe(s.filter((x) => x > q3 + 1.5 * iqr || x < q1 - 1.5 * iqr).length);
    }
  });
  it('D2 regression, residuals and margin of error', () => {
    for (const seed of SEEDS) {
      const a = g('D2.1', 1, seed), sa = plain(a.prompt.en), m = /= (-?\d*\.?\d+) ([+-]) (\d*\.?\d+)x/.exec(sa)!, x = Number(/x = (\d+)/.exec(sa)![1]);
      close(Number(m[1]) + (m[2] === '-' ? -1 : 1) * Number(m[3]) * x, value(a));
      const b = g('D2.1', 2, seed), [r, sx, sy] = [...plain(b.prompt.en).matchAll(/= (-?\d*\.?\d+)/g)].map((q) => Number(q[1]));
      close((r! * sy!) / sx!, value(b));
      const c = g('D2.1', 3, seed), rr = Number(/r = (-?\d*\.?\d+)/.exec(plain(c.prompt.en))![1]);
      close(rr * rr * 100, value(c));
      const r1 = g('D2.2', 1, seed), s1 = plain(r1.prompt.en), m1 = /= (\d+) \+ (\d*\.?\d+)x/.exec(s1)!, [px, py] = nums(r1.prompt.en);
      close(py! - (Number(m1[1]) + Number(m1[2]) * px!), value(r1));
      const r2 = g('D2.2', 2, seed), o = nums(r2.prompt.en).slice(2);
      expect(o.reduce((s, v) => s + v, 0) + value(r2)).toBe(0);
      const r3 = g('D2.2', 3, seed), s3 = plain(r3.prompt.en), m3 = /= (\d+) \+ (\d*\.?\d+)x/.exec(s3)!, pts = [...r3.prompt.en.matchAll(/\(\$(\d+)\$, \$(-?\d+(?:\.\d+)?)\$\)/g)].map((q) => [Number(q[1]), Number(q[2])] as [number, number]);
      expect(pts).toHaveLength(5);
      expect(value(r3)).toBe(pts.filter(([px3, py3]) => py3 > Number(m3[1]) + Number(m3[2]) * px3).length);
      const e1 = g('D3.1', 1, seed), [n1, k1] = nums(e1.prompt.en); close((k1! / n1!) * 100, value(e1));
      const e2 = g('D3.1', 2, seed), [n2] = nums(e2.prompt.en); close(100 / Math.sqrt(n2!), value(e2));
      const e3 = g('D3.1', 3, seed), [n3, p3, me3] = nums(e3.prompt.en); close(p3! - me3!, value(e3)); close(me3!, 100 / Math.sqrt(n3!), 1e-6);
    }
  });
});
