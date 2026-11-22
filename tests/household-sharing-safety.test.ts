import { describe, it, expect } from 'vitest';
import { addUser, makeEnv, signIn } from './helpers.js';

// An invited caregiver reaches exactly the students that were named, and no others; every other owner is told when a student is shared;
// the admin sees how many students an account has, never which.

type Cg = Awaited<ReturnType<typeof signIn>>;
const send = (c: Cg, method: 'get' | 'post' | 'patch' | 'delete', url: string, body?: object) => {
  const r = c.agent[method](url).set('x-csrf-token', c.csrf);
  return body ? r.send(body) : r;
};
async function world() {
  const env = makeEnv();
  for (const e of ['a@x.ca', 'b@x.ca', 'c@x.ca']) addUser(env, e);
  addUser(env, 'admin@x.ca', 'admin');
  const [A, B, C, X] = [await signIn(env, 'a@x.ca'), await signIn(env, 'b@x.ca'), await signIn(env, 'c@x.ca'), await signIn(env, 'admin@x.ca')];
  const mk = async (c: Cg, name: string) => (await send(c, 'post', '/api/students', { displayName: name.toUpperCase(), username: name, pin: '1234', grade: 5 }).expect(201)).body.id as string;
  const sam = await mk(A, 'sam'), mia = await mk(A, 'mia'), zoe = await mk(C, 'zoe');
  return { env, A, B, C, X, sam, mia, zoe };
}
const users = (env: ReturnType<typeof makeEnv>, email: string): number => (env.db.prepare('SELECT COUNT(*) AS n FROM users WHERE email = ?').get(email) as { n: number }).n;
const READ = ['dashboard', 'goals', 'messages', 'activity', 'caregivers', 'export', 'worksheet/options'];

describe('inviting a co-parent shares only the students that are named', () => {
  it('gives the invited caregiver the ticked students and none of the others, on every route', async () => {
    const { A, B, sam, mia } = await world();
    await send(A, 'post', '/api/me/invite-parent', { email: 'b@x.ca', studentIds: [sam] }).expect(201);
    for (const p of READ) expect((await send(B, 'get', `/api/students/${sam}/${p}`)).status, `sam ${p}`).toBe(200);
    for (const p of READ) expect((await send(B, 'get', `/api/students/${mia}/${p}`)).status, `mia ${p}`).toBe(404);
    expect((await send(B, 'get', '/api/students').expect(200)).body.students.map((s: { id: string }) => s.id)).toEqual([sam]);
    expect((await send(B, 'post', `/api/students/${mia}/messages`, { body: 'hi' })).status).toBe(404);
    expect((await send(B, 'patch', `/api/students/${mia}`, { displayName: 'X' })).status).toBe(404);
  });

  it('shares nothing, and creates no account, when the list is missing, empty or names a student that is not the caller\'s', async () => {
    const { env, A, B, sam, zoe } = await world();
    await send(A, 'post', `/api/students/${sam}/caregivers`, { email: 'b@x.ca' }).expect(201); // B is a helper on Sam
    const bad: object[] = [{ email: 'n@x.ca' }, { email: 'n@x.ca', studentIds: [] }, { email: 'n@x.ca', studentIds: 'all' }];
    for (const body of bad) expect((await send(A, 'post', '/api/me/invite-parent', body)).status, JSON.stringify(body)).toBe(400);
    expect((await send(A, 'post', '/api/me/invite-parent', { email: 'n@x.ca', studentIds: [zoe] })).status).toBe(404); // another household's student
    expect((await send(A, 'post', '/api/me/invite-parent', { email: 'n@x.ca', studentIds: ['nope'] })).status).toBe(404);
    expect((await send(A, 'post', '/api/me/invite-parent', { email: 'n@x.ca', studentIds: [sam, zoe] })).status).toBe(404); // one bad id spoils the whole request
    expect(users(env, 'n@x.ca')).toBe(0);
    // a helper cannot pass on a student they only help with, singly or in a list
    await send(B, 'post', `/api/students/${sam}/caregivers`, { email: 'n@x.ca' }).expect(403);
    expect((await send(B, 'post', '/api/me/invite-parent', { email: 'n@x.ca', studentIds: [sam] })).status).toBe(409); // B owns nothing
    expect(users(env, 'n@x.ca')).toBe(0);
    expect((env.db.prepare('SELECT COUNT(*) AS n FROM student_caregivers WHERE student_id = ?').get(zoe) as { n: number }).n).toBe(1);
  });
});

describe('the other owners are told when a student is shared', () => {
  it('emails each other owner, once, with the address and the students, and not the sharer or the person added', async () => {
    const { env, A, B, sam, mia } = await world();
    await send(A, 'post', `/api/students/${sam}/caregivers`, { email: 'b@x.ca', role: 'owner' }).expect(201);
    await send(A, 'post', `/api/students/${mia}/caregivers`, { email: 'b@x.ca', role: 'owner' }).expect(201);
    env.mailer.outbox.length = 0;
    await send(A, 'post', '/api/me/invite-parent', { email: 'new@x.ca', studentIds: [sam, mia] }).expect(201);
    const told = env.mailer.outbox.filter((m) => m.subject.includes('A student you own was shared'));
    expect(told.map((m) => m.to)).toEqual(['b@x.ca']); // one email, to the other owner
    expect(told[0]!.text).toContain('new@x.ca');
    expect(told[0]!.text).toContain('MIA, SAM');
    expect(told[0]!.text).toContain('a helper');
    expect(env.mailer.outbox.some((m) => m.to === 'new@x.ca')).toBe(true); // the invitation itself
    env.mailer.outbox.length = 0;
    // sharing one student the ordinary way tells the other owner too
    await send(B, 'post', `/api/students/${sam}/caregivers`, { email: 'c@x.ca', role: 'owner' }).expect(201);
    const told2 = env.mailer.outbox.filter((m) => m.subject.includes('A student you own was shared'));
    expect(told2.map((m) => m.to)).toEqual(['a@x.ca']);
    expect(told2[0]!.text).toContain('as an owner');
  });

  it('says nothing when the student has no other owner, or when nothing was added', async () => {
    const { env, A, sam } = await world();
    env.mailer.outbox.length = 0;
    await send(A, 'post', `/api/students/${sam}/caregivers`, { email: 'b@x.ca' }).expect(201);
    expect(env.mailer.outbox.filter((m) => m.subject.includes('you own was shared'))).toHaveLength(0);
    await send(A, 'post', `/api/students/${sam}/caregivers`, { email: 'b@x.ca' }).expect(201); // already on it
    expect(env.mailer.outbox.filter((m) => m.subject.includes('you own was shared'))).toHaveLength(0);
  });
});

describe('what the admin sees of the links', () => {
  it('is how many students each account owns and helps with, and nothing that names or identifies a student', async () => {
    const { A, B, X, sam, mia, zoe } = await world();
    await send(A, 'post', `/api/students/${sam}/caregivers`, { email: 'b@x.ca' }).expect(201);
    const body = (await send(X, 'get', '/api/admin/users').expect(200)).body;
    const byEmail = Object.fromEntries((body.users as { email: string; owns: number; helps: number }[]).map((u) => [u.email, `${u.owns}/${u.helps}`]));
    expect(byEmail).toMatchObject({ 'a@x.ca': '2/0', 'b@x.ca': '0/1', 'c@x.ca': '1/0', 'admin@x.ca': '0/0' });
    const text = JSON.stringify(body);
    for (const secret of [sam, mia, zoe, 'SAM', 'MIA', 'ZOE']) expect(text, secret).not.toContain(secret);
    expect((await send(B, 'get', '/api/admin/users')).status).toBe(403);
  });
});
