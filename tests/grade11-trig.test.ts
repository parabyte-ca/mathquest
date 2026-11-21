import { describe, it, expect } from 'vitest';
import { generate } from '../shared/generators/index.js';
import type { Item } from '../shared/items/types.js';

// Independent check of the Grade 11 trigonometry and MCF3M generators: each test reads the English prompt of a generated item and
// recomputes the answer by a different method.

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
const rad = (d: number): number => (d * Math.PI) / 180;
const math = (it: Item): string[] => [...it.prompt.en.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]!);
const R = 'MS.G11.MCR3U.';
const F = 'MS.G11.MCF3M.';

/** Numeric value of an exact-value option such as "-\frac{\sqrt{3}}{2}". */
const exact = (s: string): number => {
  const neg = s.startsWith('-'), body = neg ? s.slice(1) : s;
  const v = body === '0' ? 0 : body === '1' ? 1 : body === '\\frac{1}{2}' ? 0.5 : body === '\\frac{\\sqrt{2}}{2}' ? Math.SQRT1_2 : body === '\\frac{\\sqrt{3}}{2}' ? Math.sqrt(3) / 2 : body === '\\frac{\\sqrt{3}}{3}' ? Math.sqrt(3) / 3 : body === '\\sqrt{3}' ? Math.sqrt(3) : NaN;
  return neg ? -v : v;
};

describe('Grade 11 MCR3U trigonometry', () => {
  it('exact values', () => {
    each(R + 'D1.1.a', [1, 2, 3], (it) => {
      const m = /\\(sin|cos|tan) (\d+)\^\{\\circ\}/.exec(math(it)[0]!)!;
      const a = rad(Number(m[2])), v = m[1] === 'sin' ? Math.sin(a) : m[1] === 'cos' ? Math.cos(a) : Math.tan(a);
      near(exact(rightRaw(it).replace(/\$/g, '')), v, it.id, 1e-9);
      it.options!.forEach((o, i) => { if (i !== idx(it)) expect(Math.abs(exact(o.en.replace(/\$/g, '')) - v) > 1e-6, `${it.id} option ${i}`).toBe(true); });
    });
  });
  it('reciprocal ratios', () => {
    each(R + 'D2.1.a', [1, 2], (it) => { const m = /\\(sin|cos) \\theta = (\d+)\/(\d+)/.exec(math(it)[0]!)!; near(val(it), Number(m[3]) / Number(m[2]), it.id); });
    each(R + 'D2.1.a', [3], (it) => {
      const [known, asked] = math(it) as [string, string];
      const obtuseOrIV = /obtuse|quadrant IV/.test(it.prompt.en), neg = obtuseOrIV ? -1 : 1;
      let expected: number;
      if (/sin \\theta = 3\/5/.test(known)) expected = 1.25 * neg; // sec: cos = ±4/5
      else if (/sin \\theta = 4\/5/.test(known)) expected = 0.75 * neg; // cot = cos/sin = ±(3/5)/(4/5)
      else expected = 1.25 * neg; // csc with cos 3/5: sin = ±4/5
      expect(asked.length).toBeGreaterThan(0);
      near(val(it), expected, it.id);
    });
  });
  it('identities', () => {
    each(R + 'D3.1.a', [1], (it) => { const m = /\\(sin|cos) x = ([\d.]+)\}?\$ and x/.exec(it.prompt.en)!; const g = Number(m[2]); near(val(it) ** 2 + g ** 2, 1, it.id, 1e-9); expect(val(it)).toBeGreaterThan(0); });
    each(R + 'D3.1.a', [2, 3], (it) => {
      // numerically compare the prompt expression with the right option at several x
      const ev = (s: string, x: number): number => {
        const sx = Math.sin(x), cx = Math.cos(x), tx = Math.tan(x);
        const rules: [RegExp, number][] = [];
        void rules;
        const t = s.replace(/\\frac\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, '(($1)/($2))').replace(/\\times/g, '*').replace(/\\sin\^\{2\} x/g, `(${sx * sx})`).replace(/\\cos\^\{2\} x/g, `(${cx * cx})`).replace(/\\tan\^\{2\} x/g, `(${tx * tx})`).replace(/\\sin x/g, `(${sx})`).replace(/\\cos x/g, `(${cx})`).replace(/\\tan x/g, `(${tx})`);
        return new Function(`return ${t.replace(/\)\s*\(/g, ')*(')}`)() as number;
      };
      const expr = math(it)[0]!, right = rightRaw(it).replace(/\$/g, '');
      for (const x of [0.4, 0.9, 1.3, 2.2]) near(ev(expr, x), ev(right, x), it.id, 1e-9);
      it.options!.forEach((o, i) => { if (i !== idx(it)) expect([0.4, 0.9, 1.3, 2.2].some((x) => Math.abs(ev(expr, x) - ev(o.en.replace(/\$/g, ''), x)) > 1e-6), `${it.id} option ${i}`).toBe(true); });
    });
  });
  it('the ambiguous case', () => {
    each(R + 'D4.1.a', [1, 2, 3], (it) => {
      const [A, a, b] = nums(it.prompt.en.replace(/triangle ABC/, '').replace(/side a/, 'a').replace(/side b/, 'b').replace(/\(opposite A\)/, '')) as [number, number, number];
      const h = b * Math.sin(rad(A));
      const expected = A >= 90 ? (a > b ? 1 : 0) : a >= b ? 1 : Math.abs(a - h) < 1e-9 ? 1 : a < h ? 0 : 2;
      expect(val(it), it.id).toBe(expected);
    });
  });
  it('the laws with obtuse angles', () => {
    each(R + 'D4.2.a', [1], (it) => { const [a, b, C] = nums(it.prompt.en.replace(/triangle ABC/, '')) as [number, number, number]; expect(C).toBeGreaterThan(90); near(val(it), Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(rad(C))), it.id, 0.051); });
    each(R + 'D4.2.a', [2], (it) => { const [A, B, a] = nums(it.prompt.en.replace(/triangle ABC/, '').replace(/\(obtuse\)/, '').replace(/side b/, '')) as [number, number, number]; near(val(it), (a * Math.sin(rad(B))) / Math.sin(rad(A)), it.id, 0.051); });
    each(R + 'D4.2.a', [3], (it) => { const [a, b, c] = nums(it.prompt.en.replace(/the ([\d]+) cm side/, '')) as [number, number, number]; const ans = (Math.acos((a * a + b * b - c * c) / (2 * a * b)) * 180) / Math.PI; expect(ans).toBeGreaterThan(90); near(val(it), ans, it.id, 0.051); });
  });
  it('sinusoidal functions', () => {
    each(R + 'D5.1.a', [1], (it) => { const eq = clean(math(it)[0]!); const m = /y = (-?)(\d*(?:\.\d+)?)\\sin\(([\d.]+)\(x ([+-]) (\d+)\^\{\\circ\}\)\)(?: ([+-]) (\d+))?/.exec(eq)!; const a = (m[1] ? -1 : 1) * (m[2] ? Number(m[2]) : 1), c = m[6] ? (m[6] === '-' ? -1 : 1) * Number(m[7]) : 0; near(val(it), /maximum/.test(it.prompt.en) ? c + Math.abs(a) : c - Math.abs(a), it.id); });
    each(R + 'D5.1.a', [2], (it) => { const k = Number(/\\sin\(([\d.]+)\(x/.exec(clean(math(it)[0]!))![1]); near(val(it), 360 / k, it.id); });
    each(R + 'D5.1.a', [3], (it) => { const m = /h = (\d+)\\sin\((\d+)x\) \+ (\d+)/.exec(clean(math(it)[0]!))!, x = Number(/x = \$(\d+)\$/.exec(it.prompt.en)![1]); near(val(it), Number(m[1]) * Math.sin(rad(Number(m[2]) * x)) + Number(m[3]), it.id, 1e-9); });
  });
});

describe('Grade 11 MCF3M', () => {
  it('perfect squares', () => {
    each(F + 'A1.3.a', [1, 2, 3], (it) => {
      const trinomial = clean(math(it)[0]!);
      const ev = (s: string, x: number): number => new Function('x', `return ${s.replace(/\^\{2\}/g, '**2').replace(/(\d)\s*x/g, '$1*x').replace(/\)\s*\(/g, ')*(').replace(/(\d|x)\s*\(/g, '$1*(').replace(/\s+/g, ' ')};`)(x) as number;
      const e = (s: string, x: number): number => ev(s.replace(/(\d)x/g, '$1*x').replace(/x\*\*2/g, 'Math.pow(x,2)').replace(/-x/g, '-1*x'), x);
      const right = clean(rightRaw(it).replace(/\$/g, ''));
      for (const x of [-3, -1, 0, 2, 5]) near(e(trinomial, x), e(right, x), it.id, 1e-9);
    });
  });
  it('the range of a quadratic', () => {
    each(F + 'A3.2.a', [1, 2], (it) => { const m = /\(x ([+-]) (\d+)\)\^\{2\} ([+-]) (\d+)/.exec(clean(math(it)[0]!))!; near(val(it), (m[3] === '-' ? -1 : 1) * Number(m[4]), it.id); });
    each(F + 'A3.2.a', [3], (it) => {
      const e = clean(math(it)[0]!), m = /f\(x\) = (-?)(\d*)\(x ([+-]) (\d+)\)\^\{2\} ([+-]) (\d+)/.exec(e)!;
      const a = (m[1] ? -1 : 1) * (m[2] ? Number(m[2]) : 1), h = m[3] === '+' ? -Number(m[4]) : Number(m[4]), k = (m[5] === '-' ? -1 : 1) * Number(m[6]);
      const f = (x: number): number => a * (x - h) ** 2 + k, grid = Array.from({ length: 5 }, (_, i) => h - 2 + i);
      near(val(it), a > 0 ? Math.max(...grid.map(f)) : Math.min(...grid.map(f)), it.id);
    });
  });
  it('vertex and standard form', () => {
    each(F + 'A4.1.a', [1], (it) => { const m = /y = (-?)(\d*)\(x ([+-]) (\d+)\)\^\{2\} ([+-]) (\d+)/.exec(clean(math(it)[0]!))!; const a = (m[1] ? -1 : 1) * (m[2] ? Number(m[2]) : 1), h = m[3] === '+' ? -Number(m[4]) : Number(m[4]); expect(val(it), it.id).toBe(-2 * a * h); });
    each(F + 'A4.1.a', [2], (it) => {
      const e = clean(math(it)[0]!).replace('y = ', ''), f = (x: number): number => new Function('x', `return ${e.replace(/\^\{2\}/g, '**2').replace(/(\d)x/g, '$1*x').replace(/(^|[ (+-])x\*\*2/g, '$1Math.pow(x,2)').replace(/- x/g, '- 1*x')};`)(x) as number;
      const h = val(it); const vertexOk = [1, 2, 3].every((d) => Math.abs(f(h + d) - f(h - d)) < 1e-9); expect(vertexOk, it.id).toBe(true);
    });
    each(F + 'A4.1.a', [3], (it) => {
      const e = clean(math(it)[0]!).replace('y = ', ''), f = (x: number): number => new Function('x', `return ${e.replace(/\^\{2\}/g, '**2').replace(/(\d)x/g, '$1*x').replace(/(^|[ (+-])x\*\*2/g, '$1Math.pow(x,2)').replace(/- x/g, '- 1*x')};`)(x) as number;
      const k = val(it); const lo = Math.min(...Array.from({ length: 41 }, (_, i) => f(i - 20))), hi = Math.max(...Array.from({ length: 41 }, (_, i) => f(i - 20)));
      expect(Math.abs(k - lo) < 1e-9 || Math.abs(k - hi) < 1e-9, it.id).toBe(true);
    });
  });
  it('exponent rules on numbers', () => {
    each(F + 'B1.2.a', [1], (it) => { const m = /(\d+)\^\{(\d+)\} \* \d+\^\{(\d+)\}\}\{\d+\^\{(\d+)\}/.exec(clean(math(it)[0]!).replace(/\\frac\{/, '').replace(/\}\{/, '}{'))!; expect(val(it), it.id).toBe(Number(m[1]) ** (Number(m[2]) + Number(m[3]) - Number(m[4]))); });
    each(F + 'B1.2.a', [2], (it) => { const m = /\((\d+)\^\{(\d+)\}\)\^\{(\d+)\}\}\{\d+\^\{(\d+)\}/.exec(clean(math(it)[0]!).replace(/\\frac\{/, ''))!; expect(val(it), it.id).toBe(Number(m[1]) ** (Number(m[2]) * Number(m[3]) - Number(m[4]))); });
    each(F + 'B1.2.a', [3], (it) => { const m = /(\d+)\^\{(\d+)\} \* \d+\^\{-(\d+)\}/.exec(clean(math(it)[0]!))!; near(val(it), Number(m[1]) ** (Number(m[2]) - Number(m[3])), it.id, 1e-9); });
  });
  it('simple against compound interest', () => {
    each(F + 'B2.3.a', [1, 2], (it) => { const [P, n, rate] = nums(it.prompt.en) as [number, number, number]; near(val(it), P * (1 + rate / 100) ** n - P - P * (rate / 100) * n, it.id, 1e-6); });
    each(F + 'B2.3.a', [3], (it) => { const [n, P, , A] = nums(it.prompt.en) as [number, number, number, number]; near(val(it), A - (P + P * 0.1 * n), it.id, 1e-6); });
  });
  it('two right triangles', () => {
    each(F + 'C1.1.a', [1, 2, 3], (it) => {
      const [near1, d, far1] = nums(it.prompt.en.replace('level ground', 'ground')) as [number, number, number];
      const cot = (x: number): number => 1 / Math.tan(rad(x));
      near(val(it), d / (cot(far1) - cot(near1)), it.id, 0.051);
    });
  });
  it('the sine function', () => {
    each(F + 'C2.1.a', [1], (it) => { near(val(it), nums(clean(math(it)[0]!).replace('y =', ''))[0]!, it.id); });
    each(F + 'C2.1.a', [2], (it) => { const m = /y = (\d+)\\sin x ([+-]) (\d+)/.exec(clean(math(it)[0]!))!; expect(val(it), it.id).toBe((m[2] === '-' ? -1 : 1) * Number(m[3]) - Number(m[1])); });
    each(F + 'C2.1.a', [3], (it) => { const d = Number(/x - (\d+)\^\{\\circ\}/.exec(clean(math(it)[0]!))![1]); expect(val(it), it.id).toBe((d + 90) % 360); });
  });
});
