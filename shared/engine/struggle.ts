export interface AttemptLite {
  correct: boolean;
  hints: number;
  ms: number;
  expectedMs: number;
}

export type StruggleReason = 'misses' | 'hints' | 'slow';

/**
 * Struggle detection over the most recent attempts on ONE skill (oldest first).
 * - misses: two or more misses within the last three attempts
 * - hints: heavy hint use (3+ hints across the last two attempts, or an average of 2+ over three)
 * - slow: three of the last four answers took over twice the expected time
 */
export function detectStruggle(recent: AttemptLite[]): StruggleReason | null {
  const last3 = recent.slice(-3);
  if (last3.filter((a) => !a.correct).length >= 2) return 'misses';
  const last2 = recent.slice(-2);
  if (last2.reduce((s, a) => s + a.hints, 0) >= 3) return 'hints';
  if (last3.length === 3 && last3.reduce((s, a) => s + a.hints, 0) / 3 >= 2) return 'hints';
  const last4 = recent.slice(-4);
  if (last4.length >= 4 && last4.filter((a) => a.expectedMs > 0 && a.ms > 2 * a.expectedMs).length >= 3) return 'slow';
  return null;
}
