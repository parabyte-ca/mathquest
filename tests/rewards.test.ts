import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { makeEnv, makeStudent, signIn, addUser, type TestEnv } from './helpers.js';
import { makeRng } from '../shared/rng.js';
import { answerToGiven } from '../shared/check.js';
import { loadCurriculum } from '../server/curriculum.js';
import { BADGES, CHALLENGE_GROUPS, COSMETICS, challengesForWeek, levelInfo, newBadgeIds, streakStep, streakToShow, xpForAnswer, xpToReach, type Stats, type StreakState } from '../shared/rewards.js';
import { localDay, onAnswered, summary, effectiveSettings, weekStart } from '../server/rewards/service.js';
import type { StudentRow } from '../server/context.js';
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

  it('adds the daily-goal bonus once, when the minutes are practiced', async () => {
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

  it('lets a student choose an avatar frame once it is unlocked, starting with none, and keeps it in the export', async () => {
    const env = mk(7);
    const s = await makeStudent(env);
    const equip = (id: string) => s.agent.post('/api/learn/rewards/equip').set('x-csrf-token', s.csrf).send({ id });
    const header = async () => (await s.agent.get('/api/learn/rewards/header').expect(200)).body;
    expect((await header()).frame).toBe('frame-none'); // nothing changes for anyone until they choose
    expect((await s.agent.get('/api/learn/rewards').expect(200)).body.frame).toBe('frame-none');
    await equip('frame-blue').expect(403); // level 2
    env.db.prepare('UPDATE reward_state SET xp = 400 WHERE student_id = ?').run(s.studentId);
    const level = (await s.agent.get('/api/learn/rewards').expect(200)).body.level as number;
    expect(level).toBeGreaterThanOrEqual(2);
    await equip('frame-blue').expect(200);
    expect((await header()).frame).toBe('frame-blue');
    expect((await header()).avatar).toBe('avatar-fox'); // choosing a frame does not change the avatar
    await equip('frame-rocket').expect(403); // needs the month-streak badge
    env.db.prepare("INSERT INTO badge_earned (student_id, badge_id, at) VALUES (?, 'streak-30', 1)").run(s.studentId);
    await equip('frame-rocket').expect(200);
    await equip('frame-none').expect(200);
    expect((await header()).frame).toBe('frame-none');
    const row = env.db.prepare('SELECT frame FROM reward_state WHERE student_id = ?').get(s.studentId) as { frame: string };
    expect(row.frame).toBe('frame-none');
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

describe('weekly challenges', () => {
  const TZ = 'America/Toronto';
  it('opens three challenges a week, one of each kind, the same for everyone, and a different set the next week', () => {
    const a = challengesForWeek('2026-11-23'), b = challengesForWeek('2026-11-30');
    expect(a).toHaveLength(3);
    expect(a.map((c) => CHALLENGE_GROUPS.findIndex((g) => g.includes(c)))).toEqual([0, 1, 2]);
    expect(challengesForWeek('2026-11-23').map((c) => c.id)).toEqual(a.map((c) => c.id));
    expect(b.map((c) => c.id)).not.toEqual(a.map((c) => c.id));
    const seen = new Set<string>();
    for (let w = 0; w < 60; w++) for (const c of challengesForWeek(new Date(Date.UTC(2026, 0, 5) + w * 7 * DAY).toISOString().slice(0, 10))) seen.add(c.id);
    expect(seen.size).toBe(CHALLENGE_GROUPS.flat().length); // every challenge comes round
    for (const c of CHALLENGE_GROUPS.flat()) { expect(c.target).toBeGreaterThan(0); expect(c.xp).toBeGreaterThan(0); for (const l of ['en', 'fr'] as const) { expect(c.name[l].length).toBeGreaterThan(0); expect(c.how[l].length).toBeGreaterThan(0); } }
  });

  it('finds the Monday of a week in the family time zone', () => {
    expect(weekStart(Date.UTC(2026, 10, 25, 15), TZ)).toBe('2026-11-23');
    expect(weekStart(Date.UTC(2026, 10, 23, 3), TZ)).toBe('2026-11-16'); // Sunday evening in Toronto
    expect(weekStart(Date.UTC(2026, 10, 29, 20), TZ)).toBe('2026-11-23'); // Sunday afternoon, still the same week
  });

  it('pays a challenge bonus once, when its target is reached within the week, and shows progress', async () => {
    const env = mk(3);
    const s = await makeStudent(env);
    const student = env.db.prepare('SELECT * FROM students WHERE id = ?').get(s.studentId) as StudentRow;
    // pick a Wednesday whose week has the "thirty questions" challenge open
    let monday = '2026-11-23';
    while (!challengesForWeek(monday).some((c) => c.id === 'answers-30')) monday = new Date(Date.parse(`${monday}T12:00:00Z`) + 7 * DAY).toISOString().slice(0, 10);
    env.clock.t = Date.parse(`${monday}T17:00:00Z`) + 2 * DAY; // Wednesday noon, Toronto
    const addAttempt = () => env.db.prepare("INSERT INTO attempt (student_id, skill_id, tier, kind, correct, hints, ms, at) VALUES (?,?,?,?,?,?,?,?)").run(s.studentId, 'MS.G5.C2.3.a', 1, 'practice', 1, 0, 5000, env.clock.t);
    const facts = { correct: true, tier: 1, hints: 0, kind: 'practice' as const, masteredSkill: false, masteredExpectation: false, recovered: false };
    for (let i = 0; i < 29; i++) { addAttempt(); onAnswered(env.ctx, student, facts); }
    const before = summary(env.ctx, student).challenges.find((c) => c.id === 'answers-30')!;
    expect(before).toMatchObject({ progress: 29, target: 30, done: false });
    addAttempt();
    const r = onAnswered(env.ctx, student, facts)!;
    expect(r.challengesDone).toContain('answers-30');
    expect(r.parts.find((p) => p.kind === 'challenge' && p.xp === 30)).toBeDefined();
    const done = summary(env.ctx, student).challenges.find((c) => c.id === 'answers-30')!;
    expect(done).toMatchObject({ progress: 30, done: true });
    addAttempt();
    const again = onAnswered(env.ctx, student, facts)!;
    expect(again.challengesDone).not.toContain('answers-30'); // paid once
    expect(again.parts.some((p) => p.kind === 'challenge' && p.xp === 30)).toBe(false);
    // next week starts afresh
    env.clock.t += 7 * DAY;
    expect(summary(env.ctx, student).challenges.every((c) => !c.done)).toBe(true);
  });
});

describe('family goals and certificates', () => {
  async function setup() {
    const env = mk(9);
    const s = await makeStudent(env);
    const email = (env.db.prepare("SELECT u.email FROM users u JOIN student_caregivers sc ON sc.caregiver_id = u.id WHERE sc.student_id = ? AND sc.role = 'owner'").get(s.studentId) as { email: string }).email;
    const cg = await signIn(env, email);
    const second = await cg.agent.post('/api/students').set('x-csrf-token', cg.csrf).send({ displayName: 'Sib', username: `sib_${Math.random().toString(36).slice(2, 7)}`, pin: '1234', grade: 6 }).expect(201);
    const rows = (id: string) => env.db.prepare('SELECT * FROM students WHERE id = ?').get(id) as StudentRow;
    return { env, s, cg, a: rows(s.studentId), b: rows(second.body.id as string) };
  }
  const post = (cg: Awaited<ReturnType<typeof signIn>>, url: string, body: object = {}) => cg.agent.post(url).set('x-csrf-token', cg.csrf).send(body);
  const facts = { correct: true, tier: 2, hints: 0, kind: 'practice' as const, masteredSkill: false, masteredExpectation: false, recovered: false };

  it('adds up the XP of all of a caregiver\'s students toward one goal, reaches it once, and lets the caregiver mark it done', async () => {
    const { env, s, cg, a, b } = await setup();
    const made = await post(cg, '/api/me/family-goals', { title: 'Movie night for everyone', xpTarget: 100 }).expect(201);
    let goal = (await cg.agent.get('/api/me/family-goals').expect(200)).body.goals[0];
    expect(goal).toMatchObject({ title: 'Movie night for everyone', xpTarget: 100, progress: 0, reached: false });
    await post(cg, `/api/me/family-goals/${made.body.id}/redeem`).expect(409);
    onAnswered(env.ctx, a, facts); // 15 XP plus the daily start bonus
    goal = (await cg.agent.get('/api/me/family-goals').expect(200)).body.goals[0];
    expect(goal.progress).toBeGreaterThan(0);
    expect(goal.reached).toBe(false);
    let reachedBy = '';
    for (let i = 0; i < 12 && !reachedBy; i++) {
      const who = i % 2 ? a : b;
      if (onAnswered(env.ctx, who, facts)!.teamGoalsReached.includes('Movie night for everyone')) reachedBy = who.display_name;
    }
    expect(reachedBy).not.toBe('');
    goal = (await cg.agent.get('/api/me/family-goals').expect(200)).body.goals[0];
    expect(goal).toMatchObject({ reached: true, progress: 100 });
    expect(onAnswered(env.ctx, a, facts)!.teamGoalsReached).toEqual([]); // reached once
    expect((await s.agent.get('/api/learn/rewards').expect(200)).body.teamGoals[0]).toMatchObject({ title: 'Movie night for everyone', reached: true });
    await post(cg, `/api/me/family-goals/${made.body.id}/redeem`).expect(200);
    await post(cg, `/api/me/family-goals/${made.body.id}/redeem`).expect(409);
    expect((await s.agent.get('/api/learn/rewards').expect(200)).body.teamGoals).toEqual([]); // done goals leave the student's page
  });

  it('validates family goals, allows at most three open ones, and keeps other caregivers out', async () => {
    const { env, cg } = await setup();
    await post(cg, '/api/me/family-goals', { title: 'x', xpTarget: 500 }).expect(400);
    await post(cg, '/api/me/family-goals', { title: 'Pizza night', xpTarget: 20 }).expect(400);
    const ids: string[] = [];
    for (const t of ['One', 'Two', 'Three']) ids.push((await post(cg, '/api/me/family-goals', { title: `Goal ${t}`, xpTarget: 500 }).expect(201)).body.id as string);
    await post(cg, '/api/me/family-goals', { title: 'Goal Four', xpTarget: 500 }).expect(409);
    await cg.agent.delete(`/api/me/family-goals/${ids[0]}`).set('x-csrf-token', cg.csrf).expect(200);
    await post(cg, '/api/me/family-goals', { title: 'Goal Four', xpTarget: 500 }).expect(201);
    addUser(env, 'stranger2@x.ca');
    const other = await signIn(env, 'stranger2@x.ca');
    expect((await other.agent.get('/api/me/family-goals').expect(200)).body.goals).toEqual([]);
    await other.agent.delete(`/api/me/family-goals/${ids[1]}`).set('x-csrf-token', other.csrf).expect(404);
    await post(other, `/api/me/family-goals/${ids[1]}/redeem`).expect(404);
    await request(env.app).get('/api/me/family-goals').expect(401);
  });

  it('prints a certificate only for something that was really earned, and only for the family\'s caregivers', async () => {
    const { env, s, cg, a, b } = await setup();
    const cert = (q: string, who = cg) => who.agent.get(`/api/students/${a.id}/certificate?${q}`);
    await cert('kind=badge&ref=century').expect(404); // not earned
    await cert('kind=goal&ref=nope').expect(404);
    await cert('kind=teapot').expect(400);
    env.db.prepare("INSERT INTO attempt (student_id, skill_id, tier, kind, correct, hints, ms, at) VALUES (?,?,?,?,?,?,?,?)").run(a.id, 'MS.G5.C2.3.a', 1, 'practice', 1, 0, 5000, env.clock.t); // the badge counts real answers
    onAnswered(env.ctx, a, facts);
    const badge = (await cert('kind=badge&ref=first-steps').expect(200)).body;
    expect(badge.student).toMatchObject({ displayName: 'Kid', grade: 5 });
    expect(badge.heading.en).toBe('Badge earned');
    expect(badge.detail.fr).toContain('Premiers pas');
    expect(badge.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const lvl = (await cert('kind=level').expect(200)).body;
    expect(lvl.detail.en).toMatch(/^Level \d+ with \d+ XP$/);
    const g = await post(cg, `/api/students/${a.id}/goals`, { title: 'Ice cream trip', xpTarget: 50 }).expect(201);
    await cert(`kind=goal&ref=${g.body.id}`).expect(404); // not reached yet
    for (let i = 0; i < 6; i++) onAnswered(env.ctx, a, facts);
    expect((await cert(`kind=goal&ref=${g.body.id}`).expect(200)).body.detail.en).toBe('Ice cream trip');
    const fg = await post(cg, '/api/me/family-goals', { title: 'Beach day', xpTarget: 100 }).expect(201);
    await cert(`kind=family&ref=${fg.body.id}`).expect(404);
    for (let i = 0; i < 8; i++) onAnswered(env.ctx, b, facts);
    expect((await cert(`kind=family&ref=${fg.body.id}`).expect(200)).body.heading.en).toBe('Family goal reached');
    addUser(env, 'stranger3@x.ca');
    const other = await signIn(env, 'stranger3@x.ca');
    await cert('kind=level', other).expect(404);
    await request(env.app).get(`/api/students/${a.id}/certificate?kind=level`).expect(401);
    void s;
  });
});

describe('caregiver notes and messages', () => {
  async function setup() {
    const env = mk(8);
    const s = await makeStudent(env);
    const email = (env.db.prepare("SELECT u.email FROM users u JOIN student_caregivers sc ON sc.caregiver_id = u.id WHERE sc.student_id = ? AND sc.role = 'owner'").get(s.studentId) as { email: string }).email;
    const cg = await signIn(env, email);
    return { env, s, cg };
  }
  const send = (cg: Awaited<ReturnType<typeof signIn>>, method: 'post' | 'patch', url: string, body: object = {}) => cg.agent[method](url).set('x-csrf-token', cg.csrf).send(body);

  it('shows a goal note to the student, lets the caregiver edit or clear it, and rejects a note that is too long', async () => {
    const { s, cg } = await setup();
    const made = await send(cg, 'post', `/api/students/${s.studentId}/goals`, { title: 'Pizza night', xpTarget: 500, note: "Pizza from Mario's on Friday" }).expect(201);
    expect((await s.agent.get('/api/learn/rewards').expect(200)).body.goals[0].note).toBe("Pizza from Mario's on Friday");
    await send(cg, 'patch', `/api/students/${s.studentId}/goals/${made.body.id}`, { note: 'Saturday instead' }).expect(200);
    expect((await cg.agent.get(`/api/students/${s.studentId}/goals`).expect(200)).body.goals[0].note).toBe('Saturday instead');
    await send(cg, 'patch', `/api/students/${s.studentId}/goals/${made.body.id}`, { note: '' }).expect(200);
    expect((await s.agent.get('/api/learn/rewards').expect(200)).body.goals[0].note).toBe('');
    await send(cg, 'patch', `/api/students/${s.studentId}/goals/${made.body.id}`, { note: 'x'.repeat(161) }).expect(400);
    await send(cg, 'patch', `/api/students/${s.studentId}/goals/nope`, { note: 'hi' }).expect(404);
  });

  it('delivers a message to the student until they dismiss it, and the caregiver sees it was read', async () => {
    const { s, cg } = await setup();
    await send(cg, 'post', `/api/students/${s.studentId}/messages`, { body: 'Proud of your streak!' }).expect(201);
    let unread = (await s.agent.get('/api/learn/messages').expect(200)).body.messages;
    expect(unread).toHaveLength(1);
    expect(unread[0].body).toBe('Proud of your streak!');
    expect((await cg.agent.get(`/api/students/${s.studentId}/messages`).expect(200)).body.messages[0].read).toBe(false);
    await s.agent.post(`/api/learn/messages/${unread[0].id}/read`).set('x-csrf-token', s.csrf).send({}).expect(200);
    unread = (await s.agent.get('/api/learn/messages').expect(200)).body.messages;
    expect(unread).toHaveLength(0);
    expect((await cg.agent.get(`/api/students/${s.studentId}/messages`).expect(200)).body.messages[0].read).toBe(true);
  });

  it('limits messages to five a day, rejects empty or long ones, and keeps them private to the right people', async () => {
    const { env, s, cg } = await setup();
    await send(cg, 'post', `/api/students/${s.studentId}/messages`, { body: '   ' }).expect(400);
    await send(cg, 'post', `/api/students/${s.studentId}/messages`, { body: 'x'.repeat(201) }).expect(400);
    for (let i = 0; i < 5; i++) await send(cg, 'post', `/api/students/${s.studentId}/messages`, { body: `Hello ${i}` }).expect(201);
    await send(cg, 'post', `/api/students/${s.studentId}/messages`, { body: 'One too many' }).expect(429);
    // another caregiver cannot read or send; another student cannot dismiss someone else's message
    const other = await makeStudent(env);
    await other.cg.agent.get(`/api/students/${s.studentId}/messages`).expect(404);
    await send(other.cg, 'post', `/api/students/${s.studentId}/messages`, { body: 'hi' }).expect(404);
    const mine = (await s.agent.get('/api/learn/messages').expect(200)).body.messages[0].id as string;
    await other.agent.post(`/api/learn/messages/${mine}/read`).set('x-csrf-token', other.csrf).send({}).expect(404);
    expect((await s.agent.get('/api/learn/messages').expect(200)).body.messages).toHaveLength(3); // the newest three
  });

  it('shows message text as plain text only (the page never renders it as HTML)', async () => {
    const { s, cg } = await setup();
    await send(cg, 'post', `/api/students/${s.studentId}/messages`, { body: '<img src=x onerror=alert(1)>' }).expect(201);
    const body = (await s.agent.get('/api/learn/messages').expect(200)).body.messages[0].body;
    expect(body).toBe('<img src=x onerror=alert(1)>');
    const src = (await import('node:fs')).readFileSync('web/src/pages/LearnHome.tsx', 'utf8');
    expect(src).not.toMatch(/dangerouslySetInnerHTML/);
  });
});
