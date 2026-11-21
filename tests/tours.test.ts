import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { makeEnv, makeStudent, addUser, signIn } from './helpers.js';

const done = async (a: { agent: ReturnType<typeof request.agent> }) => (await a.agent.get('/api/tours').expect(200)).body as { done: string[]; available: string[] };

describe('first-run walkthroughs', () => {
  it('starts with nothing done, remembers a finished or skipped tour per person, and is idempotent', async () => {
    const env = makeEnv();
    addUser(env, 'cg@x.ca');
    const cg = await signIn(env, 'cg@x.ca');
    expect(await done(cg)).toEqual({ done: [], available: ['caregiver'] });
    await cg.agent.post('/api/tours/caregiver/complete').set('x-csrf-token', cg.csrf).expect(200);
    await cg.agent.post('/api/tours/caregiver/complete').set('x-csrf-token', cg.csrf).expect(200);
    expect((await done(cg)).done).toEqual(['caregiver']);
    // a different caregiver is unaffected
    addUser(env, 'other@x.ca');
    const other = await signIn(env, 'other@x.ca');
    expect((await done(other)).done).toEqual([]);
    // and it follows the person to a new session (another device)
    const again = await signIn(env, 'cg@x.ca');
    expect((await done(again)).done).toEqual(['caregiver']);
  });

  it('gives students their own tour and keeps the two kinds apart', async () => {
    const env = makeEnv();
    const s = await makeStudent(env);
    expect(await done(s)).toEqual({ done: [], available: ['student'] });
    await s.agent.post('/api/tours/caregiver/complete').set('x-csrf-token', s.csrf).expect(404); // not theirs
    await s.agent.post('/api/tours/student/complete').set('x-csrf-token', s.csrf).expect(200);
    expect((await done(s)).done).toEqual(['student']);
    addUser(env, 'cg2@x.ca');
    const cg = await signIn(env, 'cg2@x.ca');
    await cg.agent.post('/api/tours/student/complete').set('x-csrf-token', cg.csrf).expect(404);
    await cg.agent.post('/api/tours/anything/complete').set('x-csrf-token', cg.csrf).expect(404);
    await cg.agent.post('/api/tours/..%2Fadmin/complete').set('x-csrf-token', cg.csrf).expect(404);
  });

  it('needs a sign-in and a CSRF token', async () => {
    const env = makeEnv();
    await request(env.app).get('/api/tours').expect(401);
    await request(env.app).post('/api/tours/caregiver/complete').expect(401);
    addUser(env, 'cg3@x.ca');
    const cg = await signIn(env, 'cg3@x.ca');
    await cg.agent.post('/api/tours/caregiver/complete').expect(403);
    expect((await done(cg)).done).toEqual([]);
  });

  it('removes a student\'s tour record when the student is deleted', async () => {
    const env = makeEnv();
    const s = await makeStudent(env);
    await s.agent.post('/api/tours/student/complete').set('x-csrf-token', s.csrf).expect(200);
    const email = (env.db.prepare("SELECT u.email FROM users u JOIN student_caregivers sc ON sc.caregiver_id = u.id WHERE sc.student_id = ? AND sc.role = 'owner'").get(s.studentId) as { email: string }).email;
    const cg = await signIn(env, email);
    await cg.agent.delete(`/api/students/${s.studentId}`).set('x-csrf-token', cg.csrf).expect(200);
    expect(env.db.prepare('SELECT COUNT(*) AS n FROM tour_seen WHERE subject_id = ?').get(s.studentId)).toEqual({ n: 0 });
  });
});
