import { Router, type Request } from 'express';
import { z } from 'zod';
import type { Ctx, UserRow } from '../context.js';
import { requireUser } from '../context.js';
import { audit } from '../audit.js';
import { access } from './students.js';
import { archiveGoal, createGoal, listGoals, redeemGoal, RewardError } from '../rewards/service.js';
import { dashboard } from '../rewards/dashboard.js';
import { buildWorksheet } from '../worksheet.js';

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

  // Expectations with practice content, for the grades this student may use: the worksheet builder's choices.
  r.get('/students/:id/worksheet/options', (req, res) => {
    const a = access(ctx, me(req), req.params.id!);
    if (!a) return void res.status(404).json({ error: 'not_found' });
    const grades = (JSON.parse(a.student.allowed_json) as { grades?: number[] }).grades ?? [];
    const rows = ctx.db
      .prepare(
        `SELECT DISTINCT ce.code, ce.grade, ce.strand, ce.strand_name AS strandName, ce.text FROM curriculum_expectation ce JOIN microskill m ON m.expectation = ce.code
          WHERE ce.course IS NULL ORDER BY ce.grade, ce.code`,
      )
      .all() as { code: string; grade: number; strand: string; strandName: string; text: string }[];
    res.json({ studentGrade: a.student.grade, expectations: rows.filter((r) => (grades.length ? grades.includes(r.grade) : true)) });
  });

  // Printable worksheet with its answer key. Caregivers only: it carries the answers.
  r.get('/students/:id/worksheet', (req, res) => {
    const a = access(ctx, me(req), req.params.id!);
    if (!a) return void res.status(404).json({ error: 'not_found' });
    const q = z
      .object({
        focus: z.string().regex(/^[A-Z0-9]{2,6}\.[A-F][0-9.]{0,8}$/),
        tier: z.enum(['1', '2', '3', 'mixed']).default('mixed'),
        count: z.coerce.number().int().min(4).max(30).default(12),
        seed: z.coerce.number().int().min(1).max(2_000_000_000).optional(),
      })
      .safeParse(req.query);
    if (!q.success) return void res.status(400).json({ error: 'invalid_request' });
    const seed = q.data.seed ?? Math.floor(ctx.now() % 1_000_000_000) + 1;
    const items = buildWorksheet(ctx, { focus: q.data.focus, tier: q.data.tier === 'mixed' ? 'mixed' : Number(q.data.tier), count: q.data.count, seed });
    if (items.length === 0) return void res.status(404).json({ error: 'no_content' });
    const exp = ctx.db.prepare('SELECT text FROM curriculum_expectation WHERE code = ?').get(q.data.focus) as { text: string } | undefined;
    audit(ctx.db, { kind: 'caregiver', id: me(req).id }, 'worksheet.create', a.student.id, { focus: q.data.focus, count: items.length });
    res.json({ student: { displayName: a.student.display_name, grade: a.student.grade, language: a.student.language }, focus: q.data.focus, topic: exp?.text ?? '', tier: q.data.tier, seed, items });
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
