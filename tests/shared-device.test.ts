import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { makeEnv, makeStudent, addUser, signIn } from './helpers.js';

// Brothers and sisters can share one approved device: it lists the caregiver's children, a child taps their tile and types their PIN,
// and where there is more than one child a sign-in ends after 20 minutes without use, so the next child lands on the picker.

const MIN = 60_000;

async function family() {
  const env = makeEnv();
  const a = await makeStudent(env, { username: 'sam_a' });
  const b = (await a.cg.agent.post('/api/students').set('x-csrf-token', a.cg.csrf).send({ displayName: 'Jo', username: 'jo_b', pin: '5678', grade: 7 }).expect(201)).body.id as string;
  await a.agent.post('/api/auth/student').send({ username: 'sam_a', pin: '1234' }).expect(200); // signed in again now there are two children
  return { env, a, b };
}

describe('the "who is practising?" list', () => {
  it('names the caregiver\'s children, by first name and avatar, to an approved device', async () => {
    const { a, b } = await family();
    const res = await a.agent.get('/api/devices/students').expect(200);
    expect(res.body.students.map((s: { name: string }) => s.name).sort()).toEqual(['Jo', 'Kid']);
    expect(res.body.students.find((s: { id: string }) => s.id === b)).toMatchObject({ name: 'Jo', avatar: 'avatar-fox', frame: 'frame-none' });
    // nothing that would help someone get in: no username, PIN, grade or email
    expect(JSON.stringify(res.body)).not.toMatch(/sam_a|jo_b|pin|@|grade|email/i);
  });

  it('is shown only to an approved device, never to a new browser, a made-up cookie or a removed device', async () => {
    const { env, a } = await family();
    await request(env.app).get('/api/devices/students').expect(403);
    await request(env.app).get('/api/devices/students').set('Cookie', 'mq_device=nonsense').expect(403);
    const list = await a.cg.agent.get('/api/devices').expect(200);
    await a.cg.agent.delete(`/api/devices/${list.body.devices[0].id}`).set('x-csrf-token', a.cg.csrf).expect(200);
    await a.agent.get('/api/devices/students').expect(403);
  });

  it('lists only the children of the caregiver who approved that device', async () => {
    const { env, a } = await family();
    const other = await makeStudent(env, { username: 'zed_z' });
    const mine = (await a.agent.get('/api/devices/students').expect(200)).body.students.map((s: { name: string }) => s.name);
    const theirs = (await other.agent.get('/api/devices/students').expect(200)).body.students.map((s: { name: string }) => s.name);
    expect(mine).toHaveLength(2);
    expect(theirs).toEqual(['Kid']);
  });

  it('limits how often it can be asked for', async () => {
    const { a } = await family();
    for (let i = 0; i < 60; i++) await a.agent.get('/api/devices/students').expect(200);
    await a.agent.get('/api/devices/students').expect(429);
  });
});

describe('signing in from a tile', () => {
  it('signs in with the child\'s id and PIN, the same as with a username', async () => {
    const { env, a, b } = await family();
    const device = request.agent(env.app);
    const code = (await device.post('/api/devices/request').expect(201)).body.code as string;
    await a.cg.agent.post('/api/devices/approve').set('x-csrf-token', a.cg.csrf).send({ code }).expect(200);
    await device.get('/api/devices/status').expect(200);
    const res = await device.post('/api/auth/student').send({ studentId: b, pin: '5678' }).expect(200);
    expect(res.body.student.displayName).toBe('Jo');
    expect((await device.get('/api/me').expect(200)).body.student.displayName).toBe('Jo');
  });

  it('counts a wrong PIN and locks the same way, whichever way the child was named', async () => {
    const { env, a, b } = await family();
    const device = request.agent(env.app);
    const code = (await device.post('/api/devices/request').expect(201)).body.code as string;
    await a.cg.agent.post('/api/devices/approve').set('x-csrf-token', a.cg.csrf).send({ code }).expect(200);
    await device.get('/api/devices/status').expect(200);
    for (let i = 0; i < 4; i++) await device.post('/api/auth/student').send({ studentId: b, pin: '0000' }).expect(401);
    await device.post('/api/auth/student').send({ username: 'jo_b', pin: '0000' }).expect(429); // the fifth miss, by username, locks the same child
    await device.post('/api/auth/student').send({ studentId: b, pin: '5678' }).expect(429);
  });

  it('refuses another family\'s child, an unknown id, a missing name and both at once', async () => {
    const { env, a } = await family();
    const stranger = await makeStudent(env, { username: 'zed_z' });
    await a.agent.post('/api/auth/student').send({ studentId: stranger.studentId, pin: '1234' }).expect(401);
    await a.agent.post('/api/auth/student').send({ studentId: 'does-not-exist', pin: '1234' }).expect(401);
    await a.agent.post('/api/auth/student').send({ pin: '1234' }).expect(400);
    await a.agent.post('/api/auth/student').send({ studentId: stranger.studentId, username: 'sam_a', pin: '1234' }).expect(400);
    await request(env.app).post('/api/auth/student').send({ studentId: stranger.studentId, pin: '1234' }).expect(403); // no approved device
  });
});

describe('signing out after a spell of no use', () => {
  it('ends a sign-in after 20 minutes unused when the caregiver has more than one child, and keeps one that is in use', async () => {
    const { env, a } = await family();
    expect((await a.agent.get('/api/me').expect(200)).body.idleMinutes).toBe(20);
    env.clock.t += 15 * MIN;
    await a.agent.get('/api/me').expect(200); // in use: the clock for no use starts again
    env.clock.t += 15 * MIN;
    await a.agent.get('/api/me').expect(200);
    env.clock.t += 21 * MIN;
    await a.agent.get('/api/me').expect(401);
    expect((env.db.prepare("SELECT COUNT(*) AS n FROM sessions WHERE kind = 'student' AND idle_ms IS NOT NULL").get() as { n: number }).n).toBe(0);
  });

  it('signs back in with the same device and PIN, without a new code', async () => {
    const { env, a } = await family();
    env.clock.t += 25 * MIN;
    await a.agent.get('/api/me').expect(401);
    expect((await a.agent.get('/api/devices/status')).body.state).toBe('approved');
    await a.agent.post('/api/auth/student').send({ username: 'sam_a', pin: '1234' }).expect(200);
    await a.agent.get('/api/me').expect(200);
  });

  it('does not apply to a caregiver with one child, who stays signed in as before', async () => {
    const env = makeEnv();
    const s = await makeStudent(env);
    expect((await s.agent.get('/api/me').expect(200)).body.idleMinutes).toBeNull();
    env.clock.t += 5 * 3_600_000;
    await s.agent.get('/api/me').expect(200);
  });

  it('never touches a caregiver\'s own sign-in', async () => {
    const { env, a } = await family();
    env.clock.t += 40 * MIN;
    await a.cg.agent.get('/api/me').expect(200);
    void addUser; void signIn;
  });
});
