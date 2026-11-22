import { describe, it, expect } from 'vitest';
import { generate } from '../shared/generators/index.js';
import { check } from '../shared/check.js';
import type { Item } from '../shared/items/types.js';

// Independent recomputation: every answer is worked out again from the prompt text alone (brute force where that is possible).
const SEEDS = Array.from({ length: 40 }, (_, i) => i + 1);
const value = (it: Item): number => (it.answer as { value: number }).value;
const optionText = (it: Item): string => it.options![(it.answer as { index: number }).index]!.en;
const plain = (s: string): string => s.replace(/\$/g, '').replace(/\\left|\\right|\\,/g, '').replace(/\{,\}/g, '.');
const g = (skill: string, tier: number, seed: number): Item => generate(`MS.G12.MHF4U.${skill}.a`, tier, seed);
const close = (a: number, b: number, tol = 1e-6): void => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol * Math.max(1, Math.abs(b)));
const num = (s: string): number => Number(s.replace(/\s+/g, ''));

/** A polynomial from text such as "2x^{3} - x + 7", as coefficients by power. */
function parsePoly(s: string): Map<number, number> {
  const out = new Map<number, number>();
  for (const m of s.replace(/\s+/g, '').matchAll(/([+-]?)(\d*\.?\d*)(x(?:\^\{?(\d+)\}?)?)?/g)) {
    if (!m[0]) continue;
    const sign = m[1] === '-' ? -1 : 1;
    const hasX = !!m[3];
    if (!hasX && m[2] === '') continue;
    const coef = m[2] === '' ? 1 : Number(m[2]);
    const pow = hasX ? (m[4] ? Number(m[4]) : 1) : 0;
    out.set(pow, (out.get(pow) ?? 0) + sign * coef);
  }
  return out;
}
const evalMap = (p: Map<number, number>, x: number): number => [...p].reduce((s, [k, c]) => s + c * x ** k, 0);
/** Linear factors like (x - 3) or (x + 2) or (x), with an optional exponent, as [root, multiplicity]. */
function parseFactors(s: string): [number, number][] {
  return [...s.replace(/\s+/g, '').replace(/f\(x\)/g, 'F').matchAll(/\(x(?:([+-])(\d+))?\)(?:\^\{(\d+)\})?/g)].map((m) => [m[1] ? (m[1] === '-' ? 1 : -1) * Number(m[2]) : 0, m[3] ? Number(m[3]) : 1]);
}
const logb = (b: number, x: number): number => Math.log(x) / Math.log(b);

describe('MHF4U A: logarithms', () => {
  it('A1.1 evaluates logarithms from the exponent', () => {
    for (const tier of [1, 2, 3]) for (const seed of SEEDS) {
      const it = g('A1.1', tier, seed), s = plain(it.prompt.en);
      let want: number;
      let m: RegExpExecArray | null;
      if ((m = /\\log_\{(\d+)\} \\frac\{1\}\{(\d+)\}/.exec(s))) want = -logb(num(m[1]!), num(m[2]!));
      else if ((m = /\\log_\{(\d+)\} \\sqrt\[(\d+)\]\{(\d+)\}/.exec(s))) want = logb(num(m[1]!), num(m[3]!) ** (1 / num(m[2]!)));
      else { m = /\\log_\{(\d+)\} (\d+)/.exec(s)!; want = logb(num(m[1]!), num(m[2]!)); }
      close(value(it), want);
    }
  });
  it('A1.2 applies the laws of logarithms', () => {
    for (const seed of SEEDS) {
      const a = g('A1.2', 1, seed), s = plain(a.prompt.en);
      const terms = [...s.matchAll(/(\d*) ?\\log_\{(\d+)\} (\d+)/g)].map((m) => ({ k: m[1] ? num(m[1]) : 1, v: logb(num(m[2]!), num(m[3]!)) }));
      const op = /\+/.test(s) ? 1 : /-/.test(s) ? -1 : 0;
      close(value(a), op === 0 ? terms[0]!.k * terms[0]!.v : terms[0]!.v + op * terms[1]!.v);
      const b = g('A1.2', 2, seed), sb = plain(b.prompt.en);
      const [p, q, z] = [...sb.matchAll(/\\log_\{\d+\} [xyz\s]*= (\d+)/g)].map((m) => num(m[1]!));
      const [ea, ec] = [...sb.matchAll(/[xy]\^\{(\d+)\}/g)].map((m) => num(m[1]!));
      expect(value(b)).toBe(ea! * p! + ec! * q! - z!);
      const c = g('A1.2', 3, seed), nums = [...plain(c.prompt.en).matchAll(/\\log_\{(\d+)\} (\d+)/g)].map((m) => num(m[2]!));
      close(value(c), (nums[0]! * nums[1]!) / nums[2]!);
    }
  });
  it('A2.1 reads asymptotes, intercepts and values off y = log_b(x - h) + k', () => {
    for (const tier of [1, 2, 3]) for (const seed of SEEDS) {
      const it = g('A2.1', tier, seed), s = plain(it.prompt.en);
      const m = /y = \\log_\{(\d+)\} \(x ([+-]) (\d+)\) ?(?:([+-]) (\d+))?/.exec(s)!;
      const b = num(m[1]!), h = m[2] === '+' ? -num(m[3]!) : num(m[3]!), k = m[4] ? (m[4] === '-' ? -1 : 1) * num(m[5]!) : 0;
      const f = (x: number): number => logb(b, x - h) + k;
      if (tier === 1) expect(value(it)).toBe(h);
      else if (tier === 2) { close(f(value(it)), 0, 1e-9); expect(value(it)).toBeGreaterThan(h); }
      else { const x = num(/x = (-?\d+)/.exec(s)![1]!); close(f(x), value(it)); }
    }
  });
  it('A3.1 solves exponential equations: the answer satisfies the equation', () => {
    for (const seed of SEEDS) {
      const a = g('A3.1', 1, seed), m1 = /(\d+)\^x = (\d+)/.exec(plain(a.prompt.en))!;
      close(num(m1[1]!) ** value(a), num(m1[2]!), 1e-9);
      const b = g('A3.1', 2, seed), m2 = /(\d+)\^\{(\d+)x - (\d+)\} = (\d+)/.exec(plain(b.prompt.en))!;
      close(num(m2[1]!) ** (num(m2[2]!) * value(b) - num(m2[3]!)), num(m2[4]!), 1e-9);
      const c = g('A3.1', 3, seed), m3 = /(\d+)\^x = (\d+)/.exec(plain(c.prompt.en))!;
      expect(Math.abs(num(m3[1]!) ** value(c) - num(m3[2]!)) / num(m3[2]!)).toBeLessThan(1e-4);
      expect((c.answer as { tolerance?: number }).tolerance).toBe(0.005);
    }
  });
  it('A3.2 solves logarithmic equations and rejects extraneous roots', () => {
    for (const seed of SEEDS) {
      const a = g('A3.2', 1, seed), m1 = /\\log_\{(\d+)\} x = (\d+)/.exec(plain(a.prompt.en))!;
      close(logb(num(m1[1]!), value(a)), num(m1[2]!), 1e-9);
      const b = g('A3.2', 2, seed), m2 = /\\log_\{(\d+)\} \(x ([+-]) (\d+)\) = (\d+)/.exec(plain(b.prompt.en))!;
      close(logb(num(m2[1]!), value(b) + (m2[2] === '+' ? 1 : -1) * num(m2[3]!)), num(m2[4]!), 1e-9);
      const c = g('A3.2', 3, seed), m3 = /\\log_\{(\d+)\} x \+ \\log_\{\d+\} \(x - (\d+)\) = (\d+)/.exec(plain(c.prompt.en))!;
      const x = value(c), d = num(m3[2]!);
      expect(x - d).toBeGreaterThan(0);
      close(logb(num(m3[1]!), x) + logb(num(m3[1]!), x - d), num(m3[3]!), 1e-9);
      // the other root of the quadratic is not valid
      const other = (d - Math.sqrt(d * d + 4 * num(m3[1]!) ** num(m3[3]!))) / 2;
      expect(other).toBeLessThan(0);
    }
  });
});

const texValue = (s: string): number => {
  const t = plain(s).replace(/\s+/g, '');
  const neg = t.startsWith('-') ? -1 : 1, body = t.replace(/^-/, '');
  const table: Record<string, number> = { '0': 0, '1': 1, '\\frac{1}{2}': 0.5, '\\frac{\\sqrt{2}}{2}': Math.SQRT2 / 2, '\\frac{\\sqrt{3}}{2}': Math.sqrt(3) / 2, '\\sqrt{3}': Math.sqrt(3), '\\frac{\\sqrt{3}}{3}': Math.sqrt(3) / 3 };
  if (!(body in table)) throw new Error(`unknown exact value ${s}`);
  return neg * table[body]!;
};
const piValue = (s: string): number => {
  const t = plain(s).replace(/\s+/g, '');
  if (t === '0') return 0;
  let m = /^\\frac\{(\d*)\\pi\}\{(\d+)\}$/.exec(t);
  if (m) return ((m[1] ? num(m[1]) : 1) / num(m[2]!));
  m = /^(\d*)\\pi$/.exec(t);
  if (m) return m[1] ? num(m[1]) : 1;
  throw new Error(`cannot read ${s}`);
};

describe('MHF4U B: trigonometric functions', () => {
  it('B1.1 converts between degrees and radians and finds arc length', () => {
    for (const seed of SEEDS) {
      const a = g('B1.1', 1, seed), deg = num(/(\d+)°/.exec(plain(a.prompt.en))!.at(1)!);
      close(piValue(optionText(a)) * 180, deg);
      a.options!.forEach((o, i) => { if (i !== (a.answer as { index: number }).index) expect(Math.abs(piValue(o.en) * 180 - deg)).toBeGreaterThan(1e-6); });
      const b = g('B1.1', 2, seed), m = /Convert (.+) radians/.exec(plain(b.prompt.en))!;
      close(piValue(m[1]!) * 180, value(b));
      const c = g('B1.1', 3, seed), n = [...plain(c.prompt.en).matchAll(/(\d+(?:\.\d+)?)/g)].map((x) => num(x[1]!));
      close(value(c), n[0]! * n[1]!);
    }
  });
  it('B1.2 matches the exact value to sin, cos or tan of the angle', () => {
    for (const tier of [1, 2, 3]) for (const seed of SEEDS) {
      const it = g('B1.2', tier, seed), s = plain(it.prompt.en);
      const m = /\\(sin|cos|tan)\((.+)\)\?/.exec(s)!;
      const rad = piValue(m[2]!) * Math.PI;
      const want = m[1] === 'sin' ? Math.sin(rad) : m[1] === 'cos' ? Math.cos(rad) : Math.tan(rad);
      close(texValue(optionText(it)), want, 1e-9);
      it.options!.forEach((o, i) => { if (i !== (it.answer as { index: number }).index) expect(Math.abs(texValue(o.en) - want)).toBeGreaterThan(1e-6); });
    }
  });
  it('B2.1 reads the period, extremes and k of a sine function', () => {
    for (const seed of SEEDS) {
      const a = g('B2.1', 1, seed), ma = /\\sin\(([\d.]*)x\)/.exec(plain(a.prompt.en))!;
      close(value(a), 2 / (ma[1] ? num(ma[1]) : 1));
      const b = g('B2.1', 2, seed), s = plain(b.prompt.en), mb = /y = (\d+)\\sin\([\d.]*x\) ?(?:([+-]) (\d+))?/.exec(s)!;
      const amp = num(mb[1]!), c = mb[2] ? (mb[2] === '-' ? -1 : 1) * num(mb[3]!) : 0;
      expect(value(b)).toBe(/height/.test(s) ? 2 * amp : /maximum value/.test(s) ? c + amp : c - amp);
      const d = g('B2.1', 3, seed), nums = [...plain(d.prompt.en).matchAll(/(-?\d+(?:\.\d+)?)/g)].map((x) => num(x[1]!));
      const period = nums.find((_, i) => /\\pi/.test(plain(d.prompt.en).slice(plain(d.prompt.en).indexOf(String(nums[i]))))) ?? 0;
      void period;
      const mp = /period of ([\d.]+)\\pi/.exec(plain(d.prompt.en))!;
      close(value(d), 2 / num(mp[1]!));
    }
  });
  it('B3.1 solves by searching every whole degree', () => {
    const f: Record<string, (x: number) => number> = { sin: (x) => Math.sin((x * Math.PI) / 180), cos: (x) => Math.cos((x * Math.PI) / 180), tan: (x) => Math.tan((x * Math.PI) / 180) };
    for (const tier of [1, 2]) for (const seed of SEEDS) {
      const it = g('B3.1', tier, seed), s = plain(it.prompt.en), m = /\\(sin|cos|tan) x = (.+) for/.exec(s)!;
      const v = texValue(m[2]!);
      const sols = Array.from({ length: 360 }, (_, i) => i).filter((x) => Math.abs(f[m[1]!]!(x) - v) < 1e-9);
      expect(sols).toHaveLength(2);
      expect(value(it)).toBe(/smaller/.test(s) ? sols[0] : sols[1]);
    }
    for (const seed of SEEDS) {
      const it = g('B3.1', 3, seed), s = plain(it.prompt.en);
      const m = /\(2\\sin x(?: ([+-]) (\d+))?\)\(\\sin x(?: ([+-]) (\d+))?\)/.exec(s)!;
      const p = m[1] ? (m[1] === '+' ? -1 : 1) * num(m[2]!) : 0, q = m[3] ? (m[3] === '+' ? -1 : 1) * num(m[4]!) : 0;
      const count = Array.from({ length: 360 }, (_, i) => i).filter((x) => Math.abs((2 * f.sin!(x) - p) * (f.sin!(x) - q)) < 1e-9).length;
      expect(value(it)).toBe(count);
    }
  });
});

describe('MHF4U C: polynomial and rational functions', () => {
  it('C1.1 end behaviour, turning points and the y-intercept', () => {
    for (const seed of SEEDS) {
      const a = g('C1.1', 1, seed), m = /f\(x\) = (-?\d+)x\^\{(\d+)\} \+ x/.exec(plain(a.prompt.en))!;
      const lead = num(m[1]!), deg = num(m[2]!), right = lead > 0 ? 'up' : 'down', left = deg % 2 === 0 ? right : right === 'up' ? 'down' : 'up';
      expect(optionText(a)).toBe(`Left end ${left}, right end ${right}`);
      const b = g('C1.1', 2, seed), fs = parseFactors(plain(b.prompt.en).replace(/^.*f\(x\) = /, ''));
      expect(value(b)).toBe(fs.reduce((s, [, k]) => s + k, 0) - 1);
      const c = g('C1.1', 3, seed), sc = plain(c.prompt.en).replace('f(x) = ', 'F = '), lead3 = /F = (-?\d*)\(/.exec(sc)![1]!;
      const a3 = lead3 === '' ? 1 : lead3 === '-' ? -1 : num(lead3);
      expect(value(c) + 0).toBe(a3 * parseFactors(sc).reduce((p, [r]) => p * -r, 1) + 0);
    }
  });
  it('C2.1 asymptotes and holes of rational functions', () => {
    for (const seed of SEEDS) {
      const a = g('C2.1', 1, seed), md = /\}\{x(?: ([+-]) (\d+))?\}/.exec(plain(a.prompt.en))!;
      expect(value(a)).toBe(md[1] ? (md[1] === '-' ? 1 : -1) * num(md[2]!) : 0);
      const b = g('C2.1', 2, seed), mb = /\\frac\{(-?\d+)x [+-] \d+\}\{(\d*)x [+-] \d+\}/.exec(plain(b.prompt.en))!;
      close(value(b), num(mb[1]!) / (mb[2] ? num(mb[2]) : 1));
      const c = g('C2.1', 3, seed), s = plain(c.prompt.en);
      const mc = /\\frac\{\(x(?: ([+-]) (\d+))?\)\(x(?: ([+-]) (\d+))?\)\}\{\(x(?: ([+-]) (\d+))?\)\(x(?: ([+-]) (\d+))?\)\}/.exec(s)!;
      const root = (sg?: string, n?: string): number => (sg ? (sg === '-' ? 1 : -1) * num(n!) : 0);
      const p = root(mc[1], mc[2]), q = root(mc[3], mc[4]), sh = root(mc[7], mc[8]);
      expect(root(mc[5], mc[6])).toBe(p);
      const holeY = (p - q) / (p - sh);
      expect(value(c)).toBe(/x-coordinate/.test(s) ? p : holeY);
    }
  });
  it('C3 the remainder theorem, the factor theorem, polynomial equations', () => {
    for (const seed of SEEDS) {
      const a = g('C3.1', 1, seed), sa = plain(a.prompt.en), pa = parsePoly(/P\(x\) = (.+?) is divided/.exec(sa)![1]!), ka = /\(x(?: ([+-]) (\d+))?\)/.exec(sa.replace(/^.*divided by /, ''))!;
      expect(value(a)).toBe(evalMap(pa, ka[1] ? (ka[1] === '-' ? 1 : -1) * num(ka[2]!) : 0));
      const b = g('C3.1', 2, seed), sb = plain(b.prompt.en), kb = /\(x(?: ([+-]) (\d+))?\) a factor/.exec(sb)!;
      const k = kb[1] ? (kb[1] === '-' ? 1 : -1) * num(kb[2]!) : 0, pb = parsePoly(/P\(x\) = (.+)\?$/.exec(sb)![1]!.replace('mx', '0'));
      expect(evalMap(pb, k) + value(b) * k).toBe(0);
      const c = g('C3.1', 3, seed), sc = plain(c.prompt.en), pc = parsePoly(/P\(x\) = (.+?) is divided/.exec(sc)![1]!), kc = /\(x ([+-]) (\d+)\)\?$/.exec(sc)!;
      expect(value(c)).toBe(evalMap(pc, kc[1] === '+' ? -num(kc[2]!) : num(kc[2]!)));
    }
    for (const seed of SEEDS) {
      const a = g('C3.2', 1, seed), roots = parseFactors(plain(a.prompt.en));
      expect(value(a)).toBe(roots.reduce((s, [r]) => s + r, 0));
      const b = g('C3.2', 2, seed), sb = plain(b.prompt.en), known = num(/x = (-?\d+)/.exec(sb)![1]!), pb = parsePoly(/solution of (.+?) = 0/.exec(sb)![1]!);
      const rootsB = Array.from({ length: 41 }, (_, i) => i - 20).filter((x) => evalMap(pb, x) === 0);
      expect(rootsB).toContain(known);
      expect(rootsB).toHaveLength(3);
      expect(value(b)).toBe(Math.max(...rootsB.filter((x) => x !== known)));
      const c = g('C3.2', 3, seed), pc = parsePoly(/Solve (.+?) = 0/.exec(plain(c.prompt.en))![1]!);
      const rootsC = Array.from({ length: 41 }, (_, i) => i - 20).filter((x) => evalMap(pc, x) === 0);
      expect(rootsC).toHaveLength(4);
      expect(value(c)).toBe(Math.max(...rootsC));
    }
  });
  it('C4.1 counts the integers from -10 to 10 that satisfy the inequality', () => {
    const ints = Array.from({ length: 21 }, (_, i) => i - 10);
    const rt = (sg?: string, n?: string): number => (sg ? (sg === '-' ? 1 : -1) * num(n!) : 0);
    for (const seed of SEEDS) {
      const a = g('C4.1', 1, seed), ma = /\(x(?: ([+-]) (\d+))?\)\(x(?: ([+-]) (\d+))?\) (>|<|\\ge|\\le) 0/.exec(plain(a.prompt.en))!;
      const [r1, r2] = [rt(ma[1], ma[2]), rt(ma[3], ma[4])], cmp = (v: number): boolean => ({ '>': v > 0, '<': v < 0, '\\ge': v >= 0, '\\le': v <= 0 })[ma[5] as '>']!;
      expect(value(a)).toBe(ints.filter((x) => cmp((x - r1) * (x - r2))).length);
      const b = g('C4.1', 2, seed), mb = /\(x(?: ([+-]) (\d+))?\)\(x(?: ([+-]) (\d+))?\)\(x(?: ([+-]) (\d+))?\) (\\ge|\\le) 0/.exec(plain(b.prompt.en))!;
      const rs = [rt(mb[1], mb[2]), rt(mb[3], mb[4]), rt(mb[5], mb[6])];
      expect(value(b)).toBe(ints.filter((x) => { const v = rs.reduce((p, r) => p * (x - r), 1); return mb[7] === '\\le' ? v <= 0 : v >= 0; }).length);
      const c = g('C4.1', 3, seed), mc = /\\frac\{x(?: ([+-]) (\d+))?\}\{x(?: ([+-]) (\d+))?\} (\\ge|\\le) 0/.exec(plain(c.prompt.en))!;
      const [n0, d0] = [rt(mc[1], mc[2]), rt(mc[3], mc[4])];
      expect(value(c)).toBe(ints.filter((x) => x !== d0 && (mc[5] === '\\ge' ? (x - n0) / (x - d0) >= 0 : (x - n0) / (x - d0) <= 0)).length);
    }
  });
});

describe('MHF4U D: characteristics of functions', () => {
  it('D1.1 average and instantaneous rates of change', () => {
    for (const seed of SEEDS) {
      const a = g('D1.1', 1, seed), sa = plain(a.prompt.en), pa = parsePoly(/f\(x\) = (.+?) from/.exec(sa)![1]!), [x1, x2] = [...sa.matchAll(/x = (-?\d+)/g)].map((m) => num(m[1]!)) as [number, number];
      close(value(a), (evalMap(pa, x2) - evalMap(pa, x1)) / (x2 - x1));
      const b = g('D1.1', 2, seed), sb = plain(b.prompt.en), cb = /f\(x\) = (\d*)x\^3/.exec(sb)![1]!, [y1, y2] = [...sb.matchAll(/x = (-?\d+)/g)].map((m) => num(m[1]!)) as [number, number];
      const k = cb ? num(cb) : 1;
      close(value(b), (k * y2 ** 3 - k * y1 ** 3) / (y2 - y1));
      const c = g('D1.1', 3, seed), sc = plain(c.prompt.en), pc = parsePoly(/f\(x\) = (.+?) at x/.exec(sc)![1]!), [z0, z1] = [...sc.matchAll(/x = (-?\d+(?:\.\d+)?)/g)].map((m) => num(m[1]!)).slice(-2) as [number, number];
      close(value(c), (evalMap(pc, z1) - evalMap(pc, z0)) / (z1 - z0), 1e-6);
    }
  });
  it('D2.1 sums, products and compositions of f and g', () => {
    for (const tier of [1, 2, 3]) for (const seed of SEEDS) {
      const it = g('D2.1', tier, seed), s = plain(it.prompt.en);
      const mf = /f\(x\) = (-?\d+)x(?: ([+-]) (\d+))?/.exec(s)!, mg = /g\(x\) = (-?\d*)x\^2(?: ([+-]) (\d+))?/.exec(s)!;
      const F = (x: number): number => num(mf[1]!) * x + (mf[2] ? (mf[2] === '-' ? -1 : 1) * num(mf[3]!) : 0);
      const lead = mg[1] === '' ? 1 : mg[1] === '-' ? -1 : num(mg[1]!);
      const G = (x: number): number => lead * x * x + (mg[2] ? (mg[2] === '-' ? -1 : 1) * num(mg[3]!) : 0);
      const x = num(/\((-?\d+)\)\?? *(?:,|\.|$)/.exec(s.replace(/^.*find /, ''))?.[1] ?? /\((-?\d+)\)/.exec(s.replace(/^.*find /, ''))![1]!);
      const ask = s.replace(/^.*find /, '');
      if (tier === 1) {
        const want = /\(f \+ g\)/.test(ask) ? F(x) + G(x) : /\(f - g\)/.test(ask) ? F(x) - G(x) : F(x) * G(x);
        expect(value(it)).toBe(want);
      } else if (tier === 2) {
        expect(value(it)).toBe(/\(f \\circ g\)/.test(ask) ? F(G(x)) : G(F(x)));
      } else expect(value(it)).toBe(G(F(x)) - F(G(x)));
    }
  });
  it('D3.1 classifies by testing f(-x) at several points', () => {
    for (const tier of [1, 2, 3]) for (const seed of SEEDS) {
      const it = g('D3.1', tier, seed), s = plain(it.prompt.en);
      const body = /f\(x\) = (.+?) even/.exec(s)![1]!;
      const f = (x: number): number => {
        const fr = /^\\frac\{(.+)\}\{(.+)\}$/.exec(body.trim());
        const poly = (str: string): number => evalMap(parsePoly(str), x);
        return fr ? poly(fr[1]!) / poly(fr[2]!) : poly(body);
      };
      const pts = [1, 2, 3, 0.5];
      const isEven = pts.every((x) => Math.abs(f(-x) - f(x)) < 1e-9), isOdd = pts.every((x) => Math.abs(f(-x) + f(x)) < 1e-9);
      expect(optionText(it)).toBe(isEven ? 'Even' : isOdd ? 'Odd' : 'Neither');
    }
  });
});

describe('MHF4U: every answer is accepted and a rounded logarithm answer is within its tolerance', () => {
  it('accepts the answer itself and the 2-decimal rounding for log-solved equations', () => {
    for (const seed of SEEDS) {
      const it = g('A3.1', 3, seed);
      expect(check(it.answer, { kind: 'number', text: String(value(it)) })).toBe(true);
      expect(check(it.answer, { kind: 'number', text: value(it).toFixed(2) })).toBe(true);
      expect(check(it.answer, { kind: 'number', text: String(value(it) + 0.5) }, true)).toBe(false);
    }
  });
});
