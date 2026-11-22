import { Router, type Request } from 'express';
import { z } from 'zod';
import type { Ctx, StudentRow, UserRow } from '../context.js';
import { requireUser } from '../context.js';
import { hashPin } from '../crypto.js';
import { audit } from '../audit.js';
import { newId, nowIso } from '../db.js';
import { publicStudent, sendSignInLink } from './auth.js';
import { studentExport } from '../export.js';
import { MAX_CAREGIVERS, addLink, caregiverCount, linkRole, notifyOwnersShared, notifyShared, ownerIds, usernameInUse } from '../household.js';
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
    if (usernameInUse(ctx.db, user.id, d.username)) return void res.status(409).json({ error: 'username_taken' });
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

  // Sharing a student with another caregiver (owners only), as a helper or as a second owner. Unknown emails become invited caregivers and get a
  // sign-in link. The answer is the same whether or not the address already has an account.
  r.post('/students/:id/caregivers', async (req, res) => {
    const parsed = z.object({ email: z.string().trim().toLowerCase().email().max(254), note: noteSchema, role: z.enum(['owner', 'co']).default('co') }).safeParse(req.body);
    if (!parsed.success) return void res.status(400).json({ error: parsed.error.issues.some((i) => i.message === 'has_link') ? 'note_has_link' : 'invalid_request' });
    const user = me(req);
    const a = access(ctx, user, req.params.id as string);
    if (!a || a.role !== 'owner') return void res.status(a ? 403 : 404).json({ error: a ? 'forbidden' : 'not_found' });
    if (!ctx.limits.invite.take(user.id)) return void res.status(429).json({ error: 'too_many_requests' });
    let target = ctx.db.prepare('SELECT * FROM users WHERE email = ?').get(parsed.data.email) as UserRow | undefined;
    if (target && (target.role !== 'caregiver' || target.status === 'disabled' || target.id === user.id)) return void res.status(201).json({ ok: true });
    if (caregiverCount(ctx.db, a.student.id) >= MAX_CAREGIVERS && !(target && linkRole(ctx.db, a.student.id, target.id))) return void res.status(409).json({ error: 'too_many_caregivers' });
    // The recipient signs in on their own devices, where a username must pick out one child: refuse a clash before sharing.
    if (target && !linkRole(ctx.db, a.student.id, target.id) && usernameInUse(ctx.db, target.id, a.student.username, a.student.id)) return void res.status(409).json({ error: 'username_conflict' });
    let invited = false;
    if (!target) {
      const id = newId();
      ctx.db.prepare("INSERT INTO users (id, email, role, status, invited_by, created_at) VALUES (?,?, 'caregiver','invited',?,?)").run(id, parsed.data.email, user.id, nowIso());
      target = ctx.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow;
      invited = true;
    }
    const result = addLink(ctx.db, a.student, target, parsed.data.role, user);
    if (invited) await sendSignInLink(ctx, target, { invite: true, note: parsed.data.note || undefined, from: user.display_name || user.email });
    else if (result === 'added') await notifyShared(ctx, target, a.student, user, parsed.data.role);
    if (result === 'added') await notifyOwnersShared(ctx, [a.student], user, target, parsed.data.role);
    audit(ctx.db, { kind: user.role, id: user.id }, 'student.share', a.student.id, { caregiver: target.id, role: parsed.data.role, noteAttached: invited && !!parsed.data.note });
    res.status(201).json({ ok: true });
  });

  // Remove a helper (an owner does this), or leave a student yourself (anyone on it, unless you are its only owner). Owners never remove each other.
  r.delete('/students/:id/caregivers/:cid', (req, res) => {
    const user = me(req);
    const a = access(ctx, user, req.params.id as string);
    if (!a) return void res.status(404).json({ error: 'not_found' });
    const cid = req.params.cid as string;
    if (cid === user.id) {
      if (a.role === 'owner' && ownerIds(ctx.db, a.student.id).length < 2) return void res.status(409).json({ error: 'last_owner' });
      ctx.db.prepare('DELETE FROM student_caregivers WHERE student_id = ? AND caregiver_id = ?').run(a.student.id, user.id);
      audit(ctx.db, { kind: user.role, id: user.id }, 'student.leave', a.student.id);
      return void res.json({ ok: true });
    }
    if (a.role !== 'owner') return void res.status(403).json({ error: 'forbidden' });
    const target = linkRole(ctx.db, a.student.id, cid);
    if (!target) return void res.status(404).json({ error: 'not_found' });
    if (target === 'owner') return void res.status(403).json({ error: 'forbidden' });
    ctx.db.prepare("DELETE FROM student_caregivers WHERE student_id = ? AND caregiver_id = ? AND role = 'co'").run(a.student.id, cid);
    audit(ctx.db, { kind: user.role, id: user.id }, 'student.unshare', a.student.id, { caregiver: cid });
    res.json({ ok: true });
  });

  r.get('/students/:id/export', (req, res) => {
    const user = me(req);
    const a = access(ctx, user, req.params.id as string);
    if (!a) return void res.status(404).json({ error: 'not_found' });
    audit(ctx.db, { kind: user.role, id: user.id }, 'student.export', a.student.id);
    res.json({ exportedAt: nowIso(), ...studentExport(ctx, a.student) });
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
