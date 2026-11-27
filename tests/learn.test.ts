import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { makeEnv, makeStudent, type TestEnv } from './helpers.js';
import { makeRng } from '../shared/rng.js';
import type { Item, Given } from '../shared/items/types.js';
import { answerToGiven } from '../shared/check.js';
import { loadCurriculum } from '../server/curriculum.js';

type Agent = ReturnType<typeof request.agent>;
interface S { agent: Agent; csrf: string; studentId: string }

const env0 = (seed = 1) => {
  const env = makeEnv({}, makeRng(seed));
  loadCurriculum(env.db);
  return env;
};

const post = (s: S, path: string, body: unknown) => s.agent.post(`/api/learn${path}`).set('x-csrf-token', s.csrf).send(body as object);
const pendingFor = (env: TestEnv, id: string): Item => JSON.parse((env.db.prepare('SELECT item_json FROM pending_item WHERE id = ?').get(id) as { item_json: string }).item_json) as Item;

/** A response that is certainly wrong for the item. */
function wrongGiven(item: Item): Given {
  const a = item.answer;
  switch (a.kind) {
    case 'point': return { kind: 'point', x: -50, y: -50 };
    case 'choice': return { kind: 'choice', index: (a.index + 1) % item.options!.length };
    case 'multi': return { kind: 'multi', indices: [] };
    case 'order': return { kind: 'order', order: [...a.order].reverse() };
    case 'match': return { kind: 'match', pairs: [] };
    case 'fraction': return { kind: 'fraction', n: '999', d: '1' };
    case 'mixed': return { kind: 'mixed', whole: '99', n: '1', d: '2' };
    case 'expression': return { kind: 'expression', text: 'x+999' };
    default: return { kind: 'number', text: '123456' };
  }
}

async function start(s: S, body: object = { grade: 5, strands: ['B'] }) {
  const res = await post(s, '/session', body).expect(200);
  return res.body as { sessionId: string; step: { type: string; item?: { id: string; format: string }; kind?: string; target?: string; lessonId?: string } };
}

async function answerItem(env: TestEnv, s: S, itemId: string, right: boolean, ms = 5000) {
  const item = pendingFor(env, itemId);
  const given = right ? answerToGiven(item.answer) : wrongGiven(item);
  const res = await post(s, '/answer', { itemId, given, ms }).expect(200);
  return { item, body: res.body as { correct: boolean; event: string; pKnown: number; feedback: Record<string, { en: string }>; skill: string; masteredSkill: boolean } };
}

describe('options and sessions', () => {
  it('lists grades and strands with what has content', async () => {
    const env = env0();
    const s = await makeStudent(env);
    const res = await s.agent.get('/api/learn/options').expect(200);
    const g5 = res.body.grades.find((g: { grade: number }) => g.grade === 5);
    const strands = Object.fromEntries(g5.groups[0].strands.map((x: { strand: string; available: boolean }) => [x.strand, x.available]));
    expect(strands.B).toBe(true);
    expect(strands.E).toBe(true);
    expect(strands.C).toBe(true);
    expect(strands.D).toBe(true);
    expect(strands.F).toBe(true);
    const g6 = res.body.grades.find((g: { grade: number }) => g.grade === 6);
    const s6 = Object.fromEntries(g6.groups[0].strands.map((x: { strand: string; available: boolean }) => [x.strand, x.available]));
    expect(['B', 'C', 'D', 'E', 'F'].every((k) => s6[k])).toBe(true); // no Grade 6 strand is "coming soon"
    const g7 = res.body.grades.find((g: { grade: number }) => g.grade === 7);
    const s7 = Object.fromEntries(g7.groups[0].strands.map((x: { strand: string; available: boolean }) => [x.strand, x.available]));
    expect(['B', 'C', 'D', 'E', 'F'].every((k) => s7[k])).toBe(true); // Grade 7 strands B to F have content from 2.5.1
    const g8 = res.body.grades.find((g: { grade: number }) => g.grade === 8);
    const s8 = Object.fromEntries(g8.groups[0].strands.map((x: { strand: string; available: boolean }) => [x.strand, x.available]));
        expect(['B', 'C', 'D', 'E', 'F'].every((k) => s8[k])).toBe(true); // every Grade 8 strand has content from 2.7.2
    const g9 = res.body.grades.find((g: { grade: number }) => g.grade === 9);
    const s9 = Object.fromEntries(g9.groups[0].strands.map((x: { strand: string; available: boolean }) => [x.strand, x.available]));
    expect(['B', 'C', 'D', 'E', 'F'].every((k) => s9[k])).toBe(true); // every Grade 9 strand has content from 2.17.0
    expect(res.body.grades.map((g: { grade: number }) => g.grade)).toEqual([5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('practices one expectation only when asked to focus on it', async () => {
    const env = env0();
    const s = await makeStudent(env);
    const { step } = await start(s, { grade: 5, focus: 'G5.C2.3' });
    expect(step.item!.id.startsWith('MS.G5.C2.3.a:')).toBe(true);
    await post(s, '/session', { grade: 5, focus: 'not a code' }).expect(400);
  });

  it('serves an item without any answer data', async () => {
    const env = env0();
    const s = await makeStudent(env);
    const { step } = await start(s);
    expect(step.type).toBe('item');
    const txt = JSON.stringify(step);
    for (const leak of ['"answer"', '"hints"', '"steps"', '"wrong"', 'misconception']) expect(txt).not.toContain(leak);
  });

  it('resumes the same unanswered item after a reload', async () => {
    const env = env0();
    const s = await makeStudent(env);
    const first = await start(s);
    const again = await post(s, '/next', { sessionId: first.sessionId }).expect(200);
    expect(again.body.item.id).toBe(first.step.item!.id);
    expect(again.body.resumed).toBe(true);
  });

  it('offers a similar question with a new item for the same skill', async () => {
    const env = env0();
    const s = await makeStudent(env);
    const first = await start(s);
    const skill = first.step.item!.id.split(':').slice(0, 1)[0];
    await answerItem(env, s, first.step.item!.id, false);
    const sim = await post(s, '/next', { sessionId: first.sessionId, similar: true }).expect(200);
    expect(sim.body.item.id).not.toBe(first.step.item!.id);
    expect(sim.body.item.id.split(':')[0]).toBe(skill);
  });

  it('respects the grades a caregiver allows', async () => {
    const env = env0();
    const s = await makeStudent(env, { grade: 5, allowed: { grades: [5], courses: [] } });
    await post(s, '/session', { grade: 6 }).expect(403);
    await post(s, '/session', { grade: 5, strands: ['B'] }).expect(200);
    const opts = await s.agent.get('/api/learn/options').expect(200);
    expect(opts.body.grades.map((g: { grade: number }) => g.grade)).toEqual([5]);
  });

  it('says there is no content for grades that have none yet', async () => {
    const env = env0();
    const s = await makeStudent(env);
    await post(s, '/session', { grade: 9 }).expect(404);
  });
});

describe('answers, feedback and hints', () => {
  it('grades a correct answer, updates mastery and records the attempt', async () => {
    const env = env0();
    const s = await makeStudent(env);
    const { step } = await start(s);
    const { item, body } = await answerItem(env, s, step.item!.id, true);
    expect(body.correct).toBe(true);
    expect(body.feedback.message!.en).toMatch(/./);
    expect(body.pKnown).toBeGreaterThan(0.25);
    const row = env.db.prepare('SELECT attempts, correct FROM mastery WHERE student_id = ? AND skill_id = ?').get(s.studentId, item.skill);
    expect(row).toEqual({ attempts: 1, correct: 1 });
    expect(env.db.prepare('SELECT COUNT(*) AS n FROM attempt WHERE student_id = ?').get(s.studentId)).toEqual({ n: 1 });
  });

  it('answers a miss kindly, naming the misconception, the step and the correct answer', async () => {
    const env = env0();
    const s = await makeStudent(env);
    let seen = false;
    const { sessionId, step: first } = await start(s);
    let id = first.item!.id;
    for (let i = 0; i < 40 && !seen; i++) {
      const item = pendingFor(env, id);
      const w = item.wrong[0];
      if (w) {
        const res = await post(s, '/answer', { itemId: id, given: answerToGiven(w.answer), ms: 3000 }).expect(200);
        expect(res.body.correct).toBe(false);
        expect(res.body.feedback.why.en).toBe(w.why.en);
        expect(res.body.feedback.step.en).toBe(item.steps[Math.max(0, w.stepIndex)]!.en);
        expect(res.body.feedback.correctAnswer.en).toBeTruthy();
        expect(res.body.feedback.offerSimilar.en).toMatch(/similar/);
        expect(JSON.stringify(res.body.feedback)).not.toMatch(/Wrong|Incorrect|Failed/i);
        seen = true;
      } else {
        await answerItem(env, s, id, true);
        const n = await post(s, '/next', { sessionId }).expect(200);
        if (n.body.type !== 'item') break;
        id = n.body.item.id;
      }
    }
    expect(seen).toBe(true);
  });

  it('falls back to a generic encouraging message for an unmapped wrong answer', async () => {
    const env = env0();
    const s = await makeStudent(env);
    const { step } = await start(s);
    const { body } = await answerItem(env, s, step.item!.id, false);
    expect(body.correct).toBe(false);
    expect(body.feedback.message!.en).toMatch(/./);
    expect(body.feedback.why!.en).toMatch(/./);
  });

  it('gives a three-rung hint ladder and credits a hinted answer less', async () => {
    const env = env0(5);
    const hinted = await makeStudent(env);
    const clean = await makeStudent(env);
    const a = await start(hinted);
    const b = await start(clean);
    // make both items the same skill/tier/seed so the comparison is fair
    const itemA = pendingFor(env, a.step.item!.id);
    env.db.prepare('UPDATE pending_item SET item_json = ? WHERE id = ?').run(JSON.stringify(itemA), b.step.item!.id);
    env.db.prepare('DELETE FROM mastery').run();
    const levels: number[] = [];
    for (let i = 0; i < 4; i++) levels.push((await post(hinted, '/hint', { itemId: a.step.item!.id }).expect(200)).body.level);
    expect(levels).toEqual([1, 2, 3, 3]);
    const ha = await post(hinted, '/answer', { itemId: a.step.item!.id, given: answerToGiven(itemA.answer), ms: 5000 }).expect(200);
    const hb = await post(clean, '/answer', { itemId: b.step.item!.id, given: answerToGiven(itemA.answer), ms: 5000 }).expect(200);
    expect(ha.body.correct).toBe(true);
    expect(hb.body.correct).toBe(true);
    expect(ha.body.pKnown).toBeLessThan(hb.body.pKnown); // hints reduce credit a little but never block progress
    expect(ha.body.feedback.usedHints).toBe(3);
  });

  it('reads the right hint text in order', async () => {
    const env = env0();
    const s = await makeStudent(env);
    const { step } = await start(s);
    const item = pendingFor(env, step.item!.id);
    for (let i = 0; i < 3; i++) {
      const h = await post(s, '/hint', { itemId: step.item!.id }).expect(200);
      expect(h.body.text.en).toBe(item.hints[i]!.en);
    }
  });

  it('rejects malformed answers and other students\' items', async () => {
    const env = env0();
    const s = await makeStudent(env);
    const other = await makeStudent(env);
    const { step } = await start(s);
    await post(s, '/answer', { itemId: step.item!.id, given: { kind: 'number', text: 'x'.repeat(500) } }).expect(400);
    await post(s, '/answer', { itemId: step.item!.id, given: { kind: 'bogus' } }).expect(400);
    await post(s, '/answer', { itemId: step.item!.id, given: 'rm -rf' }).expect(400);
    await post(other, '/answer', { itemId: step.item!.id, given: { kind: 'number', text: '1' } }).expect(404);
    await post(other, '/hint', { itemId: step.item!.id }).expect(404);
    await post(s, '/answer', { itemId: 'nope-nope-nope', given: { kind: 'number', text: '1' } }).expect(404);
    // the item is still answerable by its owner after the failed attempts
    await post(s, '/answer', { itemId: step.item!.id, given: { kind: 'number', text: '1' } }).expect(200);
    await post(s, '/answer', { itemId: step.item!.id, given: { kind: 'number', text: '1' } }).expect(404); // one answer per item
  });

  it('is closed to caregivers and anonymous visitors, and needs the CSRF header', async () => {
    const env = env0();
    const s = await makeStudent(env);
    await request(env.app).get('/api/learn/options').expect(401);
    await s.cg.agent.get('/api/learn/options').expect(401);
    await s.agent.post('/api/learn/session').send({ grade: 5 }).expect(403);
  });
});

describe('struggle and recover', () => {
  /** Expectation G5.E1.4 has one micro-skill, which makes the ladder deterministic to walk. */
  async function walk(env: TestEnv, s: S, sessionId: string, firstItemId: string, plan: ('right' | 'wrong')[]) {
    const events: string[] = [];
    const tiers: number[] = [];
    let step: { type: string; item?: { id: string; tier: number }; lessonId?: string; target?: string } = { type: 'item', item: { id: firstItemId, tier: 0 } };
    for (const move of plan) {
      if (step.type === 'lesson') {
        await post(s, '/lesson-done', { target: step.target }).expect(200);
        events.push('lesson-read');
        step = (await post(s, '/next', { sessionId }).expect(200)).body;
      }
      if (step.type !== 'item') break;
      const { item, body } = await answerItem(env, s, step.item!.id, move === 'right');
      tiers.push(item.tier);
      events.push(body.event);
      step = (await post(s, '/next', { sessionId }).expect(200)).body;
    }
    return { events, tiers, step };
  }

  it('steps down one tier, breaks the skill into micro-skills, inserts a lesson, then builds back up', async () => {
    const env = env0(3);
    const s = await makeStudent(env);
    // a student who knows the skill well starts at the top tier
    env.db.prepare('INSERT INTO mastery (student_id, skill_id, p_known, tier, attempts, correct) VALUES (?,?,?,?,?,?)').run(s.studentId, 'MS.G5.E1.4.a', 0.8, 3, 6, 6);
    const { sessionId, step } = await start(s, { grade: 5, focus: 'G5.E1.4' });
    expect(step.item!.id.startsWith('MS.G5.E1.4.a:3:')).toBe(true); // tier 3
    const plan: ('right' | 'wrong')[] = ['wrong', 'wrong', 'wrong', 'wrong', 'wrong', 'wrong', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right'];
    const r = await walk(env, s, sessionId, step.item!.id, plan);
    expect(r.events).toContain('stepdown');
    expect(r.events).toContain('micro');
    expect(r.events).toContain('lesson');
    expect(r.events).toContain('lesson-read');
    expect(r.events).toContain('buildup');
    // never jumps more than one tier at a time while serving the combined skill
    for (let i = 1; i < r.tiers.length; i++) expect(Math.abs(r.tiers[i]! - r.tiers[i - 1]!)).toBeLessThanOrEqual(1);
    expect(r.events.indexOf('stepdown')).toBeLessThan(r.events.indexOf('micro'));
    expect(r.events.indexOf('micro')).toBeLessThan(r.events.indexOf('lesson'));
    expect(r.events.indexOf('lesson')).toBeLessThan(r.events.indexOf('buildup'));
  });

  it('builds back up from micro-skill to combined skill to the original tier, one tier at a time', async () => {
    const env = env0(8);
    const s = await makeStudent(env);
    // G5.B2.5 has three micro-skills, so a handful of right answers cannot master it and end the session early
    for (const m of ['MS.G5.B2.5.a', 'MS.G5.B2.5.b', 'MS.G5.B2.5.c']) env.db.prepare('INSERT INTO mastery (student_id, skill_id, p_known, tier, attempts, correct) VALUES (?,?,?,?,?,?)').run(s.studentId, m, 0.05, 1, 6, 1);
    const ladder = { phase: 'buildup', skill: 'G5.B2.5', tier: 1, originalTier: 3, maxTier: 3, history: [], streak: 0, microQueue: [], microIdx: 0, microStreak: 0, microMisses: 0, lessonShown: true, lessonFor: null, episodes: 1, needsHelp: false };
    env.db.prepare('INSERT INTO ladder_state (student_id, target, state_json, updated_at) VALUES (?,?,?,?)').run(s.studentId, 'G5.B2.5', JSON.stringify(ladder), env.clock.t);
    const { sessionId, step } = await start(s, { grade: 5, strands: ['B'] });
    expect(step.target).toBe('G5.B2.5'); // remediation in progress comes first
    const r = await walk(env, s, sessionId, step.item!.id, ['right', 'right', 'right', 'right', 'right', 'right']);
    expect(r.tiers).toEqual([1, 1, 2, 2, 3, 3]);
    expect(r.events.filter((e) => e === 'advance')).toHaveLength(2);
    expect(r.events.at(-1)).toBe('recovered');
  });

  it('serves the inserted lesson for the stuck skill and then continues', async () => {
    const env = env0(4);
    const s = await makeStudent(env);
    const { sessionId, step } = await start(s, { grade: 5, focus: 'G5.E1.4' }); // fresh student: tier 1, so straight to micro-skills
    const r = await walk(env, s, sessionId, step.item!.id, ['wrong', 'wrong', 'wrong', 'wrong']);
    expect(r.step.type).toBe('lesson');
    expect(r.step.lessonId).toBe('L.coordinates.plot');
    await post(s, '/lesson-done', { target: r.step.target }).expect(200);
    const after = await post(s, '/next', { sessionId }).expect(200);
    expect(after.body.type).toBe('item');
  });

  it('flags the ladder for the caregiver when the student stays stuck after the lesson', async () => {
    const env = env0(6);
    const s = await makeStudent(env);
    const { sessionId, step } = await start(s, { grade: 5, focus: 'G5.E1.4' });
    const r = await walk(env, s, sessionId, step.item!.id, ['wrong', 'wrong', 'wrong', 'wrong', 'wrong', 'wrong', 'wrong']);
    expect(r.events).toContain('help');
    const ladder = JSON.parse((env.db.prepare('SELECT state_json FROM ladder_state WHERE student_id = ?').get(s.studentId) as { state_json: string }).state_json);
    expect(ladder.needsHelp).toBe(true);
  });
});

describe('mastery, spaced review and placement', () => {
  it('moves a skill to mastered and schedules its first review', async () => {
    const env = env0(2);
    const s = await makeStudent(env);
    env.db.prepare('INSERT INTO mastery (student_id, skill_id, p_known, tier, attempts, correct) VALUES (?,?,?,?,?,?)').run(s.studentId, 'MS.G5.E1.4.a', 0.94, 3, 8, 8);
    const { sessionId, step } = await start(s, { grade: 5, focus: 'G5.E1.4' });
    let id = step.item!.id;
    let mastered = false;
    for (let i = 0; i < 6 && !mastered; i++) {
      const { body } = await answerItem(env, s, id, true);
      mastered = body.masteredSkill;
      if (!mastered) id = (await post(s, '/next', { sessionId }).expect(200)).body.item?.id;
    }
    expect(mastered).toBe(true);
    const row = env.db.prepare('SELECT next_review_at, review_step FROM mastery WHERE student_id = ? AND skill_id = ?').get(s.studentId, 'MS.G5.E1.4.a') as { next_review_at: number; review_step: number };
    expect(row.next_review_at).toBeGreaterThan(env.clock.t);
    expect(row.review_step).toBe(0);
    const done = await post(s, '/next', { sessionId }).expect(200);
    expect(done.body.type).toBe('done');
    expect(done.body.summary.masteredExpectations).toContain('G5.E1.4');
  });

  it('brings a due review back, and a slip sends the skill back to practice', async () => {
    const env = env0(1);
    const s = await makeStudent(env);
    env.db.prepare('INSERT INTO mastery (student_id, skill_id, p_known, tier, attempts, correct, next_review_at, review_step) VALUES (?,?,?,?,?,?,?,?)').run(s.studentId, 'MS.G5.E1.4.a', 0.97, 3, 9, 9, env.clock.t - 1000, 1);
    const { step } = await start(s, { grade: 5, focus: 'G5.E1.4' });
    expect(step.kind).toBe('review');
    const { body } = await answerItem(env, s, step.item!.id, false);
    expect(body.correct).toBe(false);
    const row = env.db.prepare('SELECT p_known, next_review_at, review_step FROM mastery WHERE student_id = ? AND skill_id = ?').get(s.studentId, 'MS.G5.E1.4.a') as { p_known: number; next_review_at: number | null; review_step: number };
    expect(row.p_known).toBeLessThanOrEqual(0.6);
    expect(row.next_review_at).toBeNull();
    expect(row.review_step).toBe(0);
  });

  it('grows the review interval after a correct review', async () => {
    const env = env0(1);
    const s = await makeStudent(env);
    env.db.prepare('INSERT INTO mastery (student_id, skill_id, p_known, tier, attempts, correct, next_review_at, review_step) VALUES (?,?,?,?,?,?,?,?)').run(s.studentId, 'MS.G5.E1.4.a', 0.97, 3, 9, 9, env.clock.t - 1000, 0);
    const { step } = await start(s, { grade: 5, focus: 'G5.E1.4' });
    expect(step.kind).toBe('review');
    await answerItem(env, s, step.item!.id, true);
    const row = env.db.prepare('SELECT next_review_at, review_step FROM mastery WHERE student_id = ? AND skill_id = ?').get(s.studentId, 'MS.G5.E1.4.a') as { next_review_at: number; review_step: number };
    expect(row.review_step).toBe(1);
    expect(row.next_review_at - env.clock.t).toBe(3 * 86_400_000);
  });

  it('places a strong student high and a struggling student low, in at most eight questions', async () => {
    for (const right of [true, false]) {
      const env = env0(7);
      const s = await makeStudent(env);
      let res = (await post(s, '/placement/start', { grade: 5 }).expect(200)).body as { item: { id: string } };
      let id = res.item.id;
      let count = 0;
      let result: { startingIndex: number; ladder: string[]; startingSkill: string } | undefined;
      for (; count < 12; count++) {
        const { body } = await answerItem(env, s, id, right) as unknown as { body: { placement: { done: boolean; next?: { id: string }; result?: typeof result } } };
        if (body.placement.done) { result = body.placement.result; count++; break; }
        id = body.placement.next!.id;
      }
      expect(count).toBeLessThanOrEqual(8);
      expect(result).toBeDefined();
      if (right) {
        expect(result!.startingIndex).toBeGreaterThanOrEqual(result!.ladder.length - 2);
        const p = env.db.prepare('SELECT p_known FROM mastery WHERE student_id = ? AND skill_id = ?').get(s.studentId, result!.ladder[0]) as { p_known: number };
        expect(p.p_known).toBeGreaterThanOrEqual(0.85);
      } else {
        expect(result!.startingIndex).toBeLessThanOrEqual(1);
      }
      expect(env.db.prepare("SELECT COUNT(*) AS n FROM attempt WHERE kind = 'placement'").get()).toEqual({ n: count });
    }
  });
});

describe('quick checks by strand', () => {
  /** Runs a whole check, answering every probe right or wrong, and returns what the server said at the end. */
  async function runCheck(env: TestEnv, s: S, body: object, right: boolean) {
    const started = (await post(s, '/placement/start', body).expect(200)).body as { item: { id: string }; ladderSize: number };
    let id = started.item.id;
    for (let count = 1; count <= 8; count++) {
      const { body: res } = await answerItem(env, s, id, right) as unknown as { body: { placement: { done: boolean; next?: { id: string }; result?: { startingIndex: number; ladder: string[]; startingSkill: string } } } };
      if (res.placement.done) return { count, result: res.placement.result!, ladderSize: started.ladderSize };
      id = res.placement.next!.id;
    }
    throw new Error('the check did not finish in eight questions');
  }

  it('checks one strand within eight questions, with that strand\'s skills only, for every grade and strand', async () => {
    const env = env0(3);
    const s = await makeStudent(env, { grade: 8, allowed: { grades: [5, 6, 7, 8], courses: [] } });
    for (const grade of [5, 6, 7, 8]) {
      for (const strand of ['C', 'D', 'E', 'F']) {
        const { count, result } = await runCheck(env, s, { grade, strand }, true);
        expect(count, `${grade}.${strand}`).toBeLessThanOrEqual(8);
        for (const skill of result.ladder) expect(skill, `${grade}.${strand}`).toMatch(new RegExp(`^MS\\.G\\d+\\.${strand}`));
        expect(result.ladder.length).toBeGreaterThan(0);
      }
    }
  });

  it('places a strong student high and a struggling student low within a strand, without touching other strands', async () => {
    for (const right of [true, false]) {
      const env = env0(5);
      const s = await makeStudent(env, { grade: 7, allowed: { grades: [5, 6, 7], courses: [] } });
      const { result } = await runCheck(env, s, { grade: 7, strand: 'E' }, right);
      if (right) expect(result.startingIndex).toBeGreaterThanOrEqual(result.ladder.length - 4); else expect(result.startingIndex).toBeLessThanOrEqual(1);
      const strands = (env.db.prepare("SELECT DISTINCT substr(skill_id, 4, 7) AS k FROM mastery WHERE student_id = ?").all(s.studentId) as { k: string }[]).map((r) => r.k);
      expect(strands.every((k) => /^G\d\.E/.test(k))).toBe(true);
    }
  });

  it('keeps the Number check and a strand check apart, and tidies up with the right keys', async () => {
    const env = env0(9);
    const s = await makeStudent(env, { grade: 5 });
    await runCheck(env, s, { grade: 5 }, true);
    await runCheck(env, s, { grade: 5, strand: 'C' }, false);
    const rows = env.db.prepare('SELECT strand, done_at FROM placement WHERE student_id = ? ORDER BY strand').all(s.studentId) as { strand: string; done_at: number | null }[];
    expect(rows.map((r) => r.strand)).toEqual(['B', 'C']);
    expect(rows.every((r) => r.done_at !== null)).toBe(true);
  });

  it('checks a whole Grade 10 to 12 course within eight questions, with only that course\'s skills, and keeps courses apart', async () => {
    const env = env0(11);
    const s = await makeStudent(env, { grade: 11, allowed: { grades: [10, 11, 12], courses: ['MPM2D', 'MCR3U', 'MBF3C', 'MAP4C'] } });
    for (const [grade, course] of [[10, 'MPM2D'], [11, 'MCR3U'], [11, 'MBF3C'], [12, 'MAP4C']] as const) {
      const { count, result, ladderSize } = await runCheck(env, s, { grade, course }, true);
      expect(count, course).toBeLessThanOrEqual(8);
      expect(ladderSize).toBeGreaterThan(8);
      for (const skill of result.ladder) expect(skill, course).toContain(`.${course}.`);
      expect(result.startingIndex, course).toBeGreaterThanOrEqual(result.ladder.length - 4); // a strong student starts high
    }
    const rows = env.db.prepare('SELECT grade, strand FROM placement WHERE student_id = ? ORDER BY grade, strand').all(s.studentId);
    expect(rows).toEqual([{ grade: 10, strand: 'MPM2D' }, { grade: 11, strand: 'MBF3C' }, { grade: 11, strand: 'MCR3U' }, { grade: 12, strand: 'MAP4C' }]);
    const other = (env.db.prepare("SELECT COUNT(*) AS n FROM mastery WHERE student_id = ? AND skill_id LIKE 'MS.G11.MEL3E.%'").get(s.studentId) as { n: number }).n;
    expect(other).toBe(0);
  });

  it('places a struggling student low in a course', async () => {
    const env = env0(12);
    const s = await makeStudent(env, { grade: 10, allowed: { grades: [10], courses: ['MFM2P'] } });
    const { result } = await runCheck(env, s, { grade: 10, course: 'MFM2P' }, false);
    expect(result.startingIndex).toBeLessThanOrEqual(1);
  });

  it('refuses a course check for a grade the student may not use, a made-up course, or a course below Grade 10', async () => {
    const env = env0(13);
    const s = await makeStudent(env, { grade: 10, allowed: { grades: [5, 9, 10], courses: ['MPM2D'] } });
    await post(s, '/placement/start', { grade: 11, course: 'MCR3U' }).expect(403);
    await post(s, '/placement/start', { grade: 10, course: 'NOPE1' }).expect(404);
    await post(s, '/placement/start', { grade: 10, course: 'nope' }).expect(400);
    await post(s, '/placement/start', { grade: 9, course: 'MPM2D' }).expect(400);
    await post(s, '/placement/start', { grade: 10, course: 'MPM2D', strand: 'C' }).expect(200); // the course wins; the strand is ignored
  });

  it('rejects a strand with no check and a strand that does not exist', async () => {
    const env = env0();
    const s = await makeStudent(env, { grade: 9, allowed: { grades: [5, 9], courses: [] } });
    await post(s, '/placement/start', { grade: 5, strand: 'Z' }).expect(400);
    await post(s, '/placement/start', { grade: 9, strand: 'A' }).expect(400); // strand A is never scored
  });
});

describe('Grade 9 by course', () => {
  it('practices Grade 9 Number and Algebra under the MTH1W course, and finds nothing without the course', async () => {
    const env = env0();
    const s = await makeStudent(env, { grade: 9, allowed: { grades: [9], courses: [] } });
    for (const strand of ['B', 'C']) {
      const r = await start(s, { grade: 9, course: 'MTH1W', strands: [strand] });
      expect(r.step.item ?? r.step.lessonId ?? r.step.target, strand).toBeDefined();
    }
    await post(s, '/session', { grade: 9, strands: ['C'] }).expect(404); // without the course there is no Grade 9 content
    const opts = (await s.agent.get('/api/learn/options').expect(200)).body as { grades: { grade: number; groups: { course: string | null }[] }[] };
    expect(opts.grades.find((g) => g.grade === 9)!.groups.map((g) => g.course)).toEqual(['MTH1W']);
  });
});

describe('Grade 10 by course', () => {
  it('practices MPM2D Quadratic Relations and Analytic Geometry, and MFM2P Linear and Quadratic Relations, by course', async () => {
    const env = env0();
    const s = await makeStudent(env, { grade: 10, allowed: { grades: [10], courses: [] } });
    for (const [course, strand] of [['MPM2D', 'A'], ['MPM2D', 'B'], ['MPM2D', 'C'], ['MFM2P', 'A'], ['MFM2P', 'B'], ['MFM2P', 'C']] as const) {
      const r = await start(s, { grade: 10, course, strands: [strand] });
      expect(r.step.item ?? r.step.lessonId ?? r.step.target, `${course} ${strand}`).toBeDefined();
    }
    await post(s, '/session', { grade: 10, strands: ['A'] }).expect(404); // without the course there is no Grade 10 content
    const opts = (await s.agent.get('/api/learn/options').expect(200)).body as { grades: { grade: number; groups: { course: string | null; strands: { strand: string; available: boolean }[] }[] }[] };
    const g10 = opts.grades.find((g) => g.grade === 10)!.groups;
    expect(g10.map((g) => g.course).sort()).toEqual(['MFM2P', 'MPM2D']);
    expect(g10.find((g) => g.course === 'MPM2D')!.strands.filter((x) => x.available).map((x) => x.strand)).toEqual(['A', 'B', 'C']);
    expect(g10.find((g) => g.course === 'MFM2P')!.strands.filter((x) => x.available).map((x) => x.strand)).toEqual(['A', 'B', 'C']);
  });
});

describe('Grade 11 by course', () => {
  it('practices MCR3U, MCF3M, MBF3C and MEL3E by course', async () => {
    const env = env0();
    const s = await makeStudent(env, { grade: 11, allowed: { grades: [11], courses: [] } });
    for (const [course, strand] of [['MCR3U', 'A'], ['MCR3U', 'B'], ['MCR3U', 'C'], ['MCR3U', 'D'], ['MCF3M', 'A'], ['MCF3M', 'B'], ['MCF3M', 'C'], ['MBF3C', 'A'], ['MBF3C', 'B'], ['MBF3C', 'C'], ['MBF3C', 'D'], ['MEL3E', 'A'], ['MEL3E', 'B'], ['MEL3E', 'C']] as const) {
      const r = await start(s, { grade: 11, course, strands: [strand] });
      expect(r.step.item ?? r.step.lessonId ?? r.step.target, `${course} ${strand}`).toBeDefined();
    }
    await post(s, '/session', { grade: 11, strands: ['A'] }).expect(404); // without the course there is no Grade 11 content
    const opts = (await s.agent.get('/api/learn/options').expect(200)).body as { grades: { grade: number; groups: { course: string | null; strands: { strand: string; available: boolean }[] }[] }[] };
    const g11 = opts.grades.find((g) => g.grade === 11)!.groups;
    expect(g11.find((g) => g.course === 'MCR3U')!.strands.filter((x) => x.available).map((x) => x.strand)).toEqual(['A', 'B', 'C', 'D']);
    expect(g11.find((g) => g.course === 'MCF3M')!.strands.filter((x) => x.available).map((x) => x.strand)).toEqual(['A', 'B', 'C']);
    expect(g11.find((g) => g.course === 'MBF3C')!.strands.filter((x) => x.available).map((x) => x.strand)).toEqual(['A', 'B', 'C', 'D']);
    expect(g11.find((g) => g.course === 'MEL3E')!.strands.filter((x) => x.available).map((x) => x.strand)).toEqual(['A', 'B', 'C']);
  });
});

describe('Grade 12 by course', () => {
  it('practices every Grade 12 course strand by course', async () => {
    const env = env0();
    const s = await makeStudent(env, { grade: 12, allowed: { grades: [12], courses: [] } });
    const built = [['MHF4U', ['A', 'B', 'C', 'D']], ['MCV4U', ['A', 'B', 'C']], ['MDM4U', ['A', 'B', 'C', 'D']], ['MCT4C', ['A', 'B', 'C', 'D']], ['MAP4C', ['A', 'B', 'C', 'D']], ['MEL4E', ['A', 'B', 'C']]] as const;
    for (const [course, strands] of built) {
      for (const strand of strands) {
        const r = await start(s, { grade: 12, course, strands: [strand] });
        expect(r.step.item ?? r.step.lessonId ?? r.step.target, `${course} ${strand}`).toBeDefined();
      }
    }
    await post(s, '/session', { grade: 12, strands: ['A'] }).expect(404); // without the course there is no Grade 12 content
    const opts = (await s.agent.get('/api/learn/options').expect(200)).body as { grades: { grade: number; groups: { course: string | null; strands: { strand: string; available: boolean }[] }[] }[] };
    const groups = opts.grades.find((g) => g.grade === 12)!.groups;
    for (const [course, strands] of built) expect(groups.find((g) => g.course === course)!.strands.filter((x) => x.available).map((x) => x.strand), course).toEqual([...strands]);
  });
});

describe('skill map', () => {
  it('shows soon, locked, new, in progress and mastered states, with prerequisites', async () => {
    const env = env0();
    const s = await makeStudent(env, { grade: 6 });
    const map = (await s.agent.get('/api/learn/skillmap?grade=6').expect(200)).body as { nodes: { code: string; state: string; unmet: string[]; micro: number }[]; edges: { from: string; to: string }[] };
    const node = (c: string) => map.nodes.find((n) => n.code === c)!;
    expect(node('G6.B2.5').state).toBe('locked'); // Grade 5 fractions come first (recommended, not required)
    expect(node('G6.B2.5').unmet).toContain('G5.B2.5');
    expect(map.nodes.every((n) => n.state !== 'soon')).toBe(true); // every Grade 6 expectation has practice from 2.9.1
    const map9 = (await s.agent.get('/api/learn/skillmap?grade=9&course=MTH1W').expect(200)).body as typeof map;
    expect(map9.nodes.find((n) => n.code === 'MTH1W.B1.1')!.state).toBe('soon'); // a research task has no practice
    expect(map9.nodes.find((n) => n.code === 'MTH1W.D1.2')!.state).not.toBe('soon');
    expect(map.edges.some((e) => e.from === 'G5.B2.5' && e.to === 'G6.B2.5')).toBe(true);

    // practicing never needs the prerequisite: sessions can still start on a locked skill
    await post(s, '/session', { grade: 6, strands: ['B'] }).expect(200);

    for (const m of ['MS.G5.B2.5.a', 'MS.G5.B2.5.b', 'MS.G5.B2.5.c']) env.db.prepare('INSERT INTO mastery (student_id, skill_id, p_known, tier, attempts, correct) VALUES (?,?,?,?,?,?)').run(s.studentId, m, 0.97, 3, 8, 8);
    env.db.prepare('INSERT INTO mastery (student_id, skill_id, p_known, tier, attempts, correct) VALUES (?,?,?,?,?,?)').run(s.studentId, 'MS.G6.B2.5.a', 0.5, 2, 3, 2);
    const map2 = (await s.agent.get('/api/learn/skillmap?grade=6').expect(200)).body as typeof map;
    expect(map2.nodes.find((n) => n.code === 'G5.B2.5')!.state).toBe('mastered');
    expect(map2.nodes.find((n) => n.code === 'G6.B2.5')!.state).toBe('in_progress');
  });

  it('marks a mastered skill whose review is due as needing review', async () => {
    const env = env0();
    const s = await makeStudent(env, { grade: 5 });
    env.db.prepare('INSERT INTO mastery (student_id, skill_id, p_known, tier, attempts, correct, next_review_at) VALUES (?,?,?,?,?,?,?)').run(s.studentId, 'MS.G5.E1.4.a', 0.97, 3, 9, 9, env.clock.t - 1);
    const map = (await s.agent.get('/api/learn/skillmap?grade=5').expect(200)).body as { nodes: { code: string; state: string }[] };
    expect(map.nodes.find((n) => n.code === 'G5.E1.4')!.state).toBe('needs_review');
  });

  it('refuses grades the caregiver has not allowed', async () => {
    const env = env0();
    const s = await makeStudent(env, { allowed: { grades: [5], courses: [] } });
    await s.agent.get('/api/learn/skillmap?grade=8').expect(403);
    await s.agent.get('/api/learn/skillmap?grade=2').expect(400);
  });
});

describe('student settings', () => {
  it('lets a student change voice and accessibility settings, and nothing else', async () => {
    const env = env0();
    const s = await makeStudent(env);
    const res = await s.agent.patch('/api/learn/settings').set('x-csrf-token', s.csrf).send({ voice: true, voiceRate: 1.2, autoRead: true, dyslexiaFont: true, highContrast: true }).expect(200);
    expect(res.body.settings).toMatchObject({ voice: true, voiceRate: 1.2, autoRead: true, dyslexiaFont: true });
    await s.agent.patch('/api/learn/settings').set('x-csrf-token', s.csrf).send({ grade: 12 }).expect(400);
    await s.agent.patch('/api/learn/settings').set('x-csrf-token', s.csrf).send({ voiceRate: 9 }).expect(400);
    const me = await s.agent.get('/api/me').expect(200);
    expect(me.body.student.settings.voice).toBe(true);
    expect(me.body.student.grade).toBe(5);
  });

  it('keeps the choice of a plain background, and accepts only true or false', async () => {
    const env = env0();
    const s = await makeStudent(env);
    const patch = (body: object) => s.agent.patch('/api/learn/settings').set('x-csrf-token', s.csrf).send(body);
    expect((await patch({ plainBackground: true }).expect(200)).body.settings.plainBackground).toBe(true);
    expect((await s.agent.get('/api/me').expect(200)).body.student.settings.plainBackground).toBe(true);
    await patch({ plainBackground: 'yes' }).expect(400);
    expect((await patch({ plainBackground: false }).expect(200)).body.settings.plainBackground).toBe(false);
  });
});
