// A small toolkit for writing generators: bilingual text with correct number formatting, and a one-call builder for the
// common "type a number" item. Numbers inside prompts are TeX so they render and are read aloud the same way in both languages.
import { makeRng, type Rng } from '../rng.js';
import type { Category, Generator, Text, Visual } from '../items/types.js';
import { build } from './kit.js';

export type Lang = 'en' | 'fr';
const round6 = (x: number): number => Math.round(x * 1e6) / 1e6;
export const r6 = round6;

/** TeX for a number: thin-space digit groups from 10 000 up, decimal point in English and decimal comma in French. */
export function numTex(x: number, lang: Lang): string {
  const v = round6(x);
  const [i, d] = String(Math.abs(v)).split('.') as [string, string | undefined];
  const int = Math.abs(v) >= 10000 ? i.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : i;
  const body = d ? `${int}${lang === 'fr' ? '{,}' : '.'}${d}` : int;
  return v < 0 ? `-${body}` : body;
}

export interface F {
  lang: Lang;
  /** A number as TeX (not wrapped). Use inside f.m(...). */
  n: (x: number) => string;
  /** Wraps TeX in $...$. */
  m: (tex: string) => string;
  /** One number, wrapped: $1\,234$. */
  N: (x: number) => string;
  /** Picks the English or French words. */
  t: (en: string, fr: string) => string;
}

export const fmt = (lang: Lang): F => ({
  lang,
  n: (x) => numTex(x, lang),
  m: (s) => `$${s}$`,
  N: (x) => `$${numTex(x, lang)}$`,
  t: (en, fr) => (lang === 'en' ? en : fr),
});

/** Builds a bilingual Text from one function of the formatter, so both languages share the same numbers. */
export const bi = (fn: (f: F) => string): Text => ({ en: fn(fmt('en')), fr: fn(fmt('fr')) });

export interface NumDraw {
  prompt: Text;
  answer: number;
  /** Mapped wrong answers: [value, why, stepIndex?]. */
  wrong?: [number, Text, number?][];
  steps: Text[];
  nudge: Text;
  /** Defaults to the first step. */
  stepHint?: Text;
  praise?: Text;
  category?: Category;
  tolerance?: number;
  visual?: Visual;
}

/** A generator whose answer is a number the student types. `draw` picks the variables for the tier and describes the item. */
export const numGen = (skill: string, draw: (tier: number, r: Rng, seed: number) => NumDraw): Generator => (tier, seed) => {
  const r = makeRng(seed);
  const d = draw(tier, r, seed);
  return build({
    skill, tier, seed, category: d.category ?? 'KU', format: 'number', prompt: d.prompt, visual: d.visual,
    answer: { kind: 'number', value: round6(d.answer), tolerance: d.tolerance },
    steps: d.steps, nudge: d.nudge, stepHint: d.stepHint ?? d.steps[0]!,
    wrong: (d.wrong ?? []).map(([v, why, step]) => ({ answer: { kind: 'number' as const, value: round6(v) }, why, stepIndex: step ?? 0 })),
    praise: d.praise,
  });
};
