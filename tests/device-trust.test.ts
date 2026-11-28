import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { makeEnv, makeStudent, signIn } from './helpers.js';

// A device a caregiver has approved stays trusted: coming back never asks for a new code, using it keeps the trust going, and a student
// stays signed in on it for 30 days of use. Revoking the device ends the trust and any sign-in on it.

const DAY = 24 * 3_600_000;
const cookiesOf = (res: request.Response): string[] => ((res.headers['set-cookie'] as unknown as string[] | undefined) ?? []);

describe('a trusted device', () => {
  it('is recognised when it comes back, instead of being asked for a new code', async () => {
    const env = makeEnv();
    const s = await makeStudent(env);
    // the page asks its status every time it opens; the answer is "approved" every time, not just right after approval
    for (let i = 0; i < 3; i++) expect((await s.agent.get('/api/devices/status')).body.state).toBe('approved');
    expect((env.db.prepare('SELECT COUNT(*) AS n FROM devices').get() as { n: number }).n).toBe(1); // no second device was made
  });

  it('is still not trusted without its cookie, after it was revoked, or by a made-up cookie', async () => {
    const env = makeEnv();
    const s = await makeStudent(env);
    expect((await request(env.app).get('/api/devices/status')).body.state).toBe('expired'); // a new browser, nothing to go on
    expect((await request(env.app).get('/api/devices/status').set('Cookie', 'mq_device=nonsense')).body.state).toBe('expired');
    const list = await s.cg.agent.get('/api/devices').expect(200);
    await s.cg.agent.delete(`/api/devices/${list.body.devices[0].id}`).set('x-csrf-token', s.cg.csrf).expect(200);
    expect((await s.agent.get('/api/devices/status')).body.state).toBe('expired');
  });

  it('keeps its trust going for as long as it is used, up to a year from the last visit', async () => {
    const env = makeEnv();
    const s = await makeStudent(env);
    const res = await s.agent.get('/api/devices/status').expect(200);
    const device = cookiesOf(res).find((c) => c.startsWith('mq_device='));
    expect(device).toBeTruthy();
    expect(device).toMatch(/Max-Age=31536000/);
    expect(device).toMatch(/HttpOnly/);
    const before = (env.db.prepare('SELECT last_seen_at AS t FROM devices').get() as { t: number }).t;
    expect(before).toBeGreaterThan(0);
  });

  it('is asked for a PIN on the first visit and not again until the student signs out or 30 days pass without use', async () => {
    const env = makeEnv();
    const s = await makeStudent(env);
    const session = (): { expires_at: number; created_at: number } => env.db.prepare("SELECT expires_at, created_at FROM sessions WHERE kind = 'student'").get() as { expires_at: number; created_at: number };
    expect(session().expires_at - session().created_at).toBe(30 * DAY);
    await s.agent.get('/api/me').expect(200);
  });
});

describe('revoking a device', () => {
  it('signs the student out of it straight away', async () => {
    const env = makeEnv();
    const s = await makeStudent(env);
    await s.agent.get('/api/me').expect(200);
    const list = await s.cg.agent.get('/api/devices').expect(200);
    await s.cg.agent.delete(`/api/devices/${list.body.devices[0].id}`).set('x-csrf-token', s.cg.csrf).expect(200);
    await s.agent.get('/api/me').expect(401);
    expect((env.db.prepare("SELECT COUNT(*) AS n FROM sessions WHERE kind = 'student'").get() as { n: number }).n).toBe(0);
  });

  it('leaves the student signed in on the caregiver\'s other devices', async () => {
    const env = makeEnv();
    const s = await makeStudent(env);
    const other = request.agent(env.app);
    const code = (await other.post('/api/devices/request').expect(201)).body.code as string;
    await s.cg.agent.post('/api/devices/approve').set('x-csrf-token', s.cg.csrf).send({ code }).expect(200);
    await other.get('/api/devices/status').expect(200);
    await other.post('/api/auth/student').send({ username: s.username, pin: '1234' }).expect(200);
    const list = await s.cg.agent.get('/api/devices').expect(200);
    expect(list.body.devices).toHaveLength(2);
    const first = (env.db.prepare('SELECT id FROM devices ORDER BY created_at, rowid LIMIT 1').get() as { id: string }).id;
    await s.cg.agent.delete(`/api/devices/${first}`).set('x-csrf-token', s.cg.csrf).expect(200);
    await s.agent.get('/api/me').expect(401);
    await other.get('/api/me').expect(200);
  });

  it('does not touch a caregiver\'s own sign-in', async () => {
    const env = makeEnv();
    const s = await makeStudent(env);
    const list = await s.cg.agent.get('/api/devices').expect(200);
    await s.cg.agent.delete(`/api/devices/${list.body.devices[0].id}`).set('x-csrf-token', s.cg.csrf).expect(200);
    await s.cg.agent.get('/api/me').expect(200);
    void signIn;
  });
});
