import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { makeEnv, makeStudent, addUser, signIn } from './helpers.js';
import { bankSummary, THIN_BELOW, VARIETY_SEEDS, variety } from '../server/ai/bank.js';
import { generate, hasGenerator } from '../shared/generators/index.js';
import { nowIso } from '../server/db.js';

const micros = (JSON.parse(readFileSync('content/microskills.json', 'utf8')) as { microskills: { id: string; name: string }[] }).microskills;

describe('per-skill bank sizes', () => {
  it('counts different questions per tier the same way an independent sample does', () => {
    for (const id of ['MS.G5.B2.2.a', 'MS.G7.B1.1.a'].filter(hasGenerator)) {
      const v = variety(id);
      for (const tier of [1, 2, 3]) {
        const seen = new Set<string>();
        for (let s = 1; s <= VARIETY_SEEDS; s++) { const it = generate(id, tier, s); seen.add(it.prompt.en + '|' + JSON.stringify(it.options ?? null)); }
        expect(v[tier - 1]).toBe(seen.size);
        expect(v[tier - 1]).toBeGreaterThan(0);
        expect(v[tier - 1]).toBeLessThanOrEqual(VARIETY_SEEDS);
      }
    }
  });

  it('lists every micro-skill once and adds the Claude bank counts and open reports', async () => {
    const env = makeEnv();
    const kid = await makeStudent(env);
    const skill = 'MS.G5.B2.2.a';
    const row = (status: string, served = 0) => env.db.prepare('INSERT INTO bank_item (skill, tier, status, item_json, compute, model, created_at, served) VALUES (?,?,?,?,?,?,?,?)').run(skill, 1, status, '{}', '1+1', 'm', nowIso(), served);
    row('approved', 4); row('approved', 1); row('draft'); row('retired');
    const bankId = Number(env.db.prepare("SELECT id FROM bank_item WHERE status = 'approved' LIMIT 1").pluck().get());
    env.db.prepare('INSERT INTO item_report (student_id, item_ref, bank_id, reason, at, resolved) VALUES (?,?,?,?,?,0)').run(kid.studentId, 'x', bankId, 'unclear', Date.now());
    env.db.prepare('INSERT INTO item_report (student_id, item_ref, bank_id, reason, at, resolved) VALUES (?,?,?,?,?,1)').run(kid.studentId, 'y', bankId, 'unclear', Date.now());
    const rows = bankSummary(env.ctx);
    expect(rows.map((r) => r.id)).toEqual(micros.map((m) => m.id));
    const r = rows.find((x) => x.id === skill)!;
    expect(r).toMatchObject({ approved: 2, drafts: 1, retired: 1, served: 5, openReports: 1, generator: true });
    expect(rows.find((x) => x.id !== skill)).toMatchObject({ approved: 0, drafts: 0, served: 0, openReports: 0 });
  });

  it('flags a skill as thin only when a tier has fewer different questions than the threshold', () => {
    const env = makeEnv();
    for (const r of bankSummary(env.ctx)) {
      expect(r.thin).toBe(r.generator && r.variety.some((n) => n < THIN_BELOW));
      if (!r.generator) expect(r.variety).toEqual([0, 0, 0]);
    }
  });

  it('is admin-only', async () => {
    const env = makeEnv();
    addUser(env, 'a@x.ca', 'admin');
    const a = await signIn(env, 'a@x.ca');
    const res = await a.agent.get('/api/admin/ai/bank').expect(200);
    expect(res.body.skills).toHaveLength(micros.length);
    addUser(env, 'c@x.ca');
    const c = await signIn(env, 'c@x.ca');
    await c.agent.get('/api/admin/ai/bank').expect(403);
  });
});
