import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { addUser, makeEnv, signIn, type TestEnv } from './helpers.js';
import { purgeDueAccounts, MAX_CAREGIVERS, DELETE_GRACE_MS } from '../server/household.js';

// Family accounts: two parents as equals, handing a student over, leaving, inviting a co-parent to every child, downloading an account,
// and deleting one after a waiting period. Every route here is also in the cross-household table in household-isolation.test.ts.

type Cg = Awaited<ReturnType<typeof signIn>>;
const send = (c: Cg, method: 'get' | 'post' | 'patch' | 'delete', url: string, body?: object) => {
  const r = c.agent[method](url).set('x-csrf-token', c.csrf);
  return body ? r.send(body) : r;
};
const create = async (c: Cg, username: string, pin = '1234') => (await send(c, 'post', '/api/students', { displayName: username.toUpperCase(), username, pin, grade: 5 }).expect(201)).body.id as string;
const uid = (env: TestEnv, email: string): string => (env.db.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: string }).id;
const roleOf = (env: TestEnv, sid: string, email: string): string | undefined => (env.db.prepare('SELECT sc.role FROM student_caregivers sc JOIN users u ON u.id = sc.caregiver_id WHERE sc.student_id = ? AND u.email = ?').get(sid, email) as { role: string } | undefined)?.role;
const count = (env: TestEnv, sql: string, ...args: unknown[]): number => (env.db.prepare(sql).get(...args) as { n: number }).n;

async function family() {
  const env = makeEnv();
  for (const e of ['a@x.ca', 'b@x.ca', 'c@x.ca']) addUser(env, e);
  addUser(env, 'admin@x.ca', 'admin');
  const A = await signIn(env, 'a@x.ca'), B = await signIn(env, 'b@x.ca'), C = await signIn(env, 'c@x.ca'), X = await signIn(env, 'admin@x.ca');
  const k1 = await create(A, 'sam'), k2 = await create(A, 'mia'), k3 = await create(C, 'zoe');
  return { env, A, B, C, X, k1, k2, k3 };
}

describe('who is on a student', () => {
  it('lists the caregivers to everyone on that student and to no one else', async () => {
    const { env, A, B, C, X, k1, k2 } = await family();
    await send(A, 'post', `/api/students/${k1}/caregivers`, { email: 'b@x.ca' }).expect(201);
    for (const [who, c] of [['A', A], ['B', B]] as const) {
      const res = await send(c, 'get', `/api/students/${k1}/caregivers`).expect(200);
      expect(res.body.caregivers.map((x: { email: string; role: string }) => `${x.email}:${x.role}`), who).toEqual(['a@x.ca:owner', 'b@x.ca:co']);
      expect(res.body.caregivers.filter((x: { you: boolean }) => x.you).map((x: { email: string }) => x.email)).toEqual([who.toLowerCase() + '@x.ca']);
      expect(res.body.max).toBe(MAX_CAREGIVERS);
    }
    expect((await send(B, 'get', `/api/students/${k1}/caregivers`)).body.youRole).toBe('co');
    expect((await send(C, 'get', `/api/students/${k1}/caregivers`)).status).toBe(404);
    expect((await send(X, 'get', `/api/students/${k1}/caregivers`)).status).toBe(404);
    expect((await send(B, 'get', `/api/students/${k2}/caregivers`)).status).toBe(404); // B is on K1 only
    void env;
  });
});

describe('two owners', () => {
  it('shares a student as a second owner, and owners treat each other as equals', async () => {
    const { env, A, B, k1 } = await family();
    await send(A, 'post', `/api/students/${k1}/caregivers`, { email: 'b@x.ca', role: 'owner' }).expect(201);
    expect(roleOf(env, k1, 'b@x.ca')).toBe('owner');
    expect((await send(B, 'patch', `/api/students/${k1}`, { pin: '4321' })).status).toBe(200); // a second owner changes the PIN
    expect((await send(B, 'post', `/api/students/${k1}/caregivers`, { email: 'friend@x.ca' })).status).toBe(201); // and shares
    // neither can remove or demote the other
    expect((await send(B, 'delete', `/api/students/${k1}/caregivers/${uid(env, 'a@x.ca')}`)).status).toBe(403);
    expect((await send(A, 'delete', `/api/students/${k1}/caregivers/${uid(env, 'b@x.ca')}`)).status).toBe(403);
    expect((await send(B, 'patch', `/api/students/${k1}/caregivers/${uid(env, 'a@x.ca')}`, { role: 'co' })).status).toBe(403);
    expect(roleOf(env, k1, 'a@x.ca')).toBe('owner');
    expect(roleOf(env, k1, 'b@x.ca')).toBe('owner');
  });

  it('promotes a helper, lets an owner step down, and never leaves a student without an owner', async () => {
    const { env, A, B, k1 } = await family();
    await send(A, 'post', `/api/students/${k1}/caregivers`, { email: 'b@x.ca' }).expect(201);
    const a = uid(env, 'a@x.ca'), b = uid(env, 'b@x.ca');
    expect((await send(B, 'patch', `/api/students/${k1}/caregivers/${b}`, { role: 'owner' })).status).toBe(403); // a helper cannot promote themselves
    expect((await send(A, 'patch', `/api/students/${k1}/caregivers/${a}`, { role: 'co' })).body.error).toBe('last_owner'); // the only owner cannot step down
    expect((await send(A, 'delete', `/api/students/${k1}/caregivers/${a}`)).body.error).toBe('last_owner'); // or leave
    expect((await send(A, 'patch', `/api/students/${k1}/caregivers/${b}`, { role: 'owner' })).status).toBe(200);
    expect((await send(A, 'patch', `/api/students/${k1}/caregivers/${a}`, { role: 'co' })).status).toBe(200); // now A can step down
    expect(roleOf(env, k1, 'a@x.ca')).toBe('co');
    expect((await send(A, 'patch', `/api/students/${k1}`, { pin: '9999' })).status).toBe(403); // and has a helper's rights
    expect((await send(B, 'patch', `/api/students/${k1}/caregivers/${b}`, { role: 'co' })).body.error).toBe('last_owner'); // B is the only owner now
    expect((await send(A, 'patch', `/api/students/${k1}/caregivers/nobody`, { role: 'owner' })).status).toBe(403); // helpers cannot promote anyone
    expect((await send(B, 'patch', `/api/students/${k1}/caregivers/nobody`, { role: 'owner' })).status).toBe(404);
    expect((await send(B, 'patch', `/api/students/${k1}/caregivers/${a}`, { role: 'bogus' })).status).toBe(400);
  });

  it('lets a helper leave, and then they no longer reach the student', async () => {
    const { env, A, B, k1 } = await family();
    await send(A, 'post', `/api/students/${k1}/caregivers`, { email: 'b@x.ca' }).expect(201);
    expect((await send(B, 'get', `/api/students/${k1}/goals`)).status).toBe(200);
    expect((await send(B, 'delete', `/api/students/${k1}/caregivers/${uid(env, 'b@x.ca')}`)).status).toBe(200);
    expect(roleOf(env, k1, 'b@x.ca')).toBeUndefined();
    for (const url of ['goals', 'messages', 'dashboard', 'export', 'caregivers']) expect((await send(B, 'get', `/api/students/${k1}/${url}`)).status, url).toBe(404);
    expect(roleOf(env, k1, 'a@x.ca')).toBe('owner');
    expect(count(env, "SELECT COUNT(*) AS n FROM audit_log WHERE action = 'student.leave'")).toBe(1);
  });

  it('caps how many caregivers one student can have, without changing the answer for anyone already on it', async () => {
    const { env, A, k1 } = await family();
    for (let i = 1; i < MAX_CAREGIVERS; i++) await send(A, 'post', `/api/students/${k1}/caregivers`, { email: `p${i}@x.ca` }).expect(201);
    expect(count(env, 'SELECT COUNT(*) AS n FROM student_caregivers WHERE student_id = ?', k1)).toBe(MAX_CAREGIVERS);
    expect((await send(A, 'post', `/api/students/${k1}/caregivers`, { email: 'one-too-many@x.ca' })).body.error).toBe('too_many_caregivers');
    expect(env.db.prepare('SELECT 1 FROM users WHERE email = ?').get('one-too-many@x.ca')).toBeUndefined(); // no account was made for the refused one
    expect((await send(A, 'post', `/api/students/${k1}/caregivers`, { email: 'p1@x.ca' })).status).toBe(201); // already on it: no change
  });
});

describe('handing a student over', () => {
  it('makes the other caregiver an owner and the old owner a helper, and tells both', async () => {
    const { env, A, B, k1 } = await family();
    await send(A, 'post', `/api/students/${k1}/caregivers`, { email: 'b@x.ca' }).expect(201);
    env.mailer.outbox.length = 0;
    expect((await send(B, 'post', `/api/students/${k1}/transfer`, { caregiverId: uid(env, 'a@x.ca') })).status).toBe(403); // a helper cannot hand over
    expect((await send(A, 'post', `/api/students/${k1}/transfer`, { caregiverId: uid(env, 'c@x.ca') })).status).toBe(404); // not on this student
    expect((await send(A, 'post', `/api/students/${k1}/transfer`, { caregiverId: uid(env, 'a@x.ca') })).status).toBe(404); // not to yourself
    await send(A, 'post', `/api/students/${k1}/transfer`, { caregiverId: uid(env, 'b@x.ca') }).expect(200);
    expect(roleOf(env, k1, 'b@x.ca')).toBe('owner');
    expect(roleOf(env, k1, 'a@x.ca')).toBe('co');
    expect(env.mailer.outbox.map((m) => m.to).sort()).toEqual(['a@x.ca', 'b@x.ca']);
    expect(env.mailer.outbox.find((m) => m.to === 'b@x.ca')!.subject).toContain('handed over to you');
    expect(env.mailer.outbox.every((m) => m.html && !m.text.includes('/verify'))).toBe(true);
    expect((await send(A, 'delete', `/api/students/${k1}`)).status).toBe(403); // the old owner can no longer delete
    expect((await send(B, 'delete', `/api/students/${k1}`)).status).toBe(200);
  });
});

describe('inviting a co-parent to every student', () => {
  it('shares everything you own, and gives the same answer whether or not the address has an account', async () => {
    const { env, A, k1, k2 } = await family();
    env.mailer.outbox.length = 0;
    const fresh = await send(A, 'post', '/api/me/invite-parent', { email: 'newparent@x.ca', role: 'owner', note: 'Welcome aboard', studentIds: [k1, k2] });
    expect([fresh.status, fresh.body]).toEqual([201, { ok: true }]);
    expect(roleOf(env, k1, 'newparent@x.ca')).toBe('owner');
    expect(roleOf(env, k2, 'newparent@x.ca')).toBe('owner');
    expect(env.mailer.outbox).toHaveLength(1); // one invitation with a sign-in link, not one per child
    expect(env.mailer.outbox[0]!.text).toContain('/verify');
    expect(env.mailer.outbox[0]!.text).toContain('> Welcome aboard');
    const existing = await send(A, 'post', '/api/me/invite-parent', { email: 'b@x.ca', studentIds: [k1, k2] });
    const admin = await send(A, 'post', '/api/me/invite-parent', { email: 'admin@x.ca', studentIds: [k1] });
    const self = await send(A, 'post', '/api/me/invite-parent', { email: 'a@x.ca', studentIds: [k1] });
    for (const res of [existing, admin, self]) expect([res.status, res.body]).toEqual([201, { ok: true }]);
    expect(roleOf(env, k1, 'b@x.ca')).toBe('co'); // the default role is helper
    expect(roleOf(env, k1, 'admin@x.ca')).toBeUndefined();
    expect(roleOf(env, k1, 'a@x.ca')).toBe('owner');
  });

  it('skips a child whose username clashes with one the person already has, and says nothing about it', async () => {
    const { env, A, C, k1, k2 } = await family();
    await create(C, 'sam'); // C already has a 'sam'
    const res = await send(A, 'post', '/api/me/invite-parent', { email: 'c@x.ca', studentIds: [k1, k2] });
    expect([res.status, res.body]).toEqual([201, { ok: true }]);
    expect(roleOf(env, k1, 'c@x.ca')).toBeUndefined(); // A's 'sam' clashes with C's 'sam'
    expect(roleOf(env, k2, 'c@x.ca')).toBe('co');
  });

  it('needs a student to share, and is limited per caregiver', async () => {
    const { A, B, k1 } = await family();
    expect((await send(B, 'post', '/api/me/invite-parent', { email: 'x@x.ca', studentIds: [k1] })).body.error).toBe('no_students'); // B has none of their own
    let last = 0;
    for (let i = 0; i < 12; i++) last = (await send(A, 'post', '/api/me/invite-parent', { email: `many${i}@x.ca`, studentIds: [k1] })).status;
    expect(last).toBe(429);
    expect((await send(A, 'post', '/api/me/invite-parent', { email: 'not-an-email', studentIds: [k1] })).status).toBe(400);
  });
});

describe('downloading an account', () => {
  it('holds only what the person can reach, with their role on each student', async () => {
    const { env, A, B, k1, k2, k3 } = await family();
    await send(A, 'post', `/api/students/${k1}/caregivers`, { email: 'b@x.ca' }).expect(201);
    await send(A, 'post', `/api/students/${k1}/messages`, { body: 'From A' }).expect(201);
    await send(B, 'post', `/api/students/${k1}/messages`, { body: 'From B' }).expect(201);
    env.db.prepare("INSERT INTO reward_event (student_id, at, kind, xp) VALUES (?, 1, 'answer', 5)").run(k2);
    const a = await send(A, 'get', '/api/me/export').expect(200);
    expect(a.headers['content-disposition']).toContain('attachment');
    expect(a.body.account.email).toBe('a@x.ca');
    expect(a.body.students.map((s: { role: string; student: { id: string } }) => `${s.student.id}:${s.role}`).sort()).toEqual([`${k1}:owner`, `${k2}:owner`].sort());
    expect(a.body.messagesSent.map((m: { body: string }) => m.body)).toEqual(['From A']);
    const text = JSON.stringify(a.body);
    expect(text).not.toContain(k3);
    expect(text).not.toContain('From B');
    expect(text).not.toContain('pin_hash');
    const b = await send(B, 'get', '/api/me/export').expect(200);
    expect(b.body.students.map((s: { role: string; student: { id: string } }) => `${s.student.id}:${s.role}`)).toEqual([`${k1}:co`]);
    expect(JSON.stringify(b.body)).not.toContain(k2);
    expect(b.body.messagesSent.map((m: { body: string }) => m.body)).toEqual(['From B']);
  });

  it('is for signed-in caregivers only, and is limited', async () => {
    const { env, A, X } = await family();
    expect((await request(env.app).get('/api/me/export')).status).toBe(401);
    expect((await send(X, 'get', '/api/me/export')).status).toBe(403);
    let last = 0;
    for (let i = 0; i < 7; i++) last = (await send(A, 'get', '/api/me/export')).status;
    expect(last).toBe(429);
  });
});

describe('deleting an account', () => {
  it('shows what would happen, and asks a sole owner of a shared student to hand it over first', async () => {
    const { env, A, B, k1, k2 } = await family();
    await send(A, 'post', `/api/students/${k1}/caregivers`, { email: 'b@x.ca' }).expect(201);
    const outcomes = async (c: Cg) => Object.fromEntries(((await send(c, 'get', '/api/me/delete-preview').expect(200)).body.students as { displayName: string; outcome: string }[]).map((s) => [s.displayName, s.outcome]));
    expect(await outcomes(A)).toEqual({ SAM: 'transfer-needed', MIA: 'deleted' });
    expect(await outcomes(B)).toEqual({ SAM: 'leave' });
    const refused = await send(A, 'post', '/api/me/delete', { confirm: 'a@x.ca' });
    expect([refused.status, refused.body.error, refused.body.students.map((s: { displayName: string }) => s.displayName)]).toEqual([409, 'transfer_needed', ['SAM']]);
    expect(count(env, 'SELECT COUNT(*) AS n FROM users WHERE delete_at IS NOT NULL')).toBe(0);
    await send(A, 'post', `/api/students/${k1}/transfer`, { caregiverId: uid(env, 'b@x.ca') }).expect(200);
    expect(await outcomes(A)).toEqual({ SAM: 'leave', MIA: 'deleted' });
    await send(A, 'patch', `/api/students/${k1}/caregivers/${uid(env, 'b@x.ca')}`, { role: 'co' }).expect(403); // (an old owner cannot demote the new one)
    void k2;
  });

  it('asks for your email as confirmation, waits, lets you cancel, and tells you', async () => {
    const { env, A, X, k2 } = await family();
    expect((await send(A, 'post', '/api/me/delete', { confirm: 'wrong@x.ca' })).body.error).toBe('confirm_email');
    expect((await send(A, 'post', '/api/me/delete', {})).status).toBe(400);
    env.mailer.outbox.length = 0;
    const res = await send(A, 'post', '/api/me/delete', { confirm: ' A@X.CA ' }).expect(200);
    expect(res.body.deleteAt).toBe(env.clock.t + DELETE_GRACE_MS);
    expect(DELETE_GRACE_MS).toBe(14 * 24 * 3600 * 1000); // the promise made in the email and on the page
    expect((await send(A, 'get', '/api/me')).body.user.deleteAt).toBe(res.body.deleteAt);
    expect(env.mailer.outbox[0]!.subject).toContain('will be deleted');
    expect(await purgeDueAccounts(env.db, env.ctx.cfg, env.mailer, env.clock.t + DELETE_GRACE_MS - 1)).toBe(0); // not yet
    expect(env.db.prepare('SELECT 1 FROM students WHERE id = ?').get(k2)).toBeTruthy();
    await send(A, 'post', '/api/me/delete/cancel').expect(200);
    expect((await send(A, 'get', '/api/me')).body.user.deleteAt).toBeNull();
    expect(await purgeDueAccounts(env.db, env.ctx.cfg, env.mailer, env.clock.t + DELETE_GRACE_MS + 1)).toBe(0); // cancelled
    for (const [m, u] of [['get', '/api/me/delete-preview'], ['post', '/api/me/delete/cancel'], ['post', '/api/me/invite-parent']] as const) expect((await send(X, m, u, m === 'post' ? { email: 'z@x.ca', studentIds: ['x'] } : undefined)).status, u).toBe(403);
    expect((await send(X, 'post', '/api/me/delete', { confirm: 'admin@x.ca' })).status).toBe(403); // the admin account is not deleted this way
    const shown = ((await send(X, 'get', '/api/admin/audit?limit=500').expect(200)).body.entries as { action: string }[]).map((e) => e.action);
    expect(shown).toEqual(expect.arrayContaining(['account.delete_requested', 'account.delete_cancelled']));
  });

  it('deletes the account and the students only they owned, and nothing of anyone else', async () => {
    const { env, A, B, C, X, k1, k2, k3 } = await family();
    await send(A, 'post', `/api/students/${k1}/caregivers`, { email: 'b@x.ca', role: 'owner' }).expect(201); // B owns K1 too
    await send(B, 'post', `/api/students/${k1}/goals`, { title: 'Pizza night', xpTarget: 100 }).expect(201);
    await send(A, 'post', `/api/students/${k1}/goals`, { title: 'Movie night', xpTarget: 100 }).expect(201);
    await send(A, 'post', `/api/students/${k1}/messages`, { body: 'From A' }).expect(201);
    await send(A, 'post', '/api/me/family-goals', { title: 'Family trip', xpTarget: 1000 }).expect(201);
    env.db.prepare("INSERT INTO mastery (student_id, skill_id, p_known) VALUES (?, 'MS.G5.B1.3.a', 0.5)").run(k2);
    env.db.prepare("INSERT INTO mastery (student_id, skill_id, p_known) VALUES (?, 'MS.G5.B1.3.a', 0.5)").run(k3);
    await send(A, 'post', '/api/me/delete', { confirm: 'a@x.ca' }).expect(200);
    const a = uid(env, 'a@x.ca'), b = uid(env, 'b@x.ca');
    const before = { c: count(env, 'SELECT COUNT(*) AS n FROM mastery WHERE student_id = ?', k3) };
    expect(await purgeDueAccounts(env.db, env.ctx.cfg, env.mailer, env.clock.t + DELETE_GRACE_MS + 1)).toBe(1);
    // gone: the account, its sole-owner student and what hung off them
    expect(env.db.prepare('SELECT 1 FROM users WHERE id = ?').get(a)).toBeUndefined();
    expect(env.db.prepare('SELECT 1 FROM students WHERE id = ?').get(k2)).toBeUndefined();
    expect(count(env, 'SELECT COUNT(*) AS n FROM mastery WHERE student_id = ?', k2)).toBe(0);
    expect(count(env, 'SELECT COUNT(*) AS n FROM family_goal WHERE user_id = ?', a)).toBe(0);
    expect(count(env, 'SELECT COUNT(*) AS n FROM student_message WHERE from_user = ?', a)).toBe(0);
    // kept: the student B also owns, with their goals, now attributed to B; everyone else untouched
    const k = env.db.prepare('SELECT created_by FROM students WHERE id = ?').get(k1) as { created_by: string };
    expect(k.created_by).toBe(b);
    expect((env.db.prepare('SELECT DISTINCT created_by FROM goal WHERE student_id = ?').all(k1) as { created_by: string }[]).map((g) => g.created_by)).toEqual([b]);
    expect(roleOf(env, k1, 'b@x.ca')).toBe('owner');
    expect((await send(B, 'get', `/api/students/${k1}/goals`).expect(200)).body.goals).toHaveLength(2);
    expect(count(env, 'SELECT COUNT(*) AS n FROM mastery WHERE student_id = ?', k3)).toBe(before.c);
    expect((await send(C, 'get', '/api/students').expect(200)).body.students).toHaveLength(1);
    expect(env.db.pragma('foreign_key_check')).toEqual([]);
    expect((await request(env.app).get('/api/me').set('Cookie', A.agent.jar?.getCookies?.({ domain: '', path: '/', secure: false, script: false } as never)?.toString() ?? '')).status).toBeLessThan(500);
    // sign-in no longer works for the deleted address, and the admin's log has no id that leads back to it
    env.mailer.outbox.length = 0;
    await request(env.app).post('/api/auth/magic').send({ email: 'a@x.ca' }).expect(202);
    expect(env.mailer.outbox).toHaveLength(0);
    const log = (env.db.prepare("SELECT target, actor_id FROM audit_log WHERE action = 'account.deleted'").all() as { target: string; actor_id: string | null }[]);
    expect(log).toHaveLength(1);
    expect(log[0]!.target).not.toBe(a);
    expect(log[0]!.actor_id).toBeNull();
    void X;
  });

  it('cancels the deletion instead, and says so, if helpers were added to a student during the waiting period', async () => {
    const { env, A, k2 } = await family();
    await send(A, 'post', '/api/me/delete', { confirm: 'a@x.ca' }).expect(200);
    await send(A, 'post', `/api/students/${k2}/caregivers`, { email: 'b@x.ca' }).expect(201);
    env.mailer.outbox.length = 0;
    expect(await purgeDueAccounts(env.db, env.ctx.cfg, env.mailer, env.clock.t + DELETE_GRACE_MS + 1)).toBe(0);
    expect(env.db.prepare('SELECT 1 FROM users WHERE email = ?').get('a@x.ca')).toBeTruthy();
    expect(env.db.prepare('SELECT 1 FROM students WHERE id = ?').get(k2)).toBeTruthy();
    expect(count(env, 'SELECT COUNT(*) AS n FROM users WHERE delete_at IS NOT NULL')).toBe(0);
    expect(env.mailer.outbox[0]!.subject).toContain('was not deleted');
    expect(env.mailer.outbox[0]!.text).toContain('MIA');
  });

  it('removes a helper from the students they were on without touching those students', async () => {
    const { env, A, B, k1 } = await family();
    await send(A, 'post', `/api/students/${k1}/caregivers`, { email: 'b@x.ca' }).expect(201);
    await send(B, 'post', `/api/students/${k1}/messages`, { body: 'From B' }).expect(201);
    await send(B, 'post', '/api/me/delete', { confirm: 'b@x.ca' }).expect(200);
    expect(await purgeDueAccounts(env.db, env.ctx.cfg, env.mailer, env.clock.t + DELETE_GRACE_MS + 1)).toBe(1);
    expect(env.db.prepare('SELECT 1 FROM users WHERE email = ?').get('b@x.ca')).toBeUndefined();
    expect(roleOf(env, k1, 'a@x.ca')).toBe('owner');
    expect(count(env, 'SELECT COUNT(*) AS n FROM student_message WHERE student_id = ?', k1)).toBe(0); // their messages go with them
    expect(env.db.pragma('foreign_key_check')).toEqual([]);
  });
});
