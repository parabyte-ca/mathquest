import { Router, type Request } from 'express';
import { z } from 'zod';
import type { Ctx, UserRow } from '../context.js';
import { requireUser } from '../context.js';
import { audit } from '../audit.js';
import { access } from './students.js';
import { archiveGoal, createGoal, listGoals, redeemGoal, RewardError } from '../rewards/service.js';
import { dashboard } from '../rewards/dashboard.js';

const me = (req: Request): UserRow => (req.auth as { kind: 'user'; user: UserRow }).user;

/** Caregiver-facing: the progress dashboard and real-world goals for a student. */
export function rewardRoutes(ctx: Ctx): Router {
  const r = Router();
  r.use('/students', requireUser());

  r.get('/students/:id/dashboard', (req, res) => {
    const a = access(ctx, me(req), req.params.id!);
    if (!a) return void res.status(404).json({ error: 'not_found' });
    res.json(dashboard(ctx, a.student));
  });

  r.get('/students/:id/goals', (req, res) => {
    const a = access(ctx, me(req), req.params.id!);
    if (!a) return void res.status(404).json({ error: 'not_found' });
    res.json({ goals: listGoals(ctx, a.student.id, true) });
  });

  r.post('/students/:id/goals', (req, res) => {
    const a = access(ctx, me(req), req.params.id!);
    if (!a) return void res.status(404).json({ error: 'not_found' });
    const body = z.object({ title: z.string().trim().min(2).max(80), xpTarget: z.number().int().min(50).max(100_000) }).safeParse(req.body);
    if (!body.success) return void res.status(400).json({ error: 'invalid_request' });
    const count = (ctx.db.prepare('SELECT COUNT(*) AS n FROM goal WHERE student_id = ? AND archived = 0 AND redeemed_at IS NULL').get(a.student.id) as { n: number }).n;
    if (count >= 10) return void res.status(409).json({ error: 'too_many_goals' });
    const id = createGoal(ctx, a.student.id, me(req).id, body.data.title, body.data.xpTarget);
    audit(ctx.db, { kind: 'caregiver', id: me(req).id }, 'goal.create', a.student.id, { xpTarget: body.data.xpTarget });
    res.status(201).json({ id });
  });

  const act = (what: 'redeem' | 'archive') => (req: Request, res: import('express').Response): void => {
    const a = access(ctx, me(req), req.params.id!);
    if (!a) return void res.status(404).json({ error: 'not_found' });
    try {
      if (what === 'redeem') redeemGoal(ctx, a.student.id, req.params.goalId!, me(req).id);
      else archiveGoal(ctx, a.student.id, req.params.goalId!);
      audit(ctx.db, { kind: 'caregiver', id: me(req).id }, `goal.${what}`, a.student.id);
      res.json({ ok: true });
    } catch (e) {
      if (e instanceof RewardError) return void res.status(e.status).json({ error: e.code });
      throw e;
    }
  };
  r.post('/students/:id/goals/:goalId/redeem', act('redeem'));
  r.delete('/students/:id/goals/:goalId', act('archive'));

  return r;
}
