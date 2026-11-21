// Adaptive placement over an ordered ladder of skills (easiest first), by bisection.
// A right answer moves the probe up, a wrong one down; after maxItems the boundary is the starting level.

export interface PlacementState {
  lo: number; // lowest index still possibly unknown
  hi: number; // highest index still possibly known
  probes: number[];
  answers: boolean[];
  done: boolean;
}

export const startPlacement = (ladderLength: number): PlacementState => ({ lo: 0, hi: ladderLength - 1, probes: [], answers: [], done: ladderLength === 0 });

export const nextProbe = (s: PlacementState): number => Math.floor((s.lo + s.hi) / 2);

export function recordPlacement(s: PlacementState, correct: boolean, maxItems = 8): PlacementState {
  const probe = nextProbe(s);
  // correct => levels up to `probe` are known; wrong => `probe` and above are unknown
  const lo = correct ? probe + 1 : s.lo;
  const hi = correct ? s.hi : probe - 1;
  const probes = [...s.probes, probe];
  return { lo, hi, probes, answers: [...s.answers, correct], done: lo > hi || probes.length >= maxItems };
}

/** Index of the first skill the student should practice (everything below is assumed known). */
export const startingIndex = (s: PlacementState): number => Math.max(0, Math.min(s.lo, s.hi + 1));

/** Prior P(known) for each ladder skill after placement. */
export function placementPriors(ladderLength: number, s: PlacementState): number[] {
  const start = startingIndex(s);
  return Array.from({ length: ladderLength }, (_, i) => (i < start ? 0.85 : i === start ? 0.35 : 0.15));
}
