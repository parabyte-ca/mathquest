// The rules of a household: who owns and who helps with each student, who may be added, leave or be promoted, and what happens to a
// caregiver's students when their account is deleted. Pure functions over the database, so the routes, the nightly job and the tests agree.
import type { Ctx, StudentRow, UserRow } from './context.js';
import type { DB } from './db.js';
import { newId, nowIso } from './db.js';
import { renderEmail } from './email.js';
import type { Mailer } from './mail.js';
import type { Config } from './config.js';
import { audit } from './audit.js';

/** The most caregivers (owners and helpers together) one student can have. */
export const MAX_CAREGIVERS = 6;
/** How long a requested account deletion waits, during which the person can sign in and cancel it. */
export const DELETE_GRACE_MS = 14 * 86_400_000;

export type LinkRole = 'owner' | 'co';

export const linkRole = (db: DB, studentId: string, userId: string): LinkRole | null =>
  (db.prepare('SELECT role FROM student_caregivers WHERE student_id = ? AND caregiver_id = ?').get(studentId, userId) as { role: LinkRole } | undefined)?.role ?? null;
export const ownerIds = (db: DB, studentId: string): string[] =>
  (db.prepare("SELECT caregiver_id FROM student_caregivers WHERE student_id = ? AND role = 'owner' ORDER BY added_at, rowid").all(studentId) as { caregiver_id: string }[]).map((r) => r.caregiver_id);
export const caregiverCount = (db: DB, studentId: string): number =>
  (db.prepare('SELECT COUNT(*) AS n FROM student_caregivers WHERE student_id = ?').get(studentId) as { n: number }).n;

/** True when one of the students this caregiver can reach already has the username. Usernames only have to be unique inside a household. */
export function usernameInUse(db: DB, caregiverId: string, username: string, exceptStudentId = ''): boolean {
  return !!db
    .prepare('SELECT 1 FROM students s JOIN student_caregivers sc ON sc.student_id = s.id WHERE sc.caregiver_id = ? AND s.username = ? AND s.id != ?')
    .get(caregiverId, username, exceptStudentId);
}

/** The caregivers on one student, for anyone who is on it. */
export function caregiversOf(db: DB, studentId: string, viewerId: string) {
  const rows = db
    .prepare('SELECT u.id, u.email, u.display_name AS displayName, sc.role, sc.added_at AS addedAt FROM student_caregivers sc JOIN users u ON u.id = sc.caregiver_id WHERE sc.student_id = ? ORDER BY (sc.role = \'owner\') DESC, sc.added_at, sc.rowid')
    .all(studentId) as { id: string; email: string; displayName: string; role: LinkRole; addedAt: string }[];
  return rows.map((r) => ({ ...r, you: r.id === viewerId }));
}

export type AddResult = 'added' | 'exists' | 'conflict' | 'full';
/** Links a caregiver to a student, unless they are already on it, already have a different student with that username, or the student is full. */
export function addLink(db: DB, student: StudentRow, target: UserRow, role: LinkRole, by: UserRow): AddResult {
  if (linkRole(db, student.id, target.id)) return 'exists';
  if (caregiverCount(db, student.id) >= MAX_CAREGIVERS) return 'full';
  if (usernameInUse(db, target.id, student.username, student.id)) return 'conflict';
  db.prepare('INSERT INTO student_caregivers (student_id, caregiver_id, role, added_by, added_at) VALUES (?,?,?,?,?)').run(student.id, target.id, role, by.id, nowIso());
  return 'added';
}

/** A short email that tells a caregiver something changed on a student. Plain text always has the same words. */
export async function notice(ctx: Ctx, to: string, subject: string, line: string, title = subject): Promise<void> {
  await ctx.mailer.send({
    to, subject, text: `${line} Open MathQuest: ${ctx.cfg.baseUrl}/app`,
    html: renderEmail({ lang: 'en', baseUrl: ctx.cfg.baseUrl, title, preheader: line, intro: [line], button: { label: 'Open MathQuest', url: `${ctx.cfg.baseUrl}/app` } }),
  });
}
const nameOf = (u: UserRow): string => u.display_name || u.email;
export const notifyShared = (ctx: Ctx, target: UserRow, student: StudentRow, by: UserRow, role: LinkRole): Promise<void> =>
  notice(ctx, target.email, `${student.display_name} was shared with you on MathQuest`,
    `${nameOf(by)} shared ${student.display_name} with you${role === 'owner' ? ' as an owner' : ''}. You can now see their progress, set goals and send messages.`, `${student.display_name} was shared with you`);

// ── account deletion ───────────────────────────────────────────────────

export type Outcome = 'stays' | 'deleted' | 'transfer-needed' | 'leave';
/**
 * What deleting this caregiver's account would do to each student they are on: an owner with another owner leaves it with them ('stays');
 * the only owner of a student nobody else is on deletes it ('deleted'); the only owner of a student that helpers are on must hand it over
 * first ('transfer-needed'); a helper just leaves ('leave').
 */
export function deletePreview(db: DB, userId: string): { id: string; displayName: string; outcome: Outcome }[] {
  const rows = db
    .prepare('SELECT s.id, s.display_name AS displayName, sc.role FROM students s JOIN student_caregivers sc ON sc.student_id = s.id WHERE sc.caregiver_id = ? ORDER BY s.display_name')
    .all(userId) as { id: string; displayName: string; role: LinkRole }[];
  return rows.map((r) => {
    if (r.role === 'co') return { id: r.id, displayName: r.displayName, outcome: 'leave' as const };
    if (ownerIds(db, r.id).some((o) => o !== userId)) return { id: r.id, displayName: r.displayName, outcome: 'stays' as const };
    return { id: r.id, displayName: r.displayName, outcome: caregiverCount(db, r.id) > 1 ? ('transfer-needed' as const) : ('deleted' as const) };
  });
}

/** Deletes a caregiver's account and what only they own, leaving every other household's data and the students others are on untouched. */
export function purgeAccount(db: DB, userId: string): void {
  db.transaction(() => {
    for (const s of deletePreview(db, userId)) {
      if (s.outcome === 'deleted') {
        db.prepare("DELETE FROM sessions WHERE kind = 'student' AND subject_id = ?").run(s.id);
        db.prepare("DELETE FROM tour_seen WHERE subject_kind = 'student' AND subject_id = ?").run(s.id);
        db.prepare('DELETE FROM students WHERE id = ?').run(s.id);
        continue;
      }
      const heir = (db.prepare("SELECT caregiver_id FROM student_caregivers WHERE student_id = ? AND caregiver_id != ? ORDER BY (role = 'owner') DESC, added_at, rowid LIMIT 1").get(s.id, userId) as { caregiver_id: string } | undefined)?.caregiver_id;
      if (!heir) continue;
      db.prepare('UPDATE students SET created_by = ? WHERE id = ? AND created_by = ?').run(heir, s.id, userId);
      db.prepare('UPDATE goal SET created_by = ? WHERE student_id = ? AND created_by = ?').run(heir, s.id, userId);
    }
    db.prepare('UPDATE goal SET redeemed_by = NULL WHERE redeemed_by = ?').run(userId);
    db.prepare('UPDATE student_caregivers SET added_by = caregiver_id WHERE added_by = ?').run(userId);
    db.prepare('DELETE FROM student_message WHERE from_user = ?').run(userId);
    db.prepare('UPDATE users SET invited_by = NULL WHERE invited_by = ?').run(userId);
    db.prepare('UPDATE device_pairings SET approved_by = NULL WHERE approved_by = ?').run(userId);
    db.prepare("DELETE FROM sessions WHERE kind = 'user' AND subject_id = ?").run(userId);
    db.prepare("DELETE FROM tour_seen WHERE subject_kind = 'user' AND subject_id = ?").run(userId);
    db.prepare('DELETE FROM users WHERE id = ?').run(userId); // cascades their links, sign-in links, approved devices and family goals
  })();
}

/**
 * Carries out the account deletions whose waiting period has ended. If a student the person owns has since gained helpers, the deletion
 * is cancelled (and they are told) rather than leaving helpers without an owner. Returns how many accounts were deleted.
 */
export async function purgeDueAccounts(db: DB, cfg: Pick<Config, 'baseUrl'>, mailer: Mailer | undefined, now = Date.now()): Promise<number> {
  const due = db.prepare("SELECT * FROM users WHERE delete_at IS NOT NULL AND delete_at <= ? AND role = 'caregiver'").all(now) as UserRow[];
  let done = 0;
  for (const u of due) {
    const blocked = deletePreview(db, u.id).filter((s) => s.outcome === 'transfer-needed');
    if (blocked.length > 0) {
      db.prepare('UPDATE users SET delete_at = NULL WHERE id = ?').run(u.id);
      audit(db, { kind: 'system' }, 'account.delete_cancelled', u.id, { reason: 'transfer_needed' });
      await mailer?.send({ to: u.email, subject: 'Your MathQuest account was not deleted', text: `Your account was not deleted because ${blocked.map((b) => b.displayName).join(', ')} now has other caregivers. Hand ${blocked.length > 1 ? 'them' : 'it'} over to one of them first, then ask again. Open MathQuest: ${cfg.baseUrl}/app` });
      continue;
    }
    purgeAccount(db, u.id);
    audit(db, { kind: 'system' }, 'account.deleted', newId()); // the account is gone, so the entry carries no id that leads back to it
    await mailer?.send({ to: u.email, subject: 'Your MathQuest account was deleted', text: 'Your MathQuest account and the students only you owned have been deleted, as you asked. Thank you for trying MathQuest.' });
    done++;
  }
  return done;
}
