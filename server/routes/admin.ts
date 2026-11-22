import { Router, type Request } from 'express';
import { z } from 'zod';
import type { Ctx, UserRow } from '../context.js';
import { requireUser } from '../context.js';
import { audit } from '../audit.js';
import { newId, nowIso } from '../db.js';
import { sendSignInLink } from './auth.js';
import { noteSchema } from '../note.js';
import { composeWeekly } from '../weekly.js';

const me = (req: Request): UserRow => (req.auth as { kind: 'user'; user: UserRow }).user;

/** The kinds of audit entry the admin can read: sign-ins, invitations, account changes and deletions, upgrades and question-bank review. */
const ACCOUNT_AUDIT = ['auth.login', 'admin.%', 'caregiver.invite', 'user.%', 'account.%', 'upgrade.%', 'ai.%'];

export function adminRoutes(ctx: Ctx): Router {
  const r = Router();

  // Caregiver preferences (defaults for their students; a student's own settings override these).
  r.put('/me/defaults', requireUser(), (req, res) => {
    const parsed = z
      .object({
        dailyGoalMinutes: z.number().int().min(0).max(240).optional(),
        sessionLimitMinutes: z.number().int().min(0).max(240).optional(),
        voice: z.boolean().optional(),
        weeklyEmail: z.boolean().optional(),
        weeklyDay: z.number().int().min(0).max(6).optional(), // 0 = Sunday ... 6 = Saturday
      })
      .strict()
      .safeParse(req.body);
    if (!parsed.success) return void res.status(400).json({ error: 'invalid_request' });
    const { weeklyEmail, ...defaults } = parsed.data;
    const u = me(req);
    ctx.db
      .prepare('UPDATE users SET defaults_json = ?, weekly_email = ? WHERE id = ?')
      .run(JSON.stringify({ ...(JSON.parse(u.defaults_json) as object), ...defaults }), weeklyEmail === undefined ? u.weekly_email : weeklyEmail ? 1 : 0, u.id);
    res.json({ ok: true });
  });

  // Sends the caregiver their own weekly summary now, so they can see what it looks like (it does not count as the week's email).
  r.post('/me/weekly-test', requireUser(), async (req, res) => {
    const u = me(req);
    const key = `weeklytest:${u.id}`;
    const last = ctx.db.prepare('SELECT value FROM kv WHERE key = ?').get(key) as { value: string } | undefined;
    if (last && ctx.now() - Number(last.value) < 60_000) return void res.status(429).json({ error: 'too_soon' });
    ctx.db.prepare('INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, String(ctx.now()));
    const msg = composeWeekly(ctx, { id: u.id, email: u.email, display_name: u.display_name });
    if (!msg) return void res.json({ ok: true, sent: false, reason: 'no_students' });
    const sent = await ctx.mailer.send({ to: u.email, ...msg });
    res.json({ ok: true, sent });
  });

  r.use('/admin', requireUser('admin'));

  r.post('/admin/caregivers', async (req, res) => {
    const parsed = z
      .object({ email: z.string().trim().toLowerCase().email().max(254), displayName: z.string().trim().max(60).default(''), note: noteSchema })
      .safeParse(req.body);
    if (!parsed.success) return void res.status(400).json({ error: parsed.error.issues.some((i) => i.message === 'has_link') ? 'note_has_link' : 'invalid_request' });
    const admin = me(req);
    let user = ctx.db.prepare('SELECT * FROM users WHERE email = ?').get(parsed.data.email) as UserRow | undefined;
    if (!user) {
      const id = newId();
      ctx.db
        .prepare("INSERT INTO users (id, email, role, display_name, status, invited_by, created_at) VALUES (?,?, 'caregiver',?, 'invited',?,?)")
        .run(id, parsed.data.email, parsed.data.displayName, admin.id, nowIso());
      user = ctx.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow;
    } else if (user.status === 'disabled') {
      return void res.status(409).json({ error: 'user_disabled' });
    }
    await sendSignInLink(ctx, user, { invite: user.status === 'invited', note: parsed.data.note || undefined, from: admin.display_name || admin.email });
    audit(ctx.db, { kind: 'admin', id: admin.id }, 'caregiver.invite', user.id, { noteAttached: !!parsed.data.note });
    res.status(201).json({ id: user.id });
  });

  r.get('/admin/users', (_req, res) => {
    res.json({
      users: ctx.db
        // Counts only: how many students each account owns and helps with. Never which students, and never anything about them.
        .prepare("SELECT u.id, u.email, u.role, u.display_name AS displayName, u.status, u.created_at AS createdAt, u.last_login_at AS lastLoginAt, (SELECT COUNT(*) FROM student_caregivers sc WHERE sc.caregiver_id = u.id AND sc.role = 'owner') AS owns, (SELECT COUNT(*) FROM student_caregivers sc WHERE sc.caregiver_id = u.id AND sc.role = 'co') AS helps FROM users u ORDER BY u.created_at")
        .all(),
    });
  });

  r.patch('/admin/users/:id', (req, res) => {
    const parsed = z.object({ status: z.enum(['active', 'disabled']) }).safeParse(req.body);
    if (!parsed.success) return void res.status(400).json({ error: 'invalid_request' });
    const admin = me(req);
    if (req.params.id === admin.id) return void res.status(400).json({ error: 'cannot_change_self' });
    const result = ctx.db.prepare('UPDATE users SET status = ? WHERE id = ?').run(parsed.data.status, req.params.id);
    if (result.changes !== 1) return void res.status(404).json({ error: 'not_found' });
    if (parsed.data.status === 'disabled') ctx.db.prepare("DELETE FROM sessions WHERE kind = 'user' AND subject_id = ?").run(req.params.id);
    audit(ctx.db, { kind: 'admin', id: admin.id }, `user.${parsed.data.status}`, req.params.id);
    res.json({ ok: true });
  });

  r.get('/admin/audit', (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    // Account-level events only. What families do (students, goals, messages, devices, worksheets) is never shown to the admin.
    const where = ACCOUNT_AUDIT.map(() => 'action LIKE ?').join(' OR ');
    res.json({ entries: ctx.db.prepare(`SELECT id, at, actor_kind AS actorKind, actor_id AS actorId, action, target, meta_json AS meta FROM audit_log WHERE ${where} ORDER BY id DESC LIMIT ?`).all(...ACCOUNT_AUDIT, limit) });
  });

  return r;
}
