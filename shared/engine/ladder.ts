// The "when a student struggles" ladder:
//   1. drop a tier (one at a time)  2. serve the micro-skills as single-step items
//   3. show a short micro-lesson on the weakest prerequisite  4. build back up:
//   micro-skill -> combined skill -> original tier (again one tier at a time).

import { detectStruggle, type AttemptLite } from './struggle.js';

export type Phase = 'normal' | 'stepdown' | 'micro' | 'lesson' | 'buildup';

export interface Ladder {
  phase: Phase;
  skill: string; // the expectation (or skill) being practiced
  tier: number; // tier currently being served for `skill`
  originalTier: number; // where the student was before the struggle began
  maxTier: number;
  history: AttemptLite[]; // attempts since the last phase change
  streak: number; // consecutive correct since the last phase change
  microQueue: string[]; // micro-skill ids, weakest first
  microIdx: number;
  microStreak: number;
  microMisses: number;
  lessonShown: boolean; // a lesson is shown once per episode
  lessonFor: string | null;
  episodes: number; // how many times the ladder bottomed out
  needsHelp: boolean; // flagged for the caregiver
}

export type Action =
  | { type: 'serve'; skill: string; tier: number; single_step: boolean }
  | { type: 'lesson'; skill: string };

export interface LadderEnv {
  microSkillsOf(skill: string): string[]; // prerequisite-ordered
  pKnown(id: string): number;
  weakestPrereq(id: string): string | null; // weakest prerequisite of a micro-skill (may be null)
}

export function newLadder(skill: string, tier: number, maxTier = 3): Ladder {
  return {
    phase: 'normal', skill, tier, originalTier: tier, maxTier, history: [], streak: 0,
    microQueue: [], microIdx: 0, microStreak: 0, microMisses: 0, lessonShown: false, lessonFor: null, episodes: 0, needsHelp: false,
  };
}

const reset = (l: Ladder, phase: Phase): Ladder => ({ ...l, phase, history: [], streak: 0 });

/** What to serve next for the ladder's current state. */
export function nextAction(l: Ladder): Action {
  if (l.phase === 'lesson' && l.lessonFor) return { type: 'lesson', skill: l.lessonFor };
  if (l.phase === 'micro') {
    const id = l.microQueue[l.microIdx];
    if (id) return { type: 'serve', skill: id, tier: 1, single_step: true };
  }
  return { type: 'serve', skill: l.skill, tier: l.tier, single_step: false };
}

/** Records an answer to the item that `nextAction` produced and returns the new ladder. */
export function onAttempt(l: Ladder, a: AttemptLite, env: LadderEnv): Ladder {
  let s = { ...l };

  if (s.phase === 'lesson') {
    // The lesson was read; go back to the micro-skill that tripped the student.
    if (s.microQueue.length === 0) return { ...s, phase: 'buildup', tier: 1, lessonFor: null, history: [], streak: 0 };
    return { ...s, phase: 'micro', lessonFor: null, microMisses: 0, microStreak: 0, history: [], streak: 0 };
  }

  if (s.phase === 'micro') {
    const id = s.microQueue[s.microIdx];
    if (a.correct) {
      s.microStreak += 1;
      s.microMisses = 0;
      if (s.microStreak >= 2 || (id && env.pKnown(id) >= 0.7)) {
        s.microIdx += 1;
        s.microStreak = 0;
        if (s.microIdx >= s.microQueue.length) return { ...reset(s, 'buildup'), tier: 1 }; // micro -> combined at tier 1
      }
      return s;
    }
    s.microStreak = 0;
    s.microMisses += 1;
    if (s.microMisses >= 2) {
      if (!s.lessonShown && id) {
        const weakest = env.weakestPrereq(id) ?? id;
        return { ...s, phase: 'lesson', lessonShown: true, lessonFor: weakest };
      }
      // Still stuck after the lesson: keep it small and ask a caregiver to step in.
      s.needsHelp = true;
      s.microMisses = 0;
    }
    return s;
  }

  s.history = [...s.history, a].slice(-6);
  s.streak = a.correct ? s.streak + 1 : 0;
  const struggling = detectStruggle(s.history);

  if (s.phase === 'normal') {
    if (struggling) {
      s.originalTier = s.tier;
      if (s.tier > 1) return { ...reset(s, 'stepdown'), tier: s.tier - 1 };
      return startMicro(s, env);
    }
    if (s.streak >= 3 && s.tier < s.maxTier) return { ...reset(s, 'normal'), tier: s.tier + 1 };
    return s;
  }

  if (s.phase === 'stepdown') {
    if (struggling) return startMicro(s, env);
    if (s.streak >= 2) return climb(s);
    return s;
  }

  // buildup (combined skill, climbing back one tier at a time)
  if (struggling) {
    if (s.tier > 1) return { ...reset(s, 'stepdown'), tier: s.tier - 1 };
    return startMicro(s, env);
  }
  if (s.streak >= 2) return climb(s);
  return s;
}

function climb(s: Ladder): Ladder {
  if (s.tier >= s.originalTier) return { ...reset(s, 'normal'), tier: s.originalTier, episodes: s.episodes, lessonShown: false };
  return { ...reset(s, 'buildup'), tier: s.tier + 1 }; // never more than one tier at a time
}

function startMicro(s: Ladder, env: LadderEnv): Ladder {
  const queue = [...env.microSkillsOf(s.skill)].sort((a, b) => env.pKnown(a) - env.pKnown(b));
  const episodes = s.episodes + 1;
  if (queue.length === 0) {
    // No micro-skills authored yet: fall back to a lesson on the skill itself, then rebuild from tier 1.
    return { ...reset(s, s.lessonShown ? 'buildup' : 'lesson'), tier: 1, lessonShown: true, lessonFor: s.skill, episodes, needsHelp: s.needsHelp || episodes >= 3 };
  }
  return { ...reset(s, 'micro'), tier: 1, microQueue: queue, microIdx: 0, microStreak: 0, microMisses: 0, episodes, needsHelp: s.needsHelp || episodes >= 3 };
}
