import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { addUser, makeEnv, signIn } from './helpers.js';

// The first-sign-in welcome for a caregiver who was invited to students: shown once, only about the caller's own invitations.

type Cg = Awaited<ReturnType<typeof signIn>>;
const send = (c: Cg, method: 'get' | 'post' | 'delete', url: string, body?: object) => {
  const r = c.agent[method](url).set('x-csrf-token', c.csrf);
  return body ? r.send(body) : r;
};
type Welcome = { show: boolean; invitedBy: string[]; students: { id: string; displayName: string; grade: number; role: string }[] };
const welcome = async (c: Cg): Promise<Welcome> => (await send(c, 'get', '/api/me/welcome').expect(200)).body;
const uid = (env: ReturnType<typeof makeEnv>, email: string): string => (env.db.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: string }).id;

async function world() {
  const env = makeEnv();
  for (const e of ['a@x.ca', 'b@x.ca', 'c@x.ca', 'd@x.ca']) addUser(env, e);
  addUser(env, 'admin@x.ca', 'admin');
  const [A, B, C, D, X] = [await signIn(env, 'a@x.ca'), await signIn(env, 'b@x.ca'), await signIn(env, 'c@x.ca'), await signIn(env, 'd@x.ca'), await signIn(env, 'admin@x.ca')];
  const mk = async (c: Cg, name: string, grade = 5) => (await send(c, 'post', '/api/students', { displayName: name.toUpperCase(), username: name, pin: '1234', grade }).expect(201)).body.id as string;
  return { env, A, B, C, D, X, mk };
}

describe('first-sign-in welcome', () => {
  it('is empty for a caregiver who only has their own students', async () => {
    const { A, mk } = await world();
    await mk(A, 'sam');
    expect(await welcome(A)).toEqual({ show: false, invitedBy: [], students: [] });
  });

  it('tells an invited caregiver who shared which students, in which role, and is shown only until they have seen it', async () => {
    const { env, A, B, mk } = await world();
    const sam = await mk(A, 'sam', 5), mia = await mk(A, 'mia', 7);
    await send(A, 'post', `/api/students/${sam}/caregivers`, { email: 'b@x.ca', role: 'owner' }).expect(201);
    await send(A, 'post', `/api/students/${mia}/caregivers`, { email: 'b@x.ca' }).expect(201);
    const w = await welcome(B);
    expect(w.show).toBe(true);
    expect(w.invitedBy).toEqual(['a@x.ca']);
    expect(w.students.map((s) => `${s.displayName}:${s.grade}:${s.role}`)).toEqual(['SAM:5:owner', 'MIA:7:co']);
    expect((await send(B, 'get', '/api/tours').expect(200)).body.welcomePending).toBe(true); // the walkthrough waits for the welcome
    await send(B, 'post', '/api/tours/welcome/complete', {}).expect(200);
    expect((await welcome(B)).show).toBe(false);
    expect((await send(B, 'get', '/api/tours').expect(200)).body.welcomePending).toBeUndefined();
    expect((env.db.prepare("SELECT COUNT(*) AS n FROM tour_seen WHERE tour = 'welcome'").get() as { n: number }).n).toBe(1);
    expect((await send(B, 'get', '/api/tours').expect(200)).body.done).toContain('caregiver'); // the welcome stands in for the first-run walkthrough
  });

  it('works for "invite a co-parent" (every student at once) and names each inviter once', async () => {
    const { A, B, C, mk } = await world();
    const sam = await mk(A, 'sam'), mia = await mk(A, 'mia'), zoe = await mk(C, 'zoe');
    await send(A, 'post', '/api/me/invite-parent', { email: 'new@x.ca', role: 'owner', studentIds: [sam, mia] }).expect(201);
    await send(C, 'post', '/api/me/invite-parent', { email: 'b@x.ca', studentIds: [zoe] }).expect(201);
    await send(A, 'post', '/api/me/invite-parent', { email: 'b@x.ca', studentIds: [sam, mia] }).expect(201);
    const w = await welcome(B);
    expect(w.invitedBy.sort()).toEqual(['a@x.ca', 'c@x.ca']);
    expect(w.students.map((s) => s.displayName).sort()).toEqual(['MIA', 'SAM', 'ZOE']);
  });

  it('does not show a student the caregiver was removed from, nor anyone else\'s students', async () => {
    const { env, A, B, C, mk } = await world();
    const sam = await mk(A, 'sam');
    await mk(C, 'zoe');
    await send(A, 'post', `/api/students/${sam}/caregivers`, { email: 'b@x.ca' }).expect(201);
    expect((await welcome(B)).students.map((s) => s.displayName)).toEqual(['SAM']);
    await send(A, 'delete', `/api/students/${sam}/caregivers/${uid(env, 'b@x.ca')}`).expect(200);
    expect(await welcome(B)).toEqual({ show: false, invitedBy: [], students: [] });
  });

  it('answers only for the signed-in caregiver: signed-out visitors and the admin get nothing', async () => {
    const { env, X } = await world();
    expect((await request(env.app).get('/api/me/welcome')).status).toBe(401);
    expect((await send(X, 'get', '/api/me/welcome')).status).toBe(403);
    expect((await send(X, 'get', '/api/tours').expect(200)).body.welcomePending).toBeUndefined();
  });

  it('only lets a caregiver mark the welcome as seen for themselves, and the walkthrough list is unchanged', async () => {
    const { env, A, mk } = await world();
    await mk(A, 'sam');
    await send(A, 'post', '/api/tours/welcome/complete', {}).expect(200);
    await send(A, 'post', '/api/tours/nonsense/complete', {}).expect(404);
    expect((env.db.prepare("SELECT subject_kind, subject_id FROM tour_seen WHERE tour = 'welcome'").all() as { subject_kind: string; subject_id: string }[])).toEqual([{ subject_kind: 'user', subject_id: uid(env, 'a@x.ca') }]);
  });
});
