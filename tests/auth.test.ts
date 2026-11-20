import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { addUser, makeEnv, signIn, tokenFrom } from './helpers.js';

describe('magic-link sign-in', () => {
  it('signs a known caregiver in and exposes /api/me', async () => {
    const env = makeEnv();
    addUser(env, 'a@example.com');
    const { agent } = await signIn(env, 'a@example.com');
    const me = await agent.get('/api/me').expect(200);
    expect(me.body.user.email).toBe('a@example.com');
  });

  it('answers unknown emails the same way and sends nothing', async () => {
    const env = makeEnv();
    await request(env.app).post('/api/auth/magic').send({ email: 'nobody@example.com' }).expect(202);
    expect(env.mailer.outbox).toHaveLength(0);
  });

  it('stores only a hash of the token', async () => {
    const env = makeEnv();
    addUser(env, 'a@example.com');
    const agent = request.agent(env.app);
    await agent.post('/api/auth/magic').send({ email: 'a@example.com' }).expect(202);
    const token = tokenFrom(env.mailer.outbox[0]!.text);
    const rows = env.db.prepare('SELECT token_hash FROM magic_tokens').all() as { token_hash: string }[];
    expect(rows).toHaveLength(1);
    expect(rows[0]!.token_hash).not.toContain(token);
    expect(rows[0]!.token_hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is single use', async () => {
    const env = makeEnv();
    addUser(env, 'a@example.com');
    const agent = request.agent(env.app);
    await agent.post('/api/auth/magic').send({ email: 'a@example.com' });
    const token = tokenFrom(env.mailer.outbox[0]!.text);
    await agent.post('/api/auth/verify').send({ token }).expect(200);
    await agent.post('/api/auth/verify').send({ token }).expect(400);
  });

  it('expires after 15 minutes', async () => {
    const env = makeEnv();
    addUser(env, 'a@example.com');
    const agent = request.agent(env.app);
    await agent.post('/api/auth/magic').send({ email: 'a@example.com' });
    const token = tokenFrom(env.mailer.outbox[0]!.text);
    env.clock.t += 15 * 60_000 + 1000;
    await agent.post('/api/auth/verify').send({ token }).expect(400);
  });

  it('is bound to the requesting browser', async () => {
    const env = makeEnv();
    addUser(env, 'a@example.com');
    await request.agent(env.app).post('/api/auth/magic').send({ email: 'a@example.com' });
    const token = tokenFrom(env.mailer.outbox[0]!.text);
    await request.agent(env.app).post('/api/auth/verify').send({ token }).expect(400); // different browser
  });

  it('rate limits per email', async () => {
    const env = makeEnv();
    addUser(env, 'a@example.com');
    for (let i = 0; i < 5; i++) await request(env.app).post('/api/auth/magic').send({ email: 'a@example.com' }).expect(202);
    await request(env.app).post('/api/auth/magic').send({ email: 'a@example.com' }).expect(429);
  });

  it('rate limits per IP', async () => {
    const env = makeEnv();
    for (let i = 0; i < 20; i++) await request(env.app).post('/api/auth/magic').send({ email: `u${i}@example.com` }).expect(202);
    await request(env.app).post('/api/auth/magic').send({ email: 'u99@example.com' }).expect(429);
  });

  it('never writes tokens into the audit log', async () => {
    const env = makeEnv();
    addUser(env, 'a@example.com');
    await signIn(env, 'a@example.com');
    const log = JSON.stringify(env.db.prepare('SELECT * FROM audit_log').all());
    expect(log).not.toMatch(/token=/);
  });

  it('refuses disabled users', async () => {
    const env = makeEnv();
    const id = addUser(env, 'a@example.com');
    env.db.prepare("UPDATE users SET status = 'disabled' WHERE id = ?").run(id);
    await request(env.app).post('/api/auth/magic').send({ email: 'a@example.com' }).expect(202);
    expect(env.mailer.outbox).toHaveLength(0);
  });
});

describe('request hardening', () => {
  it('requires a CSRF header on authenticated writes', async () => {
    const env = makeEnv();
    addUser(env, 'a@example.com');
    const { agent, csrf } = await signIn(env, 'a@example.com');
    const body = { displayName: 'Kid', username: 'kid_one', pin: '1234', grade: 5 };
    await agent.post('/api/students').send(body).expect(403);
    await agent.post('/api/students').set('x-csrf-token', csrf).send(body).expect(201);
  });

  it('rejects cross-site origins on writes', async () => {
    const env = makeEnv();
    await request(env.app).post('/api/auth/magic').set('Origin', 'https://evil.example').send({ email: 'a@example.com' }).expect(403);
  });

  it('sets HttpOnly, SameSite=Lax session cookies and a strict CSP', async () => {
    const env = makeEnv();
    addUser(env, 'a@example.com');
    const agent = request.agent(env.app);
    await agent.post('/api/auth/magic').send({ email: 'a@example.com' });
    const res = await agent.post('/api/auth/verify').send({ token: tokenFrom(env.mailer.outbox[0]!.text) });
    const cookie = (res.headers['set-cookie'] as unknown as string[]).find((c) => c.startsWith('mq_session='))!;
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Lax/);
    expect(res.headers['content-security-policy']).toMatch(/default-src 'self'/);
  });

  it('sets Secure cookies when configured', async () => {
    const env = makeEnv({ COOKIE_SECURE: 'true' });
    addUser(env, 'a@example.com');
    const agent = request.agent(env.app);
    const res = await agent.post('/api/auth/magic').send({ email: 'a@example.com' });
    expect((res.headers['set-cookie'] as unknown as string[])[0]).toMatch(/Secure/);
  });

  it('keeps the health check outside auth', async () => {
    const env = makeEnv();
    const res = await request(env.app).get('/api/health').expect(200);
    expect(res.body.ok).toBe(true);
  });
});

describe('roles', () => {
  it('blocks caregivers from admin routes and lets admins invite caregivers', async () => {
    const env = makeEnv();
    addUser(env, 'cg@example.com');
    addUser(env, 'admin@example.com', 'admin');
    const cg = await signIn(env, 'cg@example.com');
    await cg.agent.get('/api/admin/users').expect(403);
    const ad = await signIn(env, 'admin@example.com');
    env.mailer.outbox.length = 0;
    await ad.agent.post('/api/admin/caregivers').set('x-csrf-token', ad.csrf).send({ email: 'new@example.com' }).expect(201);
    expect(env.mailer.outbox[0]!.to).toBe('new@example.com');
    // the invited caregiver can use the invite link from any browser (no nonce binding for invites)
    const fresh = request.agent(env.app);
    await fresh.post('/api/auth/verify').send({ token: tokenFrom(env.mailer.outbox[0]!.text) }).expect(200);
  });

  it('records admin actions in the audit log', async () => {
    const env = makeEnv();
    addUser(env, 'admin@example.com', 'admin');
    const ad = await signIn(env, 'admin@example.com');
    await ad.agent.post('/api/admin/caregivers').set('x-csrf-token', ad.csrf).send({ email: 'new@example.com' }).expect(201);
    const res = await ad.agent.get('/api/admin/audit').expect(200);
    expect(res.body.entries.map((e: { action: string }) => e.action)).toContain('caregiver.invite');
  });
});
