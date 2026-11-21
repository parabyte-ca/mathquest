import { describe, it, expect } from 'vitest';
import { generate } from '../shared/generators/index.js';
import type { Item } from '../shared/items/types.js';

// Independent check of the Grade 6 financial literacy generators (2.8.1): each test reads the English prompt of a generated
// item, recomputes the answer by a different method and compares it with the stored answer.

const SEEDS = 250;
const clean = (s: string): string => s.replace(/\\,/g, '').replace(/\{,\}/g, '.').replace(/\\ /g, ' ').replace(/\$/g, '');
const nums = (s: string): number[] => [...clean(s).matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
const val = (it: Item): number => (it.answer as { value: number }).value;
const each = (skill: string, tiers: number[], fn: (it: Item, tier: number) => void): void => {
  for (const tier of tiers) for (let seed = 1; seed <= SEEDS; seed++) fn(generate(skill, tier, seed), tier);
};
const close = (a: number, b: number, id = ''): void => expect(Math.abs(a - b), id).toBeLessThan(1e-6);

describe('Grade 6 financial literacy generators compute correct answers', () => {
  it('payment methods', () => {
    each('MS.G6.F1.1.a', [1], (it) => { const [price, bill] = nums(it.prompt.en) as [number, number]; close(val(it), bill - price, it.id); expect(val(it)).toBeGreaterThan(0); });
    each('MS.G6.F1.1.a', [2], (it) => { const [balance, a, b] = nums(it.prompt.en) as [number, number, number]; close(val(it), balance - a - b, it.id); expect(val(it)).toBeGreaterThan(0); });
    each('MS.G6.F1.1.a', [3], (it) => { const [price, rate, flat] = nums(it.prompt.en) as [number, number, number]; close(val(it), (price * rate) / 100 - flat, it.id); expect(val(it)).toBeGreaterThan(0); });
  });

  it('financial goals', () => {
    each('MS.G6.F1.2.a', [1], (it) => { const [goal, s] = nums(it.prompt.en) as [number, number]; close(val(it) * s, goal, it.id); expect(Number.isInteger(val(it))).toBe(true); });
    each('MS.G6.F1.2.a', [2], (it) => { const [goal, a, s] = nums(it.prompt.en) as [number, number, number]; close(a + val(it) * s, goal, it.id); expect(Number.isInteger(val(it))).toBe(true); });
    each('MS.G6.F1.2.a', [3], (it) => { const [goal, a, s, e] = nums(it.prompt.en) as [number, number, number, number]; close(a + val(it) * (s + e), goal, it.id); expect(Number.isInteger(val(it))).toBe(true); });
  });

  it('factors that help or interfere', () => {
    each('MS.G6.F1.3.a', [1], (it) => { const [income, spend] = nums(it.prompt.en) as [number, number]; close(val(it), income - spend, it.id); expect(val(it)).toBeGreaterThan(0); });
    each('MS.G6.F1.3.a', [2], (it) => {
      const [goal, s, e] = nums(it.prompt.en) as [number, number, number];
      // brute force: count the weeks week by week
      let w1 = 0, saved = 0; while (saved < goal) { saved += s; w1++; }
      let w2 = 0; saved = 0; while (saved < goal) { saved += s + e; w2++; }
      expect(goal % s).toBe(0); expect(goal % (s + e)).toBe(0);
      close(val(it), w1 - w2, it.id); expect(val(it)).toBeGreaterThan(0);
    });
    each('MS.G6.F1.3.a', [3], (it) => {
      const [goal, s, x] = nums(it.prompt.en) as [number, number, number];
      let w1 = 0, saved = 0; while (saved < goal) { saved += s; w1++; }
      let w2 = 0; saved = 0; while (saved < goal) { saved += s - x; w2++; }
      expect(goal % s).toBe(0); expect(goal % (s - x)).toBe(0);
      close(val(it), w2 - w1, it.id); expect(val(it)).toBeGreaterThan(0);
    });
  });

  it('trading, lending, borrowing and donating', () => {
    each('MS.G6.F1.5.a', [1], (it) => { const [earn, pct] = nums(it.prompt.en) as [number, number]; close(val(it), earn * (pct / 100), it.id); });
    each('MS.G6.F1.5.a', [2], (it) => { const [B, rep, n] = nums(it.prompt.en) as [number, number, number]; let owed = B; for (let i = 0; i < n; i++) owed -= rep; close(val(it), owed, it.id); expect(val(it)).toBeGreaterThan(0); });
    each('MS.G6.F1.5.a', [3], (it) => { const [n, x, y] = nums(it.prompt.en) as [number, number, number]; close(val(it) * y, n * x, it.id); expect(Number.isInteger(val(it))).toBe(true); });
  });

  it('exercises both wordings of the loan question', () => {
    const wordings = new Set<string>();
    each('MS.G6.F1.5.a', [2], (it) => { wordings.add(it.prompt.en.startsWith('You lend') ? 'lend' : 'borrow'); });
    expect([...wordings].sort()).toEqual(['borrow', 'lend']);
  });
});
