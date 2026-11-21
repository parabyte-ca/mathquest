import { describe, it, expect } from 'vitest';
import { generate } from '../shared/generators/index.js';
import type { Item } from '../shared/items/types.js';

// Independent check of the Grade 7 strands C to F: each test reads the English prompt of a generated item, recomputes the answer
// by a different method (brute force, exact fractions, direct formulas) and compares it with the stored answer.

const SEEDS = 250;
const clean = (s: string): string => s.replace(/\\,/g, '').replace(/\{,\}/g, '.');
const nums = (s: string): number[] => [...clean(s).matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
const val = (it: Item): number => (it.answer as { value: number }).value;
const each = (skill: string, tiers: number[], fn: (it: Item, tier: number) => void): void => {
  for (const tier of tiers) for (let seed = 1; seed <= SEEDS; seed++) fn(generate(skill, tier, seed), tier);
};
const close = (a: number, b: number, id = ''): void => expect(Math.abs(a - b), id).toBeLessThan(1e-6);
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const sameFraction = (it: Item, n: number, d: number): void => {
  const a = it.answer as { n: number; d: number };
  expect(a.n * d, it.id).toBe(n * a.d);
  expect(gcd(a.n, a.d), it.id).toBe(1);
};
const PI = 3.14;

describe('Grade 7 algebra generators compute correct answers', () => {
  it('compares growing patterns', () => {
    each('MS.G7.C1.1.a', [1, 3], (it) => {
      const [s1, d1, s2, d2] = nums(it.prompt.en) as [number, number, number, number];
      close(s1 + d1 * val(it), s2 + d2 * val(it), it.id);
      expect(val(it)).toBeGreaterThan(0);
    });
    each('MS.G7.C1.1.a', [2], (it) => {
      const [s1, d1, s2, d2, w] = nums(it.prompt.en) as [number, number, number, number, number];
      close(val(it), Math.abs(s1 + d1 * w - (s2 + d2 * w)), it.id);
    });
  });

  it('uses pattern rules and solves for the unknown', () => {
    each('MS.G7.C1.3.a', [1], (it) => { const [a, b, n] = nums(it.prompt.en) as [number, number, number]; expect(val(it)).toBe(a * n + b); });
    each('MS.G7.C1.3.a', [2], (it) => { const [a, b, V] = nums(it.prompt.en) as [number, number, number]; expect(a * val(it) + b).toBe(V); });
    each('MS.G7.C1.3.a', [3], (it) => {
      const [x1, v1, x2, v2, T] = nums(it.prompt.en) as [number, number, number, number, number];
      expect(val(it)).toBe(v1 + ((v2 - v1) / (x2 - x1)) * (T - x1));
    });
  });

  it('continues integer patterns', () => {
    each('MS.G7.C1.4.a', [1], (it) => { const v = nums(it.prompt.en); expect(val(it)).toBe(v[3]! + (v[1]! - v[0]!)); });
    each('MS.G7.C1.4.a', [2], (it) => { const v = nums(it.prompt.en); expect(val(it)).toBe(v[0]! + (v[1]! - v[0]!) * (v[4]! - 1)); });
    each('MS.G7.C1.4.a', [3], (it) => { const [, s, d, n] = nums(it.prompt.en) as [number, number, number, number]; expect(val(it)).toBe(s - d * (n - 1)); });
  });

  it('adds and subtracts like terms', () => {
    each('MS.G7.C2.1.a', [1], (it) => { const [a, b] = nums(it.prompt.en) as [number, number]; expect(val(it)).toBe(a + b); });
    each('MS.G7.C2.1.a', [2], (it) => { const [a, b, c] = nums(it.prompt.en) as [number, number, number]; expect(val(it)).toBe(a - b + c); });
    each('MS.G7.C2.1.a', [3], (it) => {
      const m = /\$(\d+)x \+ (\d+) \+ (\d+)x - (\d+)\$, then find its value when x = \$(\d+)\$/.exec(it.prompt.en)!;
      const [a, b, c, d, x] = m.slice(1).map(Number) as [number, number, number, number, number];
      expect(val(it)).toBe(a * x + b + c * x - d);
    });
  });

  it('evaluates expressions with decimals', () => {
    each('MS.G7.C2.2.a', [1], (it) => { const [a, n] = nums(it.prompt.en) as [number, number]; close(val(it), a * n, it.id); });
    each('MS.G7.C2.2.a', [2], (it) => { const [a, b, n] = nums(it.prompt.en) as [number, number, number]; close(val(it), a * n + b, it.id); });
    each('MS.G7.C2.2.a', [3], (it) => { const [a, b, x, y] = nums(it.prompt.en) as [number, number, number, number]; close(val(it), a * x - b * y, it.id); });
  });

  it('solves multi-term equations (checked by substitution)', () => {
    each('MS.G7.C2.3.a', [1, 2], (it) => { const [a, b, c] = nums(it.prompt.en.replace('Solve ', '')) as [number, number, number]; close(a * val(it) + b, c, it.id); });
    each('MS.G7.C2.3.a', [3], (it) => { const [a, b, c, d] = nums(it.prompt.en) as [number, number, number, number]; close(a * val(it) + b, c * val(it) + d, it.id); });
  });

  it('solves inequalities (brute force over whole numbers)', () => {
    each('MS.G7.C2.4.a', [1, 2, 3], (it) => {
      const m = /\$(\d+)x ([+-]) (\d+) (<|\\leq|>) (\d+)\$/.exec(it.prompt.en)!;
      const a = Number(m[1]), b = Number(m[3]), c = Number(m[5]);
      const holds = (x: number): boolean => { const v = m[2] === '+' ? a * x + b : a * x - b; return m[4] === '<' ? v < c : m[4] === '>' ? v > c : v <= c; };
      if (/greatest/.test(it.prompt.en)) { let best = -1; for (let x = 0; x <= 200; x++) if (holds(x)) best = x; expect(val(it), it.id).toBe(best); expect(holds(val(it) + 1)).toBe(false); }
      else { let least = -1; for (let x = 0; x <= 200; x++) if (holds(x)) { least = x; break; } expect(val(it), it.id).toBe(least); }
    });
  });
});

describe('Grade 7 data generators compute correct answers', () => {
  it('uses percentages to organize data', () => {
    each('MS.G7.D1.2.a', [1], (it) => { const [N, k] = nums(it.prompt.en) as [number, number]; close(val(it), (k / N) * 100, it.id); });
    each('MS.G7.D1.2.a', [2], (it) => { const [N, p] = nums(it.prompt.en) as [number, number]; close(val(it), (N * p) / 100, it.id); });
    each('MS.G7.D1.2.a', [3], (it) => { const [N, a, b] = nums(it.prompt.en) as [number, number, number]; close(val(it), (N * (100 - a - b)) / 100, it.id); });
  });

  it('relates circle graph percents, counts and angles', () => {
    each('MS.G7.D1.3.a', [1], (it) => { close(val(it), (nums(it.prompt.en)[0]! / 100) * 360, it.id); });
    each('MS.G7.D1.3.a', [2], (it) => { close(val(it), (nums(it.prompt.en)[0]! / 360) * 100, it.id); });
    each('MS.G7.D1.3.a', [3], (it) => { const [k, N] = nums(it.prompt.en) as [number, number]; close(val(it), (k / N) * 360, it.id); });
  });

  it('tracks how the mean changes', () => {
    each('MS.G7.D1.5.a', [1], (it) => { const [n, m, v] = nums(it.prompt.en) as [number, number, number]; close(val(it), (n * m + v) / (n + 1), it.id); });
    each('MS.G7.D1.5.a', [2], (it) => { const [n, m, v] = nums(it.prompt.en) as [number, number, number]; close(val(it), (n * m - v) / (n - 1), it.id); });
    each('MS.G7.D1.5.a', [3], (it) => {
      const [n, m, goal] = nums(it.prompt.en) as [number, number, number];
      close((n * m + val(it)) / (n + 1), goal, it.id);
    });
  });

  it('multiplies probabilities of independent and dependent events exactly', () => {
    each('MS.G7.D2.1.a', [1], (it) => { const [red, blue] = nums(it.prompt.en) as [number, number]; const N = red + blue; sameFraction(it, red * red, N * N); });
    each('MS.G7.D2.1.a', [2], (it) => { const [red, blue] = nums(it.prompt.en) as [number, number]; const N = red + blue; sameFraction(it, red * (red - 1), N * (N - 1)); });
    each('MS.G7.D2.1.a', [3], (it) => { const [red, blue] = nums(it.prompt.en) as [number, number]; const N = red + blue; sameFraction(it, red * blue, N * (N - 1)); });
  });

  it('compares theoretical and experimental probability', () => {
    each('MS.G7.D2.2.a', [1], (it) => { const [sections, shaded, spins] = nums(it.prompt.en) as [number, number, number]; close(val(it), (spins * shaded) / sections, it.id); });
    each('MS.G7.D2.2.a', [2], (it) => { const [N, k] = nums(it.prompt.en) as [number, number]; close(val(it), (k / N) * 100, it.id); });
    each('MS.G7.D2.2.a', [3], (it) => { const [, , N, k] = nums(it.prompt.en) as number[]; close(val(it), k! - N! / 4, it.id); });
  });
});

describe('Grade 7 spatial sense generators compute correct answers', () => {
  it('counts faces, vertices and edges, and the solids obey Euler\'s formula', () => {
    const count = (kind: string, shape: string, n: number): number =>
      kind === 'faces' ? (shape === 'prism' ? n + 2 : n + 1) : kind === 'vertices' ? (shape === 'prism' ? 2 * n : n + 1) : shape === 'prism' ? 3 * n : 2 * n;
    for (const shape of ['prism', 'pyramid']) for (let n = 3; n <= 8; n++) expect(count('faces', shape, n) + count('vertices', shape, n) - count('edges', shape, n)).toBe(2);
    each('MS.G7.E1.1.a', [1, 2, 3], (it) => {
      const m = /How many (faces|vertices|edges) does a (prism|pyramid) whose base has (\d+) sides have\?/.exec(it.prompt.en.replace(/\$/g, ''));
      if (m) { expect(val(it), it.id).toBe(count(m[1]!, m[2]!, Number(m[3]))); return; }
      const r = /A (prism|pyramid) has (\d+) edges/.exec(it.prompt.en.replace(/\$/g, ''))!;
      expect(count('edges', r[1]!, val(it)), it.id).toBe(Number(r[2]));
    });
  });

  it('dilates and scales', () => {
    each('MS.G7.E1.3.a', [1], (it) => { const [side, newSide] = nums(it.prompt.en) as [number, number]; expect(val(it) * side).toBe(newSide); });
    each('MS.G7.E1.3.a', [2], (it) => { const [side, k] = nums(it.prompt.en) as [number, number]; close(val(it), side * k, it.id); });
    each('MS.G7.E1.3.a', [3], (it) => { const [a, b, other] = nums(it.prompt.en) as [number, number, number]; close(val(it) / other, b / a, it.id); });
  });

  it('transforms points on the plane', () => {
    each('MS.G7.E1.4.a', [1, 2, 3], (it) => {
      const p = /\$\((-?\d+),\\ (-?\d+)\)\$/.exec(clean(it.prompt.en))!;
      const x = Number(p[1]), y = Number(p[2]);
      let nx = x, ny = y;
      const tr = /translated (\d+) units (right|left) and (\d+) units (up|down)/.exec(it.prompt.en.replace(/\$/g, ''));
      if (tr) { nx = x + (tr[2] === 'right' ? 1 : -1) * Number(tr[1]); ny = y + (tr[4] === 'up' ? 1 : -1) * Number(tr[3]); }
      else if (/reflected in the y-axis/.test(it.prompt.en)) nx = -x;
      else if (/reflected in the x-axis/.test(it.prompt.en)) ny = -y;
      else if (/90° counterclockwise/.test(it.prompt.en)) { nx = -y; ny = x; }
      else if (/180°/.test(it.prompt.en)) { nx = -x; ny = -y; }
      else throw new Error(`unknown transformation: ${it.prompt.en}`);
      expect(val(it), it.id).toBe(/x-coordinate of the image/.test(it.prompt.en) ? nx : ny);
    });
  });

  it('relates volume and capacity', () => {
    each('MS.G7.E2.1.a', [1], (it) => { const [l, w, h] = nums(it.prompt.en) as [number, number, number]; expect(val(it)).toBe(l * w * h); });
    each('MS.G7.E2.1.a', [2], (it) => { const [l, w, h] = nums(it.prompt.en) as [number, number, number]; close(val(it), (l * w * h) / 1000, it.id); });
    each('MS.G7.E2.1.a', [3], (it) => { const [A, mL] = nums(it.prompt.en) as [number, number]; expect(val(it) * A).toBe(mL); });
  });

  it('converts units in area and volume', () => {
    each('MS.G7.E2.2.a', [1], (it) => close(val(it), nums(it.prompt.en)[0]! * 100 * 100, it.id));
    each('MS.G7.E2.2.a', [2], (it) => expect(val(it)).toBe(nums(it.prompt.en)[0]! * 100 ** 3));
    each('MS.G7.E2.2.a', [3], (it) => {
      const [L, W, tile] = nums(it.prompt.en) as [number, number, number];
      expect(val(it) * tile * tile).toBe(L * 100 * W * 100);
    });
  });

  it('works out circumference, area, surface area and volume with pi = 3.14', () => {
    each('MS.G7.E2.3.a', [1], (it) => close(val(it), PI * nums(it.prompt.en)[0]!, it.id));
    each('MS.G7.E2.3.a', [2], (it) => close(val(it), 2 * PI * nums(it.prompt.en)[0]!, it.id));
    each('MS.G7.E2.3.a', [3], (it) => close(val(it) * PI, nums(it.prompt.en)[0]!, it.id));
    each('MS.G7.E2.5.a', [1], (it) => close(val(it), PI * nums(it.prompt.en)[0]! ** 2, it.id));
    each('MS.G7.E2.5.a', [2], (it) => close(val(it), PI * (nums(it.prompt.en)[0]! / 2) ** 2, it.id));
    each('MS.G7.E2.5.a', [3], (it) => close(val(it), (PI * nums(it.prompt.en)[0]! ** 2) / 2, it.id));
    each('MS.G7.E2.6.a', [1], (it) => { const [d, h] = nums(it.prompt.en) as [number, number]; close(val(it), PI * d * h, it.id); });
    each('MS.G7.E2.6.a', [2], (it) => { const [r, h] = nums(it.prompt.en) as [number, number]; close(val(it), 2 * PI * r * r + 2 * PI * r * h, it.id); });
    each('MS.G7.E2.6.a', [3], (it) => { const [d, h] = nums(it.prompt.en) as [number, number]; close(val(it), 2 * PI * (d / 2) ** 2 + PI * d * h, it.id); });
    each('MS.G7.E2.7.a', [1], (it) => { const [l, w, h] = nums(it.prompt.en) as [number, number, number]; expect(val(it)).toBe(l * w * h); });
    each('MS.G7.E2.7.a', [2], (it) => { const [b, ht, len] = nums(it.prompt.en) as [number, number, number]; close(val(it), (b * ht * len) / 2, it.id); });
    each('MS.G7.E2.7.a', [3], (it) => { const [V, A] = nums(it.prompt.en) as [number, number]; expect(val(it) * A).toBe(V); });
    each('MS.G7.E2.7.b', [1], (it) => { const [r, h] = nums(it.prompt.en) as [number, number]; close(val(it), PI * r * r * h, it.id); });
    each('MS.G7.E2.7.b', [2], (it) => { const [d, h] = nums(it.prompt.en) as [number, number]; close(val(it), PI * (d / 2) ** 2 * h, it.id); });
    each('MS.G7.E2.7.b', [3], (it) => { const [r, V] = nums(it.prompt.en) as [number, number]; close(PI * r * r * val(it), V, it.id); });
  });
});

describe('Grade 7 financial literacy generators compute correct answers', () => {
  it('converts currency', () => {
    each('MS.G7.F1.1.a', [1], (it) => { const [, rate, c] = nums(it.prompt.en) as [number, number, number]; close(val(it), c * rate, it.id); });
    each('MS.G7.F1.1.a', [2], (it) => { const [, rate, us] = nums(it.prompt.en) as [number, number, number]; close(val(it) * rate, us, it.id); });
    each('MS.G7.F1.1.a', [3], (it) => { const [us, , rate] = nums(it.prompt.en) as [number, number, number]; close(val(it), us * rate, it.id); });
  });

  it('adjusts budgets', () => {
    each('MS.G7.F1.3.a', [1], (it) => { const [i, a, b, c] = nums(it.prompt.en) as [number, number, number, number]; expect(val(it)).toBe(i - a - b - c); });
    each('MS.G7.F1.3.a', [2], (it) => { const [i, n, w] = nums(it.prompt.en) as [number, number, number]; close(val(it), (i * (100 - n - w)) / 100, it.id); });
    each('MS.G7.F1.3.a', [3], (it) => { const [i, rent, other, pct] = nums(it.prompt.en) as [number, number, number, number]; close(val(it), i - rent * (1 + pct / 100) - other, it.id); });
  });

  it('works out simple and compound interest', () => {
    each('MS.G7.F1.5.a', [1], (it) => { const [P, rate, years] = nums(it.prompt.en) as [number, number, number]; close(val(it), (P * rate * years) / 100, it.id); });
    each('MS.G7.F1.5.a', [2], (it) => { const [P, rate, years] = nums(it.prompt.en) as [number, number, number]; close(val(it), P + (P * rate * years) / 100, it.id); });
    each('MS.G7.F1.5.a', [3], (it) => {
      const [P, rate] = nums(it.prompt.en) as [number, number];
      let amount = P; for (let y = 0; y < 2; y++) amount *= 1 + rate / 100;
      close(val(it), Math.round(amount * 100) / 100, it.id);
    });
  });

  it('compares accounts and loans', () => {
    each('MS.G7.F1.6.a', [1], (it) => { const [a, b, P, years] = nums(it.prompt.en) as [number, number, number, number]; close(val(it), (P * b * years) / 100 - (P * a * years) / 100, it.id); });
    each('MS.G7.F1.6.a', [2], (it) => { const [P, years, a, b] = nums(it.prompt.en) as [number, number, number, number]; close(val(it), (P * b * years) / 100 - (P * a * years) / 100, it.id); });
    each('MS.G7.F1.6.a', [3], (it) => {
      const [P, rate] = nums(it.prompt.en) as [number, number];
      const compound = P * (1 + rate / 100) ** 2 - P;
      close(val(it), Math.round((compound - (P * rate * 2) / 100) * 100) / 100, it.id);
    });
  });
});
