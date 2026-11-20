import request from 'supertest';
import { openDb, newId, nowIso } from '../server/db.js';
import { createApp } from '../server/app.js';
import { loadConfig } from '../server/config.js';
import { MemoryMailer } from '../server/mail.js';

export interface TestEnv {
  db: ReturnType<typeof openDb>;
  app: ReturnType<typeof createApp>['app'];
  ctx: ReturnType<typeof createApp>['ctx'];
  mailer: MemoryMailer;
  clock: { t: number };
}

export function makeEnv(overrides: Record<string, string> = {}, rand?: () => number): TestEnv {
  const db = openDb(':memory:');
  const mailer = new MemoryMailer();
  const clock = { t: Date.UTC(2026, 10, 20, 12, 0, 0) };
  const cfg = loadConfig({ BASE_URL: 'http://localhost:8086', DB_PATH: ':memory:', ...overrides });
  const { app, ctx } = createApp({ db, cfg, mailer, now: () => clock.t, rand, webRoot: '/nonexistent' });
  return { db, app, ctx, mailer, clock };
}

export function addUser(env: TestEnv, email: string, role: 'admin' | 'caregiver' = 'caregiver', status: 'invited' | 'active' = 'active'): string {
  const id = newId();
  env.db.prepare('INSERT INTO users (id, email, role, status, created_at) VALUES (?,?,?,?,?)').run(id, email, role, status, nowIso());
  return id;
}

export const tokenFrom = (text: string): string => /token=([A-Za-z0-9_-]+)/.exec(text)![1]!;

/** Signs a user in through the real magic-link flow and returns an agent plus its CSRF token. */
export async function signIn(env: TestEnv, email: string): Promise<{ agent: ReturnType<typeof request.agent>; csrf: string }> {
  const agent = request.agent(env.app);
  env.mailer.outbox.length = 0;
  await agent.post('/api/auth/magic').send({ email }).expect(202);
  const mail = env.mailer.outbox.at(-1)!;
  const res = await agent.post('/api/auth/verify').send({ token: tokenFrom(mail.text) }).expect(200);
  return { agent, csrf: res.body.csrf as string };
}

type Agent = ReturnType<typeof request.agent>;

/** A signed-in student on an approved device, created through the real caregiver and pairing flow. */
export async function makeStudent(env: TestEnv, opts: { caregiver?: string; username?: string; grade?: number; allowed?: { grades: number[]; courses: string[] } } = {}) {
  const email = opts.caregiver ?? `cg-${Math.random().toString(36).slice(2, 8)}@example.com`;
  addUser(env, email);
  const cg = await signIn(env, email);
  const username = opts.username ?? `kid_${Math.random().toString(36).slice(2, 8)}`;
  const created = await cg.agent.post('/api/students').set('x-csrf-token', cg.csrf).send({ displayName: 'Kid', username, pin: '1234', grade: opts.grade ?? 5 }).expect(201);
  const studentId = created.body.id as string;
  if (opts.allowed) await cg.agent.patch(`/api/students/${studentId}`).set('x-csrf-token', cg.csrf).send({ allowed: opts.allowed }).expect(200);
  const device = request.agent(env.app);
  const code = (await device.post('/api/devices/request').expect(201)).body.code as string;
  await cg.agent.post('/api/devices/approve').set('x-csrf-token', cg.csrf).send({ code }).expect(200);
  await device.get('/api/devices/status').expect(200);
  const login = await device.post('/api/auth/student').send({ username, pin: '1234' }).expect(200);
  return { agent: device, csrf: login.body.csrf as string, studentId, username, cg };
}
