import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { makeEnv, makeStudent, type TestEnv } from './helpers.js';
import { makeRng } from '../shared/rng.js';
import { generate } from '../shared/generators/index.js';
import { answerToGiven } from '../shared/check.js';
import type { Given } from '../shared/items/types.js';
import { loadCurriculum } from '../server/curriculum.js';

type Agent = ReturnType<typeof request.agent>;
interface S { agent: Agent; csrf: string; studentId: string }
interface Pack { packId: string; grade: number; issuedAt: number; expiresAt: number; items: { skill: string; tier: number; seed: number; target: string }[] }

const env0 = (seed = 1): TestEnv => {
  const env = makeEnv({}, makeRng(seed));
  loadCurriculum(env.db);
  return env;
};
const post = (s: S, path: string, body: unknown) => s.agent.post(`/api/learn${path}`).set('x-csrf-token', s.csrf).send(body as object);
const getPack = async (s: S, body: object = { grade: 5, strands: ['B'] }): Promise<Pack> => (await post(s, '/offline/pack', body).expect(200)).body as Pack;
/** What a device would send for an item it answered right, using the same shared generator the app bundles. */
const rightFor = (it: Pack['items'][number]): Given => answerToGiven(generate(it.skill, it.tier, it.seed).answer);
const attempts = (env: TestEnv, sid: string): number => (env.db.prepare('SELECT COUNT(*) AS n FROM attempt WHERE student_id = ?').get(sid) as { n: number }).n;

describe('offline practice', () => {
  it('hands out a pack of rebuildable questions and keeps the list on the server', async () => {
    const env = env0();
    const s = await makeStudent(env);
    const pack = await getPack(s);
    expect(pack.items.length).toBeGreaterThanOrEqual(10);
    expect(pack.expiresAt).toBeGreaterThan(pack.issuedAt);
    for (const it of pack.items) {
      expect(it.skill).toMatch(/^MS\./);
      expect(it.tier).toBeGreaterThanOrEqual(1);
      expect(generate(it.skill, it.tier, it.seed).skill).toBe(it.skill);
    }
    // The pack never carries an answer key; the list is only skill, tier, seed and target.
    expect(JSON.stringify(pack)).not.toMatch(/"answer"/);
    const row = env.db.prepare('SELECT items_json FROM offline_pack WHERE id = ?').get(pack.packId) as { items_json: string };
    expect(JSON.parse(row.items_json)).toEqual(pack.items);
  });

  it('grades every answer itself and updates mastery and rewards like online practice', async () => {
    const env = env0();
    const s = await makeStudent(env);
    const pack = await getPack(s);
    const answers = pack.items.slice(0, 6).map((it, i) => ({ i, given: i < 4 ? rightFor(it) : ({ kind: 'number', text: '123456' } as Given), hints: i === 0 ? 1 : 0, ms: 6000 }));
    const res = await post(s, '/offline/sync', { packId: pack.packId, answers }).expect(200);
    expect(res.body.answered).toBe(6);
    expect(res.body.correct).toBe(4);
    expect(res.body.xp).toBeGreaterThan(0);
    expect(res.body.remaining).toBe(pack.items.length - 6);
    expect(attempts(env, s.studentId)).toBe(6);
    const m = env.db.prepare('SELECT SUM(attempts) AS a, SUM(correct) AS c FROM mastery WHERE student_id = ?').get(s.studentId) as { a: number; c: number };
    expect(m.a).toBe(6);
    expect(m.c).toBe(4);
    const rewardXp = (env.db.prepare('SELECT xp FROM reward_state WHERE student_id = ?').get(s.studentId) as { xp: number }).xp;
    expect(rewardXp).toBe(res.body.xp);
  });

  it('never trusts the device: a claimed answer is graded from the rebuilt question, and each question counts once', async () => {
    const env = env0();
    const s = await makeStudent(env);
    const pack = await getPack(s);
    const wrong: Given = { kind: 'number', text: '123456' };
    const first = await post(s, '/offline/sync', { packId: pack.packId, answers: [{ i: 0, given: wrong }] }).expect(200);
    expect(first.body.correct).toBe(0);
    // Sending the same question again, now with the right answer, changes nothing.
    const again = await post(s, '/offline/sync', { packId: pack.packId, answers: [{ i: 0, given: rightFor(pack.items[0]!) }, { i: 0, given: rightFor(pack.items[0]!) }] }).expect(200);
    expect(again.body.answered).toBe(0);
    expect(again.body.results.every((r: { status: string }) => r.status === 'skipped')).toBe(true);
    expect(attempts(env, s.studentId)).toBe(1);
    // Out-of-range and malformed answers are skipped, not errors.
    const odd = await post(s, '/offline/sync', { packId: pack.packId, answers: [{ i: 99, given: wrong }, { i: 1, given: { kind: 'nope' } }] }).expect(200);
    expect(odd.body.answered).toBe(0);
  });

  it('finishes a pack across several syncs and marks it done', async () => {
    const env = env0();
    const s = await makeStudent(env);
    const pack = await getPack(s);
    const half = Math.floor(pack.items.length / 2);
    await post(s, '/offline/sync', { packId: pack.packId, answers: pack.items.slice(0, half).map((it, i) => ({ i, given: rightFor(it) })) }).expect(200);
    expect((env.db.prepare('SELECT synced_at FROM offline_pack WHERE id = ?').get(pack.packId) as { synced_at: number | null }).synced_at).toBeNull();
    const rest = await post(s, '/offline/sync', { packId: pack.packId, answers: pack.items.slice(half).map((it, i) => ({ i: half + i, given: rightFor(it) })) }).expect(200);
    expect(rest.body.remaining).toBe(0);
    expect((env.db.prepare('SELECT synced_at FROM offline_pack WHERE id = ?').get(pack.packId) as { synced_at: number | null }).synced_at).not.toBeNull();
  });

  it('keeps one student from using another student\'s pack', async () => {
    const env = env0();
    const a = await makeStudent(env);
    const b = await makeStudent(env);
    const pack = await getPack(a);
    await post(b, '/offline/sync', { packId: pack.packId, answers: [{ i: 0, given: rightFor(pack.items[0]!) }] }).expect(404);
    expect(attempts(env, b.studentId)).toBe(0);
  });

  it('refuses a pack long after it expired, and tidies old packs', async () => {
    const env = env0();
    const s = await makeStudent(env);
    const pack = await getPack(s);
    env.clock.t += 15 * 86_400_000;
    env.db.prepare('UPDATE sessions SET expires_at = ?').run(env.clock.t + 86_400_000); // the clock jump must not sign the student out
    await post(s, '/offline/sync', { packId: pack.packId, answers: [{ i: 0, given: rightFor(pack.items[0]!) }] }).expect(410);
    await getPack(s);
    expect((env.db.prepare('SELECT COUNT(*) AS n FROM offline_pack WHERE id = ?').get(pack.packId) as { n: number }).n).toBe(0);
  });

  it('caps how many packs a student can hold, keeping the newest', async () => {
    const env = env0();
    const s = await makeStudent(env);
    const ids: string[] = [];
    for (let i = 0; i < 7; i++) { ids.push((await getPack(s)).packId); env.clock.t += 1000; }
    const left = (env.db.prepare('SELECT id FROM offline_pack WHERE student_id = ?').all(s.studentId) as { id: string }[]).map((r) => r.id);
    expect(left.length).toBe(5);
    expect(left).toContain(ids[6]);
    expect(left).not.toContain(ids[0]);
  });

  it('checks the request, the grade and the content', async () => {
    const env = env0();
    const s = await makeStudent(env);
    await post(s, '/offline/pack', { grade: 3 }).expect(400);
    await post(s, '/offline/pack', { grade: 12 }).expect(404); // no Grade 12 content yet
    const limited = await makeStudent(env, { allowed: { grades: [5], courses: [] } });
    await post(limited, '/offline/pack', { grade: 6 }).expect(403);
    await post(s, '/offline/sync', { packId: 'x', answers: [] }).expect(400);
    await post(s, '/offline/sync', { packId: 'does-not-exist-pack', answers: [] }).expect(404);
    await request(env.app).post('/api/learn/offline/pack').send({ grade: 5 }).expect(401);
  });

  it('builds packs for the new Grade 7 skills too', async () => {
    const env = env0();
    const s = await makeStudent(env, { grade: 7, allowed: { grades: [5, 6, 7], courses: [] } });
    const pack = await getPack(s, { grade: 7, strands: ['C', 'E'] });
    expect(pack.items.every((it) => it.skill.startsWith('MS.G7.'))).toBe(true);
  });
});
