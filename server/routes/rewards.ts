import { Router, type Request } from 'express';
import { z } from 'zod';
import type { Ctx, UserRow } from '../context.js';
import { requireUser } from '../context.js';
import { audit } from '../audit.js';
import { access } from './students.js';
import { listMessages, markMessageRead, sendMessage, setGoalNote, archiveFamilyGoal, archiveGoal, createFamilyGoal, createGoal, listFamilyGoals, listGoals, localDay, redeemFamilyGoal, redeemGoal, RewardError, summary } from '../rewards/service.js';
import { dashboard } from '../rewards/dashboard.js';
import { buildWorksheet, MAX_TOPICS } from '../worksheet.js';

const me = (req: Request): UserRow => (req.auth as { kind: 'user'; user: UserRow }).user;
const tx = (en: string, fr: string): { en: string; fr: string } => ({ en, fr });

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
        focus: z.string().max(120).transform((v) => v.split(',').map((x) => x.trim()).filter(Boolean))
          .pipe(z.array(z.string().regex(/^[A-Z0-9]{2,6}\.[A-F][0-9.]{0,8}$/)).min(1).max(MAX_TOPICS)),
        tier: z.enum(['1', '2', '3', 'mixed']).default('mixed'),
        count: z.coerce.number().int().min(4).max(30).default(12),
        seed: z.coerce.number().int().min(1).max(2_000_000_000).optional(),
      })
      .safeParse(req.query);
    if (!q.success) return void res.status(400).json({ error: 'invalid_request' });
    const seed = q.data.seed ?? Math.floor(ctx.now() % 1_000_000_000) + 1;
    const items = buildWorksheet(ctx, { focus: q.data.focus, tier: q.data.tier === 'mixed' ? 'mixed' : Number(q.data.tier), count: q.data.count, seed });
    if (items.length === 0) return void res.status(404).json({ error: 'no_content' });
    const topics = q.data.focus.map((code) => ({ code, text: (ctx.db.prepare('SELECT text FROM curriculum_expectation WHERE code = ?').get(code) as { text: string } | undefined)?.text ?? '' }));
    audit(ctx.db, { kind: 'caregiver', id: me(req).id }, 'worksheet.create', a.student.id, { focus: q.data.focus.join(','), count: items.length });
    res.json({ student: { displayName: a.student.display_name, grade: a.student.grade, language: a.student.language }, focus: q.data.focus.join(', '), topic: topics.map((x) => x.text).filter(Boolean).join(' · '), topics, tier: q.data.tier, seed, items });
  });

  r.get('/students/:id/goals', (req, res) => {
    const a = access(ctx, me(req), req.params.id!);
    if (!a) return void res.status(404).json({ error: 'not_found' });
    res.json({ goals: listGoals(ctx, a.student.id, true) });
  });

  r.post('/students/:id/goals', (req, res) => {
    const a = access(ctx, me(req), req.params.id!);
    if (!a) return void res.status(404).json({ error: 'not_found' });
    const body = z.object({ title: z.string().trim().min(2).max(80), xpTarget: z.number().int().min(50).max(100_000), note: z.string().trim().max(160).optional() }).safeParse(req.body);
    if (!body.success) return void res.status(400).json({ error: 'invalid_request' });
    const count = (ctx.db.prepare('SELECT COUNT(*) AS n FROM goal WHERE student_id = ? AND archived = 0 AND redeemed_at IS NULL').get(a.student.id) as { n: number }).n;
    if (count >= 10) return void res.status(409).json({ error: 'too_many_goals' });
    const id = createGoal(ctx, a.student.id, me(req).id, body.data.title, body.data.xpTarget, body.data.note ?? '');
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
  r.patch('/students/:id/goals/:goalId', (req, res) => {
    const a = access(ctx, me(req), req.params.id!);
    if (!a) return void res.status(404).json({ error: 'not_found' });
    const body = z.object({ note: z.string().trim().max(160) }).safeParse(req.body);
    if (!body.success) return void res.status(400).json({ error: 'invalid_request' });
    try {
      setGoalNote(ctx, a.student.id, req.params.goalId!, body.data.note);
      audit(ctx.db, { kind: 'caregiver', id: me(req).id }, 'goal.note', a.student.id);
      res.json({ ok: true });
    } catch (e) {
      if (e instanceof RewardError) return void res.status(e.status).json({ error: e.code });
      throw e;
    }
  });

  // Messages to the student: short text, shown on their home page until they dismiss it.
  r.get('/students/:id/messages', (req, res) => {
    const a = access(ctx, me(req), req.params.id!);
    if (!a) return void res.status(404).json({ error: 'not_found' });
    res.json({ messages: listMessages(ctx, a.student.id) });
  });
  r.post('/students/:id/messages', (req, res) => {
    const a = access(ctx, me(req), req.params.id!);
    if (!a) return void res.status(404).json({ error: 'not_found' });
    const body = z.object({ body: z.string().trim().min(1).max(200) }).safeParse(req.body);
    if (!body.success) return void res.status(400).json({ error: 'invalid_request' });
    try {
      const id = sendMessage(ctx, a.student.id, me(req).id, body.data.body);
      audit(ctx.db, { kind: 'caregiver', id: me(req).id }, 'message.send', a.student.id);
      res.status(201).json({ id });
    } catch (e) {
      if (e instanceof RewardError) return void res.status(e.status).json({ error: e.code });
      throw e;
    }
  });

  r.post('/students/:id/goals/:goalId/redeem', act('redeem'));
  r.delete('/students/:id/goals/:goalId', act('archive'));


  // Family goals: one goal for all of this caregiver's students together.
  r.get('/me/family-goals', requireUser(), (req, res) => {
    res.json({ goals: listFamilyGoals(ctx, me(req).id) });
  });
  r.post('/me/family-goals', requireUser(), (req, res) => {
    const body = z.object({ title: z.string().trim().min(2).max(80), xpTarget: z.number().int().min(100).max(1_000_000) }).safeParse(req.body);
    if (!body.success) return void res.status(400).json({ error: 'invalid_request' });
    const open = (ctx.db.prepare('SELECT COUNT(*) AS n FROM family_goal WHERE user_id = ? AND archived = 0 AND redeemed_at IS NULL').get(me(req).id) as { n: number }).n;
    if (open >= 3) return void res.status(409).json({ error: 'too_many_goals' });
    const id = createFamilyGoal(ctx, me(req).id, body.data.title, body.data.xpTarget);
    audit(ctx.db, { kind: 'caregiver', id: me(req).id }, 'familygoal.create', id, { xpTarget: body.data.xpTarget });
    res.status(201).json({ id });
  });
  const famAct = (what: 'redeem' | 'archive') => (req: Request, res: import('express').Response): void => {
    try {
      if (what === 'redeem') redeemFamilyGoal(ctx, me(req).id, req.params.goalId!);
      else archiveFamilyGoal(ctx, me(req).id, req.params.goalId!);
      audit(ctx.db, { kind: 'caregiver', id: me(req).id }, `familygoal.${what}`, req.params.goalId!);
      res.json({ ok: true });
    } catch (e) {
      if (e instanceof RewardError) return void res.status(e.status).json({ error: e.code });
      throw e;
    }
  };
  r.post('/me/family-goals/:goalId/redeem', requireUser(), famAct('redeem'));
  r.delete('/me/family-goals/:goalId', requireUser(), famAct('archive'));

  // A printable certificate for something the student has really earned: a reached goal, a badge, a level or a reached family goal.
  r.get('/students/:id/certificate', (req, res) => {
    const a = access(ctx, me(req), req.params.id!);
    if (!a) return void res.status(404).json({ error: 'not_found' });
    const q = z.object({ kind: z.enum(['goal', 'badge', 'level', 'family']), ref: z.string().max(80).optional() }).safeParse(req.query);
    if (!q.success) return void res.status(400).json({ error: 'invalid_request' });
    const tz = ctx.cfg.timezone;
    const sum = summary(ctx, a.student);
    let heading: { en: string; fr: string }, detail: { en: string; fr: string }, icon: string, at: number;
    if (q.data.kind === 'goal') {
      const g = listGoals(ctx, a.student.id, true).find((x) => x.id === q.data.ref);
      if (!g || !g.reached || g.reachedAt === null) return void res.status(404).json({ error: 'not_found' });
      heading = tx('Goal reached', 'Objectif atteint'); detail = tx(g.title, g.title); icon = '🎯'; at = g.reachedAt;
    } else if (q.data.kind === 'badge') {
      const b = sum.badges.find((x) => x.id === q.data.ref);
      if (!b || b.earnedAt === null) return void res.status(404).json({ error: 'not_found' });
      heading = tx('Badge earned', 'Insigne obtenu'); detail = tx(`${b.name.en}: ${b.how.en}`, `${b.name.fr} : ${b.how.fr}`); icon = b.icon; at = b.earnedAt;
    } else if (q.data.kind === 'level') {
      heading = tx('Level reached', 'Niveau atteint'); detail = tx(`Level ${sum.level} with ${sum.xp} XP`, `Niveau ${sum.level} avec ${sum.xp} XP`); icon = '🚀'; at = ctx.now();
    } else {
      const g = listFamilyGoals(ctx, me(req).id).find((x) => x.id === q.data.ref);
      if (!g || !g.reached || g.reachedAt === null) return void res.status(404).json({ error: 'not_found' });
      heading = tx('Family goal reached', 'Objectif familial atteint'); detail = tx(g.title, g.title); icon = '🏡'; at = g.reachedAt;
    }
    res.json({ student: { displayName: a.student.display_name, grade: a.student.grade, language: a.student.language }, heading, detail, icon, date: localDay(at, tz), issuedOn: localDay(ctx.now(), tz), issuedBy: me(req).display_name });
  });

  return r;
}
