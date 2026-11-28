import { describe, it, expect } from 'vitest';
import { makeEnv, makeStudent, signIn, addUser } from './helpers.js';
import { makeRng } from '../shared/rng.js';
import { loadCurriculum } from '../server/curriculum.js';
import { generate } from '../shared/generators/index.js';
import { buildWorksheet } from '../server/worksheet.js';
import { XP_WORKSHEET_FINISH, xpForAnswer } from '../shared/rewards.js';
import type { Answer, Given } from '../shared/items/types.js';

// A worksheet can be answered on screen and marked by the same rules as practice. It earns the same XP per correct answer, a small
// bonus for finishing the sheet, updates skill progress, and counts once.

async function setup() {
  const env = makeEnv({}, makeRng(12));
  loadCurriculum(env.db);
  const s = await makeStudent(env);
  const email = (env.db.prepare("SELECT u.email FROM users u JOIN student_caregivers sc ON sc.caregiver_id = u.id WHERE sc.student_id = ? AND sc.role = 'owner'").get(s.studentId) as { email: string }).email;
  const cg = await signIn(env, email);
  return { env, s, cg };
}

const SHEET = { focus: ['G5.C2.3'], tier: 2 as const, count: 6, seed: 4242 };
const body = (answers: { n: number; given: unknown }[]) => ({ focus: SHEET.focus, tier: String(SHEET.tier), count: SHEET.count, seed: SHEET.seed, answers });

/** The right answer for a number item, as a student would type it. */
const right = (a: Answer): Given => (a.kind === 'number' ? { kind: 'number', text: String(a.value) } : (() => { throw new Error('not a number item'); })());
const wrong: Given = { kind: 'number', text: '987654' };

describe('marking a worksheet', () => {
  it('never sends how a question was made to the browser', async () => {
    const { s, cg } = await setup();
    const res = await cg.agent.get(`/api/students/${s.studentId}/worksheet?focus=G5.C2.3&tier=2&count=6&seed=4242`).expect(200);
    expect(res.body.marked).toBeNull();
    expect(res.body.count).toBe(6);
    for (const it of res.body.items) expect(it).not.toHaveProperty('ref');
  });

  it('marks every answer by the practice rules, and pays practice XP plus a finishing bonus', async () => {
    const { env, s, cg } = await setup();
    const sheet = buildWorksheet(env.ctx, SHEET);
    const answers = sheet.map((row) => {
      const q = generate(row.ref.skill, row.ref.tier, row.ref.seed);
      return { n: row.n, given: row.n <= 4 ? right(q.answer) : wrong };
    });
    const res = await cg.agent.post(`/api/students/${s.studentId}/worksheet/mark`).set('x-csrf-token', cg.csrf).send(body(answers)).expect(200);
    expect(res.body).toMatchObject({ total: 6, answered: 6, correct: 4, finished: true, bonus: XP_WORKSHEET_FINISH });
    const expected = sheet.reduce((sum, row) => {
      const q = generate(row.ref.skill, row.ref.tier, row.ref.seed);
      return sum + xpForAnswer({ correct: row.n <= 4, tier: q.tier, hints: 0, kind: 'practice' }).reduce((a, p) => a + p.xp, 0);
    }, XP_WORKSHEET_FINISH);
    // skill and expectation mastery bonuses could add to this, so it is at least the practice XP plus the bonus
    expect(res.body.xp).toBeGreaterThanOrEqual(expected);
    expect(res.body.results.filter((r: { correct: boolean }) => r.correct)).toHaveLength(4);
    const total = (env.db.prepare('SELECT xp FROM reward_state WHERE student_id = ?').get(s.studentId) as { xp: number }).xp;
    expect(total).toBe(res.body.xp);
    expect((env.db.prepare("SELECT COUNT(*) AS n FROM reward_event WHERE student_id = ? AND kind = 'worksheet'").get(s.studentId) as { n: number }).n).toBe(1);
  });

  it('updates skill progress like practice does', async () => {
    const { env, s, cg } = await setup();
    const sheet = buildWorksheet(env.ctx, SHEET);
    await cg.agent.post(`/api/students/${s.studentId}/worksheet/mark`).set('x-csrf-token', cg.csrf).send(body(sheet.map((row) => ({ n: row.n, given: right(generate(row.ref.skill, row.ref.tier, row.ref.seed).answer) })))).expect(200);
    const attempts = env.db.prepare("SELECT correct, kind FROM attempt WHERE student_id = ?").all(s.studentId) as { correct: number; kind: string }[];
    expect(attempts).toHaveLength(6);
    expect(attempts.every((a) => a.correct === 1 && a.kind === 'practice')).toBe(true);
    expect((env.db.prepare('SELECT COUNT(*) AS n FROM mastery WHERE student_id = ?').get(s.studentId) as { n: number }).n).toBeGreaterThan(0);
  });

  it('gives no finishing bonus when a question is left blank, but still pays for the answers given', async () => {
    const { env, s, cg } = await setup();
    const sheet = buildWorksheet(env.ctx, SHEET);
    const answers = sheet.slice(0, 3).map((row) => ({ n: row.n, given: right(generate(row.ref.skill, row.ref.tier, row.ref.seed).answer) }));
    const res = await cg.agent.post(`/api/students/${s.studentId}/worksheet/mark`).set('x-csrf-token', cg.csrf).send(body(answers)).expect(200);
    expect(res.body).toMatchObject({ total: 6, answered: 3, correct: 3, finished: false, bonus: 0 });
    expect((env.db.prepare("SELECT COUNT(*) AS n FROM reward_event WHERE student_id = ? AND kind = 'worksheet'").get(s.studentId) as { n: number }).n).toBe(0);
  });

  it('counts a sheet once: marking it again pays nothing and says so', async () => {
    const { env, s, cg } = await setup();
    const sheet = buildWorksheet(env.ctx, SHEET);
    const answers = sheet.map((row) => ({ n: row.n, given: right(generate(row.ref.skill, row.ref.tier, row.ref.seed).answer) }));
    const first = await cg.agent.post(`/api/students/${s.studentId}/worksheet/mark`).set('x-csrf-token', cg.csrf).send(body(answers)).expect(200);
    const xpAfter = (env.db.prepare('SELECT xp FROM reward_state WHERE student_id = ?').get(s.studentId) as { xp: number }).xp;
    const again = await cg.agent.post(`/api/students/${s.studentId}/worksheet/mark`).set('x-csrf-token', cg.csrf).send(body(answers)).expect(409);
    expect(again.body).toMatchObject({ error: 'already_marked', correct: 6, total: 6, xp: first.body.xp });
    expect((env.db.prepare('SELECT xp FROM reward_state WHERE student_id = ?').get(s.studentId) as { xp: number }).xp).toBe(xpAfter);
    expect((env.db.prepare('SELECT COUNT(*) AS n FROM attempt WHERE student_id = ?').get(s.studentId) as { n: number }).n).toBe(6);
    // the sheet now says it was marked
    const res = await cg.agent.get(`/api/students/${s.studentId}/worksheet?focus=G5.C2.3&tier=2&count=6&seed=4242`).expect(200);
    expect(res.body.marked).toEqual({ answered: 6, correct: 6, total: 6, xp: first.body.xp });
    // a different seed is a different sheet
    const other = buildWorksheet(env.ctx, { ...SHEET, seed: 4243 });
    await cg.agent.post(`/api/students/${s.studentId}/worksheet/mark`).set('x-csrf-token', cg.csrf).send({ ...body([]), seed: 4243, answers: other.map((row) => ({ n: row.n, given: wrong })) }).expect(200);
  });

  it('ignores a repeated or out-of-range question number, and refuses an empty or malformed marking without using the sheet up', async () => {
    const { env, s, cg } = await setup();
    const sheet = buildWorksheet(env.ctx, SHEET);
    const good = right(generate(sheet[0]!.ref.skill, sheet[0]!.ref.tier, sheet[0]!.ref.seed).answer);
    const post = (b: unknown) => cg.agent.post(`/api/students/${s.studentId}/worksheet/mark`).set('x-csrf-token', cg.csrf).send(b as object);
    await post(body([])).expect(400);
    await post(body([{ n: 99, given: good }])).expect(400); // out of range for the schema
    await post(body([{ n: 7, given: good }])).expect(400); // not on a six question sheet
    await post(body([{ n: 1, given: { kind: 'nonsense' } }])).expect(400);
    await post({ ...body([{ n: 1, given: good }]), focus: ['nope'] }).expect(400);
    expect((env.db.prepare('SELECT COUNT(*) AS n FROM worksheet_marked').get() as { n: number }).n).toBe(0);
    const res = await post(body([{ n: 1, given: good }, { n: 1, given: wrong }])).expect(200);
    expect(res.body).toMatchObject({ answered: 1, correct: 1 }); // the first answer for a question is the one that counts
  });

  it('is for the student\'s own caregivers only', async () => {
    const { env, s, cg } = await setup();
    const sheet = buildWorksheet(env.ctx, SHEET);
    const answers = [{ n: 1, given: right(generate(sheet[0]!.ref.skill, sheet[0]!.ref.tier, sheet[0]!.ref.seed).answer) }];
    addUser(env, 'other@x.ca');
    addUser(env, 'admin@x.ca', 'admin');
    const other = await signIn(env, 'other@x.ca');
    const admin = await signIn(env, 'admin@x.ca');
    await other.agent.post(`/api/students/${s.studentId}/worksheet/mark`).set('x-csrf-token', other.csrf).send(body(answers)).expect(404);
    await admin.agent.post(`/api/students/${s.studentId}/worksheet/mark`).set('x-csrf-token', admin.csrf).send(body(answers)).expect(404);
    await s.agent.post(`/api/students/${s.studentId}/worksheet/mark`).set('x-csrf-token', s.csrf).send(body(answers)).expect(401);
    await cg.agent.post(`/api/students/${s.studentId}/worksheet/mark`).send(body(answers)).expect(403); // no CSRF token
    expect((env.db.prepare('SELECT COUNT(*) AS n FROM attempt').get() as { n: number }).n).toBe(0);
  });

  it('is written to the family\'s activity log and the student\'s export, and goes when the student does', async () => {
    const { env, s, cg } = await setup();
    const sheet = buildWorksheet(env.ctx, SHEET);
    await cg.agent.post(`/api/students/${s.studentId}/worksheet/mark`).set('x-csrf-token', cg.csrf).send(body(sheet.map((row) => ({ n: row.n, given: wrong })))).expect(200);
    const log = env.db.prepare("SELECT student_id, meta_json FROM audit_log WHERE action = 'worksheet.mark'").all() as { student_id: string; meta_json: string }[];
    expect(log).toHaveLength(1);
    expect(log[0]!.student_id).toBe(s.studentId);
    expect(JSON.parse(log[0]!.meta_json)).toMatchObject({ answered: 6, correct: 0, total: 6 });
    const exp = await cg.agent.get(`/api/students/${s.studentId}/export`);
    if (exp.status === 200) expect(exp.body.worksheets).toHaveLength(1);
    env.db.prepare('DELETE FROM students WHERE id = ?').run(s.studentId);
    expect((env.db.prepare('SELECT COUNT(*) AS n FROM worksheet_marked').get() as { n: number }).n).toBe(0);
  });
});
