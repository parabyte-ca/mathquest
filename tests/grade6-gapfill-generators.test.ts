import { describe, it, expect } from 'vitest';
import { generate } from '../shared/generators/index.js';
import type { Item } from '../shared/items/types.js';

// Independent check of the Grade 6 algebra, data and spatial sense generators added in 2.8.1: each test reads the English prompt
// of a generated item, recomputes the answer by a different method and compares it with the stored answer.

const SEEDS = 250;
const clean = (s: string): string => s.replace(/\\,/g, '').replace(/\{,\}/g, '.').replace(/\\ /g, ' ').replace(/\\ldots/g, '').replace(/\\circ/g, '').replace(/\$/g, '');
const nums = (s: string): number[] => [...clean(s).matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
const val = (it: Item): number => (it.answer as { value: number }).value;
const idx = (it: Item): number => (it.answer as { index: number }).index;
const each = (skill: string, tiers: number[], fn: (it: Item, tier: number) => void): void => {
  for (const tier of tiers) for (let seed = 1; seed <= SEEDS; seed++) fn(generate(skill, tier, seed), tier);
};
const close = (a: number, b: number, id = ''): void => expect(Math.abs(a - b), id).toBeLessThan(1e-6);
const diffs = (xs: number[]): number[] => xs.slice(1).map((x, i) => x - xs[i]!);

describe('Grade 6 algebra generators compute correct answers', () => {
  it('kinds of patterns', () => {
    each('MS.G6.C1.1.a', [1], (it) => {
      const all = nums(it.prompt.en); const n = all[all.length - 1]!; const seq = all.slice(0, -1);
      const len = seq.length / 2; const core = seq.slice(0, len);
      expect(seq.slice(len)).toEqual(core);
      // walk the pattern term by term
      let term = 0; for (let i = 1; i <= n; i++) term = core[(i - 1) % len]!;
      close(val(it), term, it.id);
    });
    each('MS.G6.C1.1.a', [2], (it) => { const [start, d, n] = nums(it.prompt.en) as [number, number, number]; let v = start; for (let i = 1; i < n; i++) v -= d; close(val(it), v, it.id); expect(val(it)).toBeGreaterThan(0); });
    each('MS.G6.C1.1.a', [3], (it) => {
      const lin = it.options!.map((o) => { const x = nums(o.en); return new Set(diffs(x)).size === 1; });
      expect(lin.filter(Boolean).length, it.id).toBe(1);
      expect(lin[idx(it)], it.id).toBe(true);
    });
  });

  it('tables and rules', () => {
    each('MS.G6.C1.2.a', [1], (it) => {
      const x = nums(it.prompt.en); const vals = x.slice(4, 8); const n = x[x.length - 1]!;
      const m = vals[1]! - vals[0]!; expect(new Set(diffs(vals)).size).toBe(1);
      close(val(it), vals[0]! + m * (n - 1), it.id);
    });
    each('MS.G6.C1.2.a', [2], (it) => {
      const x = nums(it.prompt.en); const vals = x.slice(4, 8); const m = x[8]!;
      expect(diffs(vals).every((d) => d === m)).toBe(true);
      for (let k = 1; k <= 4; k++) close(m * k + val(it), vals[k - 1]!, it.id);
    });
    each('MS.G6.C1.2.a', [3], (it) => {
      const [v1, n1, v2, n2, v] = nums(it.prompt.en) as [number, number, number, number, number];
      const m = (v2 - v1) / (n2 - n1); expect(Number.isInteger(m)).toBe(true);
      close(v1 + m * (val(it) - n1), v, it.id); expect(Number.isInteger(val(it))).toBe(true);
    });
  });

  it('patterns with decimals', () => {
    each('MS.G6.C1.4.a', [1], (it) => { const [s, d, n] = nums(it.prompt.en) as [number, number, number]; let v = s; for (let i = 1; i < n; i++) v += d; close(val(it), v, it.id); });
    each('MS.G6.C1.4.a', [2], (it) => { const [s, d, n] = nums(it.prompt.en) as [number, number, number]; let v = s; for (let i = 1; i < n; i++) v -= d; close(val(it), v, it.id); expect(val(it)).toBeGreaterThan(0); });
    each('MS.G6.C1.4.a', [3], (it) => { const [m, c, v] = nums(it.prompt.en) as [number, number, number]; close(m * val(it) + c, v, it.id); expect(Number.isInteger(val(it))).toBe(true); });
  });

  it('adds monomials', () => {
    each('MS.G6.C2.1.a', [1], (it) => { const [a, b] = nums(it.prompt.en) as [number, number]; close(val(it), a + b, it.id); });
    each('MS.G6.C2.1.a', [2], (it) => {
      const [a, b, c, x] = nums(it.prompt.en) as [number, number, number, number];
      close(val(it), a * x + b * x + c * x, it.id);
    });
    each('MS.G6.C2.1.a', [3], (it) => {
      const [a, c, b, d, x] = nums(it.prompt.en) as [number, number, number, number, number];
      close(val(it), (a * x + c) + (b * x + d), it.id);
    });
  });
});

describe('Grade 6 data generators compute correct answers', () => {
  const DISCRETE = ['pets in a family', 'goals scored in a game', 'shoes sold', 'students in a class', 'pages in a book', 'coins in a jar'];
  const CONTINUOUS = ['height of a student', 'time to run', 'mass of a backpack', 'temperature outside', 'length of a river', 'volume of juice'];
  const kind = (s: string): 'd' | 'c' => (DISCRETE.some((x) => s.toLowerCase().includes(x)) ? 'd' : CONTINUOUS.some((x) => s.toLowerCase().includes(x)) ? 'c' : (() => { throw new Error(s); })());

  it('discrete and continuous data', () => {
    each('MS.G6.D1.1.a', [1], (it) => {
      const texts = it.options!.map((o) => o.en); const kinds = texts.map(kind);
      expect(kinds.filter((k) => k === 'd').length, it.id).toBe(1);
      expect(kinds[idx(it)]).toBe('d');
    });
    each('MS.G6.D1.1.a', [2], (it) => {
      const texts = it.options!.map((o) => o.en); const kinds = texts.map(kind);
      expect(kinds.filter((k) => k === 'c').length, it.id).toBe(1);
      expect(kinds[idx(it)]).toBe('c');
    });
    each('MS.G6.D1.1.a', [3], (it) => {
      const counted = /how many|counts the goals/i.test(it.prompt.en);
      const right = it.options![idx(it)]!.en;
      expect(right.startsWith(counted ? 'Discrete' : 'Continuous'), it.id).toBe(true);
    });
  });

  it('intervals', () => {
    each('MS.G6.D1.2.a', [1], (it) => {
      const x = nums(it.prompt.en); const data = x.slice(0, 12); const [lo, hi] = x.slice(12) as [number, number];
      expect(hi).toBe(lo! + 9);
      let count = 0; for (const v of data) if (v >= lo! && v <= hi!) count++;
      close(val(it), count, it.id);
    });
    each('MS.G6.D1.2.a', [2], (it) => {
      const [lo, hi, w, start] = nums(it.prompt.en) as [number, number, number, number];
      let count = 0; for (let s = start; s <= hi; s += w) { if (s + w - 1 >= lo) count++; }
      expect(start <= lo && lo < start + w).toBe(true);
      close(val(it), count, it.id);
    });
    each('MS.G6.D1.2.a', [3], (it) => {
      const text = it.prompt.en.replace(/\$/g, '');
      const total = Number(/of (\d+) data values/.exec(text)![1]);
      const counts = [...text.matchAll(/(\d+) to (\d+): (\d+)/g)].map((m) => Number(m[3]));
      expect(counts.reduce((a, b) => a + b, 0)).toBe(total);
      const asked = /interval (\d+) to (\d+)\?/.exec(text)!;
      const k = [...text.matchAll(/(\d+) to (\d+): (\d+)/g)].findIndex((m) => m[1] === asked[1]);
      close(val(it), (counts[k]! / total) * 100, it.id);
    });
  });

  it('choosing a graph', () => {
    const rule = (s: string): string => (/(changed|grew|growth|population|balance.*rising)/i.test(s) ? 'Broken-line graph' : /(percent|parts of one whole|split|part of a class|budget)/i.test(s) ? 'Circle graph' : /(equal intervals|spread|shape)/i.test(s) ? 'Histogram' : /(compare)/i.test(s) ? 'Bar graph' : '?');
    each('MS.G6.D1.3.a', [1, 2, 3], (it) => {
      const right = it.options![idx(it)]!.en;
      expect(right, it.prompt.en).toBe(rule(it.prompt.en));
    });
  });

  it('misleading graphs', () => {
    each('MS.G6.D1.6.a', [1], (it) => { expect(it.options![idx(it)]!.en).toMatch(/does not start at zero/); });
    each('MS.G6.D1.6.a', [2], (it) => {
      const [start, a, b] = nums(it.prompt.en) as [number, number, number];
      close(val(it), (b - start) / (a - start), it.id); expect(Number.isInteger(val(it))).toBe(true);
    });
    each('MS.G6.D1.6.a', [3], (it) => {
      const x = nums(it.prompt.en); const [start, k, a, b] = x as [number, number, number, number];
      expect((b - start) / (a - start)).toBe(k);
      expect(Math.abs(val(it) - ((b - a) / a) * 100)).toBeLessThan(0.0001);
      expect(val(it)).not.toBe((k - 1) * 100);
    });
  });
});

describe('Grade 6 combined transformations compute correct answers', () => {
  it('follows each move in order', () => {
    for (const tier of [1, 2, 3]) {
      each('MS.G6.E1.4.a', [tier], (it) => {
        const text = clean(it.prompt.en);
        const [x0, y0] = nums(text.slice(0, text.indexOf(')') + 1)) as [number, number];
        let x = x0, y = y0;
        const re = /translated (\d+) units (right|left) and (\d+) units (up|down)|reflected in the ([xy])-axis|rotated (\d+)° counterclockwise about the origin/g;
        let m: RegExpExecArray | null; let moves = 0;
        while ((m = re.exec(text))) {
          moves++;
          if (m[1]) { x += (m[2] === 'right' ? 1 : -1) * Number(m[1]); y += (m[4] === 'up' ? 1 : -1) * Number(m[3]); }
          else if (m[5]) { if (m[5] === 'x') y = -y; else x = -x; }
          else { const turns = (Number(m[6]) / 90) % 4; for (let i = 0; i < turns; i++) [x, y] = [-y, x]; }
        }
        expect(moves).toBe(tier === 3 ? 3 : 2);
        const askX = /What is the x-coordinate/.test(text);
        close(val(it), askX ? x : y, it.id);
      });
    }
  });

  it('uses a full 360 degree turn sometimes', () => {
    let full = 0;
    each('MS.G6.E1.4.a', [2, 3], (it) => { if (/360/.test(it.prompt.en)) full++; });
    expect(full).toBeGreaterThan(0);
  });
});
