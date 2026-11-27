// What a caregiver can download: one student's data, or everything in their account. Shared by the per-student and the whole-account routes.
import type { Ctx, StudentRow, UserRow } from './context.js';
import { nowIso } from './db.js';
import { publicStudent } from './routes/auth.js';

export function studentExport(ctx: Ctx, student: StudentRow) {
  const id = student.id;
  return {
    student: publicStudent(student),
    mastery: ctx.db.prepare('SELECT skill_id, p_known, tier, attempts, correct, last_seen_at, next_review_at FROM mastery WHERE student_id = ?').all(id),
    attempts: ctx.db.prepare('SELECT skill_id, tier, correct, hints, tries, ms, at FROM attempt WHERE student_id = ? ORDER BY at').all(id),
    worksheets: ctx.db.prepare('SELECT sheet, marked_at, total, answered, correct, xp FROM worksheet_marked WHERE student_id = ? ORDER BY marked_at').all(id),
    rewards: {
      state: ctx.db.prepare('SELECT xp, streak, best_streak, last_day, freezes, avatar, palette, frame FROM reward_state WHERE student_id = ?').get(id) ?? null,
      events: ctx.db.prepare('SELECT at, kind, xp FROM reward_event WHERE student_id = ? ORDER BY at').all(id),
      badges: ctx.db.prepare('SELECT badge_id, at FROM badge_earned WHERE student_id = ? ORDER BY at').all(id),
      goals: ctx.db.prepare('SELECT title, xp_target, created_at, reached_at, redeemed_at FROM goal WHERE student_id = ? ORDER BY created_at').all(id),
    },
  };
}

/** Everything one caregiver can reach: their account, each student they are linked to (with their role), their family goals and the messages they sent. */
export function caregiverExport(ctx: Ctx, user: UserRow) {
  const links = ctx.db
    .prepare('SELECT s.*, sc.role AS link_role FROM students s JOIN student_caregivers sc ON sc.student_id = s.id WHERE sc.caregiver_id = ? ORDER BY s.display_name')
    .all(user.id) as (StudentRow & { link_role: 'owner' | 'co' })[];
  return {
    exportedAt: nowIso(),
    account: { email: user.email, displayName: user.display_name, weeklyEmail: !!user.weekly_email, defaults: JSON.parse(user.defaults_json) as unknown },
    students: links.map((s) => ({ role: s.link_role, ...studentExport(ctx, s) })),
    familyGoals: ctx.db.prepare('SELECT title, xp_target, created_at, reached_at, redeemed_at, archived FROM family_goal WHERE user_id = ? ORDER BY created_at').all(user.id),
    messagesSent: ctx.db
      .prepare('SELECT s.display_name AS student, m.body, m.created_at, m.read_at FROM student_message m JOIN students s ON s.id = m.student_id WHERE m.from_user = ? ORDER BY m.created_at')
      .all(user.id),
  };
}
