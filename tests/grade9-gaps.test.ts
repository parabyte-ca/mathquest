import { describe, it, expect } from 'vitest';
import { generate } from '../shared/generators/index.js';
import type { Item } from '../shared/items/types.js';

// Independent check of the Grade 9 (MTH1W) coding, data, geometry and financial generators: each test reads the English prompt of a
// generated item, recomputes the answer by a different method and compares it with the stored answer.

const SEEDS = 250;
const clean = (s: string): string => s.replace(/\\,/g, '').replace(/\\ /g, ' ').replace(/\$/g, '').replace(/\\%/g, '%').replace(/\\times/g, '*').replace(/\\pi \\approx/g, 'pi=');
const nums = (s: string): number[] => [...clean(s).matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
const val = (it: Item): number => (it.answer as { value: number }).value;
const idx = (it: Item): number => (it.answer as { index: number }).index;
const rightRaw = (it: Item): string => it.options![idx(it)]!.en;
const each = (skill: string, tiers: number[], fn: (it: Item, tier: number) => void): void => {
  for (const tier of tiers) for (let seed = 1; seed <= SEEDS; seed++) fn(generate(skill, tier, seed), tier);
};
const near = (a: number, b: number, id: string, tol = 1e-6): void => expect(Math.abs(a - b), id).toBeLessThanOrEqual(tol);
const math = (it: Item): string[] => [...it.prompt.en.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]!);
const G = 'MS.G9.';
const median = (xs: number[]): number => { const s = [...xs].sort((a, b) => a - b), n = s.length; return n % 2 ? s[(n - 1) / 2]! : (s[n / 2 - 1]! + s[n / 2]!) / 2; };
const quartiles = (xs: number[]): [number, number, number] => { const s = [...xs].sort((a, b) => a - b), n = s.length; return [median(s.slice(0, Math.floor(n / 2))), median(s), median(s.slice(Math.ceil(n / 2)))]; };

describe('Grade 9 coding and relations', () => {
  it('code with equations and inequalities', () => {
    each(G + 'C2.1.a', [1], (it) => { const m = /returns ([-\d]*)x ([+-]) (\d+)\. The program calls f with x = \$?(-?\d+)/.exec(clean(it.prompt.en))!; const a = m[1] === '-' ? -1 : Number(m[1]), b = (m[2] === '-' ? -1 : 1) * Number(m[3]); expect(val(it), it.id).toBe(a * Number(m[4]) + b); });
    each(G + 'C2.1.a', [2], (it) => { const m = /sets y to (\d+)x \+ (\d+)\. Then: if y is more than (\d+).*when x = (\d+)/.exec(clean(it.prompt.en))!; const [a, b, limit, x] = [m[1], m[2], m[3], m[4]].map(Number) as [number, number, number, number]; const y = a * x + b; expect(val(it), it.id).toBe(y > limit ? y - limit : y + limit); });
    each(G + 'C2.1.a', [3], (it) => { const m = /from (-?\d+) to 20 that make (\d+)x - 1 < (\d+)/.exec(clean(it.prompt.en))!; const [from, a, c] = [m[1], m[2], m[3]].map(Number) as [number, number, number]; let n = 0; for (let x = from; x <= 20; x++) if (a * x - 1 < c) n++; expect(val(it), it.id).toBe(n); });
  });
  it('breaking a situation into steps', () => {
    each(G + 'C2.2.a', [1], (it) => { const [base, per, tax, n] = nums(it.prompt.en.replace(/\((\d)\)/g, ' ')) as number[]; near(val(it), (base! + per! * n!) * (1 + tax! / 100), it.id, 1e-9); });
    each(G + 'C2.2.a', [2], (it) => { const [start, save, spend, weeks] = nums(it.prompt.en.replace(/\((\d)\)/g, ' ')) as number[]; expect(val(it), it.id).toBe(start! + (save! - spend!) * weeks!); });
    each(G + 'C2.2.a', [3], (it) => { const [start, add, goal] = nums(it.prompt.en) as number[]; let x = start!, n = 0; while (x < goal!) { x += add!; n++; } expect(val(it), it.id).toBe(n); });
  });
  it('reading and altering code', () => {
    each(G + 'C2.3.a', [1], (it) => { const e = math(it); const [a, b] = nums(e[0]!) as [number, number]; const [a2] = nums(e[1]!) as [number]; const x = Number(/x = \$(-?\d+)\$/.exec(it.prompt.en)![1]); expect(val(it), it.id).toBe((a2 * x + b) - (a * x + b)); });
    each(G + 'C2.3.a', [2], (it) => { const [, , , , t1, , t2, , n] = [0, 0, 0, 0, ...nums(it.prompt.en)]; void t1; void t2; void n; const m = /number i from 1 to (\d+): if i can be divided by (\d+).*adds (\d+) to total.*The \$?(\d+)\$? is changed to \$?(\d+)/.exec(clean(it.prompt.en))!; const [n2, , a, , th] = [m[1], m[2], m[3], m[4], m[5]].map(Number) as number[]; let c = 0; for (let i = 1; i <= n2!; i++) c += i % th! === 0 ? a! : 1; expect(val(it), it.id).toBe(c); });
    each(G + 'C2.3.a', [3], (it) => {
      const m = /sets x to (\d+) and repeats "multiply x by (\d+)" until x is at least (\d+)\. It is changed to start with x = (\d+)/.exec(clean(it.prompt.en))!;
      const loops = (x0: number, mult: number, goal: number): number => { let x = x0, n = 0; while (x < goal) { x *= mult; n++; } return n; };
      const [s, k, goal, s2] = [m[1], m[2], m[3], m[4]].map(Number) as [number, number, number, number];
      expect(loops(s, k, goal) - loops(s2, k, goal), it.id).toBe(val(it));
    });
  });
  it('linear and non-linear relations', () => {
    const LIN = ['y = 3x + 2', 'y = -x + 7', 'y = \\frac{x}{2} - 1', '2x + 3y = 12', 'y = 5x', 'y = 4'];
    each(G + 'C4.1.a', [1], (it) => { expect(LIN, it.id).toContain(rightRaw(it).replace(/\$/g, '')); it.options!.forEach((o, i) => { if (i !== idx(it)) expect(LIN).not.toContain(o.en.replace(/\$/g, '')); }); });
    each(G + 'C4.1.a', [2], (it) => { expect(LIN, it.id).not.toContain(rightRaw(it).replace(/\$/g, '')); it.options!.forEach((o, i) => { if (i !== idx(it)) expect(LIN).toContain(o.en.replace(/\$/g, '')); }); });
    each(G + 'C4.1.a', [3], (it) => {
      const isLinear = (ys: number[]): boolean => ys.slice(1).map((y, i) => y - ys[i]!).every((d, _i, a) => d === a[0]);
      const flags = it.options!.map((o) => isLinear(nums(o.en)));
      expect(flags.filter(Boolean).length, it.id).toBe(1); expect(flags[idx(it)], it.id).toBe(true);
    });
  });
});

describe('Grade 9 data and modelling', () => {
  it('large data and the modelling cycle are well-formed choices', () => {
    for (const id of ['D1.1', 'D2.1', 'D2.2', 'D2.3', 'D2.4', 'D2.5']) {
      each(G + id + '.a', [1, 2, 3], (it) => {
        expect(it.options!.length, it.id).toBe(4);
        expect(new Set(it.options!.map((o) => o.en)).size, it.id).toBe(4);
        expect(it.wrong.length, it.id).toBe(3);
        expect(it.prompt.en, it.id).not.toMatch(/\{[gn]|\{big\}/);
        for (const o of it.options!) expect(o.en + o.fr, it.id).not.toMatch(/\{[gn]|\{big\}/);
      });
    }
  });
  it('quartiles', () => {
    each(G + 'D1.2.a', [1], (it) => { near(val(it), median(nums(it.prompt.en.split(':')[1]!)), it.id); });
    each(G + 'D1.2.a', [2], (it) => { const xs = nums(it.prompt.en.split('find')[0]!.replace('For the data', '')); const [q1, , q3] = quartiles(xs); near(val(it), /interquartile/.test(it.prompt.en) ? q3 - q1 : q3, it.id); });
    each(G + 'D1.2.a', [3], (it) => { const xs = nums(it.prompt.en.split('how many')[0]!.replace('For the data', '')); const [q1, , q3] = quartiles(xs), iqr = q3 - q1; expect(val(it), it.id).toBe(xs.filter((x) => x > q3 + 1.5 * iqr || x < q1 - 1.5 * iqr).length); });
  });
  it('scatter plots, predictions and residuals', () => {
    const corr = (xs: number[], ys: number[]): number => { const n = xs.length, mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n; let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { sxy += (xs[i]! - mx) * (ys[i]! - my); sxx += (xs[i]! - mx) ** 2; syy += (ys[i]! - my) ** 2; } return sxy / Math.sqrt(sxx * syy); };
    each(G + 'D1.3.a', [1], (it) => {
      const pts = [...clean(it.prompt.en).matchAll(/\((\d+), (-?\d+)\)/g)].map((m) => [Number(m[1]), Number(m[2])] as const);
      expect(pts.length, it.id).toBe(8);
      const rr = corr(pts.map((p) => p[0]), pts.map((p) => p[1]));
      const expected = rr > 0.9 ? 'A strong positive correlation' : rr < -0.9 ? 'A strong negative correlation' : Math.abs(rr) < 0.3 ? 'Little or no correlation' : '?';
      expect(rightRaw(it), it.id).toBe(expected);
    });
    each(G + 'D1.3.a', [2], (it) => { const m = /y = (-?[\d.]+)x \+ (\d+)\. What value of y does it predict when x = (\d+)/.exec(clean(it.prompt.en))!; near(val(it), Number(m[1]) * Number(m[3]) + Number(m[2]), it.id, 1e-9); });
    each(G + 'D1.3.a', [3], (it) => { const m = /y = (-?\d+)x \+ (\d+)\. At x = (\d+) the actual data value is y = (-?\d+)/.exec(clean(it.prompt.en))!; expect(val(it), it.id).toBe(Number(m[4]) - (Number(m[1]) * Number(m[3]) + Number(m[2]))); });
  });
});

describe('Grade 9 geometry and measurement', () => {
  it('circle and triangle properties', () => {
    each(G + 'E1.2.a', [1], (it) => { expect(val(it), it.id).toBe((180 - nums(it.prompt.en.split('top is')[1]!)[0]!) / 2); });
    each(G + 'E1.2.a', [2], (it) => { expect(val(it), it.id).toBe(6 * nums(it.prompt.en)[0]!); });
    each(G + 'E1.2.a', [3], (it) => { expect(val(it), it.id).toBe(90 - nums(it.prompt.en.split('angles is')[1]!)[0]!); });
  });
  it('unit conversions', () => {
    const F: Record<string, number> = { 'kilometres metres': 1000, 'litres millilitres': 1000, 'kilograms grams': 1000, 'centimetres metres': 0.01 };
    each(G + 'E1.3.a', [1], (it) => { const m = /Convert ([\d.]+) (\w+) to (\w+)\./.exec(clean(it.prompt.en))!; near(val(it), Number(m[1]) * F[`${m[2]} ${m[3]}`]!, it.id, 1e-6); });
    each(G + 'E1.3.a', [2], (it) => {
      const e = clean(it.prompt.en), x = nums(e)[0]!;
      if (/inches long/.test(e)) near(val(it), x * 2.54, it.id, 1e-6); else near(val(it), x / 30.48, it.id, 1e-6);
    });
    each(G + 'E1.3.a', [3], (it) => {
      const e = clean(it.prompt.en), x = nums(e)[0]!;
      if (/square centimetres/.test(e)) near(val(it), x * 10000, it.id); else if (/cubic centimetres/.test(e)) near(val(it), x * 1000, it.id); else near(val(it), x * 1000, it.id);
    });
  });
  it('scaling', () => {
    each(G + 'E1.4.a', [1], (it) => { const [w, h, k] = nums(it.prompt.en) as [number, number, number]; expect(val(it), it.id).toBe(w * h * k * k); });
    each(G + 'E1.4.a', [2], (it) => { const [s, k] = nums(it.prompt.en) as [number, number]; expect(val(it), it.id).toBe(/volume/.test(it.prompt.en) ? (s * k) ** 3 : 6 * (s * k) ** 2); });
    each(G + 'E1.4.a', [3], (it) => { const [a, v, k] = nums(it.prompt.en) as [number, number, number]; expect(val(it), it.id).toBe(/volume, in cm³/.test(it.prompt.en) ? v * k ** 3 : a * k * k); });
  });
  it('the Pythagorean relationship in composite shapes', () => {
    each(G + 'E1.5.a', [1, 2], (it, tier) => {
      const [top, bottom, slant] = nums(it.prompt.en) as [number, number, number];
      const h = Math.sqrt(slant * slant - ((bottom - top) / 2) ** 2);
      expect(Number.isInteger(h), it.id).toBe(true);
      near(val(it), tier === 1 ? h : ((top + bottom) * h) / 2, it.id, 1e-9);
    });
    each(G + 'E1.5.a', [3], (it) => { const [l, w, h] = nums(it.prompt.en) as [number, number, number]; near(val(it), Math.sqrt(l * l + w * w + h * h), it.id, 1e-9); expect(Number.isInteger(val(it))).toBe(true); });
  });
  it('volume relationships', () => {
    each(G + 'E1.6.a', [1, 2], (it) => { const e = it.prompt.en, v = nums(e.split('has a volume of')[1] ?? e.split('holds')[1]!)[0]!; const givenIsBig = /The (prism|cylinder)/.test(e); expect(val(it), it.id).toBe(givenIsBig ? v / 3 : v * 3); });
    each(G + 'E1.6.a', [3], (it) => { const [r, h] = nums(it.prompt.en) as [number, number]; near(val(it), Math.round(((3.14 * r * r * h) / 3) * 100) / 100, it.id, 0.0051); });
  });
});

describe('Grade 9 financial literacy', () => {
  it('past and present situations', () => {
    each(G + 'F1.1.a', [1], (it) => { const [old, now] = nums(it.prompt.en.replace('ten years ago', 'x')) as [number, number]; near(val(it), ((now - old) / old) * 100, it.id, 1e-6); });
    each(G + 'F1.1.a', [2], (it) => { const [then, now, cost] = nums(it.prompt.en.replace('in 2005', '')) as [number, number, number]; near(val(it), cost / then - cost / now, it.id, 0.011); });
    each(G + 'F1.1.a', [3], (it) => { const [base, rate, years] = nums(it.prompt.en) as [number, number, number]; near(val(it), base * (1 + rate / 100) ** years, it.id, 1e-6); });
  });
  it('appreciation and depreciation', () => {
    each(G + 'F1.2.a', [1], (it) => { const [price, loss, years] = nums(it.prompt.en) as [number, number, number]; expect(val(it), it.id).toBe(price - loss * years); });
    each(G + 'F1.2.a', [2], (it) => { const [price, rate, years] = nums(it.prompt.en) as [number, number, number]; const f = /loses/.test(it.prompt.en) ? 1 - rate / 100 : 1 + rate / 100; near(val(it), price * f ** years, it.id, 1e-6); });
    each(G + 'F1.2.a', [3], (it) => {
      const text = it.prompt.en, right = rightRaw(it);
      const same = /same/.test(text), up = /gains/.test(text);
      expect(right.includes('straight line'), it.id).toBe(same);
      expect(right.includes(up ? 'rises' : 'down') || right.includes(up ? 'up' : 'falls'), it.id).toBe(true);
    });
  });
  it('the cost of borrowing', () => {
    each(G + 'F1.3.a', [1], (it) => { const [P, rate, years] = nums(it.prompt.en) as [number, number, number]; near(val(it), (P * rate * years) / 100, it.id, 1e-6); });
    each(G + 'F1.3.a', [2], (it) => { const [price, down, years, rate] = nums(it.prompt.en) as [number, number, number, number]; near(val(it), price + ((price - down) * rate * years) / 100, it.id, 1e-6); });
    each(G + 'F1.3.a', [3], (it) => {
      const m = /Loan A: [^\d]*(\d+)[^\d]+for (\d+) years at (\d+)%.*Loan B: [^\d]*(\d+)[^\d]+for (\d+) years? at (\d+)%/.exec(clean(it.prompt.en));
      if (!m) return; // the rare equal-interest case falls back to a single-loan question
      const [P1, y1, r1, P2, y2, r2] = m.slice(1).map(Number) as number[];
      near(val(it), Math.abs((P1! * r1! * y1!) / 100 - (P2! * r2! * y2!) / 100), it.id, 1e-6);
    });
  });
  it('modifying a budget', () => {
    each(G + 'F1.4.a', [1], (it) => { const [income, rent, food, other] = nums(it.prompt.en) as number[]; expect(val(it), it.id).toBe(income! - rent! - food! - other!); });
    each(G + 'F1.4.a', [2], (it) => { const [income, rent, food, other, cut] = nums(it.prompt.en) as number[]; near(val(it), income! - rent! - food! - other! + (food! * cut!) / 100, it.id, 1e-6); });
    each(G + 'F1.4.a', [3], (it) => { const [income, rent, food, other, target] = nums(it.prompt.en) as number[]; near(val(it), ((target! - (income! - rent! - food! - other!)) / food!) * 100, it.id, 0.011); });
  });
});
