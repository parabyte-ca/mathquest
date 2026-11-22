import { check, answerToGiven } from '../check.js';
import type { Answer, Category, Format, Item, SliderSpec, Text, Visual, WrongAnswer } from '../items/types.js';

export const t = (en: string, fr: string): Text => ({ en, fr });
/** Wraps TeX in $...$ so the client renders it with KaTeX. */
export const tex = (s: string | number): string => `$${s}$`;
export const frac = (n: number | string, d: number | string): string => `\\frac{${n}}{${d}}`;
export const mixedTex = (w: number, n: number, d: number): string => `${w}${frac(n, d)}`;

export const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
};
export const lcm = (a: number, b: number): number => (a / gcd(a, b)) * b;

/** Joins several Texts into one paragraph (used for the "full worked example" hint). */
export const join = (parts: Text[]): Text => ({ en: parts.map((p) => p.en).join(' '), fr: parts.map((p) => p.fr).join(' ') });

export interface Spec {
  skill: string;
  tier: number;
  seed: number;
  category: Category;
  format: Format;
  prompt: Text;
  visual?: Visual;
  slider?: SliderSpec;
  options?: Text[];
  right?: Text[];
  answer: Answer;
  steps: Text[];
  /** nudge and the first worked step; the third hint is the whole worked example, built from `steps`. */
  nudge: Text;
  stepHint: Text;
  wrong?: WrongAnswer[];
  praise?: Text;
}

const EXPECTED_MS = [0, 25_000, 35_000, 50_000];

/** Assembles an Item with the standard three-rung hint ladder: nudge, worked step, full worked example. */
export function build(s: Spec): Item {
  return {
    id: `${s.skill}:${s.tier}:${s.seed}`,
    skill: s.skill, tier: s.tier, seed: s.seed, category: s.category, format: s.format,
    prompt: s.prompt, visual: s.visual, slider: s.slider, options: s.options, right: s.right, answer: s.answer,
    steps: s.steps,
    hints: [s.nudge, s.stepHint, join(s.steps)],
    wrong: dedupeWrong(s.answer, s.wrong ?? []),
    praise: s.praise,
    expectedMs: EXPECTED_MS[s.tier] ?? 40_000,
  };
}

const sameAnswer = (a: Answer, b: Answer): boolean => JSON.stringify(a) === JSON.stringify(b);

/** A mapped wrong answer must never equal the right one, and each wrong answer appears once. */
function dedupeWrong(correct: Answer, wrong: WrongAnswer[]): WrongAnswer[] {
  const out: WrongAnswer[] = [];
  for (const w of wrong) {
    if (sameAnswer(w.answer, correct) || check(correct, answerToGiven(w.answer), true)) continue;
    if (out.some((o) => sameAnswer(o.answer, w.answer))) continue;
    out.push(w);
  }
  return out;
}

export const frNum = (n: number): string => String(n).replace('.', ',');
