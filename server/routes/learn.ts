import { Router, type Response } from 'express';
import { z } from 'zod';
import type { Ctx, StudentRow } from '../context.js';
import { requireStudent } from '../context.js';
import * as svc from '../learn/service.js';
import * as rewards from '../rewards/service.js';

const student = (res: Response): StudentRow => res.locals.student as StudentRow;

const settingsSchema = z
  .object({
    voice: z.boolean(),
    voiceRate: z.number().min(0.5).max(2),
    autoRead: z.boolean(),
    theme: z.enum(['auto', 'playful', 'hud', 'pro']),
    highContrast: z.boolean(),
    dyslexiaFont: z.boolean(),
    reducedMotion: z.boolean(),
  })
  .partial()
  .strict();

/** Student-facing learning API. Answers are never sent to the client before they are graded here. */
export function learnRoutes(ctx: Ctx): Router {
  const r = Router();
  r.use('/learn', requireStudent, (req, res, next) => {
    res.locals.student = (req.auth as { student: StudentRow }).student;
    next();
  });

  const handle = (fn: (req: import('express').Request, res: Response) => unknown) => (req: import('express').Request, res: Response): void => {
    try {
      res.json(fn(req, res));
    } catch (e) {
      if (e instanceof svc.LearnError) res.status(e.status).json({ error: e.code });
      else throw e;
    }
  };

  // A student flags a question that looks wrong or unclear. Two different students retire an AI-written item automatically.
  r.post('/learn/report', handle((req, res) => {
    const body = z.object({ itemId: z.string().regex(/^[A-Za-z0-9.:_-]{3,80}$/), reason: z.enum(['unclear', 'answer', 'too_hard', 'other']) }).safeParse(req.body);
    if (!body.success) throw new svc.LearnError('invalid_request');
    return svc.reportItem(ctx, student(res), body.data.itemId, body.data.reason);
  }));

  r.get('/learn/rewards', (_req, res) => void res.json(rewards.summary(ctx, student(res))));
  r.get('/learn/rewards/header', (_req, res) => void res.json(rewards.header(ctx, student(res))));
  r.get('/learn/messages', (_req, res) => void res.json({ messages: rewards.unreadMessages(ctx, student(res).id) }));
  r.post('/learn/messages/:id/read', (req, res) => {
    try {
      rewards.markMessageRead(ctx, student(res).id, req.params.id!);
      res.json({ ok: true });
    } catch (e) {
      if (e instanceof rewards.RewardError) return void res.status(e.status).json({ error: e.code });
      throw e;
    }
  });
  r.post('/learn/rewards/equip', (req, res) => {
    const body = z.object({ id: z.string().max(40) }).safeParse(req.body);
    if (!body.success) return void res.status(400).json({ error: 'invalid_request' });
    try {
      rewards.equip(ctx, student(res), body.data.id);
      res.json({ ok: true });
    } catch (e) {
      if (e instanceof rewards.RewardError) return void res.status(e.status).json({ error: e.code });
      throw e;
    }
  });

  r.get('/learn/options', handle((_req, res) => svc.options(ctx, student(res))));

  r.post('/learn/session', handle((req, res) => {
    const body = z.object({ grade: z.number().int().min(5).max(12), course: z.string().regex(/^[A-Z0-9]{5}$/).nullable().optional(), strands: z.array(z.string().regex(/^[A-F]\d?$/)).max(10).optional(), focus: z.string().regex(/^[A-Z0-9]{2,6}\.[A-F][0-9.]{0,8}$/).nullable().optional() }).safeParse(req.body);
    if (!body.success) throw new svc.LearnError('invalid_request');
    const started = svc.startSession(ctx, student(res), body.data);
    return { ...started, step: svc.next(ctx, student(res), started.sessionId) };
  }));

  // Practice without a connection: download a pack while online, send the answers back later. The server grades everything itself.
  r.post('/learn/offline/pack', handle((req, res) => {
    const body = z.object({ grade: z.number().int().min(5).max(12), course: z.string().regex(/^[A-Z0-9]{5}$/).nullable().optional(), strands: z.array(z.string().regex(/^[A-F]\d?$/)).max(10).optional(), focus: z.string().regex(/^[A-Z0-9]{2,6}\.[A-F][0-9.]{0,8}$/).nullable().optional() }).safeParse(req.body);
    if (!body.success) throw new svc.LearnError('invalid_request');
    return svc.offlinePack(ctx, student(res), body.data);
  }));

  r.post('/learn/offline/sync', handle((req, res) => {
    const body = z.object({
      packId: z.string().min(10).max(60),
      answers: z.array(z.object({ i: z.number().int().min(0).max(99), given: z.unknown(), hints: z.number().int().min(0).max(3).optional(), ms: z.number().min(0).max(3_600_000).optional() })).max(40),
    }).safeParse(req.body);
    if (!body.success) throw new svc.LearnError('invalid_request');
    return svc.offlineSync(ctx, student(res), body.data.packId, body.data.answers);
  }));

  r.post('/learn/next', handle((req, res) => {
    const body = z.object({ sessionId: z.string().min(10).max(60), similar: z.boolean().optional() }).safeParse(req.body);
    if (!body.success) throw new svc.LearnError('invalid_request');
    return svc.next(ctx, student(res), body.data.sessionId, { similar: body.data.similar });
  }));

  r.post('/learn/answer', handle((req, res) => {
    const body = z.object({ itemId: z.string().min(5).max(120), given: z.unknown(), ms: z.number().min(0).max(3_600_000).optional() }).safeParse(req.body);
    if (!body.success) throw new svc.LearnError('invalid_request');
    return svc.answer(ctx, student(res), body.data.itemId, body.data.given, body.data.ms ?? 0);
  }));

  r.post('/learn/hint', handle((req, res) => {
    const body = z.object({ itemId: z.string().min(5).max(120) }).safeParse(req.body);
    if (!body.success) throw new svc.LearnError('invalid_request');
    return svc.hint(ctx, student(res), body.data.itemId);
  }));

  r.post('/learn/lesson-done', handle((req, res) => {
    const body = z.object({ target: z.string().min(2).max(40) }).safeParse(req.body);
    if (!body.success) throw new svc.LearnError('invalid_request');
    svc.lessonDone(ctx, student(res), body.data.target);
    return { ok: true };
  }));

  r.get('/learn/skillmap', handle((req, res) => {
    const grade = Number(req.query.grade);
    if (!Number.isInteger(grade) || grade < 5 || grade > 12) throw new svc.LearnError('invalid_request');
    const course = typeof req.query.course === 'string' && /^[A-Z0-9]{5}$/.test(req.query.course) ? req.query.course : null;
    return svc.skillMap(ctx, student(res), grade, course);
  }));

  r.post('/learn/placement/start', handle((req, res) => {
    const body = z.object({ grade: z.number().int().min(5).max(12), strand: z.enum(['B', 'C', 'D', 'E', 'F']).optional() }).safeParse(req.body);
    if (!body.success) throw new svc.LearnError('invalid_request');
    return svc.placementStart(ctx, student(res), body.data.grade, body.data.strand);
  }));

  r.patch('/learn/settings', handle((req, res) => {
    const body = settingsSchema.safeParse(req.body);
    if (!body.success) throw new svc.LearnError('invalid_request');
    const s = student(res);
    const merged = { ...(JSON.parse(s.settings_json) as object), ...body.data };
    ctx.db.prepare('UPDATE students SET settings_json = ? WHERE id = ?').run(JSON.stringify(merged), s.id);
    return { settings: merged };
  }));

  return r;
}
