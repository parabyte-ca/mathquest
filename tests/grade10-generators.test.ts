import { describe, it, expect } from 'vitest';
import { generate } from '../shared/generators/index.js';
import type { Item } from '../shared/items/types.js';

// Independent check of the Grade 10 (MPM2D and MFM2P) algebra generators: each test reads the English prompt of a generated item,
// recomputes the answer by a different method (evaluating expressions at many points, scanning for roots, Cramer's rule) and compares.

const SEEDS = 250;
const clean = (s: string): string => s.replace(/\\,/g, '').replace(/\\ /g, ' ').replace(/\$/g, '').replace(/\\left|\\right/g, '');
const nums = (s: string): number[] => [...clean(s).matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
const val = (it: Item): number => (it.answer as { value: number }).value;
const idx = (it: Item): number => (it.answer as { index: number }).index;
const rightRaw = (it: Item): string => it.options![idx(it)]!.en;
const each = (skill: string, tiers: number[], fn: (it: Item, tier: number) => void): void => {
  for (const tier of tiers) for (let seed = 1; seed <= SEEDS; seed++) fn(generate(skill, tier, seed), tier);
};
/** Evaluates TeX like "2x^{2} - 3x + 4" or "(x + 2)(3x - 1)" at x (and y). */
const ev = (s: string, x: number, y = 0): number => {
  const js = clean(s).replace(/\^\{2\}/g, '**2').replace(/(\d|\))\s*(x|y|\()/g, '$1*$2').replace(/(x|y)\s*\(/g, '$1*(').replace(/\)\s*\(/g, ')*(').replace(/(\d|x|y|\))\s+(?=[xy\d(])/g, '$1*');
  return new Function('x', 'y', `return ${js};`)(x, y) as number;
};
const POINTS = [-4, -3, -1, 0, 2, 3, 5, 7];
const same = (a: string, b: string): boolean => POINTS.every((x) => ev(a, x) === ev(b, x));
const roots = (eq: string): number[] => { const [l, r] = clean(eq).split('='); return Array.from({ length: 61 }, (_, i) => i - 30).filter((x) => ev(l!, x) === ev(r!, x)); };
/** Two equations "a x + b y = d" or "y = m x + c" as coefficient triples [a, b, d]. */
const eqn = (s: string): [number, number, number] => {
  const [l, r] = clean(s).split('=').map((p) => p.trim()) as [string, string];
  const a = ev(l, 1, 0) - ev(l, 0, 0), b = ev(l, 0, 1) - ev(l, 0, 0), c = ev(l, 0, 0);
  const a2 = ev(r, 1, 0) - ev(r, 0, 0), b2 = ev(r, 0, 1) - ev(r, 0, 0), c2 = ev(r, 0, 0);
  return [a - a2, b - b2, c2 - c];
};
const solve2 = (e1: [number, number, number], e2: [number, number, number]): [number, number] => {
  const det = e1[0] * e2[1] - e2[0] * e1[1];
  return [(e1[2] * e2[1] - e2[2] * e1[1]) / det, (e1[0] * e2[2] - e2[0] * e1[2]) / det];
};
const exprs = (it: Item): string[] => [...it.prompt.en.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]!);
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

describe('Grade 10 quadratic generators compute correct answers', () => {
  for (const [id, hard] of [['MS.G10.MPM2D.A3.1.a', true], ['MS.G10.MFM2P.C1.1.a', false]] as const) {
    it(`expanding (${id})`, () => {
      each(id, [1, 2, 3], (it) => {
        const [prod] = exprs(it) as [string];
        expect(same(prod, rightRaw(it).replace(/\$/g, '')), it.id).toBe(true);
        it.options!.forEach((o, i) => { if (i !== idx(it)) expect(same(prod, o.en), `${it.id} wrong option ${i}`).toBe(false); });
        expect(it.options!.length).toBe(4);
        if (!hard) expect(prod, it.id).not.toMatch(/\([2-9]x/);
      });
    });
  }

  for (const id of ['MS.G10.MPM2D.A3.2.a', 'MS.G10.MFM2P.C1.2.a']) {
    it(`common factors (${id})`, () => {
      each(id, [1, 2, 3], (it) => {
        const [e] = exprs(it) as [string];
        const right = clean(rightRaw(it));
        expect(same(e, right), it.id).toBe(true);
        const m = /^(\d+)(x?)\((.*)\)$/.exec(right)!;
        const inner = m[3]!.replace(/\^\{2\}/g, '');
        const coefs = [...inner.matchAll(/(\d*)x?/g)].map((c) => c[0]).filter(Boolean).map((c) => Number(/\d+/.exec(c)?.[0] ?? 1));
        expect(coefs.reduce(gcd), `${it.id} not fully factored: ${right}`).toBe(1);
        expect(Number(m[1])).toBeGreaterThan(1);
      });
    });
  }

  for (const id of ['MS.G10.MPM2D.A3.3.a', 'MS.G10.MPM2D.A3.4.a', 'MS.G10.MPM2D.A3.5.a', 'MS.G10.MFM2P.C1.3.a']) {
    it(`factoring (${id})`, () => {
      each(id, [1, 2, 3], (it, tier) => {
        if (id.endsWith('A3.5.a') && tier === 3) {
          const ok = it.options!.map((o) => { const m = /^(\d*)x\^\{2\} - (\d+)$/.exec(clean(o.en)); return !!m && Number.isInteger(Math.sqrt(Number(m[1] || 1))) && Number.isInteger(Math.sqrt(Number(m[2]))); });
          expect(ok.filter(Boolean).length, it.id).toBe(1); expect(ok[idx(it)], it.id).toBe(true);
          return;
        }
        const [e] = exprs(it) as [string];
        expect(same(e, rightRaw(it).replace(/\$/g, '')), it.id).toBe(true);
        it.options!.forEach((o, i) => { if (i !== idx(it)) expect(same(e, o.en), `${it.id} option ${i} is also correct`).toBe(false); });
      });
    });
  }

  for (const id of ['MS.G10.MPM2D.A3.6.a', 'MS.G10.MPM2D.A3.7.a']) {
    it(`solving a quadratic: the larger root (${id})`, () => {
      each(id, [1, 2, 3], (it) => {
        const [eq] = exprs(it) as [string];
        const rs = roots(eq);
        expect(rs.length, `${it.id} ${eq}`).toBe(2);
        expect(Math.max(...rs), it.id).toBe(val(it));
      });
    });
  }

  it('the discriminant and the number of real roots', () => {
    const id = 'MS.G10.MPM2D.A3.8.a';
    const label = (D: number): string => (D > 0 ? 'Two different real roots' : D === 0 ? 'Exactly one real root' : 'No real roots');
    each(id, [1], (it) => { const D = nums(it.prompt.en)[0]!; expect(rightRaw(it), it.id).toBe(label(D)); });
    each(id, [2], (it) => {
      const [eq] = exprs(it) as [string];
      const c = ev(eq.split('=')[0]!, 0), a = (ev(eq.split('=')[0]!, 1) + ev(eq.split('=')[0]!, -1)) / 2 - c, b = (ev(eq.split('=')[0]!, 1) - ev(eq.split('=')[0]!, -1)) / 2;
      expect(rightRaw(it), it.id).toBe(label(b * b - 4 * a * c));
    });
    each(id, [3], (it) => { const b = nums(it.prompt.en)[1]!; expect(val(it), it.id).toBe((b * b) / 4); });
  });

  it('completing the square', () => {
    const id = 'MS.G10.MPM2D.A3.9.a';
    each(id, [1], (it) => { const b = nums(it.prompt.en)[1]!; expect(val(it), it.id).toBe((b / 2) ** 2); });
    each(id, [2, 3], (it) => {
      const [e] = exprs(it) as [string];
      const h = (ev(e, 1) - ev(e, -1)) / 4;
      expect(ev(e, 4)).toBe((4 + h) ** 2 + val(it));
      expect(ev(e, -3)).toBe((-3 + h) ** 2 + val(it));
    });
  });
});

describe('Grade 10 linear generators compute correct answers', () => {
  it('substitution', () => {
    each('MS.G10.MPM2D.B1.1.a', [1, 2, 3], (it) => {
      const [e1, e2] = exprs(it) as [string, string];
      const [x] = solve2(eqn(e1), eqn(e2));
      expect(x, it.id).toBe(val(it));
      expect(Number.isInteger(x), it.id).toBe(true);
    });
  });
  it('elimination', () => {
    each('MS.G10.MPM2D.B1.2.a', [1, 2, 3], (it, tier) => {
      const [e1, e2] = exprs(it) as [string, string];
      const [a, b] = [eqn(e1), eqn(e2)];
      const [x, y] = solve2(a, b);
      expect(/What is x\?/.test(it.prompt.en) ? x : y, it.id).toBe(val(it));
      if (tier === 1) expect(a[1] + b[1], it.id).toBe(0);
      if (tier === 2) expect(a[1], it.id).toBe(b[1]);
      if (tier === 3) expect(a[1] === b[1] || a[1] === -b[1], it.id).toBe(false);
    });
  });
  it('system word problems', () => {
    each('MS.G10.MPM2D.B1.3.a', [1, 2], (it) => {
      const [count, p1, p2, total] = nums(it.prompt.en) as [number, number, number, number];
      const y = (p1 * count - total) / (p1 - p2);
      expect(y, it.id).toBe(val(it));
      expect(Number.isInteger(y) && y > 0 && count - y > 0, it.id).toBe(true);
    });
    each('MS.G10.MPM2D.B1.3.a', [3], (it) => { const [s, d] = nums(it.prompt.en) as [number, number]; expect(val(it), it.id).toBe((s + d) / 2); });
  });
  it('point of intersection', () => {
    each('MS.G10.MFM2P.B3.1.a', [1, 2, 3], (it) => {
      const [e1, e2] = exprs(it) as [string, string];
      const [x, y] = solve2(eqn(e1), eqn(e2));
      expect(x, it.id).toBe(val(it)); expect(Number.isInteger(y), it.id).toBe(true);
    });
  });
  it('equations with fractions', () => {
    each('MS.G10.MFM2P.B1.1.a', [1, 2, 3], (it) => {
      const [e] = exprs(it) as [string];
      const x = val(it);
      const fr = (s: string): number => Number(s);
      const t = e.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, (_m, p, q) => `(${fr(p) || p}/${q})`);
      const js = clean(t).replace(/x/g, `(${x})`).replace(/\(\((\d+)\)\/(\d+)\)/g, '($1/$2)');
      const [l, r] = js.replace(/\((\d+)\/(\d+)\)\((-?\d+)\)/g, '($1/$2*$3)').split('=');
      const f = (s: string): number => new Function(`return ${s.replace(/(\d)\(/g, '$1*(').replace(/\)\(/g, ')*(')}`)() as number;
      expect(Math.abs(f(l!) - f(r!)), `${it.id} ${e}`).toBeLessThan(1e-9);
    });
  });
  it('rearranging formulas', () => {
    const calc: Record<string, (g: Record<string, number>) => number> = {
      distance: (g) => g.d! / g.v!, 'area of a rectangle': (g) => g.A! / g.l!, 'perimeter of a rectangle': (g) => (g.P! - 2 * g.l!) / 2,
      'area of a triangle': (g) => (2 * g.A!) / g.b!, 'speed after accelerating': (g) => (g.v! - g.u!) / g.t!,
    };
    each('MS.G10.MFM2P.B1.2.a', [1, 2, 3], (it) => {
      const name = /formula for (.+?) is/.exec(it.prompt.en)![1]!;
      const given: Record<string, number> = {};
      for (const m of it.prompt.en.matchAll(/\$(\w)\$ = \$(\d+)\$/g)) given[m[1]!] = Number(m[2]);
      expect(val(it), it.id).toBe(calc[name]!(given));
      expect(Number.isInteger(val(it)) && val(it) > 0, it.id).toBe(true);
    });
  });
  it('slope', () => {
    each('MS.G10.MFM2P.B2.1.a', [1, 2, 3], (it) => {
      const [x1, y1, x2, y2] = nums(it.prompt.en) as [number, number, number, number];
      expect(val(it), it.id).toBe((y2 - y1) / (x2 - x1));
    });
  });
  it('what the slope and intercept mean', () => {
    each('MS.G10.MFM2P.B2.2.a', [1, 2, 3], (it) => {
      const [m, b, asked] = nums(it.prompt.en.replace(/n \w+s\./, '')) as [number, number, number];
      const right = rightRaw(it);
      const isFixed = /fee|charge|starting|fixed|base/i.test(right) && !/each|price of/.test(right);
      expect(asked === b, it.id).toBe(isFixed);
      void m;
    });
  });
  it('equations of lines', () => {
    each('MS.G10.MFM2P.B2.3.a', [1], (it) => {
      const [x1, y1, x2, y2] = nums(it.prompt.en) as [number, number, number, number];
      const right = clean(rightRaw(it));
      if (y1 === y2) expect(right, it.id).toBe(`y = ${y1}`); else { expect(x1, it.id).toBe(x2); expect(right, it.id).toBe(`x = ${x1}`); }
    });
    each('MS.G10.MFM2P.B2.3.a', [2], (it) => {
      const [x1, y1, x2, y2] = nums(it.prompt.en) as [number, number, number, number];
      const m = (y2 - y1) / (x2 - x1);
      expect(val(it), it.id).toBe(y1 - m * x1);
    });
    each('MS.G10.MFM2P.B2.3.a', [3], (it) => {
      const [x1, y1, x2, y2] = nums(it.prompt.en) as [number, number, number, number];
      const ok = it.options!.map((o) => { const e = clean(o.en).split('=')[1]!; return ev(e, x1) === y1 && ev(e, x2) === y2; });
      expect(ok.filter(Boolean).length, it.id).toBe(1); expect(ok[idx(it)], it.id).toBe(true);
    });
  });
});
