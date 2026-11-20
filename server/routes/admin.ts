import { Router, type Request } from 'express';
import { z } from 'zod';
import type { Ctx, UserRow } from '../context.js';
import { requireUser } from '../context.js';
import { audit } from '../audit.js';
import { newId, nowIso } from '../db.js';
import { sendSignInLink } from './auth.js';

const me = (req: Request): UserRow => (req.auth as { kind: 'user'; user: UserRow }).user;

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

  r.use('/admin', requireUser('admin'));

  r.post('/admin/caregivers', async (req, res) => {
    const parsed = z
      .object({ email: z.string().trim().toLowerCase().email().max(254), displayName: z.string().trim().max(60).default('') })
      .safeParse(req.body);
    if (!parsed.success) return void res.status(400).json({ error: 'invalid_request' });
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
    await sendSignInLink(ctx, user, { invite: user.status === 'invited' });
    audit(ctx.db, { kind: 'admin', id: admin.id }, 'caregiver.invite', user.id);
    res.status(201).json({ id: user.id });
  });

  r.get('/admin/users', (_req, res) => {
    res.json({
      users: ctx.db
        .prepare('SELECT id, email, role, display_name AS displayName, status, created_at AS createdAt, last_login_at AS lastLoginAt FROM users ORDER BY created_at')
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
    res.json({ entries: ctx.db.prepare('SELECT id, at, actor_kind AS actorKind, actor_id AS actorId, action, target, meta_json AS meta FROM audit_log ORDER BY id DESC LIMIT ?').all(limit) });
  });

  return r;
}
