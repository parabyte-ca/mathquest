// Rewards: XP, levels, streaks, badges and cosmetics. Pure functions so the server, the tests and the worksheets agree.
// Everything here is original to MathQuest: no third-party names, characters or art.
import type { Text } from './items/types.js';

const t = (en: string, fr: string): Text => ({ en, fr });

// ── XP ────────────────────────────────────────────────────────────────────────────

export interface XpInput {
  correct: boolean;
  tier: number;
  hints: number;
  kind: 'practice' | 'review' | 'placement';
}
export interface XpPart {
  kind: 'correct' | 'effort' | 'review' | 'skill' | 'expectation' | 'comeback' | 'daily-start' | 'daily-goal';
  xp: number;
}

const BASE_BY_TIER = [0, 10, 15, 20];
/** XP for one answer. Hints lower it a little but never to nothing; a miss still earns a small effort reward. */
export function xpForAnswer(i: XpInput): XpPart[] {
  if (i.kind === 'placement') return [];
  if (!i.correct) return [{ kind: 'effort', xp: 2 }];
  const base = BASE_BY_TIER[Math.max(1, Math.min(3, i.tier))]!;
  const parts: XpPart[] = [{ kind: 'correct', xp: Math.max(4, base - 3 * i.hints) }];
  if (i.kind === 'review') parts.push({ kind: 'review', xp: 5 });
  return parts;
}
export const XP_SKILL_MASTERED = 40;
export const XP_EXPECTATION_MASTERED = 100;
export const XP_COMEBACK = 15;
export const XP_DAILY_START = 10;
export const XP_DAILY_GOAL = 25;

// ── levels ────────────────────────────────────────────────────────────────────────

/** Total XP needed to reach a level: 0, 100, 300, 600, 1 000, ... */
export const xpToReach = (level: number): number => 50 * level * (level - 1);
export function levelInfo(xp: number): { level: number; into: number; need: number; next: number } {
  let level = 1;
  while (xp >= xpToReach(level + 1)) level++;
  return { level, into: xp - xpToReach(level), need: xpToReach(level + 1) - xpToReach(level), next: xpToReach(level + 1) };
}

// ── streaks ───────────────────────────────────────────────────────────────────────

export interface StreakState {
  streak: number;
  best: number;
  lastDay: string | null; // YYYY-MM-DD in the family's time zone
  freezes: number;
}
export const MAX_FREEZES = 2;
const dayNumber = (d: string): number => Math.floor(Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10))) / 86_400_000);
export const daysBetween = (a: string, b: string): number => dayNumber(b) - dayNumber(a);

/**
 * The streak after practising on `today`. Practising twice in a day changes nothing. Missing exactly one day spends a
 * freeze if there is one; missing more resets the streak to 1. A freeze is earned at every 7th day of a streak (up to two held).
 */
export function streakStep(s: StreakState, today: string): { state: StreakState; freezeUsed: boolean; freezeEarned: boolean; started: boolean } {
  if (s.lastDay === today) return { state: s, freezeUsed: false, freezeEarned: false, started: false };
  let streak = 1;
  let freezes = s.freezes;
  let freezeUsed = false;
  if (s.lastDay) {
    const gap = daysBetween(s.lastDay, today);
    if (gap === 1) streak = s.streak + 1;
    else if (gap === 2 && freezes > 0) { streak = s.streak + 1; freezes -= 1; freezeUsed = true; }
  }
  let freezeEarned = false;
  if (streak > 1 && streak % 7 === 0 && freezes < MAX_FREEZES) { freezes += 1; freezeEarned = true; }
  return { state: { streak, best: Math.max(s.best, streak), lastDay: today, freezes }, freezeUsed, freezeEarned, started: true };
}

/** The streak a student should see today: it lapses to 0 once a day (beyond what a freeze covers) has been missed. */
export function streakToShow(s: StreakState, today: string): number {
  if (!s.lastDay) return 0;
  const gap = daysBetween(s.lastDay, today);
  if (gap <= 1) return s.streak;
  if (gap === 2 && s.freezes > 0) return s.streak;
  return 0;
}

// ── badges ────────────────────────────────────────────────────────────────────────

export interface Stats {
  answers: number;
  correct: number;
  reviewCorrect: number;
  streak: number;
  skillsMastered: number;
  expectationsMastered: number;
  strandsTouched: number;
  comebacks: number;
  hintedCorrect: number;
  level: number;
}
export interface Badge {
  id: string;
  icon: string;
  name: Text;
  how: Text;
  earned: (s: Stats) => boolean;
}

export const BADGES: Badge[] = [
  { id: 'first-steps', icon: '👣', name: t('First steps', 'Premiers pas'), how: t('Answer your first question.', 'Réponds à ta première question.'), earned: (s) => s.answers >= 1 },
  { id: 'on-a-roll', icon: '🎯', name: t('On a roll', 'En grande forme'), how: t('Get 10 questions right.', 'Réussis 10 questions.'), earned: (s) => s.correct >= 10 },
  { id: 'century', icon: '💯', name: t('Century', 'Cent réussites'), how: t('Get 100 questions right.', 'Réussis 100 questions.'), earned: (s) => s.correct >= 100 },
  { id: 'marathon', icon: '🏃', name: t('Marathon', 'Marathon'), how: t('Get 500 questions right.', 'Réussis 500 questions.'), earned: (s) => s.correct >= 500 },
  { id: 'streak-3', icon: '🔥', name: t('Three-day streak', 'Trois jours de suite'), how: t('Practise 3 days in a row.', 'Pratique 3 jours de suite.'), earned: (s) => s.streak >= 3 },
  { id: 'streak-7', icon: '🌟', name: t('Week streak', 'Une semaine de suite'), how: t('Practise 7 days in a row.', 'Pratique 7 jours de suite.'), earned: (s) => s.streak >= 7 },
  { id: 'streak-30', icon: '🏅', name: t('Month streak', 'Un mois de suite'), how: t('Practise 30 days in a row.', 'Pratique 30 jours de suite.'), earned: (s) => s.streak >= 30 },
  { id: 'skill-master', icon: '🧠', name: t('Skill master', 'Maître d\'habileté'), how: t('Master your first skill.', 'Maîtrise ta première habileté.'), earned: (s) => s.skillsMastered >= 1 },
  { id: 'skill-collector', icon: '📚', name: t('Skill collector', 'Collectionneur d\'habiletés'), how: t('Master 10 skills.', 'Maîtrise 10 habiletés.'), earned: (s) => s.skillsMastered >= 10 },
  { id: 'topic-master', icon: '🏆', name: t('Topic master', 'Maître du sujet'), how: t('Master every skill in one topic.', 'Maîtrise toutes les habiletés d\'un sujet.'), earned: (s) => s.expectationsMastered >= 1 },
  { id: 'explorer', icon: '🧭', name: t('Explorer', 'Explorateur'), how: t('Get a question right in 3 different strands.', 'Réussis une question dans 3 volets différents.'), earned: (s) => s.strandsTouched >= 3 },
  { id: 'bounce-back', icon: '💪', name: t('Bounce back', 'Je rebondis'), how: t('Work through a tricky skill until you have it.', 'Persévère sur une habileté difficile jusqu\'à la réussir.'), earned: (s) => s.comebacks >= 1 },
  { id: 'hint-wise', icon: '💡', name: t('Hint-wise', 'Futé avec les indices'), how: t('Use a hint, then get the question right, 10 times.', 'Utilise un indice, puis réussis la question, 10 fois.'), earned: (s) => s.hintedCorrect >= 10 },
  { id: 'review-hero', icon: '🔁', name: t('Review hero', 'Héros de la révision'), how: t('Get 10 review questions right.', 'Réussis 10 questions de révision.'), earned: (s) => s.reviewCorrect >= 10 },
  { id: 'level-5', icon: '🚀', name: t('Level 5', 'Niveau 5'), how: t('Reach level 5.', 'Atteins le niveau 5.'), earned: (s) => s.level >= 5 },
  { id: 'level-10', icon: '👑', name: t('Level 10', 'Niveau 10'), how: t('Reach level 10.', 'Atteins le niveau 10.'), earned: (s) => s.level >= 10 },
];
export const badgeById = (id: string): Badge | undefined => BADGES.find((b) => b.id === id);
export const newBadgeIds = (s: Stats, have: Set<string>): string[] => BADGES.filter((b) => !have.has(b.id) && b.earned(s)).map((b) => b.id);

// ── cosmetics ─────────────────────────────────────────────────────────────────────

export interface Cosmetic {
  id: string;
  kind: 'avatar' | 'palette';
  icon: string;
  name: Text;
  /** Reached by level, or by earning a badge. */
  unlock: { level: number } | { badge: string };
}

export const COSMETICS: Cosmetic[] = [
  { id: 'avatar-fox', kind: 'avatar', icon: '🦊', name: t('Fox', 'Renard'), unlock: { level: 1 } },
  { id: 'avatar-panda', kind: 'avatar', icon: '🐼', name: t('Panda', 'Panda'), unlock: { level: 1 } },
  { id: 'avatar-owl', kind: 'avatar', icon: '🦉', name: t('Owl', 'Hibou'), unlock: { level: 2 } },
  { id: 'avatar-octopus', kind: 'avatar', icon: '🐙', name: t('Octopus', 'Pieuvre'), unlock: { level: 3 } },
  { id: 'avatar-butterfly', kind: 'avatar', icon: '🦋', name: t('Butterfly', 'Papillon'), unlock: { level: 4 } },
  { id: 'avatar-dolphin', kind: 'avatar', icon: '🐬', name: t('Dolphin', 'Dauphin'), unlock: { level: 5 } },
  { id: 'avatar-unicorn', kind: 'avatar', icon: '🦄', name: t('Unicorn', 'Licorne'), unlock: { level: 7 } },
  { id: 'avatar-dragon', kind: 'avatar', icon: '🐲', name: t('Dragon', 'Dragon'), unlock: { level: 10 } },
  { id: 'avatar-rocket', kind: 'avatar', icon: '🚀', name: t('Rocket', 'Fusée'), unlock: { badge: 'streak-7' } },
  { id: 'avatar-trophy', kind: 'avatar', icon: '🏆', name: t('Trophy', 'Trophée'), unlock: { badge: 'topic-master' } },
  { id: 'palette-classic', kind: 'palette', icon: '🎨', name: t('Classic', 'Classique'), unlock: { level: 1 } },
  { id: 'palette-sunrise', kind: 'palette', icon: '🌅', name: t('Sunrise', 'Aurore'), unlock: { level: 2 } },
  { id: 'palette-forest', kind: 'palette', icon: '🌲', name: t('Forest', 'Forêt'), unlock: { level: 4 } },
  { id: 'palette-ocean', kind: 'palette', icon: '🌊', name: t('Ocean', 'Océan'), unlock: { level: 6 } },
  { id: 'palette-twilight', kind: 'palette', icon: '🌌', name: t('Twilight', 'Crépuscule'), unlock: { level: 8 } },
  { id: 'palette-candy', kind: 'palette', icon: '🍬', name: t('Candy', 'Bonbon'), unlock: { level: 10 } },
];
export const cosmeticById = (id: string): Cosmetic | undefined => COSMETICS.find((c) => c.id === id);
export const DEFAULT_AVATAR = 'avatar-fox';
export const DEFAULT_PALETTE = 'palette-classic';

export const isUnlocked = (c: Cosmetic, level: number, badges: Set<string>): boolean => ('level' in c.unlock ? level >= c.unlock.level : badges.has(c.unlock.badge));
