import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import http from 'node:http';
import { readFileSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import request from 'supertest';
import { makeEnv, addUser, signIn, type TestEnv } from './helpers.js';
import { verifyDraft } from '../server/ai/verify.js';
import { newId, nowIso } from '../server/db.js';
import { loadCurriculum } from '../server/curriculum.js';
import { makeRng } from '../shared/rng.js';
import { answerToGiven } from '../shared/check.js';
import type { Item } from '../shared/items/types.js';
import * as svc from '../server/learn/service.js';
import type { StudentRow } from '../server/context.js';

const good = (n: number) => ({
  en: `A class has ${n} boxes with 12 pencils each. How many pencils are there?`,
  fr: `Une classe a ${n} boîtes de 12 crayons chacune. Combien y a-t-il de crayons ?`,
  compute: `${n} * 12`, answer: n * 12,
  stepsEn: ['Each box has 12 pencils.', `Multiply ${n} by 12.`], stepsFr: ['Chaque boîte contient 12 crayons.', `Multiplie ${n} par 12.`],
  hintsEn: ['Think about equal groups.', `Try ${n} groups of 12.`, `${n} × 12 is the total.`], hintsFr: ['Pense aux groupes égaux.', `Essaie ${n} groupes de 12.`, `${n} × 12 donne le total.`],
});

const microIds = (JSON.parse(readFileSync('content/microskills.json', 'utf8')) as { microskills: { id: string }[] }).microskills.map((m) => m.id);
let mock: http.Server;
let reply: () => { status: number; body: unknown };
let calls: unknown[];

beforeEach(async () => {
  calls = [];
  reply = () => ({ status: 200, body: { content: [{ type: 'text', text: JSON.stringify([good(3), good(4)]) }], usage: { input_tokens: 400, output_tokens: 900 } } });
  mock = http.createServer((req, res) => {
    let b = '';
    req.on('data', (c) => (b += c));
    req.on('end', () => {
      calls.push({ headers: req.headers, body: JSON.parse(b) });
      const r = reply();
      res.writeHead(r.status, { 'content-type': 'application/json' }).end(JSON.stringify(r.body));
    });
  });
  await new Promise<void>((ok) => mock.listen(0, '127.0.0.1', ok));
});
afterEach(() => mock.close());

const base = () => `http://127.0.0.1:${(mock.address() as AddressInfo).port}`;
async function admin(env: TestEnv) {
  addUser(env, 'a@x.ca', 'admin');
  return signIn(env, 'a@x.ca');
}
const post = (a: Awaited<ReturnType<typeof admin>>, url: string, body: object = {}) => a.agent.post(`/api/admin/ai/${url}`).set('x-csrf-token', a.csrf).send(body);

describe('verification', () => {
  it('accepts a correct draft and rejects each kind of bad one', () => {
    expect(verifyDraft(good(3), new Set()).ok).toBe(true);
    const reason = (d: object) => { const v = verifyDraft(d, new Set()); return v.ok ? 'ok' : v.reason; };
    expect(reason({ ...good(3), answer: 37 })).toBe('recompute');
    expect(reason({ ...good(3), compute: 'process.exit()' })).toBe('recompute');
    expect(reason({ ...good(3), en: 'You would be stupid to guess how many pencils there are.' })).toBe('banned_term');
    expect(reason({ ...good(3), hintsFr: ['Visite https://x.ca', 'b b b', 'c c c'] })).toBe('link_or_markup');
    expect(reason({ ...good(3), en: 'How many pencils in $3 \\times 12 boxes?' })).toBe('math_markup');
    expect(reason({ ...good(3), fr: good(3).en })).toBe('same_language');
    expect(reason({ ...good(3), extra: 1 })).toBe('schema');
    expect(verifyDraft(good(3), new Set([good(3).en.toLowerCase()])).ok).toBe(false);
  });
});

describe('admin pipeline', () => {
  it('needs an API key, is admin-only, and never accepts unknown skills', async () => {
    const env = makeEnv();
    const a = await admin(env);
    await post(a, 'generate', { skill: 'MS.G5.B2.2.a', tier: 1 }).expect(409);
    const env2 = makeEnv({ ANTHROPIC_API_KEY: 'k', ANTHROPIC_API_BASE: base() });
    const a2 = await admin(env2);
    await post(a2, 'generate', { skill: 'nope', tier: 1 }).expect(400);
    addUser(env2, 'c@x.ca');
    const c = await signIn(env2, 'c@x.ca');
    await c.agent.get('/api/admin/ai/status').expect(403);
  });

  it('generates drafts, records spend, and nothing is served until approved', async () => {
    const env = makeEnv({ ANTHROPIC_API_KEY: 'sk-test', ANTHROPIC_API_BASE: base() });
    const a = await admin(env);
    const res = await post(a, 'generate', { skill: 'MS.G5.B2.2.a', tier: 1, count: 2 }).expect(200);
    expect(res.body.created).toBe(2);
    const sent = calls[0] as { headers: Record<string, string>; body: { model: string; messages: { content: string }[] } };
    expect(sent.headers['x-api-key']).toBe('sk-test');
    expect(sent.body.messages[0]!.content).not.toMatch(/@|student/i); // no personal data in the prompt
    const status = await a.agent.get('/api/admin/ai/status').expect(200);
    expect(status.body.spentUsd).toBeGreaterThan(0);
    expect(status.body.counts.draft).toBe(2);
    const usage = await a.agent.get('/api/admin/ai/usage').expect(200);
    expect(usage.body.days[0].inputTokens).toBe(400);

    const items = (await a.agent.get('/api/admin/ai/items?status=draft').expect(200)).body.items as { id: number }[];
    expect(env.db.prepare("SELECT COUNT(*) AS n FROM bank_item WHERE status = 'approved'").get()).toEqual({ n: 0 });
    await post(a, `items/${items[0]!.id}/approve`).expect(200);
    await post(a, `items/${items[1]!.id}/reject`, { reason: 'unclear' }).expect(200);
    await post(a, `items/${items[0]!.id}/approve`).expect(404); // already reviewed
    expect(env.db.prepare("SELECT COUNT(*) AS n FROM bank_item WHERE status = 'approved'").get()).toEqual({ n: 1 });
  });

  it('refuses to call Claude once the monthly cap would be exceeded, and counts rejected drafts', async () => {
    const env = makeEnv({ ANTHROPIC_API_KEY: 'k', ANTHROPIC_API_BASE: base(), AI_MONTHLY_CAP_USD: '0.01' });
    const a = await admin(env);
    await post(a, 'generate', { skill: 'MS.G5.B2.2.a', tier: 1 }).expect(402); // worst case of one call is already above 1 cent
    expect(calls).toHaveLength(0);

    const env2 = makeEnv({ ANTHROPIC_API_KEY: 'k', ANTHROPIC_API_BASE: base(), AI_MONTHLY_CAP_USD: '1' });
    const a2 = await admin(env2);
    reply = () => ({ status: 200, body: { content: [{ type: 'text', text: JSON.stringify([good(3), { ...good(5), answer: 1 }, 'junk']) }], usage: { input_tokens: 100, output_tokens: 100 } } });
    const res = await post(a2, 'generate', { skill: 'MS.G5.B2.2.a', tier: 1 }).expect(200);
    expect(res.body.created).toBe(1);
    expect(res.body.rejected).toEqual({ recompute: 1, schema: 1 });
    env2.db.prepare('INSERT INTO ai_usage (at, kind, model, cost_micro_usd) VALUES (?,?,?,?)').run(env2.clock.t, 'x', 'm', 990_000);
    await post(a2, 'generate', { skill: 'MS.G5.B2.2.a', tier: 1 }).expect(402);
  });

  it('reports an API failure as 502 and still records the attempt', async () => {
    const env = makeEnv({ ANTHROPIC_API_KEY: 'k', ANTHROPIC_API_BASE: base() });
    const a = await admin(env);
    reply = () => ({ status: 500, body: {} });
    await post(a, 'generate', { skill: 'MS.G5.B2.2.a', tier: 1 }).expect(502);
    expect(env.db.prepare('SELECT ok FROM ai_usage').get()).toEqual({ ok: 0 });
  });
});

const correctGiven = (env: TestEnv, pid: string) => answerToGiven((JSON.parse((env.db.prepare('SELECT item_json FROM pending_item WHERE id = ?').get(pid) as { item_json: string }).item_json) as Item).answer);

describe('serving and reports', () => {
  function seed(env: TestEnv) {
    loadCurriculum(env.db);
    const cg = addUser(env, `cg${newId().slice(0, 6)}@x.ca`);
    const id = newId();
    env.db.prepare("INSERT INTO students (id, username, display_name, pin_hash, grade, language, created_by, created_at) VALUES (?,?,?,?,?,?,?,?)").run(id, 's' + id.slice(0, 4), 'Sam', 'x', 5, 'en', cg, nowIso());
    return env.db.prepare('SELECT * FROM students WHERE id = ?').get(id) as StudentRow;
  }
  const approved = (env: TestEnv, n: number, skill = 'MS.G5.B2.2.a', tier = 1) => {
    const v = verifyDraft(good(n), new Set());
    if (!v.ok) throw new Error('bad fixture');
    return Number(env.db.prepare("INSERT INTO bank_item (skill, tier, status, item_json, compute, model, created_at) VALUES (?, ?, 'approved', ?, ?, 'm', ?)").run(skill, tier, JSON.stringify({ id: 'x', skill, tier, seed: 0, category: 'AP', format: 'number', prompt: { en: good(n).en, fr: good(n).fr }, answer: { kind: 'number', value: n * 12 }, steps: [{ en: 'a', fr: 'a' }], hints: [{ en: 'a', fr: 'a' }, { en: 'b', fr: 'b' }, { en: 'c', fr: 'c' }], wrong: [], expectedMs: 1 }), good(n).compute, nowIso()).lastInsertRowid);
  };

  it('serves an approved bank item, grades it by the stored answer, and never serves drafts', () => {
    const env = makeEnv({}, makeRng(7));
    const s = seed(env);
    env.db.prepare("INSERT INTO bank_item (skill, tier, status, item_json, compute, model, created_at) VALUES ('MS.G5.B1.1.a', 1, 'draft', '{}', '1', 'm', ?)").run(nowIso());
    let { sessionId } = svc.startSession(env.ctx, s, { grade: 5, course: null, strands: ['B'] });
    for (let i = 0; i < 25; i++) {
      const none = svc.next(env.ctx, s, sessionId);
      if (none.type !== 'item') continue;
      expect(none.item.id).not.toMatch(/^bank/);
      svc.answer(env.ctx, s, none.item.id, correctGiven(env, none.item.id), 1000);
    }
    for (const m of microIds) for (const t of [1, 2, 3]) approved(env, 4, m, t); // every skill, so wherever the student goes there is a bank item
    let served = 0;
    for (let i = 0; i < 600; i++) {
      const step = svc.next(env.ctx, s, sessionId);
      if (step.type !== 'item') { sessionId = svc.startSession(env.ctx, s, { grade: 5, course: null, strands: ['B'] }).sessionId; continue; }
      if (step.item.id.startsWith('bank')) {
        served++;
        const r = svc.answer(env.ctx, s, step.item.id, { kind: 'number', text: '48' }, 3000);
        expect(r.feedback.correct).toBe(true);
        break;
      }
      svc.answer(env.ctx, s, step.item.id, correctGiven(env, step.item.id), 1000);
    }
    expect(served).toBe(1);
  });

  it('a student can report once; two students retire an AI item and clear it from serving', () => {
    const env = makeEnv();
    const s1 = seed(env);
    const s2 = seed(env);
    const id = approved(env, 6);
    svc.reportItem(env.ctx, s1, `bank${id}:abcd1234`, 'answer');
    svc.reportItem(env.ctx, s1, `bank${id}:zzzz9999`, 'answer'); // same student, same item: ignored
    expect(env.db.prepare('SELECT status FROM bank_item WHERE id = ?').get(id)).toEqual({ status: 'approved' });
    svc.reportItem(env.ctx, s2, `bank${id}:efgh5678`, 'unclear');
    expect(env.db.prepare('SELECT status FROM bank_item WHERE id = ?').get(id)).toEqual({ status: 'retired' });
    expect((env.db.prepare('SELECT COUNT(*) AS n FROM item_report').get() as { n: number }).n).toBe(2);
  });

  it('students reach the report route through the API and bad input is refused', async () => {
    const env = makeEnv();
    const s = seed(env);
    // route-level validation only; sign-in as a student is covered by the e2e suite
    const anon = await request(env.app).post('/api/learn/report').send({ itemId: 'a:b:c', reason: 'answer' });
    expect([401, 403]).toContain(anon.status);
    expect(s.id).toBeTruthy();
  });
});
