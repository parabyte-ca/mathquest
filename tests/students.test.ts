import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { addUser, makeEnv, signIn, type TestEnv } from './helpers.js';

type Agent = ReturnType<typeof request.agent>;

async function createStudent(cg: { agent: Agent; csrf: string }, username = 'kid_one', pin = '1234'): Promise<string> {
  const res = await cg.agent.post('/api/students').set('x-csrf-token', cg.csrf).send({ displayName: 'Kid', username, pin, grade: 5 }).expect(201);
  return res.body.id as string;
}

/** Pairs a fresh "student device" through the real code flow, approved by the given caregiver. */
async function pairDevice(env: TestEnv, cg: { agent: Agent; csrf: string }): Promise<Agent> {
  const device = request.agent(env.app);
  const code = (await device.post('/api/devices/request').expect(201)).body.code as string;
  expect((await device.get('/api/devices/status')).body.state).toBe('pending');
  await cg.agent.post('/api/devices/approve').set('x-csrf-token', cg.csrf).send({ code, label: 'Tablet' }).expect(200);
  expect((await device.get('/api/devices/status')).body.state).toBe('approved');
  return device;
}

describe('student PIN login on approved devices', () => {
  it('rejects login from an unapproved device', async () => {
    const env = makeEnv();
    addUser(env, 'a@example.com');
    const cg = await signIn(env, 'a@example.com');
    await createStudent(cg);
    await request(env.app).post('/api/auth/student').send({ username: 'kid_one', pin: '1234' }).expect(403);
  });

  it('logs in on an approved device and returns only safe fields', async () => {
    const env = makeEnv();
    addUser(env, 'a@example.com');
    const cg = await signIn(env, 'a@example.com');
    await createStudent(cg);
    const device = await pairDevice(env, cg);
    const res = await device.post('/api/auth/student').send({ username: 'kid_one', pin: '1234' }).expect(200);
    expect(res.body.student.username).toBe('kid_one');
    expect(JSON.stringify(res.body)).not.toMatch(/pin_hash|s1\$/);
    const me = await device.get('/api/me').expect(200);
    expect(me.body.kind).toBe('student');
  });

  it('uses a pairing code once and expires it after 10 minutes', async () => {
    const env = makeEnv();
    addUser(env, 'a@example.com');
    const cg = await signIn(env, 'a@example.com');
    const device = request.agent(env.app);
    const code = (await device.post('/api/devices/request').expect(201)).body.code as string;
    env.clock.t += 10 * 60_000 + 1000;
    await cg.agent.post('/api/devices/approve').set('x-csrf-token', cg.csrf).send({ code }).expect(404);
    expect((await device.get('/api/devices/status')).body.state).toBe('expired');
  });

  it('locks out after five wrong PINs, emails the caregiver, then recovers', async () => {
    const env = makeEnv();
    addUser(env, 'a@example.com');
    const cg = await signIn(env, 'a@example.com');
    await createStudent(cg);
    const device = await pairDevice(env, cg);
    env.mailer.outbox.length = 0;
    for (let i = 0; i < 4; i++) await device.post('/api/auth/student').send({ username: 'kid_one', pin: '9999' }).expect(401);
    await device.post('/api/auth/student').send({ username: 'kid_one', pin: '9999' }).expect(429);
    expect(env.mailer.outbox.some((m) => m.to === 'a@example.com' && /locked/i.test(m.subject))).toBe(true);
    await device.post('/api/auth/student').send({ username: 'kid_one', pin: '1234' }).expect(429); // even the right PIN
    env.clock.t += 15 * 60_000 + 1000;
    await device.post('/api/auth/student').send({ username: 'kid_one', pin: '1234' }).expect(200);
  });

  it('does not reveal whether a username exists', async () => {
    const env = makeEnv();
    addUser(env, 'a@example.com');
    const cg = await signIn(env, 'a@example.com');
    await createStudent(cg);
    const device = await pairDevice(env, cg);
    const real = await device.post('/api/auth/student').send({ username: 'kid_one', pin: '0000' });
    const fake = await device.post('/api/auth/student').send({ username: 'no_such', pin: '0000' });
    expect(real.status).toBe(fake.status);
    expect(real.body.error).toBe(fake.body.error);
  });

  it("does not let one caregiver's device sign in another caregiver's student", async () => {
    const env = makeEnv();
    addUser(env, 'a@example.com');
    addUser(env, 'b@example.com');
    const a = await signIn(env, 'a@example.com');
    const b = await signIn(env, 'b@example.com');
    await createStudent(a, 'a_kid');
    const deviceOfB = await pairDevice(env, b);
    await deviceOfB.post('/api/auth/student').send({ username: 'a_kid', pin: '1234' }).expect(401);
  });

  it('stops working when the caregiver revokes the device', async () => {
    const env = makeEnv();
    addUser(env, 'a@example.com');
    const cg = await signIn(env, 'a@example.com');
    await createStudent(cg);
    const device = await pairDevice(env, cg);
    const list = await cg.agent.get('/api/devices').expect(200);
    await cg.agent.delete(`/api/devices/${list.body.devices[0].id}`).set('x-csrf-token', cg.csrf).expect(200);
    await device.post('/api/auth/student').send({ username: 'kid_one', pin: '1234' }).expect(403);
  });
});

describe('caregiver access and sharing', () => {
  it('shows each caregiver only their own students', async () => {
    const env = makeEnv();
    addUser(env, 'a@example.com');
    addUser(env, 'b@example.com');
    const a = await signIn(env, 'a@example.com');
    const b = await signIn(env, 'b@example.com');
    const id = await createStudent(a, 'a_kid');
    expect((await b.agent.get('/api/students')).body.students).toHaveLength(0);
    await b.agent.get(`/api/students/${id}/export`).expect(404);
    await b.agent.patch(`/api/students/${id}`).set('x-csrf-token', b.csrf).send({ grade: 6 }).expect(404);
    await b.agent.delete(`/api/students/${id}`).set('x-csrf-token', b.csrf).expect(404);
  });

  it('shares a student with a co-caregiver who can manage but not delete', async () => {
    const env = makeEnv();
    addUser(env, 'a@example.com');
    addUser(env, 'b@example.com');
    const a = await signIn(env, 'a@example.com');
    const b = await signIn(env, 'b@example.com');
    const id = await createStudent(a, 'shared_kid');
    await a.agent.post(`/api/students/${id}/caregivers`).set('x-csrf-token', a.csrf).send({ email: 'b@example.com' }).expect(201);
    expect((await b.agent.get('/api/students')).body.students).toHaveLength(1);
    await b.agent.patch(`/api/students/${id}`).set('x-csrf-token', b.csrf).send({ grade: 6 }).expect(200);
    await b.agent.delete(`/api/students/${id}`).set('x-csrf-token', b.csrf).expect(403);
    await b.agent.post(`/api/students/${id}/caregivers`).set('x-csrf-token', b.csrf).send({ email: 'c@example.com' }).expect(403);
    await a.agent.delete(`/api/students/${id}/caregivers/${(env.db.prepare('SELECT id FROM users WHERE email = ?').get('b@example.com') as { id: string }).id}`).set('x-csrf-token', a.csrf).expect(200);
    expect((await b.agent.get('/api/students')).body.students).toHaveLength(0);
  });

  it('invites an unknown co-caregiver by email', async () => {
    const env = makeEnv();
    addUser(env, 'a@example.com');
    const a = await signIn(env, 'a@example.com');
    const id = await createStudent(a);
    env.mailer.outbox.length = 0;
    const res = await a.agent.post(`/api/students/${id}/caregivers`).set('x-csrf-token', a.csrf).send({ email: 'new@example.com' }).expect(201);
    expect(res.body).toEqual({ ok: true }); // the same answer whether or not the address had an account
    expect(env.mailer.outbox[0]!.to).toBe('new@example.com');
  });

  it('exports and deletes a student, including their data', async () => {
    const env = makeEnv();
    addUser(env, 'a@example.com');
    const a = await signIn(env, 'a@example.com');
    const id = await createStudent(a);
    env.db.prepare('INSERT INTO attempt (student_id, skill_id, tier, correct, at) VALUES (?,?,?,?,?)').run(id, 'MS.G5.B1.3.a', 1, 1, 1);
    const exp = await a.agent.get(`/api/students/${id}/export`).expect(200);
    expect(exp.body.attempts).toHaveLength(1);
    expect(JSON.stringify(exp.body)).not.toMatch(/pin_hash/);
    await a.agent.delete(`/api/students/${id}`).set('x-csrf-token', a.csrf).expect(200);
    expect(env.db.prepare('SELECT COUNT(*) AS n FROM attempt').get()).toEqual({ n: 0 });
    expect(env.db.prepare('SELECT COUNT(*) AS n FROM students').get()).toEqual({ n: 0 });
  });

  it('stores only the minimal student fields', async () => {
    const env = makeEnv();
    const cols = (env.db.prepare('PRAGMA table_info(students)').all() as { name: string }[]).map((c) => c.name);
    expect(cols.filter((c) => /email|birth|dob|photo|address|phone/i.test(c))).toEqual([]);
  });

  it('validates input', async () => {
    const env = makeEnv();
    addUser(env, 'a@example.com');
    const a = await signIn(env, 'a@example.com');
    const bad = [
      { displayName: '', username: 'kid_one', pin: '1234', grade: 5 },
      { displayName: 'K', username: 'x', pin: '1234', grade: 5 },
      { displayName: 'K', username: 'kid_one', pin: '12345', grade: 5 },
      { displayName: 'K', username: 'kid_one', pin: '1234', grade: 13 },
    ];
    for (const b of bad) await a.agent.post('/api/students').set('x-csrf-token', a.csrf).send(b).expect(400);
    await createStudent(a, 'dup_kid');
    await a.agent.post('/api/students').set('x-csrf-token', a.csrf).send({ displayName: 'K', username: 'DUP_KID', pin: '1234', grade: 5 }).expect(409);
  });
});
