import type { Ctx, StudentRow } from '../context.js';
import { newId } from '../db.js';
import { MASTERED } from '../../shared/engine/bkt.js';
import {
  BADGES, COSMETICS, DEFAULT_AVATAR, DEFAULT_PALETTE, XP_COMEBACK, XP_DAILY_GOAL, XP_DAILY_START, XP_EXPECTATION_MASTERED, XP_SKILL_MASTERED,
  cosmeticById, isUnlocked, levelInfo, newBadgeIds, streakStep, streakToShow, xpForAnswer,
  type Stats, type StreakState, type XpPart,
} from '../../shared/rewards.js';

export class RewardError extends Error {
  constructor(public code: string, public status = 400) {
    super(code);
  }
}

interface StateRow {
  student_id: string;
  xp: number;
  streak: number;
  best_streak: number;
  last_day: string | null;
  freezes: number;
  avatar: string;
  palette: string;
  daily_goal_day: string | null;
}

/** The calendar day (YYYY-MM-DD) in the family's time zone. */
export function localDay(ms: number, tz: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(ms);
}

function getState(ctx: Ctx, sid: string): StateRow {
  ctx.db.prepare('INSERT OR IGNORE INTO reward_state (student_id, avatar, palette, updated_at) VALUES (?,?,?,?)').run(sid, DEFAULT_AVATAR, DEFAULT_PALETTE, ctx.now());
  return ctx.db.prepare('SELECT * FROM reward_state WHERE student_id = ?').get(sid) as StateRow;
}

/** Daily goal and session limit in minutes: the student's own setting, else their owner caregiver's default, else 15 and no limit. */
export function effectiveSettings(ctx: Ctx, student: StudentRow): { dailyGoalMinutes: number; sessionLimitMinutes: number } {
  const own = JSON.parse(student.settings_json) as { dailyGoalMinutes?: number; sessionLimitMinutes?: number };
  const owner = ctx.db
    .prepare("SELECT u.defaults_json FROM users u JOIN student_caregivers sc ON sc.caregiver_id = u.id WHERE sc.student_id = ? AND sc.role = 'owner'")
    .get(student.id) as { defaults_json: string } | undefined;
  const def = owner ? (JSON.parse(owner.defaults_json) as { dailyGoalMinutes?: number; sessionLimitMinutes?: number }) : {};
  return { dailyGoalMinutes: own.dailyGoalMinutes ?? def.dailyGoalMinutes ?? 15, sessionLimitMinutes: own.sessionLimitMinutes ?? def.sessionLimitMinutes ?? 0 };
}

/** Milliseconds spent answering today (in the family's time zone). Each answer counts its own thinking time. */
export function msToday(ctx: Ctx, sid: string): number {
  const today = localDay(ctx.now(), ctx.cfg.timezone);
  const rows = ctx.db.prepare('SELECT ms, at FROM attempt WHERE student_id = ? AND at >= ?').all(sid, ctx.now() - 36 * 3_600_000) as { ms: number; at: number }[];
  return rows.filter((r) => localDay(r.at, ctx.cfg.timezone) === today).reduce((a, r) => a + r.ms, 0);
}

function stats(ctx: Ctx, sid: string, streak: number, level: number): Stats {
  const one = (sql: string, ...a: unknown[]): number => (ctx.db.prepare(sql).get(...a) as { n: number }).n;
  return {
    answers: one('SELECT COUNT(*) AS n FROM attempt WHERE student_id = ?', sid),
    correct: one("SELECT COUNT(*) AS n FROM attempt WHERE student_id = ? AND correct = 1 AND kind != 'placement'", sid),
    reviewCorrect: one("SELECT COUNT(*) AS n FROM attempt WHERE student_id = ? AND correct = 1 AND kind = 'review'", sid),
    streak,
    skillsMastered: one('SELECT COUNT(*) AS n FROM mastery WHERE student_id = ? AND p_known >= ? AND next_review_at IS NOT NULL', sid, MASTERED),
    expectationsMastered: one("SELECT COUNT(*) AS n FROM reward_event WHERE student_id = ? AND kind = 'expectation'", sid),
    strandsTouched: one(
      "SELECT COUNT(DISTINCT ce.strand) AS n FROM attempt a JOIN microskill m ON m.id = a.skill_id JOIN curriculum_expectation ce ON ce.code = m.expectation WHERE a.student_id = ? AND a.correct = 1 AND a.kind != 'placement'",
      sid,
    ),
    comebacks: one("SELECT COUNT(*) AS n FROM reward_event WHERE student_id = ? AND kind = 'comeback'", sid),
    hintedCorrect: one("SELECT COUNT(*) AS n FROM attempt WHERE student_id = ? AND correct = 1 AND hints > 0 AND kind != 'placement'", sid),
    level,
  };
}

export interface RewardResult {
  xp: number;
  parts: XpPart[];
  totalXp: number;
  level: number;
  leveledUp: boolean;
  into: number;
  need: number;
  streak: number;
  streakGrew: boolean;
  freezeUsed: boolean;
  freezeEarned: boolean;
  newBadges: string[];
  newCosmetics: string[];
  goalsReached: string[];
  dailyGoalReached: boolean;
}

export interface AnswerFacts {
  correct: boolean;
  tier: number;
  hints: number;
  kind: 'practice' | 'review' | 'placement';
  masteredSkill: boolean;
  masteredExpectation: boolean;
  recovered: boolean;
}

/** Awards XP for one answer and updates the streak, badges, unlocks and caregiver goals. Placement answers earn nothing. */
export function onAnswered(ctx: Ctx, student: StudentRow, a: AnswerFacts): RewardResult | null {
  if (a.kind === 'placement') return null;
  const now = ctx.now();
  const tz = ctx.cfg.timezone;
  const today = localDay(now, tz);
  const row = getState(ctx, student.id);
  const beforeLevel = levelInfo(row.xp).level;
  const beforeBadges = new Set((ctx.db.prepare('SELECT badge_id FROM badge_earned WHERE student_id = ?').all(student.id) as { badge_id: string }[]).map((r) => r.badge_id));
  const beforeUnlocked = new Set(COSMETICS.filter((c) => isUnlocked(c, beforeLevel, beforeBadges)).map((c) => c.id));

  const parts: XpPart[] = xpForAnswer(a);
  if (a.masteredSkill) parts.push({ kind: 'skill', xp: XP_SKILL_MASTERED });
  if (a.masteredExpectation) parts.push({ kind: 'expectation', xp: XP_EXPECTATION_MASTERED });
  if (a.recovered) parts.push({ kind: 'comeback', xp: XP_COMEBACK });

  const prev: StreakState = { streak: row.streak, best: row.best_streak, lastDay: row.last_day, freezes: row.freezes };
  const step = streakStep(prev, today);
  if (step.started) parts.push({ kind: 'daily-start', xp: XP_DAILY_START });

  // the daily goal: minutes spent today, counting this answer (it is already in the attempt table)
  const goalMin = effectiveSettings(ctx, student).dailyGoalMinutes;
  let dailyGoalReached = false;
  if (goalMin > 0 && row.daily_goal_day !== today && msToday(ctx, student.id) >= goalMin * 60_000) {
    dailyGoalReached = true;
    parts.push({ kind: 'daily-goal', xp: XP_DAILY_GOAL });
  }

  const gained = parts.reduce((s, p) => s + p.xp, 0);
  const totalXp = row.xp + gained;
  const info = levelInfo(totalXp);
  ctx.db
    .prepare('UPDATE reward_state SET xp = ?, streak = ?, best_streak = ?, last_day = ?, freezes = ?, daily_goal_day = ?, updated_at = ? WHERE student_id = ?')
    .run(totalXp, step.state.streak, step.state.best, step.state.lastDay, step.state.freezes, dailyGoalReached ? today : row.daily_goal_day, now, student.id);
  const ins = ctx.db.prepare('INSERT INTO reward_event (student_id, at, kind, xp) VALUES (?,?,?,?)');
  for (const p of parts) ins.run(student.id, now, p.kind, p.xp);

  const newBadges = newBadgeIds(stats(ctx, student.id, step.state.streak, info.level), beforeBadges);
  for (const id of newBadges) ctx.db.prepare('INSERT OR IGNORE INTO badge_earned (student_id, badge_id, at) VALUES (?,?,?)').run(student.id, id, now);
  const allBadges = new Set([...beforeBadges, ...newBadges]);
  const newCosmetics = COSMETICS.filter((c) => isUnlocked(c, info.level, allBadges) && !beforeUnlocked.has(c.id)).map((c) => c.id);

  const reached = ctx.db
    .prepare('SELECT id, title FROM goal WHERE student_id = ? AND archived = 0 AND reached_at IS NULL AND ? - baseline_xp >= xp_target')
    .all(student.id, totalXp) as { id: string; title: string }[];
  for (const g of reached) ctx.db.prepare('UPDATE goal SET reached_at = ? WHERE id = ?').run(now, g.id);

  return {
    xp: gained, parts, totalXp, level: info.level, leveledUp: info.level > beforeLevel, into: info.into, need: info.need,
    streak: step.state.streak, streakGrew: step.started, freezeUsed: step.freezeUsed, freezeEarned: step.freezeEarned,
    newBadges, newCosmetics, goalsReached: reached.map((g) => g.title), dailyGoalReached,
  };
}

export interface GoalView {
  id: string;
  title: string;
  xpTarget: number;
  progress: number;
  reached: boolean;
  redeemed: boolean;
  createdAt: number;
  reachedAt: number | null;
  redeemedAt: number | null;
}

export function listGoals(ctx: Ctx, studentId: string, includeArchived = false): GoalView[] {
  const xp = getState(ctx, studentId).xp;
  const rows = ctx.db
    .prepare(`SELECT id, title, xp_target, baseline_xp, created_at, reached_at, redeemed_at FROM goal WHERE student_id = ? ${includeArchived ? '' : 'AND archived = 0'} ORDER BY created_at DESC`)
    .all(studentId) as { id: string; title: string; xp_target: number; baseline_xp: number; created_at: number; reached_at: number | null; redeemed_at: number | null }[];
  return rows.map((g) => ({
    id: g.id, title: g.title, xpTarget: g.xp_target, progress: Math.max(0, Math.min(g.xp_target, xp - g.baseline_xp)),
    reached: g.reached_at !== null, redeemed: g.redeemed_at !== null, createdAt: g.created_at, reachedAt: g.reached_at, redeemedAt: g.redeemed_at,
  }));
}

export function createGoal(ctx: Ctx, studentId: string, userId: string, title: string, xpTarget: number): string {
  const id = newId();
  ctx.db.prepare('INSERT INTO goal (id, student_id, created_by, title, xp_target, baseline_xp, created_at) VALUES (?,?,?,?,?,?,?)').run(id, studentId, userId, title, xpTarget, getState(ctx, studentId).xp, ctx.now());
  return id;
}

export function redeemGoal(ctx: Ctx, studentId: string, goalId: string, userId: string): void {
  const g = ctx.db.prepare('SELECT reached_at, redeemed_at FROM goal WHERE id = ? AND student_id = ? AND archived = 0').get(goalId, studentId) as { reached_at: number | null; redeemed_at: number | null } | undefined;
  if (!g) throw new RewardError('not_found', 404);
  if (g.reached_at === null) throw new RewardError('not_reached', 409);
  if (g.redeemed_at !== null) throw new RewardError('already_redeemed', 409);
  ctx.db.prepare('UPDATE goal SET redeemed_at = ?, redeemed_by = ? WHERE id = ?').run(ctx.now(), userId, goalId);
}

export function archiveGoal(ctx: Ctx, studentId: string, goalId: string): void {
  const r = ctx.db.prepare('UPDATE goal SET archived = 1 WHERE id = ? AND student_id = ?').run(goalId, studentId);
  if (r.changes !== 1) throw new RewardError('not_found', 404);
}

/** Everything the student's rewards page and header need. */
export function summary(ctx: Ctx, student: StudentRow) {
  const row = getState(ctx, student.id);
  const today = localDay(ctx.now(), ctx.cfg.timezone);
  const info = levelInfo(row.xp);
  const earned = new Map((ctx.db.prepare('SELECT badge_id, at FROM badge_earned WHERE student_id = ?').all(student.id) as { badge_id: string; at: number }[]).map((r) => [r.badge_id, r.at]));
  const have = new Set(earned.keys());
  const settings = effectiveSettings(ctx, student);
  return {
    xp: row.xp,
    level: info.level,
    into: info.into,
    need: info.need,
    streak: streakToShow({ streak: row.streak, best: row.best_streak, lastDay: row.last_day, freezes: row.freezes }, today),
    bestStreak: row.best_streak,
    freezes: row.freezes,
    practisedToday: row.last_day === today,
    minutesToday: Math.floor(msToday(ctx, student.id) / 60_000),
    dailyGoalMinutes: settings.dailyGoalMinutes,
    avatar: row.avatar,
    palette: row.palette,
    badges: BADGES.map((b) => ({ id: b.id, icon: b.icon, name: b.name, how: b.how, earnedAt: earned.get(b.id) ?? null })),
    cosmetics: COSMETICS.map((c) => ({ id: c.id, kind: c.kind, icon: c.icon, name: c.name, unlocked: isUnlocked(c, info.level, have), unlock: c.unlock })),
    goals: listGoals(ctx, student.id),
  };
}

export function equip(ctx: Ctx, student: StudentRow, cosmeticId: string): void {
  const c = cosmeticById(cosmeticId);
  if (!c) throw new RewardError('unknown_cosmetic', 400);
  const row = getState(ctx, student.id);
  const have = new Set((ctx.db.prepare('SELECT badge_id FROM badge_earned WHERE student_id = ?').all(student.id) as { badge_id: string }[]).map((r) => r.badge_id));
  if (!isUnlocked(c, levelInfo(row.xp).level, have)) throw new RewardError('locked', 403);
  ctx.db.prepare(`UPDATE reward_state SET ${c.kind === 'avatar' ? 'avatar' : 'palette'} = ? WHERE student_id = ?`).run(c.id, student.id);
}

/** The small strip shown in the student header (cheaper than the full summary). */
export function header(ctx: Ctx, student: StudentRow): { level: number; xp: number; into: number; need: number; streak: number; avatar: string; palette: string } {
  const row = getState(ctx, student.id);
  const info = levelInfo(row.xp);
  const streak = streakToShow({ streak: row.streak, best: row.best_streak, lastDay: row.last_day, freezes: row.freezes }, localDay(ctx.now(), ctx.cfg.timezone));
  return { level: info.level, xp: row.xp, into: info.into, need: info.need, streak, avatar: row.avatar, palette: row.palette };
}
