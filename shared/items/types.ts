// Question items. Generators build an Item on the server (with the answer); the client only ever receives a PublicItem.

export type Lang = 'en' | 'fr';
/** Every learner-facing string exists in both languages, produced from one template. Math is written between $...$ (KaTeX). */
export interface Text {
  en: string;
  fr: string;
}

export type Category = 'KU' | 'AP' | 'TH';

/** What the student has typed, picked or placed. */
export type Given =
  | { kind: 'number'; text: string }
  | { kind: 'expression'; text: string }
  | { kind: 'fraction'; n: string; d: string }
  | { kind: 'mixed'; whole: string; n: string; d: string }
  | { kind: 'choice'; index: number }
  | { kind: 'multi'; indices: number[] }
  | { kind: 'order'; order: number[] }
  | { kind: 'match'; pairs: [number, number][] }
  | { kind: 'point'; x: number; y: number };

/** The correct answer (or a mapped wrong answer) in the same shapes. */
export type Answer =
  | { kind: 'number'; value: number; tolerance?: number }
  | { kind: 'expression'; expr: string; vars: string[] }
  | { kind: 'fraction'; n: number; d: number; mustReduce?: boolean }
  | { kind: 'mixed'; whole: number; n: number; d: number }
  | { kind: 'choice'; index: number }
  | { kind: 'multi'; indices: number[] }
  | { kind: 'order'; order: number[] }
  | { kind: 'match'; pairs: [number, number][] }
  | { kind: 'point'; x: number; y: number; tol: number };

/** Declarative SVG diagrams; rendered by the client. */
export type Visual =
  | { type: 'fractionBar'; n: number; d: number; label?: boolean }
  | { type: 'fractionBars'; bars: { n: number; d: number }[] }
  | { type: 'numberLine'; min: number; max: number; ticks: number; marks?: { at: number; label?: string }[] }
  | { type: 'areaModel'; rows: number; cols: number; shaded: number }
  | { type: 'plane'; size: number; points?: { x: number; y: number; label?: string }[]; click?: boolean }
  | { type: 'blocks'; tenths: number; hundredths: number };

export type Format = 'number' | 'expression' | 'fraction' | 'mixed' | 'choice' | 'multi' | 'order' | 'match' | 'point';

export interface WrongAnswer {
  answer: Answer;
  /** Why a student would give this answer, said kindly: "It looks like the denominators were added." */
  why: Text;
  /** Index into `steps` where the work most likely went off track (-1 when unknown). */
  stepIndex: number;
}

export interface Item {
  id: string;
  skill: string; // micro-skill id
  tier: number;
  seed: number;
  category: Category;
  format: Format;
  prompt: Text;
  visual?: Visual;
  /** choice/multi: options. order: the pieces to arrange. match: left column. */
  options?: Text[];
  /** match: right column. */
  right?: Text[];
  answer: Answer;
  steps: Text[]; // worked solution, one step each
  hints: [Text, Text, Text]; // nudge, worked step, full worked example
  wrong: WrongAnswer[];
  /** Skill-specific praise, e.g. "Nice, you used the common factor first." */
  praise?: Text;
  expectedMs: number;
}

export interface PublicItem {
  id: string;
  skill: string;
  tier: number;
  category: Category;
  format: Format;
  prompt: Text;
  visual?: Visual;
  options?: Text[];
  right?: Text[];
}

export const toPublic = (i: Item): PublicItem => ({
  id: i.id, skill: i.skill, tier: i.tier, category: i.category, format: i.format, prompt: i.prompt,
  visual: i.visual, options: i.options, right: i.right,
});

export type Generator = (tier: number, seed: number) => Item;
