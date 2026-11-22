import { Router, type Request } from 'express';
import { z } from 'zod';
import type { Ctx, StudentRow, UserRow } from '../context.js';
import { requireUser } from '../context.js';
import { hashPin } from '../crypto.js';
import { audit } from '../audit.js';
import { newId, nowIso } from '../db.js';
import { publicStudent, sendSignInLink } from './auth.js';
import { renderEmail } from '../email.js';
import { noteSchema } from '../note.js';

const username = z.string().trim().regex(/^[a-z0-9_]{3,20}$/i, 'username');
const pin = z.string().regex(/^\d{4}$/, 'pin');
const settings = z
  .object({
    voice: z.boolean().optional(),
    voiceRate: z.number().min(0.5).max(2).optional(),
    autoRead: z.boolean().optional(),
    dailyGoalMinutes: z.number().int().min(0).max(240).optional(),
    sessionLimitMinutes: z.number().int().min(0).max(240).optional(),
    theme: z.enum(['auto', 'playful', 'hud', 'pro']).optional(),
    highContrast: z.boolean().optional(),
    dyslexiaFont: z.boolean().optional(),
    reducedMotion: z.boolean().optional(),
  })
  .strict();
const allowed = z.object({ grades: z.array(z.number().int().min(5).max(12)).max(8), courses: z.array(z.string().regex(/^[A-Z0-9]{5}$/)).max(20) }).strict();

const me = (req: Request): UserRow => (req.auth as { kind: 'user'; user: UserRow }).user;

/**
 * A person reaches only the students they are linked to, as owner or as an additional (co) caregiver. The install admin has no
 * special reach into a household: admins manage accounts, never a family's data. An unknown id and someone else's student
 * look the same (null), so ids cannot be probed.
 */
export function access(ctx: Ctx, user: UserRow, studentId: string): { student: StudentRow; role: 'owner' | 'co' } | null {
  const student = ctx.db.prepare('SELECT * FROM students WHERE id = ?').get(studentId) as StudentRow | undefined;
  if (!student) return null;
  const link = ctx.db.prepare('SELECT role FROM student_caregivers WHERE student_id = ? AND caregiver_id = ?').get(studentId, user.id) as
    | { role: 'owner' | 'co' }
    | undefined;
  return link ? { student, role: link.role } : null;
}

/** True when one of the students this caregiver can reach already has the username. Usernames only have to be unique inside a household. */
export function usernameInUse(ctx: Ctx, caregiverId: string, username: string, exceptStudentId = ''): boolean {
  return !!ctx.db
    .prepare('SELECT 1 FROM students s JOIN student_caregivers sc ON sc.student_id = s.id WHERE sc.caregiver_id = ? AND s.username = ? AND s.id != ?')
    .get(caregiverId, username, exceptStudentId);
}

export function studentRoutes(ctx: Ctx): Router {
  const r = Router();
  r.use('/students', requireUser());

  r.get('/students', (req, res) => {
    const user = me(req);
    const rows = ctx.db
      .prepare('SELECT s.*, sc.role AS link_role FROM students s JOIN student_caregivers sc ON sc.student_id = s.id WHERE sc.caregiver_id = ? ORDER BY s.display_name')
      .all(user.id) as (StudentRow & { link_role: string })[];
    res.json({ students: rows.map((s) => ({ ...publicStudent(s), linkRole: s.link_role })) });
  });

  r.post('/students', requireUser('caregiver'), (req, res) => {
    const parsed = z
      .object({ displayName: z.string().trim().min(1).max(40), username, pin, grade: z.number().int().min(5).max(12), language: z.enum(['en', 'fr']).default('en') })
      .safeParse(req.body);
    if (!parsed.success) return void res.status(400).json({ error: 'invalid_request', fields: parsed.error.issues.map((i) => i.message) });
    const user = me(req);
    const d = parsed.data;
    if (usernameInUse(ctx, user.id, d.username)) return void res.status(409).json({ error: 'username_taken' });
    const id = newId();
    ctx.db.transaction(() => {
      ctx.db
        .prepare('INSERT INTO students (id, username, display_name, pin_hash, grade, language, created_by, created_at) VALUES (?,?,?,?,?,?,?,?)')
        .run(id, d.username, d.displayName, hashPin(d.pin), d.grade, d.language, user.id, nowIso());
      ctx.db.prepare("INSERT INTO student_caregivers (student_id, caregiver_id, role, added_by, added_at) VALUES (?,?,'owner',?,?)").run(id, user.id, user.id, nowIso());
    })();
    audit(ctx.db, { kind: 'caregiver', id: user.id }, 'student.create', id);
    res.status(201).json({ id });
  });

  r.patch('/students/:id', (req, res) => {
    const parsed = z
      .object({ displayName: z.string().trim().min(1).max(40), grade: z.number().int().min(5).max(12), language: z.enum(['en', 'fr']), settings, allowed, pin })
      .partial()
      .strict()
      .safeParse(req.body);
    if (!parsed.success) return void res.status(400).json({ error: 'invalid_request' });
    const a = access(ctx, me(req), req.params.id as string);
    if (!a) return void res.status(404).json({ error: 'not_found' });
    const d = parsed.data;
    const s = a.student;
    if (d.pin !== undefined && a.role !== 'owner') return void res.status(403).json({ error: 'forbidden' }); // only the owner changes a PIN
    ctx.db
      .prepare('UPDATE students SET display_name = ?, grade = ?, language = ?, settings_json = ?, allowed_json = ?, pin_hash = ?, pin_failures = 0, locked_until = 0 WHERE id = ?')
      .run(
        d.displayName ?? s.display_name, d.grade ?? s.grade, d.language ?? s.language,
        d.settings ? JSON.stringify({ ...(JSON.parse(s.settings_json) as object), ...d.settings }) : s.settings_json,
        d.allowed ? JSON.stringify(d.allowed) : s.allowed_json,
        d.pin ? hashPin(d.pin) : s.pin_hash, s.id,
      );
    audit(ctx.db, { kind: me(req).role, id: me(req).id }, 'student.update', s.id, { fields: Object.keys(d).filter((k) => k !== 'pin') });
    res.json({ ok: true });
  });

  // Co-caregiver sharing (owner only). Unknown emails become invited caregivers and get a sign-in link.
  r.post('/students/:id/caregivers', async (req, res) => {
    const parsed = z.object({ email: z.string().trim().toLowerCase().email().max(254), note: noteSchema }).safeParse(req.body);
    if (!parsed.success) return void res.status(400).json({ error: parsed.error.issues.some((i) => i.message === 'has_link') ? 'note_has_link' : 'invalid_request' });
    const user = me(req);
    const a = access(ctx, user, req.params.id as string);
    if (!a || a.role !== 'owner') return void res.status(a ? 403 : 404).json({ error: a ? 'forbidden' : 'not_found' });
    // The answer is the same whether or not the address already has an account, so this cannot be used to find out who uses MathQuest.
    let target = ctx.db.prepare('SELECT * FROM users WHERE email = ?').get(parsed.data.email) as UserRow | undefined;
    let invited = false;
    if (target && (target.role !== 'caregiver' || target.status === 'disabled')) return void res.status(201).json({ ok: true });
    if (target && target.id === user.id) return void res.status(201).json({ ok: true });
    // The recipient signs in on their own devices, where a username must pick out one child: refuse a clash before sharing.
    if (target && usernameInUse(ctx, target.id, a.student.username, a.student.id)) return void res.status(409).json({ error: 'username_conflict' });
    if (!target) {
      const id = newId();
      ctx.db.prepare("INSERT INTO users (id, email, role, status, invited_by, created_at) VALUES (?,?, 'caregiver','invited',?,?)").run(id, parsed.data.email, user.id, nowIso());
      target = ctx.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow;
      invited = true;
    }
    const added = ctx.db.prepare("INSERT OR IGNORE INTO student_caregivers (student_id, caregiver_id, role, added_by, added_at) VALUES (?,?,'co',?,?)").run(a.student.id, target.id, user.id, nowIso());
    if (invited) await sendSignInLink(ctx, target, { invite: true, note: parsed.data.note || undefined, from: user.display_name || user.email });
    else if (added.changes === 1) await notifyShared(ctx, target, a.student, user);
    audit(ctx.db, { kind: user.role, id: user.id }, 'student.share', a.student.id, { caregiver: target.id, noteAttached: invited && !!parsed.data.note });
    res.status(201).json({ ok: true });
  });

  r.delete('/students/:id/caregivers/:cid', (req, res) => {
    const user = me(req);
    const a = access(ctx, user, req.params.id as string);
    if (!a || a.role !== 'owner') return void res.status(a ? 403 : 404).json({ error: a ? 'forbidden' : 'not_found' });
    const result = ctx.db.prepare("DELETE FROM student_caregivers WHERE student_id = ? AND caregiver_id = ? AND role = 'co'").run(a.student.id, req.params.cid);
    if (result.changes !== 1) return void res.status(404).json({ error: 'not_found' });
    audit(ctx.db, { kind: user.role, id: user.id }, 'student.unshare', a.student.id, { caregiver: req.params.cid });
    res.json({ ok: true });
  });

  r.get('/students/:id/export', (req, res) => {
    const user = me(req);
    const a = access(ctx, user, req.params.id as string);
    if (!a) return void res.status(404).json({ error: 'not_found' });
    const id = a.student.id;
    audit(ctx.db, { kind: user.role, id: user.id }, 'student.export', id);
    res.json({
      exportedAt: nowIso(),
      student: publicStudent(a.student),
      mastery: ctx.db.prepare('SELECT skill_id, p_known, tier, attempts, correct, last_seen_at, next_review_at FROM mastery WHERE student_id = ?').all(id),
      attempts: ctx.db.prepare('SELECT skill_id, tier, correct, hints, tries, ms, at FROM attempt WHERE student_id = ? ORDER BY at').all(id),
      rewards: {
        state: ctx.db.prepare('SELECT xp, streak, best_streak, last_day, freezes, avatar, palette FROM reward_state WHERE student_id = ?').get(id) ?? null,
        events: ctx.db.prepare('SELECT at, kind, xp FROM reward_event WHERE student_id = ? ORDER BY at').all(id),
        badges: ctx.db.prepare('SELECT badge_id, at FROM badge_earned WHERE student_id = ? ORDER BY at').all(id),
        goals: ctx.db.prepare('SELECT title, xp_target, created_at, reached_at, redeemed_at FROM goal WHERE student_id = ? ORDER BY created_at').all(id),
      },
    });
  });

  r.delete('/students/:id', (req, res) => {
    const user = me(req);
    const a = access(ctx, user, req.params.id as string);
    if (!a || a.role !== 'owner') return void res.status(a ? 403 : 404).json({ error: a ? 'forbidden' : 'not_found' });
    ctx.db.transaction(() => {
      ctx.db.prepare("DELETE FROM sessions WHERE kind = 'student' AND subject_id = ?").run(a.student.id);
      ctx.db.prepare("DELETE FROM tour_seen WHERE subject_kind = 'student' AND subject_id = ?").run(a.student.id);
      ctx.db.prepare('DELETE FROM students WHERE id = ?').run(a.student.id); // cascades mastery, attempts, links
    })();
    audit(ctx.db, { kind: user.role, id: user.id }, 'student.delete', a.student.id);
    res.json({ ok: true });
  });

  return r;
}

/** Tells an existing caregiver that a student was shared with them, so nothing appears in their account unannounced. */
async function notifyShared(ctx: Ctx, target: UserRow, student: StudentRow, by: UserRow): Promise<void> {
  const from = by.display_name || by.email;
  const text = `${from} shared ${student.display_name} with you on MathQuest. You can now see their progress, set goals and send messages. Open MathQuest: ${ctx.cfg.baseUrl}/app`;
  await ctx.mailer.send({
    to: target.email,
    subject: `${student.display_name} was shared with you on MathQuest`,
    text,
    html: renderEmail({
      lang: 'en', baseUrl: ctx.cfg.baseUrl, title: `${student.display_name} was shared with you`, preheader: `${from} shared a student with you.`,
      intro: [`${from} shared ${student.display_name} with you. You can now see their progress, set goals and send messages.`],
      button: { label: 'Open MathQuest', url: `${ctx.cfg.baseUrl}/app` },
    }),
  });
}
