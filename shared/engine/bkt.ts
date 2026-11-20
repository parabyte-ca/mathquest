// Bayesian Knowledge Tracing (Corbett & Anderson, 1995), with explainable evidence adjustments.
// Four parameters per skill; evidence from hints and slow answers weakens "correct" without punishing the student.

export interface BktParams {
  pInit: number; // P(known) before any attempt
  pLearn: number; // P(learn) after each opportunity
  pSlip: number; // P(wrong | known)
  pGuess: number; // P(right | not known)
}
export const DEFAULT_BKT: BktParams = { pInit: 0.25, pLearn: 0.15, pSlip: 0.1, pGuess: 0.2 };

export interface Observation {
  correct: boolean;
  hints: number; // hints used on this question (0-3)
  tries: number; // submissions on this question
  ms: number; // time taken
  expectedMs: number; // typical time for this item
}

export const MASTERED = 0.95;
export const PROFICIENT = 0.7;

const clamp = (x: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, x));

/** Returns the effective guess/slip after adjusting for hints, retries and slowness. */
export function effectiveParams(p: BktParams, o: Observation): { slip: number; guess: number } {
  const slow = o.expectedMs > 0 && o.ms > 2.5 * o.expectedMs ? 1 : 0;
  const assists = clamp(o.hints, 0, 3) + Math.max(0, o.tries - 1) + slow;
  // Help raises the chance a right answer came without knowing; it never makes a wrong answer worse.
  const guess = clamp(p.pGuess + 0.12 * assists, 0.05, 0.6);
  const slip = o.correct ? p.pSlip : clamp(p.pSlip, 0.02, 0.3);
  return { slip, guess };
}

export function bktUpdate(pKnown: number, o: Observation, params: BktParams = DEFAULT_BKT): number {
  const { slip, guess } = effectiveParams(params, o);
  const p = clamp(pKnown, 0.001, 0.999);
  const posterior = o.correct
    ? (p * (1 - slip)) / (p * (1 - slip) + (1 - p) * guess)
    : (p * slip) / (p * slip + (1 - p) * (1 - guess));
  return clamp(posterior + (1 - posterior) * params.pLearn, 0.001, 0.999);
}

/** Expectation mastery: weighted mean of its micro-skills (the weakest count a little more). */
export function aggregate(ps: number[]): number {
  if (ps.length === 0) return 0;
  const mean = ps.reduce((a, b) => a + b, 0) / ps.length;
  const min = Math.min(...ps);
  return 0.7 * mean + 0.3 * min;
}

export type SkillState = 'new' | 'in_progress' | 'mastered' | 'needs_review';
export function skillState(p: number, attempts: number, reviewDue: boolean): SkillState {
  if (attempts === 0) return 'new';
  if (p >= MASTERED) return reviewDue ? 'needs_review' : 'mastered';
  return 'in_progress';
}
