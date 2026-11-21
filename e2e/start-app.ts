// Starts the built app against a throwaway database with a seeded admin and caregiver.
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'test-results', 'e2e');
rmSync(root, { recursive: true, force: true });
mkdirSync(join(root, 'upgrade'), { recursive: true });
mkdirSync(join(root, 'upgrade-status'), { recursive: true });

const mock = `http://127.0.0.1:${process.env.MOCK_PORT ?? 18788}`;
Object.assign(process.env, {
  PORT: process.env.E2E_PORT ?? '18086',
  BASE_URL: `http://localhost:${process.env.E2E_PORT ?? '18086'}`,
  DATA_DIR: join(root, 'data'),
  DB_PATH: join(root, 'data', 'mathquest.db'),
  UPGRADE_DIR: join(root, 'upgrade'),
  UPGRADE_STATUS_DIR: join(root, 'upgrade-status'),
  RESEND_API_KEY: 're_test',
  RESEND_API_BASE: mock,
  RELEASES_URL: `${mock}/releases/latest`,
  COOKIE_SECURE: 'false',
});

const { openDb, newId, nowIso } = await import('../server/db.js');
const db = openDb(process.env.DB_PATH!);
// One admin and one caregiver per viewport project, so each stays under the 5-per-hour sign-in limit.
// The first-run tour is marked as seen for them, so it does not get in the way of other tests; the tour-* caregivers have not seen it.
for (const vp of ['phone', 'tablet', 'desktop']) {
  for (const [email, role, seen] of [[`admin-${vp}@e2e.test`, 'admin', true], [`parent-${vp}@e2e.test`, 'caregiver', true], [`tour-${vp}@e2e.test`, 'caregiver', false]] as const) {
    const id = newId();
    db.prepare("INSERT INTO users (id, email, role, status, created_at) VALUES (?,?,?,'active',?)").run(id, email, role, nowIso());
    if (seen) db.prepare("INSERT INTO tour_seen (subject_kind, subject_id, tour, seen_at) VALUES ('user', ?, 'caregiver', ?)").run(id, Date.now());
  }
}
db.close();
await import('../server/index.js');
