import { describe, it, expect } from 'vitest';
import { generate } from '../shared/generators/index.js';
import type { Item } from '../shared/items/types.js';

// Independent check of the Grade 5 financial literacy, algebra, data and spatial sense generators added in 2.8.2: each test
// reads the English prompt of a generated item, recomputes the answer by a different method and compares it with the stored answer.

const SEEDS = 250;
const clean = (s: string): string => s.replace(/\\,/g, '').replace(/\{,\}/g, '.').replace(/\\ldots/g, '').replace(/\\ /g, ' ').replace(/\$/g, '');
const nums = (s: string): number[] => [...clean(s).matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
const val = (it: Item): number => (it.answer as { value: number }).value;
const idx = (it: Item): number => (it.answer as { index: number }).index;
const rightText = (it: Item): string => clean(it.options![idx(it)]!.en);
const each = (skill: string, tiers: number[], fn: (it: Item, tier: number) => void): void => {
  for (const tier of tiers) for (let seed = 1; seed <= SEEDS; seed++) fn(generate(skill, tier, seed), tier);
};
const close = (a: number, b: number, id = ''): void => expect(Math.abs(a - b), id).toBeLessThan(1e-6);
const diffs = (xs: number[]): number[] => xs.slice(1).map((x, i) => x - xs[i]!);

describe('Grade 5 financial literacy generators compute correct answers', () => {
  it('transferring money', () => {
    each('MS.G5.F1.1.a', [1], (it) => { const [a, fee] = nums(it.prompt.en) as [number, number]; close(val(it), a + fee, it.id); });
    each('MS.G5.F1.1.a', [2], (it) => { const [cash, debit, credit] = nums(it.prompt.en) as [number, number, number]; close(val(it), debit + credit, it.id); expect(val(it)).not.toBe(cash + debit + credit); });
    each('MS.G5.F1.1.a', [3], (it) => { const [k, a, fee] = nums(it.prompt.en) as [number, number, number]; let total = 0; for (let i = 0; i < k; i++) total += a + fee; close(val(it), total, it.id); });
  });

  it('basic budgets', () => {
    each('MS.G5.F1.3.a', [1], (it) => { const [inc, needs, wants] = nums(it.prompt.en) as [number, number, number]; close(val(it), inc - needs - wants, it.id); expect(val(it)).toBeGreaterThan(0); });
    each('MS.G5.F1.3.a', [2], (it) => { const [inc] = nums(it.prompt.en) as [number]; const rest = inc - inc / 4; close(val(it) * 2, rest, it.id); expect(Number.isInteger(val(it))).toBe(true); });
    each('MS.G5.F1.3.a', [3], (it) => {
      const [rate, hours, spend, goal] = nums(it.prompt.en) as [number, number, number, number];
      let saved = 0, weeks = 0; while (saved < goal) { saved += rate * hours - spend; weeks++; }
      expect(saved).toBe(goal); close(val(it), weeks, it.id);
    });
  });

  it('credit and debt', () => {
    each('MS.G5.F1.4.a', [1], (it) => { const [owe, paid, bought] = nums(it.prompt.en) as [number, number, number]; close(val(it), owe - paid + bought, it.id); });
    each('MS.G5.F1.4.a', [2], (it) => { const [pct, owe] = nums(it.prompt.en) as [number, number]; close(val(it), owe * (1 + pct / 100), it.id); });
    each('MS.G5.F1.4.a', [3], (it) => {
      const [owe, pay, interest] = nums(it.prompt.en) as [number, number, number];
      let debt = owe, months = 0; while (debt > 0) { debt -= pay - interest; months++; }
      expect(debt).toBe(0); close(val(it), months, it.id);
    });
  });

  it('taxes and the services they fund', () => {
    const TAX: [RegExp, string][] = [[/property tax/, 'municipal'], [/Goods and Services/, 'federal'], [/federal income/, 'federal'], [/Ontario provincial income/, 'provincial']];
    const SERVICE: [RegExp, string][] = [[/garbage|snow clearing/, 'municipal'], [/defence/, 'federal'], [/schools/, 'provincial']];
    const word = (l: string): RegExp => new RegExp(l === 'municipal' ? 'municipal' : l, 'i');
    each('MS.G5.F1.6.a', [1], (it) => { const lvl = TAX.find(([re]) => re.test(it.prompt.en))![1]; expect(rightText(it), it.id).toMatch(word(lvl)); expect(it.options!.filter((o) => word(lvl).test(o.en)).length).toBe(1); });
    each('MS.G5.F1.6.a', [2], (it) => { const lvl = SERVICE.find(([re]) => re.test(it.prompt.en))![1]; expect(rightText(it), it.id).toMatch(word(lvl)); expect(it.options!.filter((o) => word(lvl).test(o.en)).length).toBe(1); });
    each('MS.G5.F1.6.a', [3], (it) => { const x = nums(it.prompt.en); close(val(it), (x[x.length - 1]! * 8) / 100, it.id); expect(x.slice(0, 3)).toEqual([13, 5, 8]); });
  });
});

describe('Grade 5 algebra generators compute correct answers', () => {
  it('kinds of patterns', () => {
    each('MS.G5.C1.1.a', [1], (it) => {
      const all = nums(it.prompt.en); const n = all[all.length - 1]!; const seq = all.slice(0, -1);
      expect(seq.length).toBe(6); expect(seq.slice(3)).toEqual(seq.slice(0, 3));
      let term = 0; for (let i = 1; i <= n; i++) term = seq[(i - 1) % 3]!;
      close(val(it), term, it.id);
    });
    each('MS.G5.C1.1.a', [2], (it) => {
      const [start, d, n] = nums(it.prompt.en) as [number, number, number]; const grow = /growing/.test(it.prompt.en);
      let v = start; for (let i = 1; i < n; i++) v += grow ? d : -d; close(val(it), v, it.id);
    });
    each('MS.G5.C1.1.a', [3], (it) => {
      const kind = /growing/.test(it.prompt.en) ? 'growing' : /shrinking/.test(it.prompt.en) ? 'shrinking' : 'repeating';
      const is = (xs: number[]): string => (xs[3] === xs[0] && xs[4] === xs[1] ? 'repeating' : new Set(diffs(xs)).size === 1 ? (xs[1]! > xs[0]! ? 'growing' : 'shrinking') : '?');
      const kinds = it.options!.map((o) => is(nums(o.en)));
      expect(kinds.filter((k) => k === kind).length, it.id).toBe(1);
      expect(kinds[idx(it)]).toBe(kind);
    });
  });

  it('tables of values', () => {
    each('MS.G5.C1.2.a', [1], (it) => {
      const part = /values ([^.]*?)\. The pattern/.exec(clean(it.prompt.en))![1]!.split(',').map((x) => x.trim());
      const arr = part.map((x) => (x === '?' ? NaN : Number(x))); const miss = arr.findIndex((x) => Number.isNaN(x));
      const known = arr.findIndex((x, i) => !Number.isNaN(x) && !Number.isNaN(arr[i + 1] ?? NaN));
      const d = arr[known + 1]! - arr[known]!;
      close(val(it), arr[miss - 1]! + d, it.id); if (miss < arr.length - 1) expect(arr[miss + 1]! - val(it)).toBe(d);
    });
    each('MS.G5.C1.2.a', [2], (it) => { const x = nums(it.prompt.en); const [s, d] = x as [number, number]; const n = x[x.length - 1]!; let v = s; for (let i = 1; i < n; i++) v += d; close(val(it), v, it.id); });
    each('MS.G5.C1.2.a', [3], (it) => { const x = nums(it.prompt.en); const vals = x.slice(4, 8); const n = x[x.length - 1]!; const d = vals[0]! - vals[1]!; expect(diffs(vals).every((e) => e === -d)).toBe(true); let v = vals[0]!; for (let i = 1; i < n; i++) v -= d; close(val(it), v, it.id); });
  });

  it('expressions', () => {
    each('MS.G5.C2.1.a', [1], (it) => {
      const k = nums(it.prompt.en)[0]!; const right = rightText(it);
      if (/more than/.test(it.prompt.en)) expect(right).toBe(`n + ${k}`);
      else if (/less than/.test(it.prompt.en)) expect(right).toBe(`n - ${k}`);
      else expect(right).toBe(`${k} \\times n`);
    });
    each('MS.G5.C2.1.a', [2], (it) => { const [boxes, loose] = nums(it.prompt.en) as [number, number]; expect(rightText(it)).toBe(`${boxes} \\times n + ${loose}`); });
    each('MS.G5.C2.1.a', [3], (it) => {
      const expr = /same amount as ([^?]*)\?/.exec(clean(it.prompt.en))![1]!;
      const terms = expr.split('+').map((x) => x.trim()); const reps = terms.filter((x) => x === 'n').length; const c = Number(terms[terms.length - 1]);
      const m = /^(\d+) \\times n \+ (\d+)$/.exec(rightText(it))!;
      for (const n of [1, 5, 9]) expect(Number(m[1]) * n + Number(m[2])).toBe(reps * n + c);
    });
  });
});

describe('Grade 5 data generators compute correct answers', () => {
  it('sampling', () => {
    each('MS.G5.D1.1.a', [1], (it) => { const rnd = it.options!.map((o) => /random/i.test(o.en)); expect(rnd.filter(Boolean).length, it.id).toBe(1); expect(rnd[idx(it)]).toBe(true); });
    each('MS.G5.D1.1.a', [2], (it) => { const rnd = it.options!.map((o) => /random/i.test(o.en)); expect(rnd.filter((x) => !x).length, it.id).toBe(1); expect(rnd[idx(it)]).toBe(false); });
    each('MS.G5.D1.1.a', [3], (it) => { const [a, b] = nums(it.prompt.en) as [number, number]; expect(rightText(it)).toContain(`${Math.max(a, b)} students`); });
  });

  it('relative frequency', () => {
    each('MS.G5.D1.2.a', [1], (it) => { const [total, count] = nums(it.prompt.en) as [number, number]; close(val(it), count / total, it.id); });
    each('MS.G5.D1.2.a', [2], (it) => { const [total, count] = nums(it.prompt.en) as [number, number]; close(val(it), (count / total) * 100, it.id); });
    each('MS.G5.D1.2.a', [3], (it) => { const [total, a, b, c] = nums(it.prompt.en) as [number, number, number, number]; close(val(it), (total * (100 - a - b - c)) / 100, it.id); expect(Number.isInteger(val(it))).toBe(true); });
  });

  it('choosing a graph', () => {
    const rule = (s: string): string => (/split by|two groups inside|boys and girls/.test(s) ? 'Stacked-bar graph' : /parts of one whole|parts of that one whole/.test(s) ? 'Circle graph' : /changed|grew|grow/.test(s) ? 'Broken-line graph' : 'Bar graph');
    each('MS.G5.D1.3.a', [1, 2, 3], (it) => { expect(rightText(it), it.prompt.en).toBe(rule(it.prompt.en)); });
  });

  it('analysing graphs', () => {
    each('MS.G5.D1.6.a', [1], (it) => { expect(rightText(it)).toMatch(/does not start at zero/); });
    each('MS.G5.D1.6.a', [2], (it) => {
      const text = clean(it.prompt.en);
      const total = Number(/reaches a total of (\d+)/.exec(text)![1]); const girls = Number(/girls part is (\d+)/.exec(text)![1]);
      close(val(it), total - girls, it.id);
    });
    each('MS.G5.D1.6.a', [3], (it) => { const [start, a, b] = nums(it.prompt.en) as [number, number, number]; close(val(it), (b - start) / (a - start), it.id); expect(Number.isInteger(val(it))).toBe(true); });
  });
});

describe('Grade 5 spatial sense generators compute correct answers', () => {
  it('transformations on a grid', () => {
    each('MS.G5.E1.5.a', [1], (it) => { const [x, y, a, b] = nums(it.prompt.en) as [number, number, number, number]; close(val(it), /x-coordinate/.test(it.prompt.en) ? x + a : y + b, it.id); });
    each('MS.G5.E1.5.a', [2], (it) => {
      const [p, q, k] = nums(it.prompt.en) as [number, number, number];
      const vertical = /vertical line/.test(it.prompt.en); const pos = vertical ? p : q;
      expect(k - pos).toBeGreaterThan(0); close(val(it), 2 * k - pos, it.id);
    });
    each('MS.G5.E1.5.a', [3], (it) => {
      const [x, y, deg, cx, cy] = nums(it.prompt.en) as [number, number, number, number, number];
      expect(deg).toBe(180); close(val(it), /x-coordinate/.test(it.prompt.en) ? 2 * cx - x : 2 * cy - y, it.id);
    });
  });

  it('metric units', () => {
    const UNIT: [RegExp, string][] = [[/pencil/, 'centimetres'], [/distance between two towns/, 'kilometres'], [/classroom/, 'metres'], [/paper clip/, 'grams'], [/school bag/, 'kilograms'], [/spoon/, 'millilitres'], [/bathtub/, 'litres'], [/coin/, 'millimetres'], [/truck/, 'tonnes']];
    each('MS.G5.E2.1.a', [1, 2], (it) => { const u = UNIT.find(([re]) => re.test(it.prompt.en))![1]; expect(rightText(it), it.prompt.en).toBe(u); });
    const EST: [RegExp, string][] = [[/apple/, '150 grams'], [/door/, '2 metres'], [/big bottle/, '2 litres'], [/pencil/, '18 centimetres']];
    each('MS.G5.E2.1.a', [3], (it) => { const e = EST.find(([re]) => re.test(it.prompt.en))![1]; expect(rightText(it), it.prompt.en).toBe(e); });
  });

  it('comparing angles', () => {
    each('MS.G5.E2.3.a', [1], (it) => { const [a, b] = nums(it.prompt.en) as [number, number]; close(val(it), b - a, it.id); });
    each('MS.G5.E2.3.a', [2], (it) => { const [a, k] = nums(it.prompt.en) as [number, number]; close(val(it), a + k * a, it.id); });
    each('MS.G5.E2.3.a', [3], (it) => { const [right, per, mine] = nums(it.prompt.en) as [number, number, number]; expect(right).toBe(90); expect(90 % per).toBe(0); close(val(it), (90 / per) * mine, it.id); });
  });
});

describe('Grade 5 coding, congruence, views, protractor and infographic generators compute correct answers', () => {
  it('runs short programs by simulation', () => {
    each('MS.G5.C3.1.a', [1], (it) => { const [, start, , k, add] = nums(it.prompt.en) as [number, number, number, number, number]; let total = start; for (let i = 0; i < k; i++) total += add; close(val(it), total, it.id); });
    each('MS.G5.C3.1.a', [2], (it) => {
      const [score, limit, a, b] = nums(it.prompt.en) as [number, number, number, number];
      close(val(it), score > limit ? score + a : score + b, it.id);
    });
    each('MS.G5.C3.1.a', [3], (it) => {
      const [, , m] = nums(it.prompt.en) as [number, number, number]; const mult = /even/.test(it.prompt.en) ? 2 : 3;
      let total = 0; for (let i = 1; i <= m; i++) if (i % mult === 0) total += i;
      close(val(it), total, it.id);
    });
  });

  it('alters programs', () => {
    each('MS.G5.C3.2.a', [1], (it) => { const [, k, add, , k2] = nums(it.prompt.en) as number[]; let total = 0; for (let i = 0; i < k2!; i++) total += add!; expect(k).toBeLessThan(k2!); close(val(it), total, it.id); });
    each('MS.G5.C3.2.a', [2], (it) => {
      const [score, limit, a, b, before, , newLimit] = nums(it.prompt.en) as number[];
      expect(score! > limit!).toBe(true); expect(before).toBe(score! + a!);
      close(val(it), score! > newLimit! ? score! + a! : score! + b!, it.id); expect(val(it)).not.toBe(before);
    });
    each('MS.G5.C3.2.a', [3], (it) => {
      const [start, add, goal] = nums(it.prompt.en) as [number, number, number];
      let total = start, reps = 0; while (total < goal) { total += add; reps++; }
      expect(total).toBe(goal); close(val(it), reps, it.id);
    });
  });

  it('congruent shapes', () => {
    each('MS.G5.E1.2.a', [1], (it) => {
      const [ab, bc, ac] = nums(it.prompt.en.replace(/ABC|DEF/g, '')).slice(-3) as [number, number, number];
      const side = /side (DE|EF|DF) in/.exec(it.prompt.en)![1]!;
      close(val(it), side === 'DE' ? ab : side === 'EF' ? bc : ac, it.id);
    });
    each('MS.G5.E1.2.a', [2], (it) => { const [l, w] = nums(it.prompt.en) as [number, number]; close(val(it), /area/.test(it.prompt.en) ? l * w : 2 * (l + w), it.id); });
    each('MS.G5.E1.2.a', [3], (it) => { const [a] = nums(it.prompt.en) as [number]; close(val(it), /opposite/.test(it.prompt.en) ? a : 180 - a, it.id); });
  });

  it('views of block structures', () => {
    each('MS.G5.E1.3.a', [1], (it) => { const [n, ...h] = nums(it.prompt.en); expect(h.length).toBe(n); close(val(it), n!, it.id); });
    each('MS.G5.E1.3.a', [2], (it) => { const [n, ...h] = nums(it.prompt.en); expect(h.length).toBe(n); close(val(it), h.reduce((a, b) => a + b, 0), it.id); });
    each('MS.G5.E1.3.a', [3], (it) => {
      const x = nums(it.prompt.en).slice(0, 6); const front = x.slice(0, 3), back = x.slice(3);
      close(val(it), front.reduce((a, v, i) => a + Math.max(v, back[i]!), 0), it.id);
    });
  });

  it('protractor', () => {
    each('MS.G5.E2.4.a', [1], (it) => { const [a, b] = nums(it.prompt.en) as [number, number]; close(val(it), b - a, it.id); });
    each('MS.G5.E2.4.a', [2], (it) => { const [s, o] = nums(it.prompt.en) as [number, number]; expect(s + o).toBe(180); close(val(it), Math.min(s, o), it.id); expect(val(it)).toBeLessThan(90); });
    each('MS.G5.E2.4.a', [3], (it) => { const [d] = nums(it.prompt.en) as [number]; close(val(it), /less than a straight/.test(it.prompt.en) ? 180 - d : 90 + d, it.id); });
  });

  it('infographics', () => {
    each('MS.G5.D1.4.a', [1], (it) => {
      const have = ['title', 'labels', 'source'].filter((w) => new RegExp(w === 'title' ? 'a title' : w === 'labels' ? 'labels on the axes' : 'source of the data').test(it.prompt.en));
      expect(have.length).toBe(2);
      const missing = ['title', 'labels', 'source'].find((w) => !have.includes(w))!;
      expect(rightText(it)).toMatch(missing === 'title' ? /^A title/ : missing === 'labels' ? /^Labels/ : /^The source/);
    });
    each('MS.G5.D1.4.a', [2], (it) => { const [count, total] = nums(it.prompt.en) as [number, number]; close(val(it), (count * 100) / total, it.id); });
    each('MS.G5.D1.4.a', [3], (it) => { const [pct] = nums(it.prompt.en) as [number]; expect(rightText(it)).toBe(`${pct} out of every 100 students walk to school`); });
  });
});
