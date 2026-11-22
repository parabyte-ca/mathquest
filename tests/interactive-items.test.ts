import { describe, it, expect } from 'vitest';
import { generate } from '../shared/generators/index.js';
import { check } from '../shared/check.js';
import { toPublic, type Item } from '../shared/items/types.js';

const SEEDS = Array.from({ length: 40 }, (_, i) => i + 1);
const nums = (s: string): number[] => [...s.matchAll(/\$(-?\d+(?:\.\d+)?)\$/g)].map((m) => Number(m[1]));
const value = (it: Item): number => (it.answer as { value: number }).value;
const tol = (it: Item): number => (it.answer as { absTolerance?: number }).absTolerance ?? 0;
const give = (n: number) => ({ kind: 'number' as const, text: String(n) });

describe('protractor items', () => {
  it('read: the answer is the arm drawn on the protractor, checked within the tolerance, and the other scale is a mapped wrong answer', () => {
    for (const tier of [1, 2, 3]) for (const seed of SEEDS) {
      const it = generate('MS.G5.E2.4.b', tier, seed);
      expect(it.format).toBe('number');
      const v = it.visual as { type: string; angle: number; flip?: boolean };
      expect(v.type).toBe('protractor');
      expect(value(it)).toBe(v.angle);
      expect(v.angle).toBeGreaterThan(0);
      expect(v.angle).toBeLessThan(180);
      if (tier === 1) expect(v.angle % 10).toBe(0);
      if (tier === 2) expect(v.angle % 5).toBe(0);
      if (tier === 1) expect(v.flip).toBe(false);
      if (v.angle !== 90) expect(it.wrong.map((w) => (w.answer as { value: number }).value)).toContain(180 - v.angle);
      expect(check(it.answer, give(v.angle))).toBe(true);
      expect(check(it.answer, give(v.angle + tol(it) + 1), true)).toBe(false);
      if (tol(it) > 0) expect(check(it.answer, give(v.angle + tol(it)))).toBe(true);
    }
  });

  it('draw: the prompt names the angle, the picture shows no arm, and the public item gives nothing away', () => {
    const flips = new Set<boolean>();
    for (const tier of [1, 2, 3]) for (const seed of SEEDS) {
      const it = generate('MS.G5.E2.4.c', tier, seed);
      expect(it.format).toBe('angle');
      expect(nums(it.prompt.en)).toEqual([value(it)]);
      expect(nums(it.prompt.fr)).toEqual([value(it)]);
      const v = it.visual as { type: string; angle?: number; flip?: boolean };
      expect(v.type).toBe('protractor');
      expect(v.angle).toBeUndefined();
      flips.add(!!v.flip);
      expect(tol(it)).toBeGreaterThanOrEqual(2);
      expect(check(it.answer, give(value(it) + tol(it)))).toBe(true);
      expect(check(it.answer, give(value(it) + tol(it) + 1), true)).toBe(false);
      expect(check(it.answer, give(180 - value(it)), true)).toBe(Math.abs(180 - 2 * value(it)) <= tol(it));
      const pub = JSON.stringify(toPublic(it));
      expect(pub).not.toContain('"answer"');
      expect(pub).not.toContain('"angle":');
    }
    expect(flips.has(true) && flips.has(false)).toBe(true);
  });
});

describe('slider items', () => {
  const sliderOf = (it: Item) => it.slider!;
  const aligned = (n: number, s: { min: number; step: number }) => Math.abs((n - s.min) / s.step - Math.round((n - s.min) / s.step)) < 1e-9;

  it('integer placement: the prompt (or the move it describes) gives the answer, the slider can reach it and the picture has no marker', () => {
    for (const tier of [1, 2, 3]) for (const seed of SEEDS) {
      const it = generate('MS.G6.B1.2.b', tier, seed);
      expect(it.format).toBe('slider');
      const s = sliderOf(it);
      expect(s.step).toBe(1);
      expect(value(it)).toBeGreaterThanOrEqual(s.min);
      expect(value(it)).toBeLessThanOrEqual(s.max);
      expect(aligned(value(it), s)).toBe(true);
      const found = nums(it.prompt.en);
      if (tier < 3) expect(found).toEqual([value(it)]);
      else {
        const [start] = found as [number];
        const d = Number(/move (\d+) units/.exec(it.prompt.en)![1]);
        expect(value(it)).toBe(/to the left/.test(it.prompt.en) ? start - d : start + d);
      }
      const v = it.visual as { type: string; min: number; max: number; marks?: unknown[] };
      expect(v.type).toBe('numberLine');
      expect(v.marks).toBeUndefined();
      expect([v.min, v.max]).toEqual([s.min, s.max]);
      expect(check(it.answer, give(value(it)))).toBe(true);
      expect(check(it.answer, give(value(it) + 1), true)).toBe(false);
    }
  });

  it('percent: the answer is the fraction or decimal as a percent, on a slider that can reach it', () => {
    for (const tier of [1, 2, 3]) for (const seed of SEEDS) {
      const it = generate('MS.G7.B2.2.b', tier, seed);
      expect(it.format).toBe('slider');
      const s = sliderOf(it);
      expect(s).toMatchObject({ min: 0, max: 100, unit: '%' });
      expect(aligned(value(it), s)).toBe(true);
      const m = /\\frac\{(\d+)\}\{(\d+)\}/.exec(it.prompt.en);
      if (m) expect(value(it)).toBeCloseTo((Number(m[1]) * 100) / Number(m[2]), 9);
      else expect(value(it)).toBeCloseTo(nums(it.prompt.en)[0]! * 100, 9);
      expect(check(it.answer, give(value(it)))).toBe(true);
      for (const w of it.wrong) expect(check(it.answer, { kind: 'number', text: String((w.answer as { value: number }).value) }, true)).toBe(false);
    }
  });
});
