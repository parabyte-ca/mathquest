import { describe, it, expect } from 'vitest';
import { makeEnv, makeStudent, signIn, addUser } from './helpers.js';
import { makeRng } from '../shared/rng.js';
import { loadCurriculum } from '../server/curriculum.js';
import { generate } from '../shared/generators/index.js';
import { answerText, buildWorksheet } from '../server/worksheet.js';

async function setup() {
  const env = makeEnv({}, makeRng(12));
  loadCurriculum(env.db);
  const s = await makeStudent(env);
  const email = (env.db.prepare("SELECT u.email FROM users u JOIN student_caregivers sc ON sc.caregiver_id = u.id WHERE sc.student_id = ? AND sc.role = 'owner'").get(s.studentId) as { email: string }).email;
  const cg = await signIn(env, email);
  return { env, s, cg };
}

describe('worksheets', () => {
  it('builds the same sheet and answer key for the same seed, with no repeated question', async () => {
    const { env } = await setup();
    const a = buildWorksheet(env.ctx, { focus: 'G5.B2.5', tier: 'mixed', count: 12, seed: 777 });
    const b = buildWorksheet(env.ctx, { focus: 'G5.B2.5', tier: 'mixed', count: 12, seed: 777 });
    expect(a).toEqual(b);
    expect(a).toHaveLength(12);
    expect(new Set(a.map((i) => JSON.stringify([i.prompt.en, i.options]))).size).toBe(12);
    expect(buildWorksheet(env.ctx, { focus: 'G5.B2.5', tier: 'mixed', count: 12, seed: 778 })).not.toEqual(a);
    expect(a.map((i) => i.n)).toEqual(a.map((_, i) => i + 1));
  });

  it('writes an answer for every format a sheet can contain, in both languages', async () => {
    const { env } = await setup();
    const skills = (env.db.prepare('SELECT id FROM microskill').all() as { id: string }[]).map((m) => m.id);
    const formats = new Set<string>();
    for (const sk of skills) {
      for (const tier of [1, 2, 3]) {
        for (let seed = 1; seed <= 20; seed++) {
          const it = generate(sk, tier, seed);
          formats.add(it.format);
          const a = answerText(it);
          for (const l of ['en', 'fr'] as const) {
            expect(a[l].trim().length, it.id).toBeGreaterThan(0);
            expect(a[l], it.id).not.toMatch(/undefined|NaN|\[object/);
            expect((a[l].match(/\$/g) ?? []).length % 2).toBe(0);
          }
        }
      }
    }
    expect([...formats].sort()).toEqual(expect.arrayContaining(['number', 'fraction', 'choice']));
  });

  it('checks the answer key against the real answer for number items', async () => {
    const { env } = await setup();
    const sheet = buildWorksheet(env.ctx, { focus: 'G5.C2.3', tier: 2, count: 8, seed: 5 });
    for (const row of sheet) {
      const it = generate('MS.G5.C2.3.a', 2, 5 + row.n - 1);
      expect(row.answer.en).toBe(`$${(it.answer as { value: number }).value}$`);
    }
  });

  it('serves a sheet to the family and refuses outsiders, bad input and empty topics', async () => {
    const { env, s, cg } = await setup();
    const res = await cg.agent.get(`/api/students/${s.studentId}/worksheet?focus=G5.C2.3&tier=mixed&count=10&seed=42`).expect(200);
    expect(res.body.items).toHaveLength(10);
    expect(res.body.seed).toBe(42);
    expect(res.body.student.grade).toBe(5);
    expect(res.body.items[0]).toHaveProperty('answer');
    const again = await cg.agent.get(`/api/students/${s.studentId}/worksheet?focus=G5.C2.3&tier=mixed&count=10&seed=42`).expect(200);
    expect(again.body.items).toEqual(res.body.items);
    await cg.agent.get(`/api/students/${s.studentId}/worksheet?focus=bad`).expect(400);
    await cg.agent.get(`/api/students/${s.studentId}/worksheet?focus=G5.C2.3&count=2`).expect(400);
    await cg.agent.get(`/api/students/${s.studentId}/worksheet?focus=MAP4C.A1`).expect(404); // no practice content yet
    addUser(env, 'other@x.ca');
    const other = await signIn(env, 'other@x.ca');
    await other.agent.get(`/api/students/${s.studentId}/worksheet?focus=G5.C2.3`).expect(404);
    // a student cannot fetch answers
    await s.agent.get(`/api/students/${s.studentId}/worksheet?focus=G5.C2.3`).expect(401);
  });

  it('lists expectations with content for the caregiver to choose from', async () => {
    const { s, cg } = await setup();
    const res = await cg.agent.get(`/api/students/${s.studentId}/worksheet/options`).expect(200);
    const codes = res.body.expectations.map((e: { code: string }) => e.code);
    expect(codes).toContain('G5.C2.3');
    expect(codes).toContain('G6.B2.12');
    expect(codes).not.toContain('MAP4C.A1'); // nothing to practice yet
    expect(res.body.studentGrade).toBe(5);
  });
});

describe('worksheets with several topics', () => {
  it('takes the topics in turn, keeps single-topic sheets unchanged, and is repeatable', async () => {
    const { env } = await setup();
    const single = buildWorksheet(env.ctx, { focus: 'G5.B2.5', tier: 'mixed', count: 12, seed: 777 });
    expect(buildWorksheet(env.ctx, { focus: ['G5.B2.5'], tier: 'mixed', count: 12, seed: 777 })).toEqual(single);
    const two = buildWorksheet(env.ctx, { focus: ['G5.B2.5', 'G5.C2.3'], tier: 2, count: 10, seed: 9 });
    expect(two).toHaveLength(10);
    expect(buildWorksheet(env.ctx, { focus: ['G5.B2.5', 'G5.C2.3'], tier: 2, count: 10, seed: 9 })).toEqual(two);
    // the first question is the first topic and the second is the second topic
    expect(two[0]).toEqual(buildWorksheet(env.ctx, { focus: 'G5.B2.5', tier: 2, count: 1, seed: 9 })[0]);
    expect(two[1]!.prompt).toEqual(generate('MS.G5.C2.3.a', 2, 10).prompt);
  });

  it('leaves out a topic with no content and de-duplicates repeated topics', async () => {
    const { env } = await setup();
    const a = buildWorksheet(env.ctx, { focus: ['G5.C2.3', 'NOPE.B1', 'G5.C2.3'], tier: 1, count: 6, seed: 3 });
    expect(a).toEqual(buildWorksheet(env.ctx, { focus: 'G5.C2.3', tier: 1, count: 6, seed: 3 }));
    expect(buildWorksheet(env.ctx, { focus: ['NOPE.B1'], tier: 1, count: 6, seed: 3 })).toEqual([]);
  });

  it('serves a mixed sheet over the API with each topic named and worked steps for every question', async () => {
    const { s, cg } = await setup();
    const res = await cg.agent.get(`/api/students/${s.studentId}/worksheet?focus=G5.B2.5,G5.C2.3&tier=mixed&count=8&seed=11`).expect(200);
    expect(res.body.topics.map((x: { code: string }) => x.code)).toEqual(['G5.B2.5', 'G5.C2.3']);
    expect(res.body.items).toHaveLength(8);
    for (const it of res.body.items) expect(it.steps.length).toBeGreaterThanOrEqual(1);
    await cg.agent.get(`/api/students/${s.studentId}/worksheet?focus=G5.B2.5,bad`).expect(400);
    await cg.agent.get(`/api/students/${s.studentId}/worksheet?focus=${Array(7).fill('G5.B2.5').join(',')}`).expect(400);
  });
});
