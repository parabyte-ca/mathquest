import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { generate } from '../shared/generators/index.js';
import type { Item } from '../shared/items/types.js';

// Independent check of the new MCT4C generators: each test reads the English prompt of a generated item and recomputes the
// answer by a different method.

const SEEDS = 250;
const M = 'MS.G12.MCT4C.';
const val = (it: Item): number => (it.answer as { value: number }).value;
const math = (it: Item): string[] => [...it.prompt.en.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]!);
const each = (skill: string, tiers: number[], fn: (it: Item) => void): void => {
  for (const tier of tiers) for (let seed = 1; seed <= SEEDS; seed++) fn(generate(M + skill, tier, seed));
};
const near = (a: number, b: number, id: string, tol = 1e-6): void => expect(Math.abs(a - b), id).toBeLessThanOrEqual(tol);
/** Value of a polynomial written in TeX, such as "-2x^{3} + x - 5", at x. */
const evalTex = (tex: string, x: number): number => {
  const js = tex.replace(/\\,/g, '').replace(/x\^\{(\d)\}/g, 'Math.pow(x,$1)').replace(/(\d)(x|Math)/g, '$1*$2');
  return new Function('x', `return ${js};`)(x) as number;
};
const nums = (s: string): number[] => [...s.matchAll(/\d+/g)].map((m) => Number(m[0]));

describe('Grade 12 MCT4C', () => {
  it('lists 17 skills, each with a generator', () => {
    const ids = (JSON.parse(readFileSync('content/microskills.json', 'utf8')) as { microskills: { id: string }[] }).microskills.map((m) => m.id).filter((i) => i.startsWith(M));
    expect(ids).toHaveLength(17);
    for (const id of ids) for (const tier of [1, 2, 3]) expect(generate(id, tier, 1).id.startsWith(id)).toBe(true);
  });
  it('evaluates polynomials', () => {
    each('B1.1.a', [1, 2], (it) => {
      const [fx, at] = math(it) as [string, string];
      near(val(it), evalTex(fx.replace('f(x) = ', ''), Number(/\((-?\d+)\)/.exec(at)![1])), it.id);
    });
    each('B1.1.a', [3], (it) => {
      const m = /x \+ (\d+)\)\(x \+ (\d+)\)/.exec(math(it)[3]!)!, k = Number(/x = (\d+)/.exec(math(it)[4]!)![1]);
      near(val(it), k * (k + Number(m[1])) * (k + Number(m[2])), it.id);
    });
  });
  it('rearranges formulas', () => {
    each('B3.3.a', [1], (it) => { const [, v, i] = math(it).map((s) => Number(/= (\d+)/.exec(s)?.[1])) as [number, number, number]; near(val(it), v / i, it.id); });
    each('B3.3.a', [2], (it) => { const [, p, r] = math(it).map((s) => Number(/= (\d+)/.exec(s)?.[1])) as [number, number, number]; near(val(it), Math.sqrt(p / r), it.id); });
    each('B3.3.a', [3], (it) => {
      const g = (k: string): number => Number(new RegExp(`${k} = (\\d+)`).exec(math(it).join(' '))![1]);
      near(val(it), (g('v') ** 2 - g('u') ** 2) / (2 * g('s')), it.id);
    });
  });
  it('forces and navigation', () => {
    each('D1.1.a', [1, 2], (it) => { const [a, b] = nums(it.prompt.en); near(val(it), Math.hypot(a!, b!), it.id); });
    each('D1.1.a', [3], (it) => {
      const [x1, y1, x2, y2] = math(it).slice(0, 2).flatMap((s) => nums(s.replace('F_1', '').replace('F_2', '')));
      near(val(it), Math.hypot(x1! + x2!, y1! + y2!), it.id);
    });
  });
  it('circle properties', () => {
    each('D3.1.a', [1], (it) => { const a = Number(/(\d+)/.exec(math(it)[0]!)![1]); near(val(it), /^A central/.test(it.prompt.en) ? a / 2 : a * 2, it.id); });
    each('D3.1.a', [2], (it) => { const [c, a] = nums(it.prompt.en); near(val(it), 2 * Math.sqrt(c! * c! - a! * a!), it.id); });
    each('D3.1.a', [3], (it) => { const [c, a] = nums(it.prompt.en); near(val(it), Math.sqrt(c! * c! - a! * a!), it.id); });
  });
  it('arcs and sectors', () => {
    each('D3.2.a', [1, 2, 3], (it) => {
      const m = /radius of \$(\d+)\$ cm and a central angle of \$(\d+)/.exec(it.prompt.en)!, r = Number(m[1]), f = Number(m[2]) / 360;
      const arc = 2 * Math.PI * r * f, exact = /length of its arc/.test(it.prompt.en) ? arc : /its area/.test(it.prompt.en) ? Math.PI * r * r * f : arc + 2 * r;
      near(val(it), exact, it.id, 0.051);
    });
  });
});
