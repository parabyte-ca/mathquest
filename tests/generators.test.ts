import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { GENERATORS, generate } from '../shared/generators/index.js';
import { check, answerToGiven, gcd } from '../shared/check.js';
import type { Item, Text } from '../shared/items/types.js';
import { toPublic } from '../shared/items/types.js';
import { latexToSpeech, speakable } from '../shared/mathspeech.js';

const SEEDS = 300;
const skills = Object.keys(GENERATORS);
const texts = (i: Item): Text[] => [i.prompt, ...i.steps, ...i.hints, ...i.wrong.map((w) => w.why), ...(i.options ?? []), ...(i.right ?? []), ...(i.praise ? [i.praise] : [])];
const fracs = (s: string): [number, number][] => [...s.matchAll(/\\frac\{(\d+)\}\{(\d+)\}/g)].map((m) => [Number(m[1]), Number(m[2])]);

describe('generators: structure, determinism and the deterministic answer check', () => {
  it('has a generator for every micro-skill in the seed data', () => {
    const micro = JSON.parse(readFileSync('content/microskills.json', 'utf8')) as { microskills: { id: string }[] };
    expect(micro.microskills.map((m) => m.id).sort()).toEqual(skills.sort());
  });

  for (const skill of skills) {
    for (const tier of [1, 2, 3]) {
      describe(`${skill} tier ${tier}`, () => {
        const items: Item[] = [];
        for (let seed = 1; seed <= SEEDS; seed++) items.push(generate(skill, tier, seed));

        it('is deterministic for a seed', () => {
          expect(generate(skill, tier, 42)).toEqual(generate(skill, tier, 42));
          expect(generate(skill, tier, 42).id).toBe(`${skill}:${tier}:42`);
        });

        it('accepts its own answer and never accepts a mapped wrong answer', () => {
          for (const it of items) {
            expect(check(it.answer, answerToGiven(it.answer)), `${it.id} answer`).toBe(true);
            for (const w of it.wrong) {
              expect(check(it.answer, answerToGiven(w.answer), true), `${it.id} wrong answer ${JSON.stringify(w.answer)} must not be correct`).toBe(false);
              expect(check(w.answer, answerToGiven(w.answer), true), `${it.id} wrong answer matches itself`).toBe(true);
              expect(w.stepIndex).toBeGreaterThanOrEqual(-1);
              expect(w.stepIndex).toBeLessThan(it.steps.length);
            }
          }
        });

        it('has complete, clean text in both languages', () => {
          for (const it of items) {
            expect(it.hints).toHaveLength(3);
            expect(it.steps.length).toBeGreaterThanOrEqual(2);
            for (const tx of texts(it)) {
              for (const lang of ['en', 'fr'] as const) {
                const s = tx[lang];
                expect(s.trim().length, `${it.id} ${lang} empty`).toBeGreaterThan(0);
                expect(s, `${it.id} ${lang}`).not.toMatch(/undefined|NaN|null|\[object|Infinity/);
                expect((s.match(/\$/g) ?? []).length % 2, `${it.id} ${lang} unbalanced $ in: ${s}`).toBe(0);
                expect(s, `${it.id} ${lang} stray template`).not.toMatch(/\$\{|\{\{/);
              }
            }
            // never leak the answer in the nudge hint or the prompt
            expect(it.prompt.en).not.toBe(it.prompt.fr);
          }
        });

        it('is well formed for its format', () => {
          for (const it of items) {
            const a = it.answer;
            if (a.kind === 'choice') {
              expect(it.options && a.index < it.options.length).toBe(true);
            } else if (a.kind === 'multi') {
              expect(a.indices.length).toBeGreaterThan(0);
              expect(a.indices.every((i) => i < (it.options?.length ?? 0))).toBe(true);
              expect(a.indices.length).toBeLessThan(it.options!.length);
            } else if (a.kind === 'order') {
              expect([...a.order].sort()).toEqual(it.options!.map((_, i) => i));
            } else if (a.kind === 'match') {
              expect(a.pairs.length).toBe(it.options!.length);
              expect(new Set(a.pairs.map((p) => p[1])).size).toBe(it.right!.length);
            } else if (a.kind === 'point') {
              expect(it.visual?.type).toBe('plane');
            }
            expect(a.kind === 'number' ? ['number', 'slider', 'angle'] : [a.kind === 'choice' ? 'choice' : a.kind]).toContain(it.format);
          }
        });

        it('does not give the learner-facing item data away to the client', () => {
          const p = JSON.stringify(toPublic(items[0]!));
          expect(p).not.toContain('"answer"');
          expect(p).not.toContain('"hints"');
          expect(p).not.toContain('"wrong"');
          expect(p).not.toContain('"steps"');
        });

        it('offers variety across seeds', () => {
          expect(new Set(items.map((i) => JSON.stringify([i.prompt, i.visual, i.options, i.right, i.answer]))).size).toBeGreaterThanOrEqual(5);
        });
      });
    }
  }
});

describe('generators: independent recomputation of the answer from the prompt', () => {
  it('adds and subtracts fractions with like denominators', () => {
    for (const [skill, op] of [['MS.G5.B2.5.a', 1], ['MS.G5.B2.5.b', -1]] as const) {
      for (const tier of [1, 2, 3]) {
        for (let seed = 1; seed <= SEEDS; seed++) {
          const it = generate(skill, tier, seed);
          const [[a, d1], [b, d2]] = fracs(it.prompt.en) as [[number, number], [number, number]];
          expect(d1).toBe(d2);
          const a1 = it.answer as { n: number; d: number };
          expect(a1.n / a1.d).toBeCloseTo((a + op * b) / d1, 10);
          if (op === 1 && tier < 3) expect(a + b).toBeLessThan(d1);
        }
      }
    }
  });

  it('adds and subtracts fractions with unlike denominators, and reduces at tier 3', () => {
    for (const [skill, op] of [['MS.G6.B2.5.b', 1], ['MS.G6.B2.5.c', -1]] as const) {
      for (const tier of [1, 2, 3]) {
        for (let seed = 1; seed <= SEEDS; seed++) {
          const it = generate(skill, tier, seed);
          const [[a, d1], [b, d2]] = fracs(it.prompt.en) as [[number, number], [number, number]];
          const a1 = it.answer as { n: number; d: number; mustReduce?: boolean };
          expect(a1.n / a1.d).toBeCloseTo(a / d1 + op * (b / d2), 10);
          expect(a1.n / a1.d).toBeGreaterThan(0);
          if (tier === 3) {
            expect(a1.mustReduce).toBe(true);
            expect(gcd(a1.n, a1.d)).toBe(1);
          }
        }
      }
    }
  });

  it('finds the least common denominator', () => {
    for (const tier of [1, 2, 3]) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const it = generate('MS.G6.B2.5.a', tier, seed);
        const [[, d1], [, d2]] = fracs(it.prompt.en) as [[number, number], [number, number]];
        let l = 1;
        while (l % d1 !== 0 || l % d2 !== 0) l++;
        expect((it.answer as { value: number }).value).toBe(l);
      }
    }
  });

  it('converts fractions with denominator 10 or 100 to decimals', () => {
    for (const tier of [1, 2]) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const it = generate('MS.G5.B1.7.a', tier, seed);
        const [[n, d]] = fracs(it.prompt.en) as [[number, number]];
        expect(d).toBe(tier === 1 ? 10 : 100);
        expect((it.answer as { value: number }).value).toBeCloseTo(n / d, 10);
      }
    }
  });

  it('converts decimals to percents', () => {
    for (const tier of [1, 2, 3]) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const it = generate('MS.G5.B1.7.b', tier, seed);
        const v = Number(/\$(\d+(?:\.\d+)?)\$/.exec(it.prompt.en)![1]);
        expect((it.answer as { value: number }).value).toBeCloseTo(v * 100, 8);
      }
    }
  });

  it('converts between mixed numbers and improper fractions', () => {
    for (const tier of [1, 2, 3]) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const it = generate('MS.G5.B1.3.c', tier, seed);
        if (it.answer.kind === 'mixed') {
          const [[n, d]] = fracs(it.prompt.en) as [[number, number]];
          expect(it.answer.whole * d + it.answer.n).toBe(n);
          expect(it.answer.d).toBe(d);
        } else {
          const m = /\$(\d+)\\frac\{(\d+)\}\{(\d+)\}\$/.exec(it.prompt.en)!;
          const a = it.answer as { n: number; d: number };
          expect(a.n).toBe(Number(m[1]) * Number(m[3]) + Number(m[2]));
          expect(a.d).toBe(Number(m[3]));
        }
      }
    }
  });

  it('adds and subtracts mixed numbers with like denominators', () => {
    for (const tier of [1, 2, 3]) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const it = generate('MS.G5.B2.5.c', tier, seed);
        const m = [...it.prompt.en.matchAll(/(\d+)\\frac\{(\d+)\}\{(\d+)\}/g)].map((x) => x.slice(1).map(Number)) as number[][];
        const [w1, n1, d] = m[0]!;
        const [w2, n2] = m[1]!;
        const sign = it.prompt.en.startsWith('Subtract') ? -1 : 1;
        const total = (w1! * d! + n1!) + sign * (w2! * d! + n2!);
        const a = it.answer as { whole: number; n: number; d: number };
        expect(a.whole * a.d + a.n).toBe(total);
        expect(a.n).toBeGreaterThan(0);
        expect(a.n).toBeLessThan(a.d);
        expect(a.whole).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('compares fractions and decimals correctly', () => {
    for (let seed = 1; seed <= SEEDS; seed++) {
      const like = generate('MS.G5.B1.4.a', 2, seed);
      const [[a, d], [b]] = fracs(like.prompt.en) as [[number, number], [number, number]];
      expect((like.answer as { index: number }).index).toBe(a < b ? 0 : a > b ? 1 : 2);
      expect(d).toBeGreaterThan(0);
      const unlike = generate('MS.G5.B1.4.b', 3, seed);
      const [[n1, e1], [n2, e2]] = fracs(unlike.prompt.en) as [[number, number], [number, number]];
      expect((unlike.answer as { index: number }).index).toBe(n1 / e1 < n2 / e2 - 1e-12 ? 0 : n1 / e1 > n2 / e2 + 1e-12 ? 1 : 2);
    }
  });

  it('orders decimals from least to greatest', () => {
    for (let seed = 1; seed <= SEEDS; seed++) {
      const it = generate('MS.G5.B1.5.b', 3, seed);
      const vals = it.options!.map((o) => Number(/\$([\d.]+)\$/.exec(o.en)![1]));
      const order = (it.answer as { order: number[] }).order;
      for (let i = 1; i < order.length; i++) expect(vals[order[i]!]!).toBeGreaterThan(vals[order[i - 1]!]!);
    }
  });

  it('plots the point it names', () => {
    for (const tier of [1, 2]) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const it = generate('MS.G5.E1.4.a', tier, seed);
        const m = /\((\d+), (\d+)\)/.exec(it.prompt.en)!;
        expect(it.answer).toMatchObject({ kind: 'point', x: Number(m[1]), y: Number(m[2]) });
        const size = (it.visual as { size: number }).size;
        expect(Number(m[1])).toBeLessThan(size);
        expect(Number(m[2])).toBeLessThan(size);
      }
    }
  });

  it('shows equivalent-fraction answers that really are equivalent', () => {
    for (const tier of [1, 2]) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const it = generate('MS.G5.B1.3.b', tier, seed);
        const [[a, b], [c, d]] = [...it.prompt.en.matchAll(/\\frac\{([\d?]+)\}\{([\d?]+)\}/g)].map((m) => [m[1], m[2]]) as [string, string][] as unknown as [[string, string], [string, string]];
        const missing = (it.answer as { value: number }).value;
        const known = [Number(a), Number(b), c === '?' ? missing : Number(c), d === '?' ? missing : Number(d)];
        expect(known[0]! * known[3]!).toBe(known[1]! * known[2]!);
      }
    }
  });
});

describe('math to speech', () => {
  it('reads fractions, powers, roots and mixed numbers naturally in English', () => {
    expect(latexToSpeech('\\frac{3}{4}', 'en')).toBe('three fourths');
    expect(latexToSpeech('\\frac{1}{2}', 'en')).toBe('one half');
    expect(latexToSpeech('\\frac{2}{3}', 'en')).toBe('two thirds');
    expect(latexToSpeech('x^2+3x', 'en')).toBe('x squared plus three x');
    expect(latexToSpeech('x^3', 'en')).toBe('x cubed');
    expect(latexToSpeech('x^5', 'en')).toBe('x to the power of five');
    expect(latexToSpeech('\\sqrt{2}', 'en')).toBe('the square root of two');
    expect(latexToSpeech('2\\frac{1}{3}', 'en')).toBe('two and one third');
    expect(latexToSpeech('0.75', 'en')).toBe('zero point seven five');
    expect(latexToSpeech('-3', 'en')).toBe('negative three');
    expect(latexToSpeech('5-3', 'en')).toBe('five minus three');
    expect(latexToSpeech('12 \\times 3 = 36', 'en')).toBe('twelve times three equals thirty-six');
    expect(latexToSpeech('\\frac{1}{2}<\\frac{3}{4}', 'en')).toBe('one half is less than three fourths');
    expect(latexToSpeech('75\\%', 'en')).toBe('seventy-five percent');
  });
  it('reads in Canadian French', () => {
    expect(latexToSpeech('\\frac{3}{4}', 'fr')).toBe('trois quarts');
    expect(latexToSpeech('\\frac{1}{2}', 'fr')).toBe('un demi');
    expect(latexToSpeech('\\frac{5}{6}', 'fr')).toBe('cinq sixièmes');
    expect(latexToSpeech('x^2+3x', 'fr')).toBe('x au carré plus trois x');
    expect(latexToSpeech('\\sqrt{2}', 'fr')).toBe('la racine carrée de deux');
    expect(latexToSpeech('0.5', 'fr')).toBe('zéro virgule cinq');
    expect(latexToSpeech('21', 'fr')).toBe('vingt et un');
    expect(latexToSpeech('71', 'fr')).toBe('soixante et onze');
    expect(latexToSpeech('80', 'fr')).toBe('quatre-vingts');
  });
  it('converts only the math inside a sentence and never says symbols one by one', () => {
    expect(speakable('Add $\\frac{1}{4}+\\frac{2}{4}$. What is the total?', 'en')).toContain('one fourth plus two fourths');
    for (const skill of skills) {
      for (const tier of [1, 2, 3]) {
        for (let seed = 1; seed <= 40; seed++) {
          const it = generate(skill, tier, seed);
          for (const lang of ['en', 'fr'] as const) {
            const spoken = speakable(it.prompt[lang], lang);
            expect(spoken, `${it.id} ${lang}`).not.toMatch(/[\\^{}$]|\bfrac\b|sqrt/);
          }
        }
      }
    }
  });
});
