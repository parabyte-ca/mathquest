import { Router } from 'express';
import { z } from 'zod';
import type { Ctx, StudentRow, UserRow } from '../context.js';
import { clientIp } from '../context.js';
import { dummyVerify, randomToken, sha256, verifyPin } from '../crypto.js';
import { audit } from '../audit.js';
import { COOKIE, clearCookie, createSession, destroySession, parseCookies, setCookie } from '../session.js';
import { nowIso } from '../db.js';

const emailSchema = z.string().trim().toLowerCase().email().max(254);

/**
 * Issues a single-use sign-in token and emails the link. Only the SHA-256 of the token is stored.
 * `nonce` binds the token to the browser that asked for it (omit for admin/co-caregiver invites,
 * where the invitee's browser is not yet known).
 */
export async function sendSignInLink(ctx: Ctx, user: UserRow, opts: { nonce?: string; invite?: boolean } = {}): Promise<boolean> {
  const token = randomToken(32);
  const t = ctx.now();
  ctx.db
    .prepare('INSERT INTO magic_tokens (token_hash, user_id, nonce_hash, expires_at, created_at) VALUES (?,?,?,?,?)')
    .run(sha256(token), user.id, opts.nonce ? sha256(opts.nonce) : null, t + ctx.cfg.magicLinkTtlMs, t);
  const link = `${ctx.cfg.baseUrl}/app/verify?token=${token}`;
  const minutes = Math.round(ctx.cfg.magicLinkTtlMs / 60_000);
  return ctx.mailer.send({
    to: user.email,
    subject: opts.invite ? 'You are invited to MathQuest' : 'Your MathQuest sign-in link',
    text:
      `${opts.invite ? 'You have been invited to MathQuest.\n\n' : ''}` +
      `Open this link to sign in. It works once and expires in ${minutes} minutes:\n\n${link}\n\n` +
      `If you did not ask for this, you can ignore this email.`,
  });
}

export function authRoutes(ctx: Ctx): Router {
  const r = Router();

  r.post('/auth/magic', async (req, res) => {
    const parsed = z.object({ email: emailSchema }).safeParse(req.body);
    if (!parsed.success) return void res.status(400).json({ error: 'invalid_request' });
    const { email } = parsed.data;
    if (!ctx.limits.magicIp.take(clientIp(req)) || !ctx.limits.magicEmail.take(email)) {
      return void res.status(429).json({ error: 'too_many_requests' });
    }
    // Always set a login nonce and answer identically so unknown emails cannot be probed.
    const nonce = randomToken(24);
    setCookie(ctx, res, COOKIE.login, nonce, ctx.cfg.magicLinkTtlMs);
    const user = ctx.db.prepare("SELECT * FROM users WHERE email = ? AND status != 'disabled'").get(email) as UserRow | undefined;
    if (user) await sendSignInLink(ctx, user, { nonce });
    res.status(202).json({ ok: true });
  });

  r.post('/auth/verify', (req, res) => {
    const parsed = z.object({ token: z.string().min(20).max(200) }).safeParse(req.body);
    if (!parsed.success) return void res.status(400).json({ error: 'invalid_or_expired' });
    const hash = sha256(parsed.data.token);
    const row = ctx.db.prepare('SELECT * FROM magic_tokens WHERE token_hash = ?').get(hash) as
      | { user_id: string; nonce_hash: string | null; expires_at: number; used_at: number | null }
      | undefined;
    const fail = () => res.status(400).json({ error: 'invalid_or_expired' });
    if (!row || row.used_at !== null || row.expires_at <= ctx.now()) return void fail();
    if (ctx.cfg.magicLinkBind === 'strict' && row.nonce_hash) {
      const nonce = parseCookies(req.headers.cookie)[COOKIE.login];
      if (!nonce || sha256(nonce) !== row.nonce_hash) return void fail();
    }
    // Atomic single-use: only one request can flip used_at from NULL.
    const claimed = ctx.db.prepare('UPDATE magic_tokens SET used_at = ? WHERE token_hash = ? AND used_at IS NULL').run(ctx.now(), hash);
    if (claimed.changes !== 1) return void fail();
    const user = ctx.db.prepare("SELECT * FROM users WHERE id = ? AND status != 'disabled'").get(row.user_id) as UserRow | undefined;
    if (!user) return void fail();
    ctx.db.prepare("UPDATE users SET status = 'active', last_login_at = ? WHERE id = ?").run(nowIso(), user.id);
    const csrf = createSession(ctx, res, 'user', user.id);
    clearCookie(ctx, res, COOKIE.login);
    audit(ctx.db, { kind: user.role, id: user.id }, 'auth.login');
    res.json({ csrf, user: publicUser(user) });
  });

  r.post('/auth/student', (req, res) => {
    const parsed = z.object({ username: z.string().trim().min(3).max(20), pin: z.string().regex(/^\d{4}$/) }).safeParse(req.body);
    if (!parsed.success) return void res.status(400).json({ error: 'invalid_request' });
    if (!ctx.limits.studentIp.take(clientIp(req))) return void res.status(429).json({ error: 'too_many_requests' });
    const invalid = (extra: object = {}) => res.status(401).json({ error: 'invalid_login', ...extra });

    const deviceToken = parseCookies(req.headers.cookie)[COOKIE.device];
    const device = deviceToken
      ? (ctx.db.prepare('SELECT * FROM devices WHERE token_hash = ? AND revoked_at IS NULL').get(sha256(deviceToken)) as
          | { id: string; approved_by: string }
          | undefined)
      : undefined;
    if (!device) return void res.status(403).json({ error: 'device_not_approved' });

    const student = ctx.db.prepare('SELECT * FROM students WHERE username = ?').get(parsed.data.username) as StudentRow | undefined;
    const linked =
      student &&
      ctx.db.prepare('SELECT 1 FROM student_caregivers WHERE student_id = ? AND caregiver_id = ?').get(student.id, device.approved_by);
    if (!student || !linked) {
      dummyVerify(parsed.data.pin);
      return void invalid();
    }
    if (student.locked_until > ctx.now()) {
      return void res.status(429).json({ error: 'locked', retryAfterSeconds: Math.ceil((student.locked_until - ctx.now()) / 1000) });
    }
    if (!verifyPin(parsed.data.pin, student.pin_hash)) {
      const failures = student.pin_failures + 1;
      if (failures >= 5) {
        ctx.db.prepare('UPDATE students SET pin_failures = 0, locked_until = ? WHERE id = ?').run(ctx.now() + 15 * 60_000, student.id);
        audit(ctx.db, { kind: 'system' }, 'student.locked', student.id);
        void notifyLockout(ctx, student);
        return void res.status(429).json({ error: 'locked', retryAfterSeconds: 900 });
      }
      ctx.db.prepare('UPDATE students SET pin_failures = ? WHERE id = ?').run(failures, student.id);
      return void invalid({ attemptsLeft: 5 - failures });
    }
    ctx.db.prepare('UPDATE students SET pin_failures = 0, locked_until = 0 WHERE id = ?').run(student.id);
    ctx.db.prepare('UPDATE devices SET last_seen_at = ? WHERE id = ?').run(ctx.now(), device.id);
    const csrf = createSession(ctx, res, 'student', student.id);
    audit(ctx.db, { kind: 'student', id: student.id }, 'auth.student_login');
    res.json({ csrf, student: publicStudent(student) });
  });

  r.post('/auth/logout', (req, res) => {
    destroySession(ctx, req, res);
    res.json({ ok: true });
  });

  r.get('/me', (req, res) => {
    if (!req.auth) return void res.status(401).json({ error: 'unauthenticated' });
    if (req.auth.kind === 'user') {
      return void res.json({ kind: 'user', csrf: req.auth.csrf, user: publicUser(req.auth.user), version: ctx.cfg.version });
    }
    res.json({ kind: 'student', csrf: req.auth.csrf, student: publicStudent(req.auth.student), version: ctx.cfg.version });
  });

  return r;
}

async function notifyLockout(ctx: Ctx, student: StudentRow): Promise<void> {
  const rows = ctx.db
    .prepare('SELECT u.email FROM student_caregivers sc JOIN users u ON u.id = sc.caregiver_id WHERE sc.student_id = ?')
    .all(student.id) as { email: string }[];
  for (const { email } of rows) {
    await ctx.mailer.send({
      to: email,
      subject: `MathQuest: ${student.display_name} was locked out`,
      text: `There were 5 wrong PIN attempts for ${student.display_name}. Sign-in is paused for 15 minutes. If this was not them, you can change the PIN from your caregiver page.`,
    });
  }
}

export const publicUser = (u: UserRow) => ({
  id: u.id, email: u.email, role: u.role, displayName: u.display_name, weeklyEmail: !!u.weekly_email, defaults: JSON.parse(u.defaults_json) as unknown,
});
export const publicStudent = (s: StudentRow) => ({
  id: s.id, username: s.username, displayName: s.display_name, grade: s.grade, language: s.language,
  settings: JSON.parse(s.settings_json) as unknown, allowed: JSON.parse(s.allowed_json) as unknown,
});

