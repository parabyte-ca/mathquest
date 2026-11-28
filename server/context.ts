import type { Request, Response, NextFunction } from 'express';
import type { Config } from './config.js';
import type { DB } from './db.js';
import type { Mailer } from './mail.js';
import { RateLimiter } from './ratelimit.js';

export interface UserRow {
  id: string;
  email: string;
  role: 'admin' | 'caregiver';
  display_name: string;
  status: 'invited' | 'active' | 'disabled';
  weekly_email: number;
  defaults_json: string;
  /** When a requested account deletion will happen (ms), or null. */
  delete_at: number | null;
}
export interface StudentRow {
  id: string;
  username: string;
  display_name: string;
  pin_hash: string;
  grade: number;
  language: 'en' | 'fr';
  settings_json: string;
  allowed_json: string;
  pin_failures: number;
  locked_until: number;
  created_by: string;
  created_at: string;
}

export type Auth = { kind: 'user'; user: UserRow; csrf: string } | { kind: 'student'; student: StudentRow; csrf: string; idleMs: number | null };

declare module 'express-serve-static-core' {
  interface Request {
    auth?: Auth;
  }
}

export interface Ctx {
  db: DB;
  cfg: Config;
  mailer: Mailer;
  now: () => number;
  /** Random source in [0,1); tests inject a seeded one. */
  rand?: () => number;
  limits: {
    magicEmail: RateLimiter;
    magicIp: RateLimiter;
    studentIp: RateLimiter;
    pairIp: RateLimiter;
    approve: RateLimiter;
    /** Sharing a child and inviting a parent send email, so each caregiver gets a few an hour. */
    invite: RateLimiter;
    /** Downloading the whole account is heavier than a page. */
    exportAll: RateLimiter;
    /** Each photo read costs money, so each caregiver gets a few an hour. */
    photo: RateLimiter;
    /** The "who is practising?" list is asked for each time the sign-in page opens. */
    picker: RateLimiter;
  };
}

export function makeLimits(now: () => number): Ctx['limits'] {
  const H = 3_600_000;
  return {
    magicEmail: new RateLimiter(5, H, now),
    magicIp: new RateLimiter(20, H, now),
    studentIp: new RateLimiter(40, 600_000, now),
    pairIp: new RateLimiter(10, H, now),
    approve: new RateLimiter(10, 600_000, now),
    invite: new RateLimiter(10, H, now),
    exportAll: new RateLimiter(5, H, now),
    photo: new RateLimiter(10, H, now),
    picker: new RateLimiter(60, 600_000, now),
  };
}

export const clientIp = (req: Request): string => req.ip ?? 'unknown';

export function requireUser(role?: 'admin' | 'caregiver') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.auth?.kind !== 'user') {
      res.status(401).json({ error: 'unauthenticated' });
      return;
    }
    if (role === 'admin' && req.auth.user.role !== 'admin') {
      res.status(403).json({ error: 'forbidden' });
      return;
    }
    next();
  };
}

export function requireStudent(req: Request, res: Response, next: NextFunction): void {
  if (req.auth?.kind !== 'student') {
    res.status(401).json({ error: 'unauthenticated' });
    return;
  }
  next();
}
