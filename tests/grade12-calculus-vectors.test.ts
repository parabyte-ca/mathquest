import { describe, it, expect } from 'vitest';
import { generate } from '../shared/generators/index.js';
import type { Item } from '../shared/items/types.js';

// Independent recomputation of every MCV4U answer from the prompt text alone: functions are read from the TeX and differentiated
// numerically, vector answers use the definitions directly, and equations are checked by substituting the answer.
const SEEDS = Array.from({ length: 40 }, (_, i) => i + 1);
const value = (it: Item): number => (it.answer as { value: number }).value;
const optionText = (it: Item): string => it.options![(it.answer as { index: number }).index]!.en;
const plain = (s: string): string => s.replace(/\$/g, '').replace(/\\left|\\right|\\,/g, '').replace(/\{,\}/g, '.');
const g = (skill: string, tier: number, seed: number): Item => generate(`MS.G12.MCV4U.${skill}.a`, tier, seed);
const close = (a: number, b: number, tol = 1e-4): void => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol * Math.max(1, Math.abs(b)));


/** Rewrites a**b as Math.pow(a, b), so that a leading minus sign never sits directly in front of a power. */
function powers(s: string): string {
  for (;;) {
    const i = s.indexOf('**');
    if (i < 0) return s;
    let a = i - 1;
    if (s[a] === ')') { let depth = 0; for (; a >= 0; a--) { if (s[a] === ')') depth++; if (s[a] === '(') { depth--; if (depth === 0) break; } } }
    else while (a > 0 && /[\w.]/.test(s[a - 1]!)) a--;
    let b = i + 2, end: number;
    if (s[b] === '(') { let depth = 0; for (end = b; end < s.length; end++) { if (s[end] === '(') depth++; if (s[end] === ')') { depth--; if (depth === 0) break; } } end++; }
    else { end = b; while (end < s.length && /[\w.]/.test(s[end]!)) end++; }
    s = `${s.slice(0, a)}Math.pow(${s.slice(a, i)}, ${s.slice(b, end)})${s.slice(end)}`;
  }
}

/** A function of x from TeX such as "2x^{3} - x + 7", "(x + 2)(x - 5)", "\sin(3x)", "e^{2x}", "\sqrt{4x + 1}" or "\frac{2x - 3}{x + 1}". */
function fn(tex: string): (x: number) => number {
  let s = plain(tex).replace(/\s+/g, '').replace(/\\times|\\cdot/g, '*');
  s = s.replace(/e\^\{([^{}]*)\}/g, 'Math.exp($1)').replace(/e\^x/g, 'Math.exp(x)');
  s = s.replace(/\^\{([^{}]*)\}/g, '**($1)');
  for (let i = 0; i < 4; i++) s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))');
  s = s.replace(/\\sqrt\{([^{}]*)\}/g, 'Math.sqrt($1)').replace(/\\sin\(/g, 'Math.sin(').replace(/\\cos\(/g, 'Math.cos(').replace(/\\sinx/g, 'Math.sin(x)').replace(/\\cosx/g, 'Math.cos(x)');
  s = s.replace(/e\^\{([^{}]*)\}/g, 'Math.exp($1)').replace(/e\^x/g, 'Math.exp(x)').replace(/\^\{([^{}]*)\}/g, '**($1)').replace(/\^(\d)/g, '**$1');
  s = s.replace(/(\d|\)|x)(?=Math|x|\()/g, '$1*').replace(/\)(?=\d)/g, ')*');
  s = powers(s);
  return new Function('x', `return ${s};`) as (x: number) => number;
}
const d1 = (f: (x: number) => number, x: number, h = 1e-5): number => (f(x + h) - f(x - h)) / (2 * h);
const d2 = (f: (x: number) => number, x: number, h = 1e-3): number => (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
const at = (s: string): number => Number(/f'\(?(-?\d+(?:\.\d+)?)\)?|f''\(?(-?\d+)\)?/.exec(s)?.[1] ?? NaN);

describe('MCV4U A and B: calculus', () => {
  it('A1.1 limits', () => {
    for (const seed of SEEDS) {
      const a = g('A1.1', 1, seed), pa = plain(a.prompt.en), la = Number(/to (-?\d+)\}/.exec(pa)![1]);
      const fa = fn(/(\\frac.*)\.$/.exec(pa)![1]!);
      close((fa(la + 1e-5) + fa(la - 1e-5)) / 2, value(a), 1e-3);
      const b = g('A1.1', 2, seed), pb = plain(b.prompt.en), lb = Number(/to (-?\d+)\}/.exec(pb)![1]);
      const fb = fn(/(\\frac.*)\.$/.exec(pb)![1]!);
      close((fb(lb + 1e-5) + fb(lb - 1e-5)) / 2, value(b), 1e-3);
      const c = g('A1.1', 3, seed), fc = fn(/(\\frac.*)\.$/.exec(plain(c.prompt.en))![1]!);
      close(fc(1e7), value(c), 1e-4);
    }
  });
  it('A1.2 first principles: the answer is the derivative at the point', () => {
    for (const tier of [1, 2, 3]) for (const seed of SEEDS) {
      const it = g('A1.2', tier, seed), s = plain(it.prompt.en);
      const x0 = Number(/f'\((-?\d+)\)/.exec(s)![1]);
      const f = fn(/for f\(x\) = (.*)\.$/.exec(s)![1]!);
      close(d1(f, x0), value(it));
    }
  });
  it('A2.1 derivatives of sinusoidal and exponential functions', () => {
    for (const seed of SEEDS) {
      const a = g('A2.1', 1, seed), sa = plain(a.prompt.en);
      close(d1(fn(/f\(x\) = (.*)\.$/.exec(sa)![1]!), 0), value(a));
      const b = g('A2.1', 2, seed), sb = plain(b.prompt.en), at2 = /f'\((.+?)\) for/.exec(sb)![1]!;
      const x0 = at2 === '0' ? 0 : at2 === '\\frac{\\pi}{2}' ? Math.PI / 2 : Math.PI;
      close(d1(fn(/f\(x\) = (.*)\.$/.exec(sb)![1]!), x0), value(b), 1e-3);
      const c = g('A2.1', 3, seed), sc = plain(c.prompt.en);
      close(d2(fn(/f\(x\) = (.*)\.$/.exec(sc)![1]!), 0), value(c), 1e-3);
    }
  });
  it('A3 power, product, quotient and chain rules', () => {
    for (const seed of SEEDS) {
      const tier = (n: number): Item => g('A3.1', n, seed);
      for (const n of [1, 2, 3]) {
        const it = tier(n), s = plain(it.prompt.en).replace(/^Simplify first, then find /, 'Find ');
        const x0 = Number(/f'\((-?\d+)\)/.exec(s)![1]);
        let body = /for f\(x\) = (.*)\.$/.exec(s)![1]!;
        if (n === 3) body = body.replace(/^\\frac\{(.*)\}\{x\}$/, '(($1)/x)');
        close(d1(fn(body), x0), value(it), 1e-3);
      }
      for (const n of [1, 2, 3]) {
        const it = g('A3.2', n, seed), s = plain(it.prompt.en), x0 = Number(/f'\((-?\d+)\)/.exec(s)![1]);
        close(d1(fn(/for f\(x\) = (.*)\.$/.exec(s)![1]!), x0), value(it), 1e-3);
      }
      for (const n of [1, 2, 3]) {
        const it = g('A3.3', n, seed), s = plain(it.prompt.en), x0 = Number(/f'\((-?\d+)\)/.exec(s)![1] ?? 0);
        close(d1(fn(/for f\(x\) = (.*)\.$/.exec(s)![1]!), n === 2 ? 0 : x0), value(it), 1e-3);
      }
    }
  });
  it('B1.1 critical points and inflection', () => {
    for (const seed of SEEDS) {
      const a = g('B1.1', 1, seed), sa = plain(a.prompt.en), fa = fn(/of f\(x\) = (.*)\?$/.exec(sa)![1]!);
      close(d1(fa, value(a)), 0, 1e-6);
      expect(d2(fa, value(a)) > 0).toBe(/minimum/.test(sa));
      const b = g('B1.1', 2, seed), fb = fn(/^f\(x\) = (.*) has/.exec(plain(b.prompt.en))![1]!);
      close(d1(fb, value(b)), 0, 1e-6);
      expect(d2(fb, value(b))).toBeLessThan(0);
      const c = g('B1.1', 3, seed), fc = fn(/f\(x\) = (.*) have its/.exec(plain(c.prompt.en))![1]!);
      close(d2(fc, value(c)), 0, 1e-3);
      expect(d2(fc, value(c) - 0.5) * d2(fc, value(c) + 0.5)).toBeLessThan(0);
    }
  });
  it('B2.1 optimization by searching for the best value', () => {
    const best = (f: (v: number) => number, lo: number, hi: number): number => { let m = -Infinity; for (let v = lo; v <= hi; v += 0.001) m = Math.max(m, f(v)); return m; };
    for (const seed of SEEDS) {
      const a = g('B2.1', 1, seed), P = Number(/perimeter of (\d+)/.exec(plain(a.prompt.en))![1]);
      close(best((w) => w * (P / 2 - w), 0, P / 2), value(a), 1e-3);
      const b = g('B2.1', 2, seed), L = Number(/has (\d+) m/.exec(plain(b.prompt.en))![1]);
      close(best((w) => w * (L - 2 * w), 0, L / 2), value(b), 1e-3);
      const c = g('B2.1', 3, seed), m = /x = (\d+) - (\d+)p/.exec(plain(c.prompt.en))!;
      close(best((p) => p * (Number(m[1]) - Number(m[2]) * p), 0, Number(m[1]) / Number(m[2])), value(c), 1e-3);
    }
  });
});

const vecs = (s: string): number[][] => [...plain(s).matchAll(/\(([-\d.,\s]+)\)/g)].map((m) => m[1]!.split(',').map(Number));
const dot = (a: number[], b: number[]): number => a.reduce((s, x, i) => s + x * b[i]!, 0);
const mag = (a: number[]): number => Math.hypot(...a);

describe('MCV4U C: vectors', () => {
  it('C1.1 magnitude', () => {
    for (const seed of SEEDS) {
      for (const n of [1, 2]) { const it = g('C1.1', n, seed), [v] = vecs(it.prompt.en); close(mag(v!), value(it), 1e-9); expect(Number.isInteger(value(it))).toBe(true); }
      const c = g('C1.1', 3, seed), [a, b] = vecs(c.prompt.en);
      close(mag(a!.map((x, i) => x - b![i]!)), value(c), 1e-9);
    }
  });
  it('C2.1 operations, the dot product and the cross product', () => {
    for (const seed of SEEDS) {
      const a = g('C2.1', 1, seed), sa = plain(a.prompt.en), [va, vb] = vecs(sa);
      const m = /of (-?\d+)\\vec\{a\} ([+-]) (\d+)\\vec\{b\}/.exec(sa)!, k = ['first', 'second', 'third'].findIndex((w) => sa.includes(`the ${w} component`));
      expect(value(a)).toBe(Number(m[1]) * va![k]! + (m[2] === '-' ? -1 : 1) * Number(m[3]) * vb![k]!);
      const b = g('C2.1', 2, seed), [pa, pb] = vecs(b.prompt.en);
      expect(value(b)).toBe(dot(pa!, pb!));
      const c = g('C2.1', 3, seed), sc = plain(c.prompt.en), [ca, cb] = vecs(sc), ki = ['x', 'y', 'z'].findIndex((w) => sc.includes(`the ${w}-component`));
      const cr = [ca![1]! * cb![2]! - ca![2]! * cb![1]!, ca![2]! * cb![0]! - ca![0]! * cb![2]!, ca![0]! * cb![1]! - ca![1]! * cb![0]!];
      expect(value(c)).toBe(cr[ki]!);
      // the cross product is perpendicular to both vectors
      expect(dot(cr, ca!)).toBe(0);
      expect(dot(cr, cb!)).toBe(0);
    }
  });
  it('C2.2 work, projection and perpendicular vectors', () => {
    for (const seed of SEEDS) {
      const a = g('C2.2', 1, seed), [F, dd] = vecs(a.prompt.en);
      expect(value(a)).toBe(dot(F!, dd!));
      const b = g('C2.2', 2, seed), [va, vb] = vecs(b.prompt.en);
      close(dot(va!, vb!) / mag(vb!), value(b), 1e-9);
      const c = g('C2.2', 3, seed), sc = plain(c.prompt.en), m = /\(k, (-?\d+)\)/.exec(sc)!, vv = vecs(sc.replace(/\(k, -?\d+\)/, ''))[0]!;
      expect(value(c) * vv[0]! + Number(m[1]) * vv[1]!).toBe(0);
    }
  });
  it('C3.1 how lines and planes meet', () => {
    for (const seed of SEEDS) {
      const a = g('C3.1', 1, seed), sa = plain(a.prompt.en);
      const [l1, l2] = [...sa.matchAll(/(-?\d+)x ([+-]) (\d+)y = (-?\d+)/g)].map((m) => [Number(m[1]), (m[2] === '-' ? -1 : 1) * Number(m[3]), Number(m[4])]);
      const det = l1![0]! * l2![1]! - l2![0]! * l1![1]!;
      const same = l1![0]! * l2![2]! === l2![0]! * l1![2]! && l1![1]! * l2![2]! === l2![1]! * l1![2]!;
      expect(optionText(a)).toBe(det !== 0 ? 'They meet at exactly one point' : same ? 'They are the same line' : 'They are parallel and never meet');
      for (const tier of [2, 3]) {
        const it = g('C3.1', tier, seed), s = plain(it.prompt.en);
        const [p1, p2] = [...s.matchAll(/(-?\d+)x ([+-]) (\d+)y ([+-]) (\d+)z = (-?\d+)/g)].map((m) => [Number(m[1]), (m[2] === '-' ? -1 : 1) * Number(m[3]), (m[4] === '-' ? -1 : 1) * Number(m[5]), Number(m[6])]);
        const cr = [p1![1]! * p2![2]! - p1![2]! * p2![1]!, p1![2]! * p2![0]! - p1![0]! * p2![2]!, p1![0]! * p2![1]! - p1![1]! * p2![0]!];
        const parallel = cr.every((x) => x === 0);
        const coincide = parallel && [0, 1, 2].every((i) => p1![i]! * p2![3]! === p2![i]! * p1![3]!) && p1![0]! * p2![3]! === p2![0]! * p1![3]!;
        expect(optionText(it)).toBe(!parallel ? 'They intersect in a line' : coincide ? 'They are the same plane' : 'They are parallel and distinct');
      }
    }
  });
  it('C4 planes, lines and where they meet', () => {
    const lin = (s: string): number[] => [...s.matchAll(/(-?\d+)x ([+-]) (\d+)y ([+-]) (\d+)z/g)].flatMap((m) => [Number(m[1]), (m[2] === '-' ? -1 : 1) * Number(m[3]), (m[4] === '-' ? -1 : 1) * Number(m[5])]);
    for (const seed of SEEDS) {
      const a = g('C4.1', 1, seed), sa = plain(a.prompt.en), [n, P] = vecs(sa);
      expect(value(a)).toBe(dot(n!, P!));
      const b = g('C4.1', 2, seed), sb = plain(b.prompt.en), [P0, d] = vecs(sb), tt = Number(/t = (-?\d+)/.exec(sb)![1]), k = ['x', 'y', 'z'].findIndex((w) => sb.includes(`${w}-coordinate`));
      expect(value(b)).toBe(P0![k]! + tt * d![k]!);
      const c = g('C4.1', 3, seed), sc = plain(c.prompt.en), nn = lin(sc), PP = vecs(sc)[0]!, D = Number(/= (-?\d+)\?$/.exec(sc)![1]);
      close(Math.abs(dot(nn, PP) - D) / mag(nn), value(c), 1e-9);
      expect(Number.isInteger(value(c))).toBe(true);
    }
    for (const seed of SEEDS) {
      const a = g('C4.2', 1, seed), sa = plain(a.prompt.en), [P0, d] = vecs(sa);
      expect(P0![2]! + value(a) * d![2]!).toBe(0);
      for (const tier of [2, 3]) {
        const it = g('C4.2', tier, seed), s = plain(it.prompt.en), [Q0, e] = vecs(s), nn = lin(s), D = Number(/= (-?\d+)\. What/.exec(s)![1]);
        const tt = tier === 2 ? value(it) : (D - dot(nn, Q0!)) / dot(nn, e!);
        close(dot(nn, Q0!.map((x, i) => x + tt * e![i]!)), D, 1e-9);
        if (tier === 3) { const k = ['x', 'y', 'z'].findIndex((w) => s.includes(`the ${w}-coordinate`)); close(value(it), Q0![k]! + tt * e![k]!, 1e-9); }
      }
    }
  });
});
