import { describe, it, expect } from 'vitest';
import { makeEnv, makeStudent, addUser, signIn, type TestEnv } from './helpers.js';
import { NOTE_MAX, noteSchema, quoteNote } from '../server/note.js';

const post = (a: Awaited<ReturnType<typeof signIn>>, url: string, body: object) => a.agent.post(url).set('x-csrf-token', a.csrf).send(body);
const links = (text: string): string[] => text.match(/https?:\/\/\S+/g) ?? [];

async function admin(env: TestEnv) {
  addUser(env, 'admin@x.ca', 'admin');
  return signIn(env, 'admin@x.ca');
}
const everything = (env: TestEnv): string =>
  (env.db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all() as { name: string }[])
    .map((t) => JSON.stringify(env.db.prepare(`SELECT * FROM ${t.name}`).all()))
    .join('\n');

describe('invitation notes', () => {
  it('quotes the note in the email and leaves the link and subject alone', async () => {
    const env = makeEnv();
    const a = await admin(env);
    env.mailer.outbox.length = 0;
    await post(a, '/api/admin/caregivers', { email: 'new@x.ca', note: 'Welcome, Sam!\nLooking forward to working with you.' }).expect(201);
    const mail = env.mailer.outbox.at(-1)!;
    expect(mail.subject).toBe('You are invited to MathQuest');
    expect(mail.text).toContain('A note from admin@x.ca:');
    expect(mail.text).toContain('> Welcome, Sam!\n> Looking forward to working with you.');
    expect(links(mail.text)).toHaveLength(1);
    expect(links(mail.text)[0]).toMatch(/^http:\/\/localhost:8086\/app\/verify\?token=[A-Za-z0-9_-]+$/);
    expect(mail.text.indexOf('> Welcome')).toBeLessThan(mail.text.indexOf('/app/verify'));
  });

  it('sends the usual invitation when there is no note', async () => {
    const env = makeEnv();
    const a = await admin(env);
    env.mailer.outbox.length = 0;
    await post(a, '/api/admin/caregivers', { email: 'plain@x.ca' }).expect(201);
    await post(a, '/api/admin/caregivers', { email: 'blank@x.ca', note: '   ' }).expect(201);
    for (const m of env.mailer.outbox) {
      expect(m.text).not.toContain('note');
      expect(m.text).not.toContain('> ');
    }
  });

  it('refuses links, over-long notes and wrong types, and creates nobody when it does', async () => {
    const env = makeEnv();
    const a = await admin(env);
    env.mailer.outbox.length = 0;
    for (const note of ['See https://evil.example/login', 'Visit www.evil.example now', 'write to me at help.example.com', 'x'.repeat(NOTE_MAX + 1)]) {
      const res = await post(a, '/api/admin/caregivers', { email: 'blocked@x.ca', note });
      expect(res.status, note).toBe(400);
    }
    expect((await post(a, '/api/admin/caregivers', { email: 'blocked@x.ca', note: 42 })).status).toBe(400);
    expect((await post(a, '/api/admin/caregivers', { email: 'blocked@x.ca', note: 'a link: https://x.test' })).body.error).toBe('note_has_link');
    expect(env.mailer.outbox).toHaveLength(0);
    expect(env.db.prepare("SELECT COUNT(*) AS n FROM users WHERE email = 'blocked@x.ca'").get()).toEqual({ n: 0 });
    await post(a, '/api/admin/caregivers', { email: 'ok@x.ca', note: 'x'.repeat(NOTE_MAX) }).expect(201); // exactly at the limit
  });

  it('cannot be used to pose as the message, change the subject or inject headers', async () => {
    const env = makeEnv();
    const a = await admin(env);
    env.mailer.outbox.length = 0;
    const sneaky = 'Thanks!\r\n\r\n\r\n\r\nSubject: Reset your bank password\u0000‮\nBcc: someone\n\nYour account has been locked.';
    await post(a, '/api/admin/caregivers', { email: 'sneaky@x.ca', note: sneaky }).expect(201);
    const mail = env.mailer.outbox.at(-1)!;
    expect(mail.subject).toBe('You are invited to MathQuest');
    expect(mail.text).not.toMatch(/\u0000|‮|\r/);
    const noteBlock = mail.text.split('\n').filter((l) => /Subject:|Bcc:|locked/.test(l));
    expect(noteBlock.length).toBeGreaterThan(0);
    for (const l of noteBlock) expect(l.startsWith('> ')).toBe(true); // every line of the note is quoted
    expect(mail.text).not.toMatch(/\n\n\n/); // blank runs are collapsed
    expect(mail.to).toBe('sneaky@x.ca');
  });

  it('records that a note was attached, never what it said, and does not keep it', async () => {
    const env = makeEnv();
    const a = await admin(env);
    await post(a, '/api/admin/caregivers', { email: 'kept@x.ca', note: 'ZEBRA-MARKER-7421 hello' }).expect(201);
    const log = env.db.prepare("SELECT meta_json FROM audit_log WHERE action = 'caregiver.invite'").all() as { meta_json: string }[];
    expect(log.map((l) => JSON.parse(l.meta_json))).toEqual([{ noteAttached: true }]);
    expect(everything(env)).not.toContain('ZEBRA-MARKER-7421');
  });

  it('works for a caregiver sharing a student, only for new people, and names the sender', async () => {
    const env = makeEnv();
    const s = await makeStudent(env);
    const ownerEmail = (env.db.prepare("SELECT u.email FROM users u JOIN student_caregivers sc ON sc.caregiver_id = u.id WHERE sc.student_id = ? AND sc.role = 'owner'").get(s.studentId) as { email: string }).email;
    env.db.prepare('UPDATE users SET display_name = ? WHERE email = ?').run('Alex', ownerEmail);
    const cg = await signIn(env, ownerEmail);
    env.mailer.outbox.length = 0;
    await post(cg, `/api/students/${s.studentId}/caregivers`, { email: 'grandma@x.ca', note: 'Please keep an eye on Robin\'s progress.' }).expect(201);
    const mail = env.mailer.outbox.at(-1)!;
    expect(mail.text).toContain('A note from Alex:');
    expect(mail.text).toContain("> Please keep an eye on Robin's progress.");
    // someone who already has an account is just linked: no invitation and no note, only a short notice that a student was shared with them
    addUser(env, 'existing@x.ca');
    env.mailer.outbox.length = 0;
    await post(cg, `/api/students/${s.studentId}/caregivers`, { email: 'existing@x.ca', note: 'Hello' }).expect(201);
    expect(env.mailer.outbox).toHaveLength(1);
    expect(env.mailer.outbox[0]!.subject).toContain('was shared with you');
    expect(env.mailer.outbox[0]!.text).toContain('Alex shared');
    expect(env.mailer.outbox[0]!.text).not.toContain('Hello');
    expect(links(env.mailer.outbox[0]!.text).every((l) => !l.includes('/verify'))).toBe(true); // no sign-in link
    const res = await post(cg, `/api/students/${s.studentId}/caregivers`, { email: 'other@x.ca', note: 'go to https://evil.test' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('note_has_link');
  });

  it('cleans notes the way the schema says', () => {
    expect(noteSchema.parse('  hi  ')).toBe('hi');
    expect(noteSchema.parse('a\n\n\n\nb')).toBe('a\n\nb');
    expect(noteSchema.parse(undefined)).toBeUndefined();
    expect(noteSchema.safeParse('see example.com').success).toBe(false);
    expect(noteSchema.safeParse('Les crêpes, c\'est délicieux!').success).toBe(true); // accents and punctuation are fine
    expect(quoteNote('a\nb')).toBe('> a\n> b');
  });
});
