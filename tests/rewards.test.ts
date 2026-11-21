import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { makeEnv, makeStudent, signIn, addUser, type TestEnv } from './helpers.js';
import { makeRng } from '../shared/rng.js';
import { answerToGiven } from '../shared/check.js';
import { loadCurriculum } from '../server/curriculum.js';
import { BADGES, COSMETICS, levelInfo, newBadgeIds, streakStep, streakToShow, xpForAnswer, xpToReach, type Stats, type StreakState } from '../shared/rewards.js';
import { localDay, onAnswered, summary, effectiveSettings } from '../server/rewards/service.js';
import type { Item } from '../shared/items/types.js';

const DAY = 86_400_000;

describe('XP, levels and streaks (pure)', () => {
  it('pays more for harder questions, a little less per hint, and something for a good try', () => {
    const xp = (o: Partial<Parameters<typeof xpForAnswer>[0]> = {}) => xpForAnswer({ correct: true, tier: 1, hints: 0, kind: 'practice', ...o }).reduce((s, p) => s + p.xp, 0);
    expect(xp({ tier: 1 })).toBe(10);
    expect(xp({ tier: 2 })).toBe(15);
    expect(xp({ tier: 3 })).toBe(20);
    expect(xp({ tier: 3, hints: 2 })).toBe(14);
    expect(xp({ tier: 1, hints: 3 })).toBe(4); // never to nothing
    expect(xp({ kind: 'review' })).toBe(15);
    expect(xp({ correct: false })).toBe(2);
    expect(xpForAnswer({ correct: true, tier: 2, hints: 0, kind: 'placement' })).toEqual([]);
  });

  it('levels rise at 100, 300, 600, 1 000 XP', () => {
    expect([1, 2, 3, 4, 5].map(xpToReach)).toEqual([0, 100, 300, 600, 1000]);
    expect(levelInfo(0)).toMatchObject({ level: 1, into: 0, need: 100 });
    expect(levelInfo(99).level).toBe(1);
    expect(levelInfo(100)).toMatchObject({ level: 2, into: 0, need: 200 });
    expect(levelInfo(1000).level).toBe(5);
  });

  it('counts days in a row, spends a freeze on one missed day, earns one every seventh day, and resets after a longer gap', () => {
    let s: StreakState = { streak: 0, best: 0, lastDay: null, freezes: 0 };
    s = streakStep(s, '2026-11-01').state;
    expect(s).toMatchObject({ streak: 1, lastDay: '2026-11-01' });
    expect(streakStep(s, '2026-11-01').started).toBe(false); // same day: nothing changes
    for (let d = 2; d <= 7; d++) s = streakStep(s, `2026-11-0${d}`).state;
    expect(s).toMatchObject({ streak: 7, freezes: 1, best: 7 });
    const skip = streakStep(s, '2026-11-09'); // missed the 8th
    expect(skip).toMatchObject({ freezeUsed: true, state: { streak: 8, freezes: 0 } });
    const lost = streakStep(skip.state, '2026-11-12'); // missed two days, no freeze
    expect(lost.state).toMatchObject({ streak: 1, best: 8 });
    // a missed day with no freeze resets
    expect(streakStep({ streak: 5, best: 5, lastDay: '2026-11-01', freezes: 0 }, '2026-11-03').state.streak).toBe(1);
  });

  it('shows a lapsed streak as zero', () => {
    const s: StreakState = { streak: 6, best: 6, lastDay: '2026-11-10', freezes: 0 };
    expect(streakToShow(s, '2026-11-10')).toBe(6);
    expect(streakToShow(s, '2026-11-11')).toBe(6); // still alive: today is not over
    expect(streakToShow(s, '2026-11-12')).toBe(0);
    expect(streakToShow({ ...s, freezes: 1 }, '2026-11-12')).toBe(6);
  });

  it('awards each badge once its rule is met, and badges and cosmetics are well formed', () => {
    const zero: Stats = { answers: 0, correct: 0, reviewCorrect: 0, streak: 0, skillsMastered: 0, expectationsMastered: 0, strandsTouched: 0, comebacks: 0, hintedCorrect: 0, level: 1 };
    expect(newBadgeIds(zero, new Set())).toEqual([]);
    expect(newBadgeIds({ ...zero, answers: 1 }, new Set())).toEqual(['first-steps']);
    expect(newBadgeIds({ ...zero, answers: 5, correct: 12, streak: 3 }, new Set(['first-steps']))).toEqual(['on-a-roll', 'streak-3']);
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
    for (const b of BADGES) for (const l of ['en', 'fr'] as const) { expect(b.name[l].length).toBeGreaterThan(0); expect(b.how[l].length).toBeGreaterThan(0); }
    expect(new Set(COSMETICS.map((c) => c.id)).size).toBe(COSMETICS.length);
    for (const c of COSMETICS) if ('badge' in c.unlock) expect(BADGES.some((b) => b.id === (c.unlock as { badge: string }).badge)).toBe(true);
    expect(COSMETICS.filter((c) => 'level' in c.unlock && (c.unlock as { level: number }).level === 1).length).toBeGreaterThanOrEqual(2); // something to wear from the start
  });
});

const mk = (seed = 1) => {
  const env = makeEnv({}, makeRng(seed));
  loadCurriculum(env.db);
  return env;
};

async function practice(env: TestEnv, s: Awaited<ReturnType<typeof makeStudent>>, n: number, right = true, ms = 4000) {
  env.db.prepare('UPDATE sessions SET expires_at = ?').run(env.clock.t + 30 * 86_400_000); // long jumps in time must not end the student's sign-in
  const start = await s.agent.post('/api/learn/session').set('x-csrf-token', s.csrf).send({ grade: 5, focus: 'G5.C2.3' }).expect(200);
  let step = start.body.step as { type: string; item?: { id: string } };
  const rewards: Record<string, unknown>[] = [];
  for (let i = 0; i < n && step.type === 'item'; i++) {
    const row = env.db.prepare('SELECT item_json FROM pending_item WHERE id = ?').get(step.item!.id) as { item_json: string };
    const item = JSON.parse(row.item_json) as Item;
    const given = right ? answerToGiven(item.answer) : { kind: 'number', text: '987654' };
    const res = await s.agent.post('/api/learn/answer').set('x-csrf-token', s.csrf).send({ itemId: step.item!.id, given, ms }).expect(200);
    rewards.push(res.body.reward);
    step = (await s.agent.post('/api/learn/next').set('x-csrf-token', s.csrf).send({ sessionId: start.body.sessionId }).expect(200)).body;
  }
  return rewards as { xp: number; totalXp: number; level: number; streak: number; newBadges: string[]; parts: { kind: string; xp: number }[] }[];
}

describe('rewards through the learning flow', () => {
  it('pays XP on the first answer, adds the daily start bonus once, and starts a streak and the first badge', async () => {
    const env = mk();
    const s = await makeStudent(env);
    const rs = await practice(env, s, 3);
    expect(rs[0]!.parts.map((p) => p.kind)).toEqual(['correct', 'daily-start']);
    expect(rs[0]!.newBadges).toContain('first-steps');
    expect(rs[1]!.parts.map((p) => p.kind)).toEqual(['correct']); // the daily bonus only once
    expect(rs[2]!.totalXp).toBeGreaterThan(rs[0]!.totalXp);
    expect(rs[2]!.streak).toBe(1);
    const sum = (await s.agent.get('/api/learn/rewards').expect(200)).body;
    expect(sum.xp).toBe(rs[2]!.totalXp);
    expect(sum.badges.find((b: { id: string }) => b.id === 'first-steps').earnedAt).not.toBeNull();
  });

  it('gives a small effort reward for a miss and never takes XP away', async () => {
    const env = mk(2);
    const s = await makeStudent(env);
    const before = await practice(env, s, 1);
    const wrong = await practice(env, s, 1, false);
    expect(wrong[0]!.parts.find((p) => p.kind === 'effort')!.xp).toBe(2);
    expect(wrong[0]!.totalXp).toBeGreaterThanOrEqual(before[0]!.totalXp);
  });

  it('grows the streak on consecutive days and lets it lapse', async () => {
    const env = mk(3);
    const s = await makeStudent(env);
    await practice(env, s, 1);
    env.clock.t += DAY;
    const next = await practice(env, s, 1);
    expect(next[0]!.streak).toBe(2);
    env.clock.t += 5 * DAY;
    expect((await s.agent.get('/api/learn/rewards').expect(200)).body.streak).toBe(0);
    const again = await practice(env, s, 1);
    expect(again[0]!.streak).toBe(1);
  });

  it('adds the daily-goal bonus once, when the minutes are practised', async () => {
    const env = mk(4);
    const s = await makeStudent(env);
    env.db.prepare('UPDATE students SET settings_json = ? WHERE id = ?').run(JSON.stringify({ dailyGoalMinutes: 1 }), s.studentId);
    const rs = await practice(env, s, 3, true, 40_000); // 40 s each: the minute is reached on the second answer
    const goalHits = rs.filter((r) => r.parts.some((p) => p.kind === 'daily-goal'));
    expect(goalHits).toHaveLength(1);
    expect(goalHits[0]!.parts.find((p) => p.kind === 'daily-goal')!.xp).toBe(25);
  });

  it('unlocks cosmetics with level and only lets a student equip what is unlocked', async () => {
    const env = mk(5);
    const s = await makeStudent(env);
    const sum = (await s.agent.get('/api/learn/rewards').expect(200)).body;
    expect(sum.cosmetics.find((c: { id: string }) => c.id === 'avatar-fox').unlocked).toBe(true);
    expect(sum.cosmetics.find((c: { id: string }) => c.id === 'avatar-dragon').unlocked).toBe(false);
    await s.agent.post('/api/learn/rewards/equip').set('x-csrf-token', s.csrf).send({ id: 'avatar-dragon' }).expect(403);
    await s.agent.post('/api/learn/rewards/equip').set('x-csrf-token', s.csrf).send({ id: 'nonsense' }).expect(400);
    await s.agent.post('/api/learn/rewards/equip').set('x-csrf-token', s.csrf).send({ id: 'avatar-panda' }).expect(200);
    expect((await s.agent.get('/api/learn/rewards/header').expect(200)).body.avatar).toBe('avatar-panda');
    env.db.prepare('UPDATE reward_state SET xp = 5000 WHERE student_id = ?').run(s.studentId);
    await s.agent.post('/api/learn/rewards/equip').set('x-csrf-token', s.csrf).send({ id: 'avatar-dragon' }).expect(200);
  });

  it('does not reward placement answers', () => {
    const env = mk(6);
    return makeStudent(env).then((s) => {
      const student = env.db.prepare('SELECT * FROM students WHERE id = ?').get(s.studentId) as Parameters<typeof onAnswered>[1];
      expect(onAnswered(env.ctx, student, { correct: true, tier: 2, hints: 0, kind: 'placement', masteredSkill: false, masteredExpectation: false, recovered: false })).toBeNull();
    });
  });

  it('resolves the daily goal and session limit: the student, then the owner caregiver, then the default', async () => {
    const env = mk(7);
    const s = await makeStudent(env);
    const student = (): Parameters<typeof effectiveSettings>[1] => env.db.prepare('SELECT * FROM students WHERE id = ?').get(s.studentId) as Parameters<typeof effectiveSettings>[1];
    expect(effectiveSettings(env.ctx, student())).toEqual({ dailyGoalMinutes: 15, sessionLimitMinutes: 0 });
    env.db.prepare("UPDATE users SET defaults_json = ? WHERE id = (SELECT caregiver_id FROM student_caregivers WHERE student_id = ? AND role = 'owner')").run(JSON.stringify({ dailyGoalMinutes: 20, sessionLimitMinutes: 45 }), s.studentId);
    expect(effectiveSettings(env.ctx, student())).toEqual({ dailyGoalMinutes: 20, sessionLimitMinutes: 45 });
    env.db.prepare('UPDATE students SET settings_json = ? WHERE id = ?').run(JSON.stringify({ dailyGoalMinutes: 5 }), s.studentId);
    expect(effectiveSettings(env.ctx, student())).toEqual({ dailyGoalMinutes: 5, sessionLimitMinutes: 45 });
  });

  it('uses the family time zone for the day boundary', () => {
    const t = Date.UTC(2026, 10, 21, 3, 30); // 22:30 on the 20th in Toronto
    expect(localDay(t, 'America/Toronto')).toBe('2026-11-20');
    expect(localDay(t, 'UTC')).toBe('2026-11-21');
    void summary;
  });
});

describe('caregiver goals and dashboard', () => {
  async function setup() {
    const env = mk(8);
    const s = await makeStudent(env);
    const caregiverEmail = (env.db.prepare("SELECT u.email FROM users u JOIN student_caregivers sc ON sc.caregiver_id = u.id WHERE sc.student_id = ? AND sc.role = 'owner'").get(s.studentId) as { email: string }).email;
    const cg = await signIn(env, caregiverEmail);
    return { env, s, cg };
  }
  const post = (cg: Awaited<ReturnType<typeof signIn>>, url: string, body: object = {}) => cg.agent.post(url).set('x-csrf-token', cg.csrf).send(body);

  it('sets a real-world goal, reaches it by earning XP, and lets the caregiver mark it redeemed once', async () => {
    const { env, s, cg } = await setup();
    const made = await post(cg, `/api/students/${s.studentId}/goals`, { title: 'Movie night', xpTarget: 50 }).expect(201);
    let goal = (await cg.agent.get(`/api/students/${s.studentId}/goals`).expect(200)).body.goals[0];
    expect(goal).toMatchObject({ title: 'Movie night', xpTarget: 50, progress: 0, reached: false });
    await post(cg, `/api/students/${s.studentId}/goals/${made.body.id}/redeem`).expect(409); // not yet reached
    const rs = await practice(env, s, 6);
    expect(rs.some((r) => (r as unknown as { goalsReached: string[] }).goalsReached.includes('Movie night'))).toBe(true);
    goal = (await cg.agent.get(`/api/students/${s.studentId}/goals`).expect(200)).body.goals[0];
    expect(goal).toMatchObject({ reached: true, progress: 50, redeemed: false });
    await post(cg, `/api/students/${s.studentId}/goals/${made.body.id}/redeem`).expect(200);
    await post(cg, `/api/students/${s.studentId}/goals/${made.body.id}/redeem`).expect(409);
    expect((await cg.agent.get(`/api/students/${s.studentId}/goals`).expect(200)).body.goals[0].redeemed).toBe(true);
    // the student sees the goal too
    expect((await s.agent.get('/api/learn/rewards').expect(200)).body.goals[0].title).toBe('Movie night');
  });

  it('only counts XP earned after the goal was set, validates input, and keeps strangers out', async () => {
    const { env, s, cg } = await setup();
    await practice(env, s, 4); // XP before the goal does not count
    const xpBefore = (await s.agent.get('/api/learn/rewards').expect(200)).body.xp as number;
    expect(xpBefore).toBeGreaterThan(0);
    await post(cg, `/api/students/${s.studentId}/goals`, { title: 'x', xpTarget: 500 }).expect(400);
    await post(cg, `/api/students/${s.studentId}/goals`, { title: 'Pizza', xpTarget: 10 }).expect(400);
    await post(cg, `/api/students/${s.studentId}/goals`, { title: 'Pizza night', xpTarget: 500 }).expect(201);
    expect((await cg.agent.get(`/api/students/${s.studentId}/goals`).expect(200)).body.goals[0].progress).toBe(0);
    addUser(env, 'stranger@x.ca');
    const other = await signIn(env, 'stranger@x.ca');
    await other.agent.get(`/api/students/${s.studentId}/goals`).expect(404);
    await other.agent.get(`/api/students/${s.studentId}/dashboard`).expect(404);
    await request(env.app).get(`/api/students/${s.studentId}/dashboard`).expect(401);
  });

  it('builds a dashboard with effort, accuracy, strands and where help would count', async () => {
    const { env, s, cg } = await setup();
    const good = await practice(env, s, 5);
    const bad = await practice(env, s, 3, false);
    const total = good.length + bad.length;
    const d = (await cg.agent.get(`/api/students/${s.studentId}/dashboard`).expect(200)).body;
    expect(d.student.displayName).toBeTruthy();
    expect(d.week.answered).toBe(total);
    expect(d.week.accuracy).toBe(Math.round((good.length / total) * 100));
    expect(d.days).toHaveLength(14);
    expect(d.days.at(-1).answered).toBe(total);
    expect(d.strands.find((x: { strand: string }) => x.strand === 'C')).toMatchObject({ attempts: total, correct: good.length });
    expect(d.level).toBeGreaterThanOrEqual(1);
    expect(d.recentBadges.length).toBeGreaterThan(0);
    expect(JSON.stringify(d)).not.toMatch(/pin|token|secret/i);
  });

  it('includes rewards in the data export and removes them with the student', async () => {
    const { env, s, cg } = await setup();
    await practice(env, s, 2);
    const ex = (await cg.agent.get(`/api/students/${s.studentId}/export`).expect(200)).body;
    expect(ex.rewards.state.xp).toBeGreaterThan(0);
    expect(ex.rewards.events.length).toBeGreaterThan(0);
    await cg.agent.delete(`/api/students/${s.studentId}`).set('x-csrf-token', cg.csrf).expect(200);
    for (const table of ['reward_state', 'reward_event', 'badge_earned', 'goal']) expect(env.db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE student_id = ?`).get(s.studentId)).toEqual({ n: 0 });
  });
});

describe('caregiver session limit', () => {
  it('suggests a break once a sitting passes the limit, and waits before the next sitting', async () => {
    const env = mk(9);
    const s = await makeStudent(env);
    env.db.prepare('UPDATE students SET settings_json = ? WHERE id = ?').run(JSON.stringify({ sessionLimitMinutes: 10 }), s.studentId);
    const start = await s.agent.post('/api/learn/session').set('x-csrf-token', s.csrf).send({ grade: 5, focus: 'G5.C2.3' }).expect(200);
    expect(start.body.step.type).toBe('item');
    env.clock.t += 11 * 60_000;
    env.db.prepare('UPDATE sessions SET expires_at = ?').run(env.clock.t + DAY);
    const row = env.db.prepare('SELECT item_json FROM pending_item WHERE id = ?').get(start.body.step.item.id) as { item_json: string };
    await s.agent.post('/api/learn/answer').set('x-csrf-token', s.csrf).send({ itemId: start.body.step.item.id, given: answerToGiven((JSON.parse(row.item_json) as Item).answer), ms: 3000 }).expect(200);
    const after = await s.agent.post('/api/learn/next').set('x-csrf-token', s.csrf).send({ sessionId: start.body.sessionId }).expect(200);
    expect(after.body).toMatchObject({ type: 'done', reason: 'limit' });
    await s.agent.post('/api/learn/session').set('x-csrf-token', s.csrf).send({ grade: 5, focus: 'G5.C2.3' }).expect(429);
    env.clock.t += 21 * 60_000;
    env.db.prepare('UPDATE sessions SET expires_at = ?').run(env.clock.t + DAY);
    await s.agent.post('/api/learn/session').set('x-csrf-token', s.csrf).send({ grade: 5, focus: 'G5.C2.3' }).expect(200);
  });

  it('does nothing when no limit is set', async () => {
    const env = mk(10);
    const s = await makeStudent(env);
    const start = await s.agent.post('/api/learn/session').set('x-csrf-token', s.csrf).send({ grade: 5, focus: 'G5.C2.3' }).expect(200);
    env.clock.t += 3 * 3_600_000;
    env.db.prepare('UPDATE sessions SET expires_at = ?').run(env.clock.t + DAY);
    const again = await s.agent.post('/api/learn/next').set('x-csrf-token', s.csrf).send({ sessionId: start.body.sessionId }).expect(200);
    expect(again.body.type).toBe('item');
  });
});
