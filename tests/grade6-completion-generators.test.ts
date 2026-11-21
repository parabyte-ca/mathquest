import { describe, it, expect } from 'vitest';
import { generate } from '../shared/generators/index.js';
import type { Item } from '../shared/items/types.js';

// Independent check of the Grade 6 coding, modelling, infographic, views, protractor and nets generators added in 2.9.1: each test
// reads the English prompt of a generated item, recomputes the answer by a different method and compares it with the stored answer.

const SEEDS = 250;
const clean = (s: string): string => s.replace(/\\,/g, '').replace(/\{,\}/g, '.').replace(/\\ /g, ' ').replace(/\$/g, '');
const nums = (s: string): number[] => [...clean(s).matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
const val = (it: Item): number => (it.answer as { value: number }).value;
const idx = (it: Item): number => (it.answer as { index: number }).index;
const rightText = (it: Item): string => clean(it.options![idx(it)]!.en);
const each = (skill: string, tiers: number[], fn: (it: Item, tier: number) => void): void => {
  for (const tier of tiers) for (let seed = 1; seed <= SEEDS; seed++) fn(generate(skill, tier, seed), tier);
};
const close = (a: number, b: number, id = ''): void => expect(Math.abs(a - b), id).toBeLessThan(1e-6);

describe('Grade 6 coding and modelling generators compute correct answers', () => {
  it('runs programs by simulation', () => {
    each('MS.G6.C3.a', [1], (it) => {
      const [, , step, , k, inc] = nums(it.prompt.en) as number[];
      let total = 0, s = step!; for (let i = 0; i < k!; i++) { total += s; s += inc!; }
      close(val(it), total, it.id);
    });
    each('MS.G6.C3.a', [2], (it) => {
      const [, , m, by, a] = nums(it.prompt.en) as number[];
      let total = 0; for (let i = 1; i <= m!; i++) total += i % by! === 0 ? a! : 1;
      close(val(it), total, it.id);
    });
    each('MS.G6.C3.a', [3], (it) => {
      const [start, limit, factor] = nums(it.prompt.en) as [number, number, number];
      let x = start, runs = 0; while (x <= limit) { x *= factor; runs++; }
      close(val(it), runs, it.id);
    });
  });

  it('alters programs', () => {
    each('MS.G6.C3.b', [1], (it) => { const [start, k, , , , a2] = nums(it.prompt.en) as number[]; let total = start!; for (let i = 0; i < k!; i++) total += a2!; close(val(it), total, it.id); });
    each('MS.G6.C3.b', [2], (it) => {
      const [, m, , , by2] = nums(it.prompt.en) as number[];
      let c = 0; for (let i = 1; i <= m!; i++) if (i % by2! === 0) c++;
      close(val(it), c, it.id);
    });
    each('MS.G6.C3.b', [3], (it) => { const [start, add, goal] = nums(it.prompt.en) as [number, number, number]; let total = start, reps = 0; while (total < goal) { total += add; reps++; } expect(total).toBe(goal); close(val(it), reps, it.id); });
  });

  it('the modelling process', () => {
    each('MS.G6.C4.a', [1], (it) => { const [people, slices, per] = nums(it.prompt.en) as [number, number, number]; let pizzas = 0; while (pizzas * per < people * slices) pizzas++; close(val(it), pizzas, it.id); });
    each('MS.G6.C4.a', [2], (it) => { const [inn, out, tank] = nums(it.prompt.en) as [number, number, number]; let level = 0, mins = 0; while (level < tank) { level += inn - out; mins++; } expect(level).toBe(tank); close(val(it), mins, it.id); });
    each('MS.G6.C4.a', [3], (it) => {
      const [people, slices, per, extra] = nums(it.prompt.en) as [number, number, number, number];
      const need = (n: number): number => { let p = 0; while (p * per < n * slices) p++; return p; };
      close(val(it), need(people + extra) - need(people), it.id);
    });
  });
});

describe('Grade 6 data and spatial sense generators compute correct answers', () => {
  it('infographics', () => {
    each('MS.G6.D1.4.a', [1], (it) => {
      const missing = ['a title', 'labelled axes with units', 'the source of the data'].filter((p) => !it.prompt.en.includes(p));
      expect(missing.length).toBe(1);
      expect(rightText(it).toLowerCase()).toBe(missing[0]);
    });
    each('MS.G6.D1.4.a', [2], (it) => {
      const text = clean(it.prompt.en); const total = Number(/(\d+) students take/.exec(text)![1]);
      const rows = [...text.matchAll(/(0 to 9 minutes|10 to 19 minutes|20 minutes or more): (\d+)/g)].map((m) => [m[1]!, Number(m[2])] as [string, number]);
      expect(rows.reduce((a, [, n]) => a + n, 0)).toBe(total);
      const asked = /for "(.+?)"\?/.exec(text)![1]!; close(val(it), ((rows.find(([n]) => n === asked)![1]) * 100) / total, it.id);
    });
    each('MS.G6.D1.4.a', [3], (it) => { const [pct] = nums(it.prompt.en) as [number]; expect(rightText(it)).toBe(`About ${pct}% of students surveyed ride the bus`); });
  });

  const rowsOf = (s: string): [number[], number[]] => {
    const m = /front row \$([^$]+)\$ and back row \$([^$]+)\$/.exec(s)!;
    return [m[1]!.replace(/\\ /g, ' ').split(',').map(Number), m[2]!.replace(/\\ /g, ' ').split(',').map(Number)];
  };
  it('views of block structures', () => {
    each('MS.G6.E1.2.a', [1], (it) => { const [f, b] = rowsOf(it.prompt.en); close(val(it), [...f, ...b].reduce((x, y) => x + y, 0), it.id); });
    each('MS.G6.E1.2.a', [2], (it) => { const [f, b] = rowsOf(it.prompt.en); close(val(it), f.reduce((acc, v, i) => acc + Math.max(v, b[i]!), 0), it.id); });
    each('MS.G6.E1.2.a', [3], (it) => { const [f, b] = rowsOf(it.prompt.en); close(val(it), Math.max(...f) + Math.max(...b), it.id); });
  });

  it('the protractor up to 360 degrees', () => {
    each('MS.G6.E2.2.a', [1], (it) => { const [a, b] = nums(it.prompt.en) as [number, number]; close(val(it), b - a, it.id); });
    each('MS.G6.E2.2.a', [2], (it) => { const [a] = nums(it.prompt.en) as [number]; close(val(it), 360 - a, it.id); expect(val(it)).toBeGreaterThan(180); });
    each('MS.G6.E2.2.a', [3], (it) => { const [target, max] = nums(it.prompt.en) as [number, number]; expect(max).toBe(180); expect(target).toBeGreaterThan(180); close(val(it) + target, 360, it.id); });
  });

  it('nets', () => {
    const FACES: [RegExp, number][] = [[/a cube/, 6], [/a rectangular prism/, 6], [/a triangular prism/, 5], [/a square pyramid/, 5], [/a triangular pyramid/, 4], [/a pentagonal prism/, 7], [/a hexagonal pyramid/, 7]];
    each('MS.G6.E2.5.a', [1], (it) => { close(val(it), FACES.find(([re]) => re.test(it.prompt.en))![1], it.id); });
    each('MS.G6.E2.5.a', [2], (it) => { const [, s] = nums(it.prompt.en) as [number, number]; close(val(it), 6 * s * s, it.id); });
    each('MS.G6.E2.5.a', [3], (it) => { const [b, b2, h] = nums(it.prompt.en) as [number, number, number]; expect(b2).toBe(b); close(val(it), b * b + 4 * ((b * h) / 2), it.id); });
  });
});
