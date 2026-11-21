import type { Ctx, StudentRow } from '../context.js';
import { MASTERED } from '../../shared/engine/bkt.js';
import { listGoals, localDay } from './service.js';
import { summary } from './service.js';

export interface DayStat { day: string; answered: number; correct: number; minutes: number }

/** Progress a caregiver can read at a glance: effort, accuracy, strengths and where help would count. */
export function dashboard(ctx: Ctx, student: StudentRow) {
  const tz = ctx.cfg.timezone;
  const now = ctx.now();
  const today = localDay(now, tz);
  const rows = ctx.db.prepare("SELECT skill_id, correct, hints, ms, at, kind FROM attempt WHERE student_id = ? AND at >= ? AND kind != 'placement'").all(student.id, now - 31 * 86_400_000) as { skill_id: string; correct: number; hints: number; ms: number; at: number; kind: string }[];

  const days = new Map<string, DayStat>();
  for (let i = 13; i >= 0; i--) {
    const d = localDay(now - i * 86_400_000, tz);
    days.set(d, { day: d, answered: 0, correct: 0, minutes: 0 });
  }
  const windows = { d7: { answered: 0, correct: 0, ms: 0 }, d30: { answered: 0, correct: 0, ms: 0 }, prev7: { answered: 0, correct: 0, ms: 0 } };
  for (const r of rows) {
    const d = localDay(r.at, tz);
    const st = days.get(d);
    if (st) { st.answered += 1; st.correct += r.correct; st.minutes += r.ms / 60_000; }
    const age = now - r.at;
    for (const [k, span] of [['d7', 7], ['d30', 30]] as const) if (age <= span * 86_400_000) { windows[k].answered += 1; windows[k].correct += r.correct; windows[k].ms += r.ms; }
    if (age > 7 * 86_400_000 && age <= 14 * 86_400_000) { windows.prev7.answered += 1; windows.prev7.correct += r.correct; windows.prev7.ms += r.ms; }
  }

  const sk = ctx.db
    .prepare(
      `SELECT m.id AS skill, m.name, ce.strand, ce.strand_name AS strandName, ce.code AS expectation, ms.p_known AS p, ms.attempts, ms.correct, ms.next_review_at AS nextReview
         FROM mastery ms JOIN microskill m ON m.id = ms.skill_id JOIN curriculum_expectation ce ON ce.code = m.expectation WHERE ms.student_id = ?`,
    )
    .all(student.id) as { skill: string; name: string; strand: string; strandName: string; expectation: string; p: number; attempts: number; correct: number; nextReview: number | null }[];

  const strands = new Map<string, { strand: string; name: string; attempts: number; correct: number; mastered: number; practised: number }>();
  for (const s of sk) {
    const e = strands.get(s.strand) ?? { strand: s.strand, name: s.strandName, attempts: 0, correct: 0, mastered: 0, practised: 0 };
    e.attempts += s.attempts; e.correct += s.correct; e.practised += 1;
    if (s.p >= MASTERED) e.mastered += 1;
    strands.set(s.strand, e);
  }

  const attention = sk
    .filter((s) => s.attempts >= 4 && s.p < 0.45)
    .sort((a, b) => a.p - b.p)
    .slice(0, 5)
    .map((s) => ({ skill: s.skill, name: s.name, expectation: s.expectation, accuracy: Math.round((s.correct / s.attempts) * 100), attempts: s.attempts }));
  const dueReviews = sk.filter((s) => s.nextReview !== null && s.nextReview <= now).length;
  const rewards = summary(ctx, student);
  const recentBadges = (ctx.db.prepare('SELECT badge_id AS id, at FROM badge_earned WHERE student_id = ? ORDER BY at DESC LIMIT 5').all(student.id) as { id: string; at: number }[]).map((b) => ({ ...b, ...(rewards.badges.find((x) => x.id === b.id) ?? {}) }));
  const pct = (a: number, b: number): number | null => (b ? Math.round((a / b) * 100) : null);

  return {
    student: { id: student.id, displayName: student.display_name, grade: student.grade, language: student.language },
    today,
    level: rewards.level, xp: rewards.xp, streak: rewards.streak, bestStreak: rewards.bestStreak, freezes: rewards.freezes,
    minutesToday: rewards.minutesToday, dailyGoalMinutes: rewards.dailyGoalMinutes,
    week: { answered: windows.d7.answered, accuracy: pct(windows.d7.correct, windows.d7.answered), minutes: Math.round(windows.d7.ms / 60_000) },
    prevWeek: { answered: windows.prev7.answered, accuracy: pct(windows.prev7.correct, windows.prev7.answered), minutes: Math.round(windows.prev7.ms / 60_000) },
    month: { answered: windows.d30.answered, accuracy: pct(windows.d30.correct, windows.d30.answered), minutes: Math.round(windows.d30.ms / 60_000) },
    days: [...days.values()].map((d) => ({ ...d, minutes: Math.round(d.minutes) })),
    skillsMastered: sk.filter((s) => s.p >= MASTERED).length,
    skillsPractised: sk.length,
    strands: [...strands.values()].map((s) => ({ ...s, accuracy: pct(s.correct, s.attempts) })).sort((a, b) => a.strand.localeCompare(b.strand)),
    attention, dueReviews, recentBadges,
    goals: listGoals(ctx, student.id, true),
  };
}
