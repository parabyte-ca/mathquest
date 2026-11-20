import type { Request, Response, NextFunction } from 'express';
import { timingSafeEqual } from 'node:crypto';
import type { Ctx, StudentRow, UserRow } from './context.js';
import { randomToken, sha256 } from './crypto.js';

// Pre-auth endpoints never act on an existing session, so they skip CSRF (the Origin check still applies).
const CSRF_EXEMPT = new Set(['/auth/magic', '/auth/verify', '/auth/student', '/devices/request']);

export const COOKIE = { session: 'mq_session', device: 'mq_device', login: 'mq_login', pair: 'mq_pair' } as const;

const USER_TTL = 30 * 24 * 3_600_000;
const STUDENT_TTL = 12 * 3_600_000;

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k && !(k in out)) {
      try {
        out[k] = decodeURIComponent(v);
      } catch {
        /* ignore malformed cookie */
      }
    }
  }
  return out;
}

export function setCookie(ctx: Ctx, res: Response, name: string, value: string, maxAgeMs: number): void {
  const attrs = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${Math.floor(maxAgeMs / 1000)}`];
  if (ctx.cfg.secure) attrs.push('Secure');
  res.append('Set-Cookie', attrs.join('; '));
}
export const clearCookie = (ctx: Ctx, res: Response, name: string): void => setCookie(ctx, res, name, '', 0);

export function createSession(ctx: Ctx, res: Response, kind: 'user' | 'student', subjectId: string): string {
  const token = randomToken();
  const csrf = randomToken(24);
  const t = ctx.now();
  const ttl = kind === 'user' ? USER_TTL : STUDENT_TTL;
  ctx.db
    .prepare('INSERT INTO sessions (id_hash, kind, subject_id, csrf, expires_at, created_at, last_seen_at) VALUES (?,?,?,?,?,?,?)')
    .run(sha256(token), kind, subjectId, csrf, t + ttl, t, t);
  setCookie(ctx, res, COOKIE.session, token, ttl);
  return csrf;
}

export function destroySession(ctx: Ctx, req: Request, res: Response): void {
  const token = parseCookies(req.headers.cookie)[COOKIE.session];
  if (token) ctx.db.prepare('DELETE FROM sessions WHERE id_hash = ?').run(sha256(token));
  clearCookie(ctx, res, COOKIE.session);
}

/** Loads the signed-in subject (if any) onto req.auth and enforces CSRF on unsafe methods. */
export function sessionMiddleware(ctx: Ctx) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = parseCookies(req.headers.cookie)[COOKIE.session];
    if (token) {
      const t = ctx.now();
      const row = ctx.db.prepare('SELECT * FROM sessions WHERE id_hash = ?').get(sha256(token)) as
        | { id_hash: string; kind: 'user' | 'student'; subject_id: string; csrf: string; expires_at: number }
        | undefined;
      if (row && row.expires_at > t) {
        if (row.kind === 'user') {
          const user = ctx.db.prepare("SELECT * FROM users WHERE id = ? AND status = 'active'").get(row.subject_id) as UserRow | undefined;
          if (user) req.auth = { kind: 'user', user, csrf: row.csrf };
        } else {
          const student = ctx.db.prepare('SELECT * FROM students WHERE id = ?').get(row.subject_id) as StudentRow | undefined;
          if (student) req.auth = { kind: 'student', student, csrf: row.csrf };
        }
        if (req.auth) {
          const ttl = row.kind === 'user' ? USER_TTL : STUDENT_TTL;
          if (row.expires_at - t < ttl / 2) {
            ctx.db.prepare('UPDATE sessions SET expires_at = ?, last_seen_at = ? WHERE id_hash = ?').run(t + ttl, t, row.id_hash);
            setCookie(ctx, res, COOKIE.session, token, ttl);
          }
        }
      }
    }
    if (req.auth && !['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !CSRF_EXEMPT.has(req.path)) {
      const sent = req.get('x-csrf-token') ?? '';
      const a = Buffer.from(sent);
      const b = Buffer.from(req.auth.csrf);
      if (a.length !== b.length || !timingSafeEqual(a, b)) {
        res.status(403).json({ error: 'csrf' });
        return;
      }
    }
    next();
  };
}

/** Rejects cross-site writes. Same-origin browser requests always send a matching Origin. */
export function originMiddleware(ctx: Ctx) {
  const allowed = new Set([new URL(ctx.cfg.baseUrl).origin]);
  return (req: Request, res: Response, next: NextFunction): void => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const origin = req.get('origin');
    if (origin) {
      const own = `${req.protocol}://${req.get('host')}`;
      if (!allowed.has(origin) && origin !== own) {
        res.status(403).json({ error: 'bad_origin' });
        return;
      }
    } else if (req.get('sec-fetch-site') === 'cross-site') {
      res.status(403).json({ error: 'bad_origin' });
      return;
    }
    next();
  };
}
