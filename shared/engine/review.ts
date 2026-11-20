// Spaced review: mastered skills return at growing intervals; a slip sends the skill back to practice.

export const REVIEW_DAYS = [1, 3, 7, 14, 30, 60] as const;
const DAY = 86_400_000;

export interface ReviewState {
  step: number; // index into REVIEW_DAYS of the interval just completed (0 = not yet reviewed)
  nextReviewAt: number | null;
}

/** Called when a skill first reaches mastery. */
export function scheduleFirstReview(now: number): ReviewState {
  return { step: 0, nextReviewAt: now + REVIEW_DAYS[0] * DAY };
}

export function onReview(state: ReviewState, correct: boolean, now: number): ReviewState & { backToPractice: boolean } {
  if (!correct) return { step: 0, nextReviewAt: null, backToPractice: true };
  const step = Math.min(state.step + 1, REVIEW_DAYS.length - 1);
  return { step, nextReviewAt: now + REVIEW_DAYS[step]! * DAY, backToPractice: false };
}

export const isDue = (s: { nextReviewAt: number | null }, now: number): boolean => s.nextReviewAt !== null && s.nextReviewAt <= now;
