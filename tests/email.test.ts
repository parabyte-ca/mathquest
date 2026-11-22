import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { addUser, makeEnv, makeStudent, signIn, tokenFrom } from './helpers.js';
import { makeRng } from '../shared/rng.js';
import { loadCurriculum } from '../server/curriculum.js';
import { composeWeekly } from '../server/weekly.js';
import { esc, renderEmail } from '../server/email.js';
import { ResendMailer } from '../server/mail.js';

const visibleText = (html: string): string => html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]*>/g, ' ');
const hrefs = (html: string): string[] => [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]!);
const post = (a: Awaited<ReturnType<typeof signIn>>, url: string, body: object) => a.agent.post(url).set('x-csrf-token', a.csrf).send(body);

describe('the email template', () => {
  const base = { lang: 'en' as const, baseUrl: 'https://mathquest.example/', title: 'Hello' };
  it('escapes everything a person typed', () => {
    const html = renderEmail({ ...base, title: '<img src=x onerror=1>', intro: ['A & B <script>alert(1)</script>'], sections: [{ heading: '"Sam" & \'Jo\'', lines: ['<b>bold</b>'], quote: { text: '<i>hi</i>', from: '<u>me</u>' } }] });
    for (const raw of ['<img src=x', '<script>', '<b>bold', '<i>hi', '<u>me']) expect(html).not.toContain(raw);
    for (const safe of ['&lt;img src=x onerror=1&gt;', 'A &amp; B &lt;script&gt;', '&quot;Sam&quot; &amp; &#39;Jo&#39;', '&lt;b&gt;bold&lt;/b&gt;', '&lt;i&gt;hi&lt;/i&gt;']) expect(html).toContain(safe);
    expect(esc('<&>"\'')).toBe('&lt;&amp;&gt;&quot;&#39;');
  });
  it('shows a labelled button, with the address only in the link', () => {
    const url = 'https://mathquest.example/app/verify?token=abc_DEF-123';
    const html = renderEmail({ ...base, button: { label: 'Sign in to MathQuest', url } });
    expect(hrefs(html)).toContain(url);
    expect(visibleText(html)).toContain('Sign in to MathQuest');
    expect(visibleText(html)).not.toMatch(/https?:|verify\?token/);
  });
  it('never makes a script or data address into a link', () => {
    for (const url of ['javascript:alert(1)', 'data:text/html,x', 'JAVASCRIPT:1']) expect(hrefs(renderEmail({ ...base, button: { label: 'x', url } }))).toEqual(['#']);
    expect(hrefs(renderEmail({ ...base, button: { label: 'x', url: 'http://a/"onmouseover="x' } }))).toEqual(['http://a/&quot;onmouseover=&quot;x']);
  });
  it('is readable by clients and in the dark: language, viewport, colour scheme, logo from the app and a hidden preview line', () => {
    const html = renderEmail({ ...base, lang: 'fr', preheader: 'Aperçu' });
    expect(html).toContain('<html lang="fr">');
    expect(html).toContain('name="viewport"');
    expect(html).toContain('prefers-color-scheme: dark');
    expect(html).toContain('src="https://mathquest.example/icons/icon-192.png"');
    expect(html).toContain('display:none');
    expect(html).toContain('Aperçu');
    expect(html).toMatch(/<img [^>]*alt=""/); // the wordmark beside it carries the name
    expect(html).toContain('>MathQuest<');
  });
});

describe('the emails the app sends', () => {
  it('signs in with a button and keeps the full link in the plain text', async () => {
    const env = makeEnv();
    addUser(env, 'a@example.com');
    await request(env.app).post('/api/auth/magic').send({ email: 'a@example.com' }).expect(202);
    const mail = env.mailer.outbox[0]!;
    const token = tokenFrom(mail.text);
    expect(mail.html).toBeDefined();
    const link = hrefs(mail.html!).find((h) => h.includes('/app/verify'))!;
    expect(link).toContain(`token=${token}`);
    expect(mail.text).toContain(link);
    expect(visibleText(mail.html!)).toContain('Sign in to MathQuest');
    expect(visibleText(mail.html!)).not.toMatch(/https?:|\/app\/verify/);
    expect(visibleText(mail.html!)).toContain('15 minutes');
  });
  it('invites with a note that cannot add markup or change the link', async () => {
    const env = makeEnv();
    addUser(env, 'admin@x.ca', 'admin');
    const a = await signIn(env, 'admin@x.ca');
    env.mailer.outbox.length = 0;
    await post(a, '/api/admin/caregivers', { email: 'new@x.ca', note: 'Welcome <b>Sam</b> & co' }).expect(201);
    const mail = env.mailer.outbox.at(-1)!;
    expect(mail.html).toContain('Welcome &lt;b&gt;Sam&lt;/b&gt; &amp; co');
    expect(mail.html).not.toContain('<b>Sam');
    expect(hrefs(mail.html!).filter((h) => h.startsWith('http'))).toHaveLength(1);
    expect(visibleText(mail.html!)).toContain('Accept the invitation');
    expect(visibleText(mail.html!)).toContain('A note from admin@x.ca');
  });
  it('sends the weekly summary as HTML as well, with the same words as the text', async () => {
    const env = makeEnv({}, makeRng(11));
    loadCurriculum(env.db);
    const s = await makeStudent(env);
    env.db.prepare('UPDATE students SET display_name = ?, language = ? WHERE id = ?').run('Zoé <3 & Co', 'fr', s.studentId);
    const owner = env.db.prepare('SELECT u.id, u.email FROM users u JOIN student_caregivers sc ON sc.caregiver_id = u.id WHERE sc.student_id = ?').get(s.studentId) as { id: string; email: string };
    const msg = composeWeekly(env.ctx, { id: owner.id, email: owner.email, display_name: '' })!;
    expect(msg.html).toContain('<html lang="fr">');
    expect(msg.html).toContain('Zoé &lt;3 &amp; Co');
    expect(msg.html).not.toContain('Zoé <3');
    expect(msg.text).toContain('Zoé <3 & Co');
    expect(visibleText(msg.html)).toContain('Ouvrir le tableau de bord');
    expect(hrefs(msg.html)).toContain(`${env.ctx.cfg.baseUrl}/app`);
    expect(msg.text).toContain(`Ouvrir le tableau de bord : ${env.ctx.cfg.baseUrl}/app`);
  });
  it('tells the caregiver about a lockout with a button to the app', async () => {
    const env = makeEnv();
    const s = await makeStudent(env);
    env.mailer.outbox.length = 0;
    for (let i = 0; i < 4; i++) await s.agent.post('/api/auth/student').send({ username: s.username, pin: '9999' }).expect(401);
    await s.agent.post('/api/auth/student').send({ username: s.username, pin: '9999' }).expect(429);
    const mail = env.mailer.outbox.find((m) => m.subject.includes('locked out'));
    expect(mail?.html).toBeDefined();
    expect(visibleText(mail!.html!)).toContain('Open the caregiver page');
    expect(mail!.text).toContain('5 wrong PIN attempts');
  });
});

describe('sending through Resend', () => {
  const cfg = { resendApiKey: 're_x', resendApiBase: 'http://mock', mailFrom: 'MathQuest <m@x.ca>' };
  it('sends the HTML and the text together, and only the text when there is no HTML', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    const mailer = new ResendMailer(cfg);
    expect(await mailer.send({ to: 'a@x.ca', subject: 's', text: 'plain', html: '<p>rich</p>' })).toBe(true);
    expect(await mailer.send({ to: 'a@x.ca', subject: 's', text: 'plain' })).toBe(true);
    const bodies = fetchMock.mock.calls.map((c) => JSON.parse((c[1] as { body: string }).body) as Record<string, unknown>);
    expect(bodies[0]).toMatchObject({ text: 'plain', html: '<p>rich</p>' });
    expect(bodies[1]).not.toHaveProperty('html');
    fetchMock.mockRestore();
  });
});
