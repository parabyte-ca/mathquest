import { describe, it, expect, afterEach } from 'vitest';
import http from 'node:http';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';
import request from 'supertest';
import { makeEnv, addUser, signIn, makeStudent } from './helpers.js';
import { createApp } from '../server/app.js';
import { openDb } from '../server/db.js';
import { loadConfig } from '../server/config.js';
import { MemoryMailer } from '../server/mail.js';

// Credentials live only in the server's environment. These tests configure FAKE credentials and then try to make the running app
// reveal them: through its API (for every kind of signed-in user), through error paths, and through the files it serves.

const filler = (n: number): string => 'x9Q'.repeat(Math.ceil(n / 3)).slice(0, n);
const FAKE_RESEND = ['re', filler(30)].join('_');
const FAKE_ANTHROPIC = ['sk', 'ant', 'api03', filler(40)].join('-');
const FAKES = [FAKE_RESEND, FAKE_ANTHROPIC];
const SECRET_ENV = { RESEND_API_KEY: FAKE_RESEND, ANTHROPIC_API_KEY: FAKE_ANTHROPIC };

const leaks = (text: string): string[] => FAKES.filter((s) => text.includes(s));
const noLeak = (label: string, text: string): void => expect(leaks(text), `${label} must not contain a credential`).toEqual([]);

const READ_ONLY_PATHS = ['/api/me', '/api/health', '/api/admin/ai/status', '/api/admin/ai/usage', '/api/admin/ai/items', '/api/admin/ai/reports', '/api/admin/ai/skills', '/api/admin/audit', '/api/admin/updates', '/api/admin/users', '/api/students', '/api/devices', '/api/me/family-goals', '/api/tours', '/api/curriculum/expectations', '/api/curriculum/graph', '/api/learn/options'];

describe('API responses never carry a credential', () => {
  it('for an admin, a caregiver, a student and a visitor on every read-only route', async () => {
    const env = makeEnv(SECRET_ENV);
    addUser(env, 'admin@example.com', 'admin');
    const admin = await signIn(env, 'admin@example.com');
    const kid = await makeStudent(env);
    const visitor = request.agent(env.app);
    for (const [who, agent] of [['admin', admin.agent], ['caregiver', kid.cg.agent], ['student', kid.agent], ['visitor', visitor]] as const) {
      for (const path of READ_ONLY_PATHS) {
        const res = await agent.get(path);
        noLeak(`${who} GET ${path}`, JSON.stringify(res.body) + res.text + JSON.stringify(res.headers));
        if (path !== '/api/health') expect(res.headers['cache-control'], `${who} GET ${path} must not be cached`).toBe('no-store');
      }
    }
    // the AI status tells the admin whether a key exists, never the key itself
    const status = await admin.agent.get('/api/admin/ai/status').expect(200);
    expect(status.body.configured).toBe(true);
    expect(JSON.stringify(status.body)).not.toMatch(/key/i);
  });

  it('on error paths, including a provider that echoes the key back in its error', async () => {
    const mock = http.createServer((req, res) => {
      const echoed = String(req.headers['x-api-key'] ?? '');
      res.writeHead(401, { 'content-type': 'application/json' }).end(JSON.stringify({ error: { message: `invalid x-api-key: ${echoed}` } }));
    });
    await new Promise<void>((ok) => mock.listen(0, '127.0.0.1', ok));
    try {
      const env = makeEnv({ ...SECRET_ENV, ANTHROPIC_API_BASE: `http://127.0.0.1:${(mock.address() as AddressInfo).port}` });
      addUser(env, 'admin@example.com', 'admin');
      const admin = await signIn(env, 'admin@example.com');
      const skill = (await admin.agent.get('/api/admin/ai/skills').expect(200)).body;
      const first = (Array.isArray(skill) ? skill[0] : skill.skills?.[0])?.id as string;
      const res = await admin.agent.post('/api/admin/ai/generate').set('x-csrf-token', admin.csrf).send({ skill: first, tier: 1, count: 1 });
      expect(res.status).toBe(502);
      noLeak('generate error', JSON.stringify(res.body) + res.text);
      const items = await admin.agent.get('/api/admin/ai/items').expect(200);
      noLeak('items after the failure', JSON.stringify(items.body));
    } finally {
      mock.close();
    }
    const env = makeEnv(SECRET_ENV);
    for (const res of [await request(env.app).post('/api/auth/magic').send({ email: 12 }), await request(env.app).post('/api/auth/verify').set('content-type', 'application/json').send('{bad json'), await request(env.app).get('/api/nope')]) {
      noLeak('error response', JSON.stringify(res.body) + res.text);
      expect(res.text).not.toMatch(/\bat \S+ \(|node_modules|\/home\/|stack/i);
    }
  });

  it('and mail failures do not print the credential', async () => {
    const lines: string[] = [];
    const [oldError, oldWarn, oldLog] = [console.error, console.warn, console.log];
    console.error = console.warn = console.log = (...a: unknown[]) => void lines.push(a.join(' '));
    const mock = http.createServer((_req, res) => res.writeHead(403, { 'content-type': 'application/json' }).end('{"message":"nope"}'));
    await new Promise<void>((ok) => mock.listen(0, '127.0.0.1', ok));
    try {
      const { ResendMailer } = await import('../server/mail.js');
      const mailer = new ResendMailer({ resendApiKey: FAKE_RESEND, resendApiBase: `http://127.0.0.1:${(mock.address() as AddressInfo).port}`, mailFrom: 'A <a@example.com>' });
      expect(await mailer.send({ to: 'x@example.com', subject: 'Test', text: 'Sign in: http://x/?token=abc' })).toBe(false);
      expect(await new ResendMailer({ resendApiKey: '', resendApiBase: 'http://127.0.0.1:1', mailFrom: 'A <a@example.com>' }).send({ to: 'x@example.com', subject: 'Test', text: 'Sign in: http://x/?token=abc' })).toBe(false);
    } finally {
      console.error = oldError;
      console.warn = oldWarn;
      console.log = oldLog;
      mock.close();
    }
    noLeak('log output', lines.join('\n'));
    expect(lines.join('\n')).not.toContain('token=abc');
  });
});

describe('the web server only serves the built app', () => {
  let root = '';
  afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = ''; });

  it('does not expose files next to it, parent folders, the environment file or the server build', async () => {
    root = mkdtempSync(join(tmpdir(), 'mq-web-'));
    const web = join(root, 'dist', 'web');
    mkdirSync(join(web, 'assets'), { recursive: true });
    mkdirSync(join(root, 'dist', 'server'), { recursive: true });
    writeFileSync(join(web, 'index.html'), '<!doctype html><div id="app"></div>');
    writeFileSync(join(web, 'assets', 'app.js'), 'console.log("app")');
    writeFileSync(join(root, '.env'), `RESEND_API_KEY=${FAKE_RESEND}\nANTHROPIC_API_KEY=${FAKE_ANTHROPIC}\n`);
    writeFileSync(join(root, 'package.json'), `{"secret":"${FAKE_ANTHROPIC}"}`);
    writeFileSync(join(root, 'dist', 'server', 'config.js'), `export const k = "${FAKE_RESEND}";`);
    const cfg = loadConfig({ BASE_URL: 'http://localhost:8086', DB_PATH: ':memory:', ...SECRET_ENV });
    const { app } = createApp({ db: openDb(':memory:'), cfg, mailer: new MemoryMailer(), webRoot: web });

    expect((await request(app).get('/assets/app.js')).status).toBe(200);
    const attempts = ['/.env', '/%2e%2e/.env', '/..%2f.env', '/%2e%2e%2f%2e%2e%2f.env', '/assets/..%2f..%2f..%2f.env', '/..%2fpackage.json', '/package.json', '/server/config.js', '/dist/server/config.js', '/..%2fserver%2fconfig.js', '/assets/app.js.map', '/index.html.map', '/.git/config', '/data/mathquest.db'];
    for (const p of attempts) {
      const res = await request(app).get(p);
      noLeak(`GET ${p}`, res.text + JSON.stringify(res.headers));
      expect([200, 301, 302, 400, 403, 404], `GET ${p} status`).toContain(res.status);
    }
    // anything that is not a built file falls back to the app shell, which holds no secrets
    const shell = await request(app).get('/app/anything');
    expect(shell.text).toContain('<div id="app">');
    noLeak('app shell', shell.text);
  });

  it('sends the headers that keep keys and sessions out of other places', async () => {
    const env = makeEnv(SECRET_ENV);
    const res = await request(env.app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['referrer-policy']).toBe('no-referrer');
    expect(res.headers['x-powered-by']).toBeUndefined();
    const csp = String(res.headers['content-security-policy']);
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("connect-src 'self'"); // the browser cannot send data to any other site
    expect(csp).toContain("script-src 'self'"); // no inline or third-party scripts
    expect(csp).toContain("frame-ancestors 'none'");
    // session cookies are not readable from scripts
    addUser(env, 'user@example.com');
    const agent = request.agent(env.app);
    await agent.post('/api/auth/magic').send({ email: 'user@example.com' }).expect(202);
    const token = /token=([A-Za-z0-9_-]+)/.exec(env.mailer.outbox.at(-1)!.text)![1]!;
    const verified = await agent.post('/api/auth/verify').send({ token });
    const cookies = ([] as string[]).concat(verified.headers['set-cookie'] ?? []);
    expect(cookies.length).toBeGreaterThan(0);
    for (const c of cookies) expect(c).toMatch(/HttpOnly/i);
  });
});
