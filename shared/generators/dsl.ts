// A small toolkit for writing generators: bilingual text with correct number formatting, and a one-call builder for the
// common "type a number" item. Numbers inside prompts are TeX so they render and are read aloud the same way in both languages.
import { makeRng, shuffle, type Rng } from '../rng.js';
import type { Category, Format, Generator, SliderSpec, Text, Visual } from '../items/types.js';
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

/** The TeX for an amount of money (not wrapped). `\dollar` is a macro for the dollar sign (see shared/tex.ts): it goes before the amount in English and after it, with a space, in French. */
export function dollarTex(x: number, lang: Lang, cents = false): string {
  const v = Math.round(x * 100) / 100;
  let body: string;
  if (Number.isInteger(v) && !cents) body = numTex(v, lang);
  else {
    const [i, d] = Math.abs(v).toFixed(2).split('.') as [string, string];
    const int = Math.abs(v) >= 10000 ? i.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : i;
    body = `${v < 0 ? '-' : ''}${int}${lang === 'fr' ? '{,}' : '.'}${d}`;
  }
  return lang === 'fr' ? `${body}\\ \\dollar` : `\\dollar ${body}`;
}

export interface F {
  lang: Lang;
  /** A number as TeX (not wrapped). Use inside f.m(...). */
  n: (x: number) => string;
  /** Wraps TeX in $...$. */
  m: (tex: string) => string;
  /** One number, wrapped: $1\,234$. */
  N: (x: number) => string;
  /** An amount of money, wrapped, with the dollar sign the Canadian way: $\dollar 45.50$ in English, $45{,}50\ \dollar$ in French. Whole amounts have no cents unless `cents` is true. */
  D: (x: number, cents?: boolean) => string;
  /** Picks the English or French words. */
  t: (en: string, fr: string) => string;
}

export const fmt = (lang: Lang): F => ({
  lang,
  n: (x) => numTex(x, lang),
  m: (s) => `$${s}$`,
  N: (x) => `$${numTex(x, lang)}$`,
  D: (x, cents) => `$${dollarTex(x, lang, cents)}$`,
  t: (en, fr) => (lang === 'en' ? en : fr),
});

/** Builds a bilingual Text from one function of the formatter, so both languages share the same numbers. */
export const bi = (fn: (f: F) => string): Text => ({ en: fn(fmt('en')), fr: fn(fmt('fr')) });

/** Keeps only the mapped wrong answers that are finite, distinct and different from the right answer. */
export const keepWrong = (answer: number, list: [number, Text, number?][]): [number, Text, number?][] => {
  const seen = new Set<number>([round6(answer)]);
  return list.filter(([v]) => Number.isFinite(v) && !seen.has(round6(v)) && (seen.add(round6(v)), true));
};

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
  /** Accept any value within this many units of the answer (for example 2 degrees on a protractor). */
  absTolerance?: number;
  visual?: Visual;
  /** How the student gives the number: typed (default), moved on a slider (give `slider` too), or drawn as an angle on a protractor. */
  format?: 'number' | 'slider' | 'angle';
  slider?: SliderSpec;
}

/** A generator whose answer is a number the student types, slides or draws. `draw` picks the variables for the tier and describes the item. */
export const numGen = (skill: string, draw: (tier: number, r: Rng, seed: number) => NumDraw): Generator => (tier, seed) => {
  const r = makeRng(seed);
  const d = draw(tier, r, seed);
  return build({
    skill, tier, seed, category: d.category ?? 'KU', format: (d.format ?? 'number') as Format, prompt: d.prompt, visual: d.visual, slider: d.slider,
    answer: { kind: 'number', value: round6(d.answer), tolerance: d.tolerance, absTolerance: d.absTolerance },
    steps: d.steps, nudge: d.nudge, stepHint: d.stepHint ?? d.steps[0]!,
    wrong: (d.wrong ?? []).map(([v, why, step]) => ({ answer: { kind: 'number' as const, value: round6(v) }, why, stepIndex: step ?? 0 })),
    praise: d.praise,
  });
};

/** Money for prompts: always two decimals, decimal comma in French, wrapped for KaTeX. The word "dollars" is written by the caller. */
export const money = (f: F, x: number): string => f.m((Math.round(x * 100) / 100).toFixed(2).replace('.', f.lang === 'fr' ? '{,}' : '.'));

export interface ChoiceDraw {
  prompt: Text;
  options: Text[];
  correct: number;
  /** Why a student would pick each wrong option, by option index. */
  why?: Record<number, Text>;
  steps: Text[];
  nudge: Text;
  stepHint?: Text;
  praise?: Text;
  category?: Category;
  visual?: Visual;
}

/** Shuffles one right option among wrong ones, keeping each wrong option's reason attached. */
export function mc(r: Rng, right: Text, wrongs: [Text, Text][]): { options: Text[]; correct: number; why: Record<number, Text> } {
  const all = [{ o: right, w: null as Text | null }, ...wrongs.map(([o, w]) => ({ o, w }))];
  const order = shuffle(r, all);
  const why: Record<number, Text> = {};
  order.forEach((x, i) => { if (x.w) why[i] = x.w; });
  return { options: order.map((x) => x.o), correct: order.findIndex((x) => x.w === null), why };
}

/** A generator whose answer is one choice among several. */
export const choiceGen = (skill: string, draw: (tier: number, r: Rng, seed: number) => ChoiceDraw): Generator => (tier, seed) => {
  const r = makeRng(seed);
  const d = draw(tier, r, seed);
  return build({
    skill, tier, seed, category: d.category ?? 'KU', format: 'choice', prompt: d.prompt, visual: d.visual, options: d.options,
    answer: { kind: 'choice', index: d.correct },
    steps: d.steps, nudge: d.nudge, stepHint: d.stepHint ?? d.steps[0]!,
    wrong: Object.entries(d.why ?? {}).map(([i, why]) => ({ answer: { kind: 'choice' as const, index: Number(i) }, why, stepIndex: 0 })),
    praise: d.praise,
  });
};
