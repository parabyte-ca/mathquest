import { describe, it, expect } from 'vitest';
import { makeEnv, makeStudent } from './helpers.js';
import { makeRng } from '../shared/rng.js';
import { answerToGiven } from '../shared/check.js';
import { loadCurriculum } from '../server/curriculum.js';
import { composeWeekly, mondayOf, sendWeeklyEmails } from '../server/weekly.js';
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
});
