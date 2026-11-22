// Household and family accounts: who is on a student and in what role, handing a student over, leaving, inviting a co-parent to all
// your students at once, downloading your whole account, and deleting it after a waiting period.
import { Router, type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';
import type { Ctx, StudentRow, UserRow } from '../context.js';
import { requireUser } from '../context.js';
import { audit } from '../audit.js';
import { ACTIVITY_DAYS } from '../jobs.js';
import { newId, nowIso } from '../db.js';
import { caregiverExport } from '../export.js';
import { DELETE_GRACE_MS, addLink, caregiversOf, deletePreview, linkRole, MAX_CAREGIVERS, notice, notifyOwnersShared, notifyShared, ownerIds, welcomeFor } from '../household.js';
import { sendSignInLink } from './auth.js';
import { access } from './students.js';
import { noteSchema } from '../note.js';

const me = (req: Request): UserRow => (req.auth as { kind: 'user'; user: UserRow }).user;
const nameOf = (u: UserRow): string => u.display_name || u.email;

/** The admin account holds no students and is not a family: these routes are for caregivers. */
const familyOnly = (req: Request, res: Response, next: NextFunction): void => {
  if (req.auth?.kind === 'user' && req.auth.user.role === 'admin') return void res.status(403).json({ error: 'forbidden' });
  next();
};
export function householdRoutes(ctx: Ctx): Router {
  const r = Router();

  // The caregivers on one student: visible to anyone on that student, and to nobody else.
  r.get('/students/:id/caregivers', requireUser('caregiver'), (req, res) => {
    const a = access(ctx, me(req), req.params.id as string);
    if (!a) return void res.status(404).json({ error: 'not_found' });
    res.json({ youRole: a.role, max: MAX_CAREGIVERS, caregivers: caregiversOf(ctx.db, a.student.id, me(req).id) });
  });

  // Make a helper an owner, or step down from owner to helper. Owners never demote or remove each other: each owner can only step down themselves.
  // What has happened on this student, newest first: who looked, changed or shared what, and when. Every caregiver on the student can read it; nobody else can.
  r.get('/students/:id/activity', requireUser('caregiver'), (req, res) => {
    const a = access(ctx, me(req), req.params.id as string);
    if (!a) return void res.status(404).json({ error: 'not_found' });
    const before = Number(req.query.before) || Number.MAX_SAFE_INTEGER;
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const rows = ctx.db.prepare('SELECT id, at, actor_kind AS actorKind, actor_id AS actorId, action, meta_json AS meta FROM audit_log WHERE student_id = ? AND id < ? ORDER BY id DESC LIMIT ?').all(a.student.id, before, limit + 1) as { id: number; at: string; actorKind: string; actorId: string | null; action: string; meta: string }[];
    const on = new Map(caregiversOf(ctx.db, a.student.id, me(req).id).map((c) => [c.id, c]));
    const who = (id: string | null) => (id && on.get(id) ? { name: on.get(id)!.displayName || on.get(id)!.email, you: on.get(id)!.you } : null);
    const SHOWN = ['role', 'fields', 'xpTarget', 'count', 'focus'];
    const entries = rows.slice(0, limit).map((e) => {
      const meta = JSON.parse(e.meta) as Record<string, unknown>;
      return {
        id: e.id,
        at: e.at,
        action: e.action,
        actor: e.actorKind === 'student' ? { name: a.student.display_name, student: true } : e.actorKind === 'system' ? { system: true } : (who(e.actorId) ?? { former: true }),
        other: typeof meta.caregiver === 'string' ? who(meta.caregiver) ?? { former: true } : typeof meta.to === 'string' ? who(meta.to) ?? { former: true } : undefined,
        detail: Object.fromEntries(Object.entries(meta).filter(([k]) => SHOWN.includes(k))),
      };
    });
    res.json({ entries, more: rows.length > limit, keepDays: ACTIVITY_DAYS });
  });

  r.patch('/students/:id/caregivers/:cid', requireUser('caregiver'), (req, res) => {
    const parsed = z.object({ role: z.enum(['owner', 'co']) }).strict().safeParse(req.body);
    if (!parsed.success) return void res.status(400).json({ error: 'invalid_request' });
    const user = me(req);
    const a = access(ctx, user, req.params.id as string);
    if (!a) return void res.status(404).json({ error: 'not_found' });
    if (a.role !== 'owner') return void res.status(403).json({ error: 'forbidden' });
    const cid = req.params.cid as string;
    const current = linkRole(ctx.db, a.student.id, cid);
    if (!current) return void res.status(404).json({ error: 'not_found' });
    if (current === parsed.data.role) return void res.json({ ok: true });
    if (parsed.data.role === 'co') {
      if (cid !== user.id) return void res.status(403).json({ error: 'forbidden' }); // only you can step down
      if (ownerIds(ctx.db, a.student.id).length < 2) return void res.status(409).json({ error: 'last_owner' });
    }
    ctx.db.prepare('UPDATE student_caregivers SET role = ? WHERE student_id = ? AND caregiver_id = ?').run(parsed.data.role, a.student.id, cid);
    audit(ctx.db, { kind: 'caregiver', id: user.id }, 'student.role', a.student.id, { caregiver: cid, role: parsed.data.role });
    res.json({ ok: true });
  });

  // Hand a student over: the other caregiver becomes an owner and you become a helper. Both get an email.
  r.post('/students/:id/transfer', requireUser('caregiver'), async (req, res) => {
    const parsed = z.object({ caregiverId: z.string().min(1).max(64) }).strict().safeParse(req.body);
    if (!parsed.success) return void res.status(400).json({ error: 'invalid_request' });
    const user = me(req);
    const a = access(ctx, user, req.params.id as string);
    if (!a) return void res.status(404).json({ error: 'not_found' });
    if (a.role !== 'owner') return void res.status(403).json({ error: 'forbidden' });
    const target = ctx.db.prepare("SELECT * FROM users WHERE id = ? AND role = 'caregiver' AND status != 'disabled'").get(parsed.data.caregiverId) as UserRow | undefined;
    if (!target || target.id === user.id || !linkRole(ctx.db, a.student.id, target.id)) return void res.status(404).json({ error: 'not_found' });
    ctx.db.transaction(() => {
      ctx.db.prepare("UPDATE student_caregivers SET role = 'owner' WHERE student_id = ? AND caregiver_id = ?").run(a.student.id, target.id);
      ctx.db.prepare("UPDATE student_caregivers SET role = 'co' WHERE student_id = ? AND caregiver_id = ?").run(a.student.id, user.id);
    })();
    audit(ctx.db, { kind: 'caregiver', id: user.id }, 'student.transfer', a.student.id, { to: target.id });
    await notice(ctx, target.email, `${a.student.display_name} was handed over to you on MathQuest`, `${nameOf(user)} made you an owner of ${a.student.display_name}. You can now share, change the PIN and delete.`, `${a.student.display_name} is yours now`);
    await notice(ctx, user.email, `You handed over ${a.student.display_name} on MathQuest`, `You handed ${a.student.display_name} over to ${nameOf(target)}. You can still see their progress and help.`, `You handed over ${a.student.display_name}`);
    res.json({ ok: true });
  });

  // Invite a co-parent to every student you own. Nothing about whether the address already has an account (or has a clashing username) is revealed.
  r.post('/me/invite-parent', requireUser('caregiver'), familyOnly, async (req, res) => {
    const parsed = z.object({ email: z.string().trim().toLowerCase().email().max(254), role: z.enum(['owner', 'co']).default('co'), note: noteSchema, studentIds: z.array(z.string().min(1).max(64)).min(1).max(100) }).strict().safeParse(req.body);
    if (!parsed.success) return void res.status(400).json({ error: parsed.error.issues.some((i) => i.message === 'has_link') ? 'note_has_link' : 'invalid_request' });
    const user = me(req);
    const owned = ctx.db.prepare("SELECT s.* FROM students s JOIN student_caregivers sc ON sc.student_id = s.id WHERE sc.caregiver_id = ? AND sc.role = 'owner' ORDER BY s.display_name").all(user.id) as StudentRow[];
    if (owned.length === 0) return void res.status(409).json({ error: 'no_students' });
    // Only the students the caller names, and only ones they own: an id that is not theirs is a mistake or tampering, and shares nothing.
    const wanted = new Set(parsed.data.studentIds);
    const mine = owned.filter((s) => wanted.has(s.id));
    if (mine.length !== wanted.size) return void res.status(404).json({ error: 'not_found' });
    if (!ctx.limits.invite.take(user.id)) return void res.status(429).json({ error: 'too_many_requests' });
    let target = ctx.db.prepare('SELECT * FROM users WHERE email = ?').get(parsed.data.email) as UserRow | undefined;
    if (target && (target.role !== 'caregiver' || target.status === 'disabled' || target.id === user.id)) return void res.status(201).json({ ok: true });
    let invited = false;
    if (!target) {
      const id = newId();
      ctx.db.prepare("INSERT INTO users (id, email, role, status, invited_by, created_at) VALUES (?,?, 'caregiver','invited',?,?)").run(id, parsed.data.email, user.id, nowIso());
      target = ctx.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow;
      invited = true;
    }
    const added = mine.filter((s) => addLink(ctx.db, s, target!, parsed.data.role, user) === 'added');
    for (const sid of added.map((x) => x.id)) audit(ctx.db, { kind: 'caregiver', id: user.id }, 'student.share', sid, { caregiver: target.id, role: parsed.data.role });
    audit(ctx.db, { kind: 'caregiver', id: user.id }, 'student.share', null, { caregiver: target.id, students: added.length, role: parsed.data.role, noteAttached: invited && !!parsed.data.note });
    if (invited) await sendSignInLink(ctx, target, { invite: true, note: parsed.data.note || undefined, from: nameOf(user) });
    else if (added.length > 0) await notifyShared(ctx, target, added[0]!, user, parsed.data.role).catch(() => undefined);
    if (added.length > 0) await notifyOwnersShared(ctx, added, user, target, parsed.data.role);
    res.status(201).json({ ok: true });
  });

  // Download everything in your account.
  r.get('/me/export', requireUser('caregiver'), familyOnly, (req, res) => {
    const user = me(req);
    if (!ctx.limits.exportAll.take(user.id)) return void res.status(429).json({ error: 'too_many_requests' });
    audit(ctx.db, { kind: 'caregiver', id: user.id }, 'account.export', user.id);
    res.setHeader('Content-Disposition', 'attachment; filename="mathquest-account.json"');
    res.json(caregiverExport(ctx, user));
  });

  // The one-time welcome for a caregiver who was invited to students: who shared what, and in which role. Only ever about the caller.
  r.get('/me/welcome', requireUser('caregiver'), familyOnly, (req, res) => {
    res.json(welcomeFor(ctx.db, me(req).id));
  });

  // Deleting your account: see what would happen, ask (with your email as the confirmation), cancel during the waiting period.
  r.get('/me/delete-preview', requireUser('caregiver'), familyOnly, (req, res) => {
    const user = me(req);
    res.json({ students: deletePreview(ctx.db, user.id), deleteAt: user.delete_at ?? null, graceDays: DELETE_GRACE_MS / 86_400_000 });
  });
  r.post('/me/delete', requireUser('caregiver'), familyOnly, async (req, res) => {
    const parsed = z.object({ confirm: z.string().trim().toLowerCase() }).strict().safeParse(req.body);
    const user = me(req);
    if (!parsed.success || parsed.data.confirm !== user.email.toLowerCase()) return void res.status(400).json({ error: 'confirm_email' });
    const blocked = deletePreview(ctx.db, user.id).filter((s) => s.outcome === 'transfer-needed');
    if (blocked.length > 0) return void res.status(409).json({ error: 'transfer_needed', students: blocked.map((b) => ({ id: b.id, displayName: b.displayName })) });
    const deleteAt = ctx.now() + DELETE_GRACE_MS;
    ctx.db.prepare('UPDATE users SET delete_at = ? WHERE id = ?').run(deleteAt, user.id);
    audit(ctx.db, { kind: 'caregiver', id: user.id }, 'account.delete_requested', user.id);
    const days = DELETE_GRACE_MS / 86_400_000;
    await notice(ctx, user.email, 'Your MathQuest account will be deleted', `You asked to delete your MathQuest account. It will be deleted in ${days} days, along with the students only you own. To change your mind, sign in and choose Cancel before then.`, 'Your account will be deleted');
    res.json({ ok: true, deleteAt });
  });
  r.post('/me/delete/cancel', requireUser('caregiver'), familyOnly, (req, res) => {
    const user = me(req);
    ctx.db.prepare('UPDATE users SET delete_at = NULL WHERE id = ?').run(user.id);
    audit(ctx.db, { kind: 'caregiver', id: user.id }, 'account.delete_cancelled', user.id);
    res.json({ ok: true });
  });

  return r;
}
