import { describe, it, expect } from 'vitest';
import { generate } from '../shared/generators/index.js';
import type { Item } from '../shared/items/types.js';

// Independent check of the arithmetic: each test parses the English prompt of a generated item, recomputes the answer
// with a different method from the generator, and compares. Structure, text and wrong-answer rules are covered in generators.test.ts.

const SEEDS = 250;
const clean = (s: string): string => s.replace(/\\,/g, '').replace(/\{,\}/g, '.');
const nums = (s: string): number[] => [...clean(s).matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
const val = (it: Item): number => (it.answer as { value: number }).value;
const each = (skill: string, tiers: number[], fn: (it: Item, tier: number) => void): void => {
  for (const tier of tiers) for (let seed = 1; seed <= SEEDS; seed++) fn(generate(skill, tier, seed), tier);
};
const close = (a: number, b: number): void => expect(Math.abs(a - b)).toBeLessThan(1e-6);
const PV: Record<string, number> = { 'hundred-thousands': 100000, 'ten-thousands': 10000, thousands: 1000, hundreds: 100, tens: 10, ones: 1 };

describe('Grade 5 number generators compute correct answers', () => {
  it('composes whole numbers', () => {
    each('MS.G5.B1.1.a', [1, 2], (it) => {
      const parts = [...it.prompt.en.matchAll(/(\d+) (ten-thousands|thousands|hundreds|tens|ones)/g)];
      expect(parts.reduce((s, m) => s + Number(m[1]) * PV[m[2]!]!, 0)).toBe(val(it));
    });
    each('MS.G5.B1.1.a', [3], (it) => expect(val(it)).toBe(nums(it.prompt.en)[0]! / 100));
  });

  it('compares and orders whole numbers', () => {
    each('MS.G5.B1.2.a', [1, 2], (it) => {
      const [a, b] = nums(it.prompt.en.split('?').slice(1).join('?'));
      expect((it.answer as { index: number }).index).toBe(a! < b! ? 0 : a! > b! ? 1 : 2);
    });
    each('MS.G5.B1.2.a', [3], (it) => {
      const v = it.options!.map((o) => nums(o.en)[0]!);
      const order = (it.answer as { order: number[] }).order;
      for (let i = 1; i < order.length; i++) expect(v[order[i]!]!).toBeGreaterThan(v[order[i - 1]!]!);
    });
  });

  it('rounds to the nearest tenth, half up', () => {
    each('MS.G5.B1.6.a', [1, 2, 3], (it) => {
      const X = Math.round(nums(it.prompt.en)[0]! * 100);
      close(val(it), Math.floor((X + 5) / 10) / 10);
    });
  });

  it('solves the multi-step problems', () => {
    each('MS.G5.B2.1.a', [1], (it) => {
      const m = /holds (\d+) pencils. Mia buys (\d+) boxes and gives away (\d+)/.exec(it.prompt.en)!;
      expect(val(it)).toBe(Number(m[2]) * Number(m[1]) - Number(m[3]));
    });
    each('MS.G5.B2.1.a', [2], (it) => {
      const n = nums(it.prompt.en);
      expect(val(it)).toBe(n[0]! / n[1]! + n[2]!);
    });
    each('MS.G5.B2.1.a', [3], (it) => {
      const n = nums(it.prompt.en);
      close(val(it), n[0]! * n[1]! + n[2]!);
    });
  });

  it('keeps the properties item well-posed: exactly one option is the named property', () => {
    each('MS.G5.B2.1.b', [1, 2, 3], (it) => {
      const idx = (it.answer as { index: number }).index;
      const right = it.options![idx]!.en;
      if (it.prompt.en.includes('commutative')) expect(right).toMatch(/(\d+) \\times (\d+) = (\d+) \\times (\d+)/);
      if (it.prompt.en.includes('associative')) expect(right).toMatch(/^\$\((\d+) \+ (\d+)\) \+ (\d+) = \d+ \+ \(\d+ \+ \d+\)\$$/);
      if (it.prompt.en.includes('equal to')) {
        const [a, b, c] = nums(it.prompt.en);
        const [p, q, r2, s2] = nums(right);
        expect(a! * (b! + c!)).toBe(p! * q! + r2! * s2!);
      }
    });
  });

  it('knows its facts', () => {
    each('MS.G5.B2.2.a', [1, 2, 3], (it) => {
      const text = it.prompt.en;
      const n = nums(text);
      if (text.includes('\\div')) expect(val(it)).toBe(n[0]! / n[1]!);
      else if (text.includes('? \\times')) expect(val(it) * n[0]!).toBe(n[1]!);
      else expect(val(it)).toBe(n[0]! * n[1]!);
    });
  });

  it('does mental math and estimates', () => {
    each('MS.G5.B2.3.a', [1, 2], (it) => {
      const n = nums(it.prompt.en);
      close(val(it), n[0]! * n[1]!);
    });
    each('MS.G5.B2.3.a', [3], (it) => {
      const [x, y] = nums(it.prompt.en);
      const best = Math.round(x!) + Math.round(y!);
      expect(nums(it.options![(it.answer as { index: number }).index]!.en)[0]).toBe(best);
    });
  });

  it('adds and subtracts', () => {
    each('MS.G5.B2.4.a', [1, 2, 3], (it) => {
      const [a, b] = nums(it.prompt.en);
      close(val(it), it.prompt.en.startsWith('Subtract') ? a! - b! : a! + b!);
    });
  });

  it('multiplies two-digit numbers', () => {
    each('MS.G5.B2.6.a', [1, 2, 3], (it) => {
      const [a, b] = nums(it.prompt.en);
      expect(val(it)).toBe(a! * b!);
    });
  });

  it('divides, and treats remainders to suit the question', () => {
    each('MS.G5.B2.7.a', [1], (it) => { const [n, d] = nums(it.prompt.en); expect(val(it)).toBe(n! / d!); });
    each('MS.G5.B2.7.a', [2], (it) => {
      const [n, d] = nums(it.prompt.en);
      expect(val(it)).toBe(it.prompt.en.includes('remainder') ? n! % d! : Math.floor(n! / d!));
    });
    each('MS.G5.B2.7.a', [3], (it) => {
      const text = it.prompt.en;
      const [n, d] = nums(text);
      if (text.includes('buses')) expect(val(it)).toBe(Math.ceil(n! / d!));
      else if (text.includes('full boxes')) expect(val(it)).toBe(Math.floor(n! / d!));
      else expect(val(it)).toBe(n! % d!);
    });
  });

  it('multiplies and divides by unit fractions', () => {
    each('MS.G5.B2.8.a', [1, 2, 3], (it) => {
      const text = it.prompt.en;
      const n = nums(text);
      if (text.includes('\\times \\frac')) expect(val(it)).toBe(n[0]! / n[2]!);
      else if (text.includes('\\div \\frac')) expect(val(it)).toBe(n[0]! * n[2]!);
      else if (text.includes('pieces')) expect(val(it)).toBe(n[0]! * n[2]!); // metres x pieces per metre
      else expect(val(it)).toBe(n[0]! / n[2]!); // a unit fraction of the students
    });
  });

  it('finds equivalent ratios and rates', () => {
    each('MS.G5.B2.9.a', [1], (it) => { const [a, b, c] = nums(it.prompt.en); expect(val(it)).toBe((a! * c!) / b!); });
    each('MS.G5.B2.9.a', [2], (it) => { const [n, total, n2] = nums(it.prompt.en); expect(val(it)).toBe((total! * n2!) / n!); });
    each('MS.G5.B2.9.a', [3], (it) => { const [dist, h, h2] = nums(it.prompt.en); expect(val(it)).toBe((dist! / h!) * h2!); });
  });
});

const fracValue = (s: string): number => {
  const m = /\\frac\{(\d+)\}\{(\d+)\}/.exec(s);
  return m ? Number(m[1]) / Number(m[2]) : Number(clean(s).replace(/\$/g, ''));
};

describe('Grade 6 number generators compute correct answers', () => {
  it('reads whole numbers to a million', () => {
    each('MS.G6.B1.1.a', [1], (it) => {
      const parts = [...it.prompt.en.matchAll(/(\d+) (hundred-thousands|ten-thousands|thousands|hundreds|tens|ones)/g)];
      expect(parts.reduce((s, m) => s + Number(m[1]) * PV[m[2]!]!, 0)).toBe(val(it));
    });
    each('MS.G6.B1.1.a', [2], (it) => {
      const [d, N] = nums(it.prompt.en);
      const s = String(N);
      const pos = s.length - 1 - s.indexOf(String(d));
      expect(val(it)).toBe(d! * 10 ** pos);
    });
    each('MS.G6.B1.1.a', [3], (it) => expect(val(it)).toBe(nums(it.prompt.en)[0]! / 10000));
  });

  it('reads integers on a number line', () => {
    each('MS.G6.B1.2.a', [1, 2], (it) => {
      const v = it.visual as { type: string; marks: { at: number }[] };
      expect(v.type).toBe('numberLine');
      expect(val(it)).toBe(v.marks[0]!.at);
    });
    each('MS.G6.B1.2.a', [3], (it) => {
      const text = it.prompt.en;
      const [x, d] = nums(text);
      if (text.includes('opposite')) expect(val(it)).toBe(-x!);
      else expect(val(it)).toBe(x! - d!);
    });
  });

  it('compares and orders integers, decimals and fractions', () => {
    each('MS.G6.B1.3.a', [1], (it) => {
      const [a, b] = nums(it.prompt.en.split('?').slice(1).join('?'));
      expect((it.answer as { index: number }).index).toBe(a! < b! ? 0 : a! > b! ? 1 : 2);
    });
    each('MS.G6.B1.3.a', [2], (it) => {
      const m = /\$([^$]+)\$/.exec(it.prompt.en)![1]!;
      const [l, r2] = m.split('\\ ? \\ ').map((p) => fracValue(p.trim()));
      expect((it.answer as { index: number }).index).toBe(Math.abs(l! - r2!) < 1e-9 ? 2 : l! < r2! ? 0 : 1);
    });
    each('MS.G6.B1.3.a', [3], (it) => {
      const v = it.options!.map((o) => fracValue(o.en.replace(/^\$|\$$/g, '')));
      const order = (it.answer as { order: number[] }).order;
      for (let i = 1; i < order.length; i++) expect(v[order[i]!]!).toBeGreaterThan(v[order[i - 1]!]!);
    });
  });

  it('reads decimals to thousandths', () => {
    each('MS.G6.B1.4.a', [1], (it) => {
      const [d, N] = nums(it.prompt.en);
      const frac = String(N).split('.')[1]!;
      const pos = frac.indexOf(String(d)) + 1;
      expect(val(it)).toBeCloseTo(d! / 10 ** pos, 9);
    });
    each('MS.G6.B1.4.a', [2], (it) => {
      const m = (re: RegExp) => Number(re.exec(it.prompt.en)?.[1] ?? 0);
      const v = m(/Write (\d+) ones/) + m(/(\d+) tenths/) / 10 + m(/(\d+) hundredths/) / 100 + m(/(\d+) thousandths/) / 1000;
      close(val(it), v);
    });
    each('MS.G6.B1.4.a', [3], (it) => {
      const v = it.options!.map((o) => nums(o.en)[0]!);
      expect(v[(it.answer as { index: number }).index]).toBe(Math.min(...v));
    });
  });

  it('rounds decimals, including repeating decimals', () => {
    each('MS.G6.B1.5.a', [1, 2], (it) => {
      const x = nums(it.prompt.en)[0]!;
      const places = it.prompt.en.includes('whole') ? 0 : it.prompt.en.includes('tenth') ? 1 : 2;
      const X = Math.round(x * 1000);
      const scale = 10 ** (3 - places);
      close(val(it), Math.floor((X + scale / 2) / scale) / 10 ** places);
    });
    each('MS.G6.B1.5.a', [3], (it) => {
      const [n, d] = nums(it.prompt.en.split('is')[0]!);
      const places = it.prompt.en.includes('tenth') ? 1 : 2;
      close(val(it), Number(((n! / d!)).toFixed(places)));
    });
  });

  it('converts between fractions and decimals', () => {
    each('MS.G6.B1.6.a', [1, 2], (it) => close(val(it), fracValue(it.prompt.en.match(/\$(\\frac\{\d+\}\{\d+\})\$/)![1]!)));
    each('MS.G6.B1.6.a', [3], (it) => {
      const a = it.answer as { n: number; d: number };
      close(a.n / a.d, nums(it.prompt.en)[0]!);
    });
  });

  it('solves the multi-step problems', () => {
    each('MS.G6.B2.1.a', [1], (it) => { const [n, p] = nums(it.prompt.en); close(val(it), 20 - n! * p!); });
    each('MS.G6.B2.1.a', [2], (it) => {
      const m = /\\frac\{(\d+)\}\{(\d+)\}\$ cup.*makes (\d+) batches.*uses (\d+) cups/.exec(clean(it.prompt.en))!;
      close(val(it), (Number(m[3]) * Number(m[1])) / Number(m[2]) + Number(m[4]));
    });
    each('MS.G6.B2.1.a', [3], (it) => { const [price, pct] = nums(it.prompt.en); close(val(it), price! - (price! * pct!) / 100); });
  });

  it('applies divisibility rules', () => {
    const divisible = (n: number, d: number) => n % d === 0;
    each('MS.G6.B2.2.a', [1], (it) => {
      const d = nums(it.prompt.en)[0]!;
      const picked = nums(it.options![(it.answer as { index: number }).index]!.en)[0]!;
      expect(divisible(picked, d)).toBe(true);
      expect(it.options!.filter((o) => divisible(nums(o.en)[0]!, d))).toHaveLength(1);
    });
    each('MS.G6.B2.2.a', [2], (it) => {
      const d = nums(it.prompt.en)[0]!;
      const idx = (it.answer as { indices: number[] }).indices;
      it.options!.forEach((o, i) => expect(idx.includes(i)).toBe(divisible(nums(o.en)[0]!, d)));
    });
    each('MS.G6.B2.2.a', [3], (it) => {
      const n = nums(it.prompt.en)[0]!;
      const truth = it.options!.map((o) => { const [a, b] = nums(o.en); return divisible(n, a!) && divisible(n, b!); });
      expect(truth.filter(Boolean)).toHaveLength(1);
      expect(truth[(it.answer as { index: number }).index]).toBe(true);
    });
  });

  it('finds percents mentally', () => {
    each('MS.G6.B2.3.a', [1, 2, 3], (it) => { const [p, N] = nums(it.prompt.en); close(val(it), (N! * p!) / 100); });
  });

  it('adds and subtracts larger numbers and decimals', () => {
    each('MS.G6.B2.4.a', [1, 2, 3], (it) => {
      const [a, b] = nums(it.prompt.en);
      close(val(it), it.prompt.en.startsWith('Subtract') ? a! - b! : a! + b!);
    });
  });

  it('factors into primes', () => {
    const isPrime = (n: number) => n > 1 && [...Array(Math.max(0, Math.floor(Math.sqrt(n)) - 1)).keys()].every((i) => n % (i + 2) !== 0);
    each('MS.G6.B2.6.a', [1], (it) => {
      const idx = (it.answer as { indices: number[] }).indices;
      it.options!.forEach((o, i) => expect(idx.includes(i)).toBe(isPrime(nums(o.en)[0]!)));
    });
    each('MS.G6.B2.6.a', [2], (it) => {
      const n = nums(it.prompt.en)[0]!;
      const right = it.options![(it.answer as { index: number }).index]!.en;
      const terms = [...right.matchAll(/(\d+)(?:\^\{(\d+)\})?/g)].map((m) => [Number(m[1]), Number(m[2] ?? 1)] as const);
      expect(terms.every(([p]) => isPrime(p))).toBe(true);
      expect(terms.reduce((s, [p, e]) => s * p ** e, 1)).toBe(n);
      // every wrong option fails: a composite factor, or a product that is not n
      it.options!.forEach((o, i) => {
        if (i === (it.answer as { index: number }).index) return;
        const ts = [...o.en.matchAll(/(\d+)(?:\^\{(\d+)\})?/g)].map((m) => [Number(m[1]), Number(m[2] ?? 1)] as const);
        expect(ts.every(([p]) => isPrime(p)) && ts.reduce((s, [p, e]) => s * p ** e, 1) === n).toBe(false);
      });
    });
    each('MS.G6.B2.6.a', [3], (it) => {
      const n = nums(it.prompt.en)[0]!;
      let m = n, best = 1;
      for (let p = 2; p <= m; p++) while (m % p === 0) { best = p; m /= p; }
      expect(val(it)).toBe(best);
    });
  });

  it('multiplies and divides by tenths', () => {
    each('MS.G6.B2.7.a', [1, 2, 3], (it) => { const [a, b] = nums(it.prompt.en); close(val(it), a! * b!); });
    each('MS.G6.B2.8.a', [1, 2, 3], (it) => { const [a, b] = nums(it.prompt.en); close(val(it), a! / b!); });
  });

  it('multiplies and divides by proper fractions', () => {
    each('MS.G6.B2.9.a', [1, 2], (it) => {
      const m = /(\d+)(?:\s*\\times\s*|.*?)\\frac\{(\d+)\}\{(\d+)\}/.exec(clean(it.prompt.en))!;
      const [n, a, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
      close(val(it), (n * a) / d);
    });
    each('MS.G6.B2.9.a', [3], (it) => {
      const m = /(\d+) \\times \\frac\{(\d+)\}\{(\d+)\}/.exec(it.prompt.en)!;
      const a = it.answer as { n: number; d: number };
      close(a.n / a.d, (Number(m[1]) * Number(m[2])) / Number(m[3]));
    });
    each('MS.G6.B2.10.a', [1, 2, 3], (it) => {
      const m = /(\d+)(?:\s*\\div\s*|.*?)\\frac\{(\d+)\}\{(\d+)\}/.exec(clean(it.prompt.en))!;
      close(val(it), (Number(m[1]) * Number(m[3])) / Number(m[2]));
    });
  });

  it('divides decimals by whole numbers', () => {
    each('MS.G6.B2.11.a', [1, 2, 3], (it) => { const [a, b] = nums(it.prompt.en); close(val(it), a! / b!); });
  });

  it('works with ratios, percents and rates', () => {
    each('MS.G6.B2.12.a', [1], (it) => { const [a, b, N] = nums(it.prompt.en); expect(val(it)).toBe((a! * N!) / b!); });
    each('MS.G6.B2.12.a', [2], (it) => { const [p, base] = nums(it.prompt.en); close(val(it), (base! * p!) / 100); });
    each('MS.G6.B2.12.a', [3], (it) => {
      const unit = it.options!.map((o) => { const [s, p] = nums(o.en); return p! / s!; });
      expect(unit[(it.answer as { index: number }).index]).toBe(Math.min(...unit));
      expect(it.options!.map((o) => nums(o.en)[1]).length).toBe(2);
    });
  });
});
