import { describe, it, expect } from 'vitest';
import { addUser, makeEnv, makeStudent, signIn } from './helpers.js';
import { makeRng } from '../shared/rng.js';
import { answerToGiven } from '../shared/check.js';
import { loadCurriculum } from '../server/curriculum.js';
import { composeWeekly, mondayOf, sendWeeklyEmails, weekdayOnOrBefore, weeklyDayOf } from '../server/weekly.js';
import { dashboard } from '../server/rewards/dashboard.js';
import type { StudentRow } from '../server/context.js';
import type { Item } from '../shared/items/types.js';

const TZ = 'America/Toronto';
const monday = (h: number, m = 0, plusDays = 0) => Date.UTC(2026, 10, 23 + plusDays, h + 5, m); // Monday 23 Nov 2026 local time (UTC-5)

async function setup(language: 'en' | 'fr' = 'en') {
  const env = makeEnv({}, makeRng(11));
  loadCurriculum(env.db);
  const s = await makeStudent(env);
  env.db.prepare('UPDATE students SET language = ? WHERE id = ?').run(language, s.studentId);
  const owner = env.db.prepare("SELECT u.id, u.email FROM users u JOIN student_caregivers sc ON sc.caregiver_id = u.id WHERE sc.student_id = ? AND sc.role = 'owner'").get(s.studentId) as { id: string; email: string };
  return { env, s, owner };
}
const dashboardFor = (env: Awaited<ReturnType<typeof setup>>['env'], sid: string) => dashboard(env.ctx, env.db.prepare('SELECT * FROM students WHERE id = ?').get(sid) as StudentRow);
async function practise(env: Awaited<ReturnType<typeof setup>>['env'], s: Awaited<ReturnType<typeof setup>>['s'], n: number) {
  const start = await s.agent.post('/api/learn/session').set('x-csrf-token', s.csrf).send({ grade: 5, focus: 'G5.C2.3' }).expect(200);
  let step = start.body.step as { type: string; item?: { id: string } };
  for (let i = 0; i < n && step.type === 'item'; i++) {
    const row = env.db.prepare('SELECT item_json FROM pending_item WHERE id = ?').get(step.item!.id) as { item_json: string };
    await s.agent.post('/api/learn/answer').set('x-csrf-token', s.csrf).send({ itemId: step.item!.id, given: answerToGiven((JSON.parse(row.item_json) as Item).answer), ms: 6000 }).expect(200);
    step = (await s.agent.post('/api/learn/next').set('x-csrf-token', s.csrf).send({ sessionId: start.body.sessionId }).expect(200)).body;
  }
}

describe('weekly email', () => {
  it('finds the Monday of the week in the family time zone', () => {
    expect(mondayOf(monday(8), TZ)).toBe('2026-11-23');
    expect(mondayOf(monday(8, 0, 2), TZ)).toBe('2026-11-23'); // Wednesday
    expect(mondayOf(monday(8, 0, 6), TZ)).toBe('2026-11-23'); // Sunday
    expect(mondayOf(monday(8, 0, 7), TZ)).toBe('2026-11-30');
    expect(mondayOf(Date.UTC(2026, 10, 23, 3, 0), TZ)).toBe('2026-11-16'); // Sunday evening in Toronto, still last week
  });

  it('sends one summary per week to opted-in caregivers, from Monday 07:30, and not to others', async () => {
    const { env, s, owner } = await setup();
    await practise(env, s, 3);
    const cfg = env.ctx.cfg;
    // not opted in
    expect(await sendWeeklyEmails(env.db, cfg, env.mailer, monday(9))).toBe(0);
    env.db.prepare('UPDATE users SET weekly_email = 1 WHERE id = ?').run(owner.id);
    env.mailer.outbox.length = 0;
    expect(await sendWeeklyEmails(env.db, cfg, env.mailer, monday(7, 0))).toBe(0); // too early on Monday
    expect(await sendWeeklyEmails(env.db, cfg, env.mailer, monday(7, 45))).toBe(1);
    expect(env.mailer.outbox).toHaveLength(1);
    const mail = env.mailer.outbox[0]!;
    expect(mail.to).toBe(owner.email);
    expect(mail.subject).toContain('MathQuest');
    expect(mail.text).toContain('Grade 5');
    expect(mail.text).toMatch(/\d+ questions in about \d+ minutes/);
    expect(mail.text).toContain('/app');
    expect(mail.text).not.toMatch(/token|pin\b|password/i);
    expect(await sendWeeklyEmails(env.db, cfg, env.mailer, monday(12))).toBe(0); // already sent this week
    expect(await sendWeeklyEmails(env.db, cfg, env.mailer, monday(8, 0, 3))).toBe(0); // Thursday, same week
    expect(await sendWeeklyEmails(env.db, cfg, env.mailer, monday(8, 0, 7))).toBe(1); // next Monday
  });

  it('catches up when the server missed Monday', async () => {
    const { env, owner } = await setup();
    env.db.prepare('UPDATE users SET weekly_email = 1 WHERE id = ?').run(owner.id);
    expect(await sendWeeklyEmails(env.db, env.ctx.cfg, env.mailer, monday(10, 0, 2))).toBe(1); // Wednesday
  });

  it('says so kindly when there was no practice, mentions goals reached, and writes in French for a French family', async () => {
    const { env, s, owner } = await setup('fr');
    env.db.prepare('UPDATE users SET weekly_email = 1 WHERE id = ?').run(owner.id);
    const ctx = { ...env.ctx, now: () => monday(9) };
    const quiet = composeWeekly(ctx, { id: owner.id, email: owner.email, display_name: 'Sam' })!;
    expect(quiet.subject).toContain('semaine');
    expect(quiet.text).toContain('Bonjour Sam');
    expect(quiet.text).toContain('Aucune pratique');
    // a reached, unredeemed goal is called out
    env.db.prepare('INSERT INTO goal (id, student_id, created_by, title, xp_target, baseline_xp, created_at, reached_at) VALUES (?,?,?,?,?,?,?,?)').run('g1', s.studentId, owner.id, 'Soirée cinéma', 50, 0, 1, 2);
    expect(composeWeekly(ctx, { id: owner.id, email: owner.email, display_name: '' })!.text).toContain('Soirée cinéma');
  });

  it('returns nothing for a caregiver with no students', async () => {
    const { env } = await setup();
    env.db.prepare("INSERT INTO users (id, email, role, status, created_at, weekly_email) VALUES ('u9','empty@x.ca','caregiver','active','2026-01-01',1)").run();
    expect(composeWeekly(env.ctx, { id: 'u9', email: 'empty@x.ca', display_name: '' })).toBeNull();
  });

  it('sends on the day the caregiver chose, from 07:30, and not on other days', async () => {
    const { env, owner } = await setup();
    env.db.prepare("UPDATE users SET weekly_email = 1, defaults_json = ? WHERE id = ?").run(JSON.stringify({ weeklyDay: 3 }), owner.id); // Wednesday
    const cfg = env.ctx.cfg;
    expect(await sendWeeklyEmails(env.db, cfg, env.mailer, monday(9, 0, 3))).toBe(1); // Thursday: the first check after Wednesday catches up
    env.mailer.outbox.length = 0;
    expect(await sendWeeklyEmails(env.db, cfg, env.mailer, monday(9, 0, 4))).toBe(0); // Friday, same Wednesday-to-Tuesday week
    expect(await sendWeeklyEmails(env.db, cfg, env.mailer, monday(7, 0, 9))).toBe(0); // the next Wednesday, before 07:30
    expect(await sendWeeklyEmails(env.db, cfg, env.mailer, monday(7, 45, 9))).toBe(1); // the next Wednesday, after 07:30
    expect(await sendWeeklyEmails(env.db, cfg, env.mailer, monday(15, 0, 9))).toBe(0); // only once that day
  });

  it('falls back to Monday for a missing or invalid day', () => {
    expect(weeklyDayOf('{}')).toBe(1);
    expect(weeklyDayOf('{"weeklyDay":9}')).toBe(1);
    expect(weeklyDayOf('{"weeklyDay":"x"}')).toBe(1);
    expect(weeklyDayOf('{"weeklyDay":0}')).toBe(0);
    expect(weekdayOnOrBefore(monday(8, 0, 2), TZ, 0)).toBe('2026-11-22'); // Sunday before that Wednesday
    expect(weekdayOnOrBefore(monday(8, 0, 2), TZ, 3)).toBe('2026-11-25'); // the Wednesday itself
  });

  it('compares this week with the week before, in the dashboard and in the email', async () => {
    const { env, s, owner } = await setup();
    const sid = s.studentId;
    const now = env.ctx.now();
    const add = (skill: string, ageDays: number, correct: number) => env.db.prepare("INSERT INTO attempt (student_id, skill_id, tier, kind, correct, hints, ms, at) VALUES (?,?,?,?,?,?,?,?)").run(sid, skill, 1, 'practice', correct, 0, 60_000, now - ageDays * 86_400_000);
    for (let i = 0; i < 6; i++) add('MS.G5.C2.3.a', 2, i < 3 ? 1 : 0); // this week: 6 answered, 3 right (50%)
    for (let i = 0; i < 4; i++) add('MS.G5.C2.3.a', 10, 1); // the week before: 4 answered, 4 right (100%)
    add('MS.G5.C2.3.a', 20, 1); // older than two weeks: in neither
    const d = dashboardFor(env, sid);
    expect(d.week.answered).toBe(6);
    expect(d.prevWeek).toEqual({ answered: 4, accuracy: 100, minutes: 4 });
    const mail = composeWeekly(env.ctx, { id: owner.id, email: owner.email, display_name: '' })!;
    expect(mail.text).toContain('Compared with the week before: +2 question(s), accuracy -50 point(s).');
  });

  it('lets a caregiver send themselves a test email, once a minute, without using up the week\'s email', async () => {
    const { env, owner } = await setup();
    const cg = await signIn(env, owner.email);
    env.mailer.outbox.length = 0;
    const first = await cg.agent.post('/api/me/weekly-test').set('x-csrf-token', cg.csrf).send({}).expect(200);
    expect(first.body.sent).toBe(true);
    expect(env.mailer.outbox).toHaveLength(1);
    expect(env.mailer.outbox[0]!.to).toBe(owner.email);
    await cg.agent.post('/api/me/weekly-test').set('x-csrf-token', cg.csrf).send({}).expect(429);
    expect(env.db.prepare("SELECT value FROM kv WHERE key = ?").get(`weekly:${owner.id}`)).toBeUndefined();
    await cg.agent.put('/api/me/defaults').set('x-csrf-token', cg.csrf).send({ weeklyDay: 5 }).expect(200);
    await cg.agent.put('/api/me/defaults').set('x-csrf-token', cg.csrf).send({ weeklyDay: 7 }).expect(400);
    expect(weeklyDayOf((env.db.prepare('SELECT defaults_json FROM users WHERE id = ?').get(owner.id) as { defaults_json: string }).defaults_json)).toBe(5);
  });

  it('says so when a caregiver without students asks for a test email', async () => {
    const env = makeEnv({}, makeRng(5));
    loadCurriculum(env.db);
    addUser(env, 'lonely@x.ca');
    const cg = await signIn(env, 'lonely@x.ca');
    const r = await cg.agent.post('/api/me/weekly-test').set('x-csrf-token', cg.csrf).send({}).expect(200);
    expect(r.body).toEqual({ ok: true, sent: false, reason: 'no_students' });
  });
});
