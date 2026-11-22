import { describe, it, expect } from 'vitest';
import { addUser, makeEnv, signIn } from './helpers.js';
import { audit } from '../server/audit.js';
import { purgeExpired, ACTIVITY_DAYS } from '../server/jobs.js';
import { purgeDueAccounts, DELETE_GRACE_MS } from '../server/household.js';

// The household activity log: a student's caregivers see who looked at, changed or shared what, and when; nobody else does.

type Cg = Awaited<ReturnType<typeof signIn>>;
const send = (c: Cg, method: 'get' | 'post' | 'patch' | 'delete', url: string, body?: object) => {
  const r = c.agent[method](url).set('x-csrf-token', c.csrf);
  return body ? r.send(body) : r;
};
type Entry = { id: number; action: string; actor: { name?: string; you?: boolean; former?: boolean; student?: boolean }; other?: { name?: string; former?: boolean }; detail: Record<string, unknown> };
const log = async (c: Cg, sid: string, q = ''): Promise<{ entries: Entry[]; more: boolean; keepDays: number }> => (await send(c, 'get', `/api/students/${sid}/activity${q}`).expect(200)).body;

async function world() {
  const env = makeEnv();
  for (const e of ['a@x.ca', 'b@x.ca', 'c@x.ca']) addUser(env, e);
  addUser(env, 'admin@x.ca', 'admin');
  const A = await signIn(env, 'a@x.ca'), B = await signIn(env, 'b@x.ca'), C = await signIn(env, 'c@x.ca'), X = await signIn(env, 'admin@x.ca');
  const k1 = (await send(A, 'post', '/api/students', { displayName: 'SAM', username: 'sam', pin: '1234', grade: 5 }).expect(201)).body.id as string;
  const k2 = (await send(A, 'post', '/api/students', { displayName: 'MIA', username: 'mia', pin: '1234', grade: 5 }).expect(201)).body.id as string;
  const k3 = (await send(C, 'post', '/api/students', { displayName: 'ZOE', username: 'zoe', pin: '1234', grade: 5 }).expect(201)).body.id as string;
  return { env, A, B, C, X, k1, k2, k3 };
}

describe('household activity log', () => {
  it('shows each caregiver on a student what the others did, with names, newest first', async () => {
    const { A, B, k1 } = await world();
    await send(A, 'post', `/api/students/${k1}/caregivers`, { email: 'b@x.ca', role: 'owner' }).expect(201);
    await send(B, 'post', `/api/students/${k1}/goals`, { title: 'Pizza', xpTarget: 100 }).expect(201);
    await send(B, 'post', `/api/students/${k1}/messages`, { body: 'Well done' }).expect(201);
    await send(A, 'patch', `/api/students/${k1}`, { displayName: 'Sam J' }).expect(200);
    for (const c of [A, B]) {
      const { entries } = await log(c, k1);
      expect(entries.map((e) => e.action)).toEqual(['student.update', 'message.send', 'goal.create', 'student.share', 'student.create']);
      expect(entries[0]!.detail.fields).toEqual(['displayName']);
      expect(entries[2]!.detail.xpTarget).toBe(100);
    }
    const a = (await log(A, k1)).entries, b = (await log(B, k1)).entries;
    expect([a[0]!.actor.you, b[0]!.actor.you]).toEqual([true, false]);
    expect(b[1]!.actor.you).toBe(true);
    expect(a[3]!.other).toMatchObject({ name: 'b@x.ca' });
    expect(JSON.stringify(a)).not.toMatch(/Pizza|Well done/); // what was written stays in goals and messages, not in the log
  });

  it('records a caregiver opening progress once per half hour, and a student signing in', async () => {
    const { env, A, B, k1 } = await world();
    await send(A, 'post', `/api/students/${k1}/caregivers`, { email: 'b@x.ca' }).expect(201);
    for (let i = 0; i < 3; i++) await send(B, 'get', `/api/students/${k1}/dashboard`).expect(200);
    audit(env.db, { kind: 'student', id: k1 }, 'auth.student_login');
    const e = (await log(A, k1)).entries;
    expect(e.filter((x) => x.action === 'student.view')).toHaveLength(1);
    expect(e.find((x) => x.action === 'student.view')!.actor).toMatchObject({ name: 'b@x.ca', you: false });
    expect(e.find((x) => x.action === 'auth.student_login')!.actor).toMatchObject({ name: 'SAM', student: true });
    env.db.prepare("UPDATE audit_log SET at = ? WHERE action = 'student.view'").run(new Date(Date.now() - 31 * 60_000).toISOString());
    await send(B, 'get', `/api/students/${k1}/dashboard`).expect(200);
    expect((await log(A, k1)).entries.filter((x) => x.action === 'student.view')).toHaveLength(2);
  });

  it('is private to the family: other households, the admin and signed-out visitors get nothing', async () => {
    const { env, A, C, X, k1, k2, k3 } = await world();
    await send(A, 'get', `/api/students/${k1}/dashboard`);
    for (const c of [C, X]) expect((await send(c, 'get', `/api/students/${k1}/activity`)).status).toBe(404);
    expect((await send(A, 'get', `/api/students/${k3}/activity`)).status).toBe(404);
    expect(JSON.stringify((await log(A, k2)).entries)).not.toContain(k3);
    const adminSees = ((await send(X, 'get', '/api/admin/audit?limit=500').expect(200)).body.entries as { action: string }[]).map((e) => e.action);
    expect(adminSees.some((a) => a.startsWith('student.') || a.startsWith('goal.') || a === 'auth.student_login')).toBe(false);
    expect((await (await import('supertest')).default(env.app).get(`/api/students/${k1}/activity`)).status).toBe(401);
  });

  it('bulk "invite a co-parent" shows on every student it shared', async () => {
    const { A, k1, k2 } = await world();
    await send(A, 'post', '/api/me/invite-parent', { email: 'b@x.ca', role: 'owner', studentIds: [k1, k2] }).expect(201);
    for (const k of [k1, k2]) expect((await log(A, k)).entries.map((e) => `${e.action}:${e.detail.role}`)).toContain('student.share:owner');
  });

  it('shows a former caregiver as "former", never by name, and pages through long histories', async () => {
    const { env, A, B, k1 } = await world();
    await send(A, 'post', `/api/students/${k1}/caregivers`, { email: 'b@x.ca' }).expect(201);
    await send(B, 'post', `/api/students/${k1}/messages`, { body: 'hi' }).expect(201);
    await send(B, 'delete', `/api/students/${k1}/caregivers/${(env.db.prepare("SELECT id FROM users WHERE email = 'b@x.ca'").get() as { id: string }).id}`).expect(200);
    const e = (await log(A, k1)).entries;
    expect(e.find((x) => x.action === 'message.send')!.actor).toEqual({ former: true });
    expect(JSON.stringify(e)).not.toContain('b@x.ca');
    for (let i = 0; i < 5; i++) audit(env.db, { kind: 'caregiver', id: (env.db.prepare("SELECT id FROM users WHERE email = 'a@x.ca'").get() as { id: string }).id }, 'goal.create', k1, { xpTarget: i });
    const p1 = await log(A, k1, '?limit=3');
    expect([p1.entries.length, p1.more]).toEqual([3, true]);
    const p2 = await log(A, k1, `?limit=100&before=${p1.entries[2]!.id}`);
    expect(p2.more).toBe(false);
    expect(new Set([...p1.entries, ...p2.entries].map((x) => x.id)).size).toBe(p1.entries.length + p2.entries.length);
  });

  it('keeps entries for the retention period only, and deletes them with the student or the account', async () => {
    const { env, A, k1, k2 } = await world();
    const count = (sid: string): number => (env.db.prepare('SELECT COUNT(*) AS n FROM audit_log WHERE student_id = ?').get(sid) as { n: number }).n;
    expect(ACTIVITY_DAYS).toBe(180);
    env.db.prepare("UPDATE audit_log SET at = ? WHERE student_id = ? AND action = 'student.create'").run(new Date(Date.now() - 181 * 86_400_000).toISOString(), k1);
    const before = count(k1);
    purgeExpired(env.db);
    expect(count(k1)).toBe(before - 1);
    expect(count(k2)).toBeGreaterThan(0);
    await send(A, 'delete', `/api/students/${k2}`).expect(200);
    expect(count(k2)).toBe(0);
    await send(A, 'post', '/api/me/delete', { confirm: 'a@x.ca' }).expect(200);
    await purgeDueAccounts(env.db, env.ctx.cfg, env.mailer, env.clock.t + DELETE_GRACE_MS + 1);
    expect(count(k1)).toBe(0);
    expect(env.db.pragma('foreign_key_check')).toEqual([]);
  });
});
