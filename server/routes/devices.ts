import { Router } from 'express';
import { z } from 'zod';
import type { Ctx } from '../context.js';
import { clientIp, requireUser } from '../context.js';
import { randomDigits, randomToken, sha256 } from '../crypto.js';
import { audit } from '../audit.js';
import { newId } from '../db.js';
import { COOKIE, parseCookies, setCookie } from '../session.js';

const PAIR_TTL = 10 * 60_000;
const DEVICE_TTL = 365 * 24 * 3_600_000;

export function deviceRoutes(ctx: Ctx): Router {
  const r = Router();

  // Student's device asks to be trusted. It shows a 6-digit code; a caregiver enters it while signed in.
  r.post('/devices/request', (req, res) => {
    if (!ctx.limits.pairIp.take(clientIp(req))) return void res.status(429).json({ error: 'too_many_requests' });
    const id = newId();
    const code = randomDigits(6);
    const secret = randomToken(24);
    ctx.db
      .prepare('INSERT INTO device_pairings (id, code_hash, secret_hash, expires_at, created_at) VALUES (?,?,?,?,?)')
      .run(id, sha256(code), sha256(secret), ctx.now() + PAIR_TTL, ctx.now());
    setCookie(ctx, res, COOKIE.pair, `${id}.${secret}`, PAIR_TTL);
    res.status(201).json({ code, expiresInSeconds: PAIR_TTL / 1000 });
  });

  // Student's device polls. Once approved it receives a long-lived device trust cookie.
  r.get('/devices/status', (req, res) => {
    const raw = parseCookies(req.headers.cookie)[COOKIE.pair] ?? '';
    const [id, secret] = raw.split('.');
    const p = id && secret
      ? (ctx.db.prepare('SELECT * FROM device_pairings WHERE id = ?').get(id) as
          | { id: string; secret_hash: string; expires_at: number; approved_by: string | null; label: string }
          | undefined)
      : undefined;
    if (!p || p.secret_hash !== sha256(secret!) || p.expires_at <= ctx.now()) {
      return void res.json({ state: 'expired' });
    }
    if (!p.approved_by) return void res.json({ state: 'pending' });
    const token = randomToken(32);
    ctx.db
      .prepare('INSERT INTO devices (id, token_hash, approved_by, label, created_at, last_seen_at) VALUES (?,?,?,?,?,?)')
      .run(newId(), sha256(token), p.approved_by, p.label, ctx.now(), ctx.now());
    ctx.db.prepare('DELETE FROM device_pairings WHERE id = ?').run(p.id);
    setCookie(ctx, res, COOKIE.device, token, DEVICE_TTL);
    setCookie(ctx, res, COOKIE.pair, '', 0);
    res.json({ state: 'approved' });
  });

  // Caregiver approves the code shown on the student's device.
  r.post('/devices/approve', requireUser('caregiver'), (req, res) => {
    const parsed = z.object({ code: z.string().regex(/^\d{6}$/), label: z.string().trim().max(60).default('') }).safeParse(req.body);
    if (!parsed.success) return void res.status(400).json({ error: 'invalid_request' });
    const user = (req.auth as { kind: 'user'; user: { id: string } }).user;
    if (!ctx.limits.approve.take(user.id)) return void res.status(429).json({ error: 'too_many_requests' });
    const p = ctx.db
      .prepare('SELECT id FROM device_pairings WHERE code_hash = ? AND approved_by IS NULL AND expires_at > ?')
      .get(sha256(parsed.data.code), ctx.now()) as { id: string } | undefined;
    if (!p) return void res.status(404).json({ error: 'code_not_found' });
    ctx.db.prepare('UPDATE device_pairings SET approved_by = ?, label = ? WHERE id = ?').run(user.id, parsed.data.label, p.id);
    audit(ctx.db, { kind: 'caregiver', id: user.id }, 'device.approve', p.id, { label: parsed.data.label });
    res.json({ ok: true });
  });

  r.get('/devices', requireUser('caregiver'), (req, res) => {
    const user = (req.auth as { kind: 'user'; user: { id: string } }).user;
    const rows = ctx.db
      .prepare('SELECT id, label, created_at AS createdAt, last_seen_at AS lastSeenAt FROM devices WHERE approved_by = ? AND revoked_at IS NULL')
      .all(user.id);
    res.json({ devices: rows });
  });

  r.delete('/devices/:id', requireUser('caregiver'), (req, res) => {
    const user = (req.auth as { kind: 'user'; user: { id: string } }).user;
    const result = ctx.db
      .prepare('UPDATE devices SET revoked_at = ? WHERE id = ? AND approved_by = ? AND revoked_at IS NULL')
      .run(ctx.now(), req.params.id, user.id);
    if (result.changes !== 1) return void res.status(404).json({ error: 'not_found' });
    audit(ctx.db, { kind: 'caregiver', id: user.id }, 'device.revoke', req.params.id);
    res.json({ ok: true });
  });

  return r;
}
