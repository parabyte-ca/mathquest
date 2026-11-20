import { describe, it, expect } from 'vitest';
import { bktUpdate, DEFAULT_BKT, MASTERED, aggregate, skillState } from '../shared/engine/bkt.js';
import { detectStruggle, type AttemptLite } from '../shared/engine/struggle.js';
import { newLadder, nextAction, onAttempt, type Ladder, type LadderEnv } from '../shared/engine/ladder.js';
import { REVIEW_DAYS, onReview, scheduleFirstReview, isDue } from '../shared/engine/review.js';
import { categoryPlan, planSession } from '../shared/engine/mix.js';
import { startPlacement, nextProbe, recordPlacement, startingIndex, placementPriors } from '../shared/engine/placement.js';
import { makeRng } from '../shared/rng.js';

const ok = (o: Partial<AttemptLite> = {}): AttemptLite => ({ correct: true, hints: 0, ms: 10_000, expectedMs: 10_000, ...o });
const miss = (o: Partial<AttemptLite> = {}): AttemptLite => ({ correct: false, hints: 0, ms: 10_000, expectedMs: 10_000, ...o });
const obs = (correct: boolean, extra = {}) => ({ correct, hints: 0, tries: 1, ms: 10_000, expectedMs: 10_000, ...extra });

describe('BKT', () => {
  it('rises with correct answers and falls with misses', () => {
    let p = DEFAULT_BKT.pInit;
    for (let i = 0; i < 6; i++) p = bktUpdate(p, obs(true));
    expect(p).toBeGreaterThan(MASTERED);
    const dropped = bktUpdate(p, obs(false));
    expect(dropped).toBeLessThan(p);
  });
  it('credits a hinted or slow correct answer less than a clean one', () => {
    const clean = bktUpdate(0.5, obs(true));
    expect(bktUpdate(0.5, obs(true, { hints: 2 }))).toBeLessThan(clean);
    expect(bktUpdate(0.5, obs(true, { tries: 3 }))).toBeLessThan(clean);
    expect(bktUpdate(0.5, obs(true, { ms: 40_000 }))).toBeLessThan(clean);
  });
  it('stays strictly inside (0,1)', () => {
    let p = 0.5;
    for (let i = 0; i < 200; i++) p = bktUpdate(p, obs(true));
    expect(p).toBeLessThan(1);
    for (let i = 0; i < 200; i++) p = bktUpdate(p, obs(false));
    expect(p).toBeGreaterThan(0);
  });
  it('aggregates micro-skills with extra weight on the weakest', () => {
    expect(aggregate([0.9, 0.9])).toBeCloseTo(0.9);
    expect(aggregate([1, 0.2])).toBeLessThan((1 + 0.2) / 2);
    expect(aggregate([])).toBe(0);
  });
  it('maps probability and review state to a skill-map state', () => {
    expect(skillState(0.2, 0, false)).toBe('new');
    expect(skillState(0.5, 3, false)).toBe('in_progress');
    expect(skillState(0.97, 9, false)).toBe('mastered');
    expect(skillState(0.97, 9, true)).toBe('needs_review');
  });
});

describe('struggle detection', () => {
  it('flags two misses in the last three', () => {
    expect(detectStruggle([ok(), miss(), miss()])).toBe('misses');
    expect(detectStruggle([miss(), ok(), ok(), miss()])).toBeNull();
  });
  it('flags heavy hint use', () => {
    expect(detectStruggle([ok({ hints: 2 }), ok({ hints: 1 })])).toBe('hints');
    expect(detectStruggle([ok({ hints: 1 }), ok({ hints: 1 })])).toBeNull();
  });
  it('flags repeated slow answers', () => {
    const slow = ok({ ms: 30_000 });
    expect(detectStruggle([slow, slow, ok(), slow])).toBe('slow');
    expect(detectStruggle([slow, ok(), ok(), slow])).toBeNull();
  });
  it('is quiet for a steady student', () => {
    expect(detectStruggle([ok(), ok(), ok(), ok()])).toBeNull();
    expect(detectStruggle([])).toBeNull();
  });
});

describe('struggle ladder', () => {
  const p: Record<string, number> = { 'MS.a': 0.3, 'MS.b': 0.1, 'MS.c': 0.5 };
  const env: LadderEnv = {
    microSkillsOf: () => ['MS.a', 'MS.b', 'MS.c'],
    pKnown: (id) => p[id] ?? 0.5,
    weakestPrereq: (id) => (id === 'MS.b' ? 'MS.a' : null),
  };
  const run = (l: Ladder, seq: AttemptLite[], e: LadderEnv = env): Ladder => seq.reduce((acc, a) => onAttempt(acc, a, e), l);

  it('steps down exactly one tier on struggle', () => {
    const l = run(newLadder('G5.B2.5', 3), [miss(), miss()]);
    expect(l.phase).toBe('stepdown');
    expect(l.tier).toBe(2);
    expect(nextAction(l)).toMatchObject({ type: 'serve', skill: 'G5.B2.5', tier: 2, single_step: false });
  });

  it('advances one tier after three correct in a row, never two', () => {
    const l = run(newLadder('G5.B2.5', 1), [ok(), ok(), ok()]);
    expect(l.tier).toBe(2);
    expect(l.phase).toBe('normal');
  });

  it('goes to micro-skills, weakest first, when step-down is not enough', () => {
    const l = run(newLadder('G5.B2.5', 2), [miss(), miss(), miss(), miss()]);
    expect(l.phase).toBe('micro');
    expect(l.tier).toBe(1);
    expect(l.microQueue[0]).toBe('MS.b');
    expect(nextAction(l)).toEqual({ type: 'serve', skill: 'MS.b', tier: 1, single_step: true });
  });

  it('starts at micro-skills when already at tier 1', () => {
    const l = run(newLadder('G5.B2.5', 1), [miss(), miss()]);
    expect(l.phase).toBe('micro');
  });

  it('inserts a lesson on the weakest prerequisite when a micro-skill is still missed', () => {
    let l = run(newLadder('G5.B2.5', 1), [miss(), miss()]); // -> micro, first micro is MS.b
    l = run(l, [miss(), miss()]);
    expect(l.phase).toBe('lesson');
    expect(nextAction(l)).toEqual({ type: 'lesson', skill: 'MS.a' });
    l = onAttempt(l, ok(), env); // lesson read
    expect(l.phase).toBe('micro');
    expect(nextAction(l)).toMatchObject({ skill: 'MS.b', single_step: true });
  });

  it('shows only one lesson per episode and then flags caregiver help', () => {
    let l = run(newLadder('G5.B2.5', 1), [miss(), miss(), miss(), miss()]);
    l = onAttempt(l, ok(), env);
    l = run(l, [miss(), miss()]);
    expect(l.phase).toBe('micro');
    expect(l.needsHelp).toBe(true);
  });

  it('builds back up: micro-skills, then the combined skill, then the original tier one step at a time', () => {
    let l = run(newLadder('G5.B2.5', 3), [miss(), miss()]); // stepdown to 2
    l = run(l, [miss(), miss()]); // micro
    expect(l.phase).toBe('micro');
    l = run(l, [ok(), ok(), ok(), ok(), ok(), ok()]); // two correct per micro-skill (3 skills)
    expect(l.phase).toBe('buildup');
    expect(l.tier).toBe(1);
    const tiers: number[] = [];
    for (let i = 0; i < 8 && l.phase !== 'normal'; i++) {
      l = run(l, [ok(), ok()]);
      tiers.push(l.tier);
    }
    expect(tiers).toEqual([2, 3, 3]); // 1 -> 2 -> 3, then back to normal at the original tier
    expect(l.phase).toBe('normal');
    expect(l.tier).toBe(3);
  });

  it('never changes tier by more than one in a single step', () => {
    const rng = makeRng(7);
    let l = newLadder('G5.B2.5', 3);
    for (let i = 0; i < 400; i++) {
      const before = l;
      const a = rng() < 0.5 ? ok({ hints: rng() < 0.2 ? 2 : 0 }) : miss();
      l = onAttempt(l, a, env);
      if (before.phase !== 'micro' && l.phase !== 'micro') expect(Math.abs(l.tier - before.tier)).toBeLessThanOrEqual(1);
      expect(l.tier).toBeGreaterThanOrEqual(1);
      expect(l.tier).toBeLessThanOrEqual(3);
    }
  });

  it('falls back to a lesson on the skill itself when no micro-skills exist', () => {
    const none: LadderEnv = { ...env, microSkillsOf: () => [] };
    let l = run(newLadder('G7.B2.8', 1), [miss(), miss()], none);
    expect(nextAction(l)).toEqual({ type: 'lesson', skill: 'G7.B2.8' });
    l = onAttempt(l, ok(), none);
    expect(l.phase).toBe('buildup');
  });
});

describe('spaced review', () => {
  const now = 1_000_000_000_000;
  it('grows the interval after each success', () => {
    let s = scheduleFirstReview(now);
    const gaps: number[] = [];
    for (let i = 0; i < 4; i++) {
      s = onReview(s, true, now);
      gaps.push(Math.round((s.nextReviewAt! - now) / 86_400_000));
    }
    expect(gaps).toEqual([REVIEW_DAYS[1], REVIEW_DAYS[2], REVIEW_DAYS[3], REVIEW_DAYS[4]]);
  });
  it('sends a slip back to practice', () => {
    const r = onReview({ step: 3, nextReviewAt: now }, false, now);
    expect(r.backToPractice).toBe(true);
    expect(r.step).toBe(0);
    expect(r.nextReviewAt).toBeNull();
  });
  it('knows when a review is due', () => {
    expect(isDue({ nextReviewAt: now - 1 }, now)).toBe(true);
    expect(isDue({ nextReviewAt: now + 1 }, now)).toBe(false);
    expect(isDue({ nextReviewAt: null }, now)).toBe(false);
  });
});

describe('session mix', () => {
  it('splits categories 40/30/30 and sums to n', () => {
    const plan = categoryPlan(10, makeRng(1));
    expect(plan).toHaveLength(10);
    expect(plan.filter((c) => c === 'KU')).toHaveLength(4);
    expect(plan.filter((c) => c === 'AP')).toHaveLength(3);
    expect(plan.filter((c) => c === 'TH')).toHaveLength(3);
  });
  it('is mostly target skills with some review and stretch', () => {
    const s = planSession(20, { target: ['t1', 't2'], review: ['r1'], stretch: ['s1'] }, makeRng(3));
    expect(s).toHaveLength(20);
    expect(s.filter((x) => x.kind === 'target').length).toBeGreaterThanOrEqual(12);
    expect(s.filter((x) => x.kind === 'review').length).toBeGreaterThan(0);
  });
  it('falls back to target skills when nothing is due', () => {
    const s = planSession(10, { target: ['t1'], review: [], stretch: [] }, makeRng(3));
    expect(s.every((x) => x.kind === 'target')).toBe(true);
  });
  it('is deterministic for a seed', () => {
    const a = planSession(12, { target: ['a', 'b', 'c'], review: ['r'], stretch: ['s'] }, makeRng(9));
    const b = planSession(12, { target: ['a', 'b', 'c'], review: ['r'], stretch: ['s'] }, makeRng(9));
    expect(a).toEqual(b);
  });
});

describe('placement', () => {
  const place = (known: number, len = 16): number => {
    let s = startPlacement(len);
    while (!s.done) s = recordPlacement(s, nextProbe(s) < known);
    return startingIndex(s);
  };
  it('finds the boundary of what the student knows within 8 items', () => {
    for (const known of [0, 3, 8, 12, 16]) {
      const idx = place(known);
      expect(Math.abs(idx - known)).toBeLessThanOrEqual(1);
    }
  });
  it('asks at most eight questions', () => {
    let s = startPlacement(64);
    let n = 0;
    while (!s.done) {
      s = recordPlacement(s, n % 2 === 0);
      n++;
    }
    expect(n).toBeLessThanOrEqual(8);
  });
  it('turns the result into priors', () => {
    let s = startPlacement(10);
    while (!s.done) s = recordPlacement(s, nextProbe(s) < 5);
    const priors = placementPriors(10, s);
    expect(priors[0]).toBeGreaterThan(priors[9]!);
  });
});
