import { describe, it, expect } from 'vitest';
import { generate } from '../shared/generators/index.js';
import type { Item } from '../shared/items/types.js';

// Independent check of the Grade 11 (MCR3U) generators: each test reads the English prompt of a generated item, recomputes the
// answer by a different method (evaluating at many points, scanning for solutions, simulating sequences) and compares.

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
const math = (it: Item): string[] => [...it.prompt.en.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]!);
/** Evaluates TeX like "2x^{2} - 3x + 4" at x. */
const ev = (s: string, x: number): number => {
  const js = clean(s).replace(/(\([^()]*\)|x)\^\{2\}/g, 'Math.pow($1,2)').replace(/(\d|\))\s*(x|\(|M)/g, '$1*$2').replace(/(x)\s*\(/g, '$1*(').replace(/\)\s*\(/g, ')*(').replace(/(\d|x|\))\s+(?=[xM\d(])/g, '$1*');
  return new Function('x', `return ${js};`)(x) as number;
};
const P = 'MS.G11.MCR3U.';

describe('Grade 11 Characteristics of Functions', () => {
  it('function notation', () => {
    each(P + 'A1.1.a', [1], (it) => { const [rule, call] = math(it) as [string, string]; const x0 = Number(/f\((-?\d+)\)/.exec(call)![1]); near(val(it), ev(rule.replace('f(x) = ', ''), x0), it.id); });
    each(P + 'A1.1.a', [2], (it) => { const [m, p, x0, pp] = nums(it.prompt.en.replace(/f\(x\) =/, '').replace('f(', ' f(')) as number[]; void p; void pp; const rule = math(it)[0]!.replace('f(x) = ', ''); const arg = clean(math(it)[1]!); near(val(it), ev(rule, ev(arg.replace(/f\(|\)$/g, ''), 0)), it.id); void m; void x0; });
    each(P + 'A1.1.a', [3], (it) => {
      const rule = math(it)[0]!.replace('f(x) = ', ''), k = Number(/f\((-?\d+)\) = (-?\d+)/.exec(clean(math(it)[1]!))![2]);
      const x0 = Number(/f\((-?\d+)\)/.exec(clean(math(it)[1]!))![1]);
      const sols = Array.from({ length: 61 }, (_, i) => i - 30).filter((x) => ev(rule, x) === k);
      expect(sols.length, it.id).toBe(2); expect(sols).toContain(x0); expect(val(it), it.id).toBe(Math.max(...sols));
    });
  });
  it('domain', () => {
    each(P + 'A1.2.a', [1], (it) => { const m = /x ([+-]) (\d+)\}/.exec(clean(it.prompt.en))!; expect(val(it), it.id).toBe(m[1] === '+' ? -Number(m[2]) : Number(m[2])); });
    each(P + 'A1.2.a', [2], (it) => {
      const e = clean(math(it)[0]!), flip = /sqrt\{-?\d+ - x\}/.test(e), a = flip ? Number(/\{(-?\d+) - x\}/.exec(e)![1]) : (() => { const m = /x ([+-]) (\d+)\}/.exec(e)!; return m[1] === '+' ? -Number(m[2]) : Number(m[2]); })();
      expect(val(it), it.id).toBe(a);
      const ok = (x: number): boolean => (flip ? a - x >= 0 : x - a >= 0);
      expect(ok(val(it)) && (flip ? !ok(val(it) + 1) : !ok(val(it) - 1)), it.id).toBe(true);
    });
    each(P + 'A1.2.a', [3], (it) => { expect(val(it), it.id).toBe(/x\^\{2\} - /.test(clean(math(it)[0]!)) ? 2 : 0); });
  });
  it('inverse', () => {
    each(P + 'A2.1.a', [1, 2], (it) => { const rule = clean(math(it)[0]!).replace('f(x) = ', ''); const y = Number(/\^\{-1\}\((-?\d+)\)/.exec(math(it)[1]!)![1]); expect(ev(rule, val(it)), it.id).toBe(y); });
    each(P + 'A2.1.a', [3], (it) => { const rule = clean(math(it)[0]!).replace('f(x) = ', ''); const y = Number(/\^\{-1\}\((-?\d+)\)/.exec(math(it)[1]!)![1]); expect(ev(rule, val(it)), it.id).toBe(y); expect(val(it)).toBeGreaterThanOrEqual(0); });
  });
  it('transformations of a point', () => {
    each(P + 'A3.1.a', [1, 2, 3], (it) => {
      const [pt, eq] = [math(it)[0]!, clean(math(it)[2] ?? math(it)[1]!)];
      const [x, y] = nums(pt) as [number, number];
      const m = /y = (-?)(\d*(?:\.\d+)?)f\((?:(-?\d*(?:\.\d+)?)\()?x(?: ([+-]) (\d+(?:\.\d+)?))?\)?\)? ([+-]) (\d+(?:\.\d+)?)$/.exec(eq) ?? /y = (-?)(\d*(?:\.\d+)?)f\(x\) ([+-]) (\d+(?:\.\d+)?)$/.exec(eq);
      expect(m, `${it.id} ${eq}`).not.toBeNull();
      const askX = /x-coordinate/.test(it.prompt.en);
      if (m!.length === 5) { // y = a f(x) + c
        const a = (m![1] ? -1 : 1) * (m![2] ? Number(m![2]) : 1), c = (m![3] === '-' ? -1 : 1) * Number(m![4]);
        near(val(it), a * y + c, it.id);
      } else {
        const a = (m![1] ? -1 : 1) * (m![2] ? Number(m![2]) : 1), k = m![3] === undefined ? 1 : m![3] === '' ? 1 : m![3] === '-' ? -1 : Number(m![3]);
        const d = m![5] === undefined ? 0 : (m![4] === '+' ? -1 : 1) * Number(m![5]), c = (m![6] === '-' ? -1 : 1) * Number(m![7]);
        near(val(it), askX ? x / k + d : a * y + c, it.id);
      }
    });
  });
  it('a line and a parabola', () => {
    each(P + 'A4.1.a', [1, 2, 3], (it) => {
      const [par, line] = [clean(math(it)[0]!).replace('y = ', ''), clean(math(it)[1]!).replace('y = ', '')];
      const xs = Array.from({ length: 41 }, (_, i) => i - 20).filter((x) => ev(par, x) === ev(line, x));
      expect(xs.length, it.id).toBe(2); expect(val(it), it.id).toBe(Math.max(...xs));
    });
  });
  it('maximum and minimum values', () => {
    each(P + 'A4.2.a', [1, 2, 3], (it) => {
      const e = clean(math(it)[0]!).replace('y = ', ''), grid = Array.from({ length: 81 }, (_, i) => i - 40), ys = grid.map((x) => ev(e, x));
      expect(val(it), it.id).toBe(/maximum/.test(it.prompt.en) ? Math.max(...ys) : Math.min(...ys));
    });
  });
  it('radicals and rational expressions', () => {
    each(P + 'A5.1.a', [1, 2], (it) => { const [n, sq] = nums(it.prompt.en.replace(/to the form/, ' ')) as [number, number]; void sq; expect(val(it) ** 2 * Number(/a\\sqrt\{(\d+)\}/.exec(it.prompt.en)![1]), it.id).toBe(n); });
    each(P + 'A5.1.a', [3], (it) => { const m = /\$(\d+)\\sqrt\{(\d+)\} \+ \\sqrt\{(\d+)\}\$/.exec(it.prompt.en)!, sq = Number(m[3]); near(val(it) * Math.sqrt(sq), Number(m[1]) * Math.sqrt(Number(m[2])) + Math.sqrt(sq), it.id, 1e-9); });
    each(P + 'A5.2.a', [1], (it) => { const a = Math.sqrt(Number(/x\^\{2\} - (\d+)\}/.exec(clean(math(it)[0]!))![1])), x0 = 0; const x = Number(/when x = \$(-?\d+)\$/.exec(it.prompt.en)![1]); const sign = /x \+ \d+\}/.test(clean(math(it)[0]!)) ? -1 : 1; void x0; expect(val(it), it.id).toBe(x + sign * a); });
    each(P + 'A5.2.a', [2], (it) => { const fs = [...clean(math(it)[0]!).matchAll(/x ([+-]) (\d+)\)/g)].map((m) => (m[1] === '+' ? -Number(m[2]) : Number(m[2]))); expect(fs.length, it.id).toBe(2); expect(val(it), it.id).toBe(fs[0]! + fs[1]!); });
    each(P + 'A5.2.a', [3], (it) => {
      const e = clean(math(it)[0]!), m = /\\frac\{(.+)\}\{x ([+-]) (\d+)\}/.exec(e)!, excluded = m[2] === '-' ? Number(m[3]) : -Number(m[3]);
      const num = m[1]!.replace(/\+ 0x/, ''); const q = val(it);
      for (const x of [-7, -3, 2, 5, 9]) if (x !== excluded) near(ev(num, x) / (x - excluded), x + q, it.id, 1e-9);
    });
  });
});

describe('Grade 11 Exponential Functions', () => {
  it('rational exponents', () => {
    each(P + 'B1.1.a', [1, 2], (it) => {
      const m = /(\d+)\^\{\\frac\{(\d+)\}\{(\d+)\}\}/.exec(clean(math(it)[0]!).replace(/\s/g, ''))!;
      near(val(it), Number(m[1]) ** (Number(m[2]) / Number(m[3])), it.id, 1e-6);
    });
    each(P + 'B1.1.a', [3], (it) => { const m = /(\d+)\^\{-\\frac\{(\d+)\}\{(\d+)\}\}/.exec(clean(math(it)[0]!).replace(/\s/g, ''))!; near(val(it), Number(m[1]) ** (-Number(m[2]) / Number(m[3])), it.id, 1e-6); });
  });
  it('linear, quadratic or exponential', () => {
    each(P + 'B3.1.a', [1, 2, 3], (it) => {
      const ys = nums(it.prompt.en.split('for x')[0]!.replace('y =', ''));
      const d1 = ys.slice(1).map((y, i) => y - ys[i]!), d2 = d1.slice(1).map((y, i) => y - d1[i]!), rs = ys.slice(1).map((y, i) => y / ys[i]!);
      const kind = d1.every((d) => d === d1[0]) ? 'Linear' : d2.every((d) => d === d2[0]) ? 'Quadratic' : rs.every((q) => Math.abs(q - rs[0]!) < 1e-9) ? 'Exponential' : '?';
      expect(rightRaw(it), it.id).toBe(kind);
    });
  });
  it('growth and decay', () => {
    each(P + 'B5.1.a', [1], (it) => {
      const [first, d, T] = nums(it.prompt.en.replace('every', ' ').replace('after', ' ')) as [number, number, number];
      void first; void d; void T;
      const n = nums(it.prompt.en);
      const growth = /doubles/.test(it.prompt.en);
      const [a, per, total] = [n[0]!, n[1]!, n[2]!];
      near(val(it), growth ? a * 2 ** (total / per) : a / 2 ** (total / per), it.id);
    });
    each(P + 'B5.1.a', [2], (it) => { const [p0, pct, yrs] = nums(it.prompt.en) as [number, number, number]; const up = /grows/.test(it.prompt.en); near(val(it), p0 * (1 + (up ? pct : -pct) / 100) ** yrs, it.id, 1e-6); });
    each(P + 'B5.1.a', [3], (it) => { const [p0, d, final] = nums(it.prompt.en) as [number, number, number]; const k = Math.log2(final / p0); expect(Number.isInteger(k), it.id).toBe(true); expect(val(it), it.id).toBe(d * k); });
  });
});

describe('Grade 11 Discrete Functions', () => {
  it("Pascal's triangle", () => {
    const C = (n: number, k: number): number => { let v = 1; for (let i = 1; i <= k; i++) v = (v * (n - k + i)) / i; return Math.round(v); };
    each(P + 'C1.1.a', [1], (it) => { const n = nums(it.prompt.en); const [rowN, k] = [n[0]!, n[3]!]; expect(val(it), it.id).toBe(C(rowN, k)); });
    each(P + 'C1.1.a', [2, 3], (it) => { const m = /x\^\{(\d+)\}\$ in the expansion of \$\(x \+ (\d+)\)\^\{(\d+)\}/.exec(it.prompt.en)!; const [k, a, n] = [Number(m[1]), Number(m[2]), Number(m[3])]; expect(val(it), it.id).toBe(C(n, k) * a ** (n - k)); });
  });
  it('recursive sequences', () => {
    each(P + 'C1.2.a', [1, 2], (it) => {
      const m = /t_1 = (\d+)\$ and \$t_n = (\d*)t_\{n-1\} ([+-]) (\d+)\$.*t_\{(\d+)\}/.exec(it.prompt.en)!;
      let t = Number(m[1]); const mult = m[2] ? Number(m[2]) : 1, d = (m[3] === '-' ? -1 : 1) * Number(m[4]);
      for (let i = 1; i < Number(m[5]); i++) t = mult * t + d;
      expect(val(it), it.id).toBe(t);
    });
    each(P + 'C1.2.a', [3], (it) => {
      const m = /t_1 = (\d+)\$, \$t_2 = (\d+)\$ and \$t_n = t_\{n-1\} \+ (\d*)t_\{n-2\}\$\. What is \$t_\{(\d+)\}/.exec(it.prompt.en)!;
      const seq = [Number(m[1]), Number(m[2])], c = m[3] ? Number(m[3]) : 1;
      for (let i = 2; i < Number(m[4]); i++) seq.push(seq[i - 1]! + c * seq[i - 2]!);
      expect(val(it), it.id).toBe(seq[Number(m[4]) - 1]);
    });
  });
  it('arithmetic and geometric', () => {
    each(P + 'C2.1.a', [1], (it) => { const [a, d, n] = nums(it.prompt.en) as [number, number, number]; expect(val(it), it.id).toBe(a + (n - 1) * d); });
    each(P + 'C2.1.a', [2], (it) => { const [a, d, tn] = nums(it.prompt.en) as [number, number, number]; expect(a + (val(it) - 1) * d, it.id).toBe(tn); });
    each(P + 'C2.1.a', [3], (it) => { const [a, d, n] = nums(it.prompt.en) as [number, number, number]; let s = 0; for (let i = 0; i < n; i++) s += a + i * d; expect(val(it), it.id).toBe(s); });
    each(P + 'C2.2.a', [1], (it) => { const [a, r, n] = nums(it.prompt.en.replace('t_', 't ')) as [number, number, number]; near(val(it), a * r ** (n - 1), it.id, 1e-6); });
    each(P + 'C2.2.a', [2], (it) => { const [a, r, n] = nums(it.prompt.en) as [number, number, number]; let s = 0; for (let i = 0; i < n; i++) s += a * r ** i; expect(val(it), it.id).toBe(s); });
    each(P + 'C2.2.a', [3], (it) => { const n = nums(it.prompt.en.split('What')[0]!); const [a, b, tt] = [n[0]!, n[1]!, Number(/t_\{(\d+)\}/.exec(it.prompt.en)![1])]; expect(val(it), it.id).toBe(a * (b / a) ** (tt - 1)); });
  });
  it('compound interest and annuities', () => {
    each(P + 'C3.1.a', [1], (it) => { const [P0, rate, yrs] = nums(it.prompt.en) as [number, number, number]; near(val(it), P0 * (1 + rate / 100) ** yrs, it.id, 1e-6); });
    each(P + 'C3.1.a', [2], (it) => { const [P0, rt] = nums(it.prompt.en) as [number, number]; const per = /semi-annually/.test(it.prompt.en) ? 2 : 4; near(val(it), P0 * (1 + rt / per / 100) ** per, it.id, 0.0051); });
    each(P + 'C3.1.a', [3], (it) => { const [P0, A] = nums(it.prompt.en) as [number, number]; near(P0 * 1.1 ** val(it), A, it.id, 1e-6); });
    each(P + 'C4.1.a', [1], (it) => { const [R, n] = nums(it.prompt.en) as [number, number]; near(val(it), R * ((1.1 ** n - 1) / 0.1), it.id, 1e-6); });
    each(P + 'C4.1.a', [2], (it) => { const [FV, n] = nums(it.prompt.en) as [number, number]; near(val(it) * ((1.1 ** n - 1) / 0.1), FV, it.id, 1e-6); });
    each(P + 'C4.1.a', [3], (it) => { const [R, n] = nums(it.prompt.en) as [number, number]; near(val(it), R * ((1 - 1.1 ** -n) / 0.1), it.id, 0.0051); });
  });
});
