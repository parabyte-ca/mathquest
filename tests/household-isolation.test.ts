import { describe, it, expect } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import { addUser, makeEnv, signIn, type TestEnv } from './helpers.js';
import { migrate } from '../server/db.js';
import { familyGoalsForStudent, listFamilyGoals } from '../server/rewards/service.js';
import { loadCurriculum } from '../server/curriculum.js';

// MathQuest serves many households. A caregiver reaches only themselves, their own students and the caregivers they share a student with.
// The install admin manages accounts and never sees a family's data.

type Cg = Awaited<ReturnType<typeof signIn>>;
const send = (c: Cg, method: 'get' | 'post' | 'patch' | 'delete', url: string, body?: object) => {
  const r = c.agent[method](url).set('x-csrf-token', c.csrf);
  return body ? r.send(body) : r;
};
const create = async (c: Cg, username: string, pin = '1234') =>
  (await send(c, 'post', '/api/students', { displayName: username.toUpperCase(), username, pin, grade: 5 }).expect(201)).body.id as string;

/** A device approved by this caregiver, with the student's PIN sign-in tried on it. */
async function device(env: TestEnv, c: Cg) {
  const d = request.agent(env.app);
  const code = (await d.post('/api/devices/request').expect(201)).body.code as string;
  await send(c, 'post', '/api/devices/approve', { code }).expect(200);
  await d.get('/api/devices/status').expect(200);
  return d;
}
const loginAs = async (d: ReturnType<typeof request.agent>, username: string, pin = '1234') => {
  const res = await d.post('/api/auth/student').send({ username, pin });
  if (res.status !== 200) return { status: res.status, id: null as string | null };
  return { status: 200, id: (await d.get('/api/me').expect(200)).body.student.id as string };
};

async function world() {
  const env = makeEnv();
  loadCurriculum(env.db);
  for (const e of ['a@x.ca', 'b@x.ca', 'c@x.ca']) addUser(env, e);
  addUser(env, 'admin@x.ca', 'admin');
  const A = await signIn(env, 'a@x.ca'), B = await signIn(env, 'b@x.ca'), C = await signIn(env, 'c@x.ca'), X = await signIn(env, 'admin@x.ca');
  const k1 = await create(A, 'sam'), k2 = await create(A, 'mia');
  const k3 = await create(C, 'sam'); // the same username in another household
  await send(A, 'post', `/api/students/${k1}/caregivers`, { email: 'b@x.ca' }).expect(201); // B shares K1 only
  return { env, A, B, C, X, k1, k2, k3 };
}

const ROUTES: { m: 'get' | 'post' | 'patch' | 'delete'; url: (id: string) => string; body?: object; ownerOnly?: boolean }[] = [
  { m: 'get', url: (id) => `/api/students/${id}/dashboard` },
  { m: 'get', url: (id) => `/api/students/${id}/worksheet/options` },
  { m: 'get', url: (id) => `/api/students/${id}/worksheet?focus=G5.C2.3&count=4&seed=3` },
  { m: 'get', url: (id) => `/api/students/${id}/goals` },
  { m: 'post', url: (id) => `/api/students/${id}/goals`, body: { title: 'Pizza night', xpTarget: 100 } },
  { m: 'patch', url: (id) => `/api/students/${id}/goals/nope`, body: { note: 'x' } },
  { m: 'post', url: (id) => `/api/students/${id}/goals/nope/redeem` },
  { m: 'delete', url: (id) => `/api/students/${id}/goals/nope` },
  { m: 'get', url: (id) => `/api/students/${id}/messages` },
  { m: 'post', url: (id) => `/api/students/${id}/messages`, body: { body: 'Well done' } },
  { m: 'get', url: (id) => `/api/students/${id}/certificate?kind=level` },
  { m: 'get', url: (id) => `/api/students/${id}/export` },
  { m: 'patch', url: (id) => `/api/students/${id}`, body: { displayName: 'Renamed' } },
  { m: 'post', url: (id) => `/api/students/${id}/caregivers`, body: { email: 'zed@x.ca' }, ownerOnly: true },
  { m: 'delete', url: (id) => `/api/students/${id}/caregivers/some-id`, ownerOnly: true },
  { m: 'delete', url: (id) => `/api/students/${id}`, ownerOnly: true },
];
const snapshot = (env: TestEnv): string =>
  JSON.stringify(['students', 'student_caregivers', 'goal', 'student_message', 'users'].map((t) => env.db.prepare(`SELECT * FROM ${t} ORDER BY rowid`).all()));

describe('who can reach which student', () => {
  it('lists only the students a person is linked to, and nothing for the admin', async () => {
    const { A, B, C, X, k1, k2, k3 } = await world();
    const ids = async (c: Cg) => ((await send(c, 'get', '/api/students').expect(200)).body.students as { id: string; linkRole: string }[]).map((s) => `${s.id}:${s.linkRole}`).sort();
    expect(await ids(A)).toEqual([`${k1}:owner`, `${k2}:owner`].sort());
    expect(await ids(B)).toEqual([`${k1}:co`]);
    expect(await ids(C)).toEqual([`${k3}:owner`]);
    expect(await ids(X)).toEqual([]);
  });

  it('answers 404 to every route for a student the caller cannot reach, and changes nothing', async () => {
    const w = await world();
    const before = snapshot(w.env);
    const outsiders: [string, Cg, string[]][] = [
      ['B', w.B, [w.k2, w.k3]], ['C', w.C, [w.k1, w.k2]], ['A', w.A, [w.k3]], ['admin', w.X, [w.k1, w.k2, w.k3]],
    ];
    for (const [who, caller, others] of outsiders) {
      for (const id of others) {
        for (const r of ROUTES) {
          const res = await send(caller, r.m, r.url(id), r.body);
          expect(res.status, `${who} ${r.m} ${r.url(id)}`).toBe(404);
        }
      }
    }
    expect(snapshot(w.env)).toBe(before);
  });

  it('refuses people who are not signed in, and students, on every caregiver route', async () => {
    const w = await world();
    const d = await device(w.env, w.A);
    expect((await loginAs(d, 'sam')).status).toBe(200);
    for (const r of ROUTES) {
      const anon = await request(w.env.app)[r.m](r.url(w.k1)).send(r.body);
      expect(anon.status, `anon ${r.url(w.k1)}`).toBe(401);
      const kid = await d[r.m](r.url(w.k1)).send(r.body);
      expect([401, 403], `student ${r.url(w.k1)} -> ${kid.status}`).toContain(kid.status); // signed in as a child, but never a caregiver
    }
  });

  it('lets the owner and the shared caregiver reach the shared student, and the owner alone reach the rest', async () => {
    const w = await world();
    for (const r of ROUTES.filter((x) => !x.ownerOnly && !x.url('').includes('/goals/nope'))) { // a made-up goal id is a 404 for anyone
      for (const [who, c] of [['A', w.A], ['B', w.B]] as const) {
        const res = await send(c, r.m, r.url(w.k1), r.body);
        expect([404, 401, 403], `${who} ${r.m} ${r.url(w.k1)} -> ${res.status}`).not.toContain(res.status);
      }
    }
  });

  it('ties a goal to its own student: another student\'s goal id does nothing, even for someone who reaches both', async () => {
    const w = await world();
    const g1 = (await send(w.A, 'post', `/api/students/${w.k1}/goals`, { title: 'Pizza night', xpTarget: 100 }).expect(201)).body.id as string;
    expect((await send(w.B, 'patch', `/api/students/${w.k1}/goals/${g1}`, { note: 'Friday' })).status).toBe(200); // the shared caregiver can
    expect((await send(w.A, 'patch', `/api/students/${w.k2}/goals/${g1}`, { note: 'Hijacked' })).status).toBe(404); // K2's URL with K1's goal
    expect((await send(w.A, 'delete', `/api/students/${w.k2}/goals/${g1}`)).status).toBe(404);
    expect((await send(w.A, 'post', `/api/students/${w.k2}/goals/${g1}/redeem`)).status).toBe(404);
    const row = w.env.db.prepare('SELECT note, archived FROM goal WHERE id = ?').get(g1) as { note: string; archived: number };
    expect(row).toEqual({ note: 'Friday', archived: 0 });
  });

  it('keeps an additional caregiver from deleting, sharing, unsharing and changing the PIN, but not from the rest', async () => {
    const w = await world();
    for (const r of ROUTES.filter((x) => x.ownerOnly)) expect((await send(w.B, r.m, r.url(w.k1), r.body)).status, `B ${r.m} ${r.url(w.k1)}`).toBe(403);
    expect((await send(w.B, 'patch', `/api/students/${w.k1}`, { pin: '9999' })).status).toBe(403);
    expect((await send(w.B, 'patch', `/api/students/${w.k1}`, { displayName: 'Sammy', settings: { voice: true } })).status).toBe(200);
    expect((await send(w.A, 'patch', `/api/students/${w.k1}`, { pin: '4321' })).status).toBe(200);
    const d = await device(w.env, w.B);
    expect((await loginAs(d, 'sam', '1234')).status).toBe(401); // the new PIN is in force
    expect((await loginAs(d, 'sam', '4321')).id).toBe(w.k1);
    expect(w.env.db.prepare('SELECT 1 FROM students WHERE id = ?').get(w.k1)).toBeTruthy(); // B's delete did not happen
  });
});

describe('usernames inside a household', () => {
  it('lets two households use the same username, and signs each child in on their own household\'s devices', async () => {
    const { env, A, B, C, k1, k3 } = await world();
    expect(k1).not.toBe(k3);
    const dA = await device(env, A), dB = await device(env, B), dC = await device(env, C);
    expect((await loginAs(dA, 'sam')).id).toBe(k1);
    expect((await loginAs(dC, 'sam')).id).toBe(k3);
    expect((await loginAs(dB, 'sam')).id).toBe(k1); // B reaches K1 only, so the name means K1 on B's devices
    expect((await loginAs(dA, 'SAM')).id).toBe(k1); // case does not matter
  });

  it('refuses a username that one of your own students already has, and tells you nothing about other households', async () => {
    const { A, B, C, k2 } = await world();
    expect((await send(A, 'post', '/api/students', { displayName: 'Dup', username: 'sam', pin: '1234', grade: 5 })).body.error).toBe('username_taken');
    expect((await send(A, 'post', '/api/students', { displayName: 'Dup', username: 'SAM', pin: '1234', grade: 5 })).status).toBe(409);
    expect((await send(B, 'post', '/api/students', { displayName: 'Dup', username: 'sam', pin: '1234', grade: 5 })).status).toBe(409); // B reaches K1 'sam'
    expect((await send(C, 'post', '/api/students', { displayName: 'Mia', username: 'mia', pin: '1234', grade: 5 })).status).toBe(201); // A's 'mia' is not C's business
    expect(k2).toBeTruthy();
  });

  it('does not let a device sign in as a student of another household, and says the same as for an unknown name', async () => {
    const { env, C } = await world();
    const dC = await device(env, C);
    const other = await dC.post('/api/auth/student').send({ username: 'mia', pin: '1234' }); // A's child
    const unknown = await dC.post('/api/auth/student').send({ username: 'nobody', pin: '1234' });
    expect(other.status).toBe(401);
    expect(other.body).toEqual(unknown.body);
  });

  it('refuses to share a student with someone who already has a different student of that name', async () => {
    const { A, B, C, k2, k3 } = await world();
    const res = await send(C, 'post', `/api/students/${k3}/caregivers`, { email: 'b@x.ca' }); // B already reaches K1 'sam'
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('username_conflict');
    expect((await send(A, 'post', `/api/students/${k2}/caregivers`, { email: 'b@x.ca' })).status).toBe(201); // 'mia' does not clash
    expect(((await send(B, 'get', '/api/students').expect(200)).body.students as unknown[]).length).toBe(2);
  });
});

describe('sharing does not reveal who has an account', () => {
  it('answers the same for a new address, an existing caregiver, the admin and yourself, and never links an admin', async () => {
    const { env, A, k2 } = await world();
    const answers = [];
    for (const email of ['brand-new@x.ca', 'c@x.ca', 'admin@x.ca', 'a@x.ca']) {
      const res = await send(A, 'post', `/api/students/${k2}/caregivers`, { email });
      answers.push([res.status, JSON.stringify(res.body)]);
    }
    expect(new Set(answers.map((a) => a.join(' '))).size).toBe(1);
    expect(answers[0]).toEqual([201, '{"ok":true}']);
    const linked = (env.db.prepare("SELECT u.email FROM student_caregivers sc JOIN users u ON u.id = sc.caregiver_id WHERE sc.student_id = ? ORDER BY u.email").all(k2) as { email: string }[]).map((r) => r.email);
    expect(linked).toEqual(['a@x.ca', 'brand-new@x.ca', 'c@x.ca']);
  });

  it('tells an existing caregiver when a student is shared with them, without a sign-in link', async () => {
    const { env, A, k2 } = await world();
    env.mailer.outbox.length = 0;
    await send(A, 'post', `/api/students/${k2}/caregivers`, { email: 'c@x.ca' }).expect(201);
    const mail = env.mailer.outbox.find((m) => m.to === 'c@x.ca')!;
    expect(mail.subject).toContain('was shared with you');
    expect(mail.text).not.toContain('/verify');
    expect(mail.html).toBeDefined();
  });
});

describe('what the admin can and cannot see', () => {
  it('reads accounts, but the audit log shows only account-level events', async () => {
    const { env, A, C, X, k1 } = await world();
    const d = await device(env, A);
    await loginAs(d, 'sam');
    await send(A, 'post', `/api/students/${k1}/goals`, { title: 'Pizza night', xpTarget: 100 }).expect(201);
    await send(A, 'post', `/api/students/${k1}/messages`, { body: 'Hi' }).expect(201);
    await send(C, 'get', `/api/students/${k1}/export`).expect(404);
    const users = (await send(X, 'get', '/api/admin/users').expect(200)).body.users as { email: string }[];
    expect(users.map((u) => u.email).sort()).toEqual(['a@x.ca', 'admin@x.ca', 'b@x.ca', 'c@x.ca']);
    const all = (env.db.prepare('SELECT DISTINCT action FROM audit_log').all() as { action: string }[]).map((r) => r.action);
    expect(all).toEqual(expect.arrayContaining(['student.create', 'goal.create', 'message.send', 'device.approve', 'auth.student_login'])); // they are recorded...
    const shown = ((await send(X, 'get', '/api/admin/audit?limit=500').expect(200)).body.entries as { action: string }[]).map((e) => e.action);
    expect(shown.length).toBeGreaterThan(0);
    for (const a of shown) expect(a, a).toMatch(/^(auth\.login|admin\.|caregiver\.invite|user\.|upgrade\.|ai\.)/); // ...but not shown
  });

  it('keeps the admin out of the family goals, certificates and student data routes it could reach before', async () => {
    const { X, k1 } = await world();
    for (const url of [`/api/students/${k1}/dashboard`, `/api/students/${k1}/export`, `/api/students/${k1}/certificate?kind=level`, `/api/students/${k1}/messages`]) {
      expect((await send(X, 'get', url)).status, url).toBe(404);
    }
  });
});

describe('family goals stay inside one household', () => {
  it('counts only the students a caregiver owns, and shows a student only the goals of their owner', async () => {
    const { env, A, B, C, k1, k3 } = await world();
    // A is shared K3 (C's child) too; B is shared K1 (A's child).
    await send(C, 'post', `/api/students/${k3}/caregivers`, { email: 'a@x.ca' }).expect(409); // clash: A already has 'sam'. Share is refused, so rename the case with a free name.
    const k4 = await create(C, 'zoe');
    await send(C, 'post', `/api/students/${k4}/caregivers`, { email: 'a@x.ca' }).expect(201);
    const t0 = env.clock.t;
    const ga = (await send(A, 'post', '/api/me/family-goals', { title: "A's goal", xpTarget: 1000 }).expect(201)).body.id as string;
    const gb = (await send(B, 'post', '/api/me/family-goals', { title: "B's goal", xpTarget: 1000 }).expect(201)).body.id as string;
    const ev = (sid: string, xp: number) => env.db.prepare("INSERT INTO reward_event (student_id, at, kind, xp) VALUES (?,?, 'answer', ?)").run(sid, t0 + 1000, xp);
    ev(k1, 30); ev(k4, 50); ev(k3, 70);
    env.clock.t += 5000;
    const progress = (uid: string, id: string) => listFamilyGoals(env.ctx, uid).find((g) => g.id === id)!.progress;
    const uid = (email: string) => (env.db.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: string }).id;
    expect(progress(uid('a@x.ca'), ga)).toBe(30); // K4 is shared with A, not owned: its XP does not count
    expect(progress(uid('b@x.ca'), gb)).toBe(0); // B owns no student, so nothing counts toward B's goal
    expect(familyGoalsForStudent(env.ctx, k1).map((g) => g.id)).toEqual([ga]); // K1 sees its owner's goal, not B's
    expect(familyGoalsForStudent(env.ctx, k4).map((g) => g.id)).toEqual([]); // K4 belongs to C, who made none, and A's goal is not K4's
  });
});

describe('the upgrade that lets usernames repeat', () => {
  it('keeps every student and everything attached to them, then lets two students share a name', () => {
    const db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    migrate(db, 9);
    db.prepare("INSERT INTO users (id, email, role, status, created_at) VALUES ('u1','a@x.ca','caregiver','active','2026-01-01')").run();
    const stu = db.prepare("INSERT INTO students (id, username, display_name, pin_hash, grade, created_by, created_at) VALUES (?,?,?,?,?, 'u1','2026-01-01')");
    stu.run('s1', 'sam', 'Sam', 'h', 5); stu.run('s2', 'mia', 'Mia', 'h', 6);
    db.prepare("INSERT INTO student_caregivers (student_id, caregiver_id, role, added_by, added_at) VALUES ('s1','u1','owner','u1','2026-01-01')").run();
    db.prepare("INSERT INTO mastery (student_id, skill_id, p_known) VALUES ('s1','MS.G5.B1.3.a',0.5)").run();
    db.prepare("INSERT INTO attempt (student_id, skill_id, tier, correct, at) VALUES ('s1','MS.G5.B1.3.a',1,1,5)").run();
    expect(() => stu.run('s3', 'SAM', 'Dup', 'h', 5)).toThrow(/UNIQUE/); // before: names are unique install-wide
    migrate(db);
    expect(db.pragma('foreign_keys', { simple: true })).toBe(1); // switched back on
    expect(db.pragma('foreign_key_check')).toEqual([]);
    expect((db.prepare('SELECT COUNT(*) AS n FROM students').get() as { n: number }).n).toBe(2);
    expect((db.prepare("SELECT display_name, grade FROM students WHERE id = 's1'").get() as { display_name: string }).display_name).toBe('Sam');
    expect((db.prepare('SELECT COUNT(*) AS n FROM mastery').get() as { n: number }).n).toBe(1); // not wiped by the rebuild
    expect((db.prepare('SELECT COUNT(*) AS n FROM attempt').get() as { n: number }).n).toBe(1);
    expect((db.prepare('SELECT COUNT(*) AS n FROM student_caregivers').get() as { n: number }).n).toBe(1);
    db.prepare("INSERT INTO students (id, username, display_name, pin_hash, grade, created_by, created_at) VALUES ('s3','SAM','Another Sam','h',5,'u1','2026-01-02')").run();
    expect((db.prepare("SELECT COUNT(*) AS n FROM students WHERE username = 'sam'").get() as { n: number }).n).toBe(2); // names compare without case
    db.prepare("DELETE FROM students WHERE id = 's1'").run(); // the cascade still works
    expect((db.prepare('SELECT COUNT(*) AS n FROM mastery').get() as { n: number }).n).toBe(0);
    expect((db.prepare('SELECT COUNT(*) AS n FROM student_caregivers').get() as { n: number }).n).toBe(0);
    migrate(db); // running it again changes nothing
    expect((db.prepare('SELECT COUNT(*) AS n FROM schema_version').get() as { n: number }).n).toBe(10);
  });
});
