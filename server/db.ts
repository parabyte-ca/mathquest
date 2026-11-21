import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export type DB = Database.Database;

// Forward-only migrations. Never edit an applied migration; add a new one.
const MIGRATIONS: { id: number; name: string; sql: string }[] = [
  {
    id: 1,
    name: 'foundation',
    sql: `
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      role TEXT NOT NULL CHECK (role IN ('admin','caregiver')),
      display_name TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited','active','disabled')),
      weekly_email INTEGER NOT NULL DEFAULT 0,
      defaults_json TEXT NOT NULL DEFAULT '{}',
      invited_by TEXT REFERENCES users(id),
      created_at TEXT NOT NULL,
      last_login_at TEXT
    );

    CREATE TABLE magic_tokens (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      nonce_hash TEXT,
      expires_at INTEGER NOT NULL,
      used_at INTEGER,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX idx_magic_user ON magic_tokens(user_id);

    CREATE TABLE students (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      display_name TEXT NOT NULL,
      pin_hash TEXT NOT NULL,
      grade INTEGER NOT NULL CHECK (grade BETWEEN 5 AND 12),
      language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en','fr')),
      settings_json TEXT NOT NULL DEFAULT '{}',
      allowed_json TEXT NOT NULL DEFAULT '{"grades":[],"courses":[]}',
      pin_failures INTEGER NOT NULL DEFAULT 0,
      locked_until INTEGER NOT NULL DEFAULT 0,
      created_by TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL
    );

    CREATE TABLE student_caregivers (
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      caregiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('owner','co')),
      added_by TEXT NOT NULL REFERENCES users(id),
      added_at TEXT NOT NULL,
      PRIMARY KEY (student_id, caregiver_id)
    );
    CREATE INDEX idx_sc_caregiver ON student_caregivers(caregiver_id);

    CREATE TABLE sessions (
      id_hash TEXT PRIMARY KEY,
      kind TEXT NOT NULL CHECK (kind IN ('user','student')),
      subject_id TEXT NOT NULL,
      csrf TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      last_seen_at INTEGER NOT NULL
    );
    CREATE INDEX idx_sessions_subject ON sessions(subject_id);

    CREATE TABLE devices (
      id TEXT PRIMARY KEY,
      token_hash TEXT NOT NULL UNIQUE,
      approved_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      label TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL,
      last_seen_at INTEGER NOT NULL,
      revoked_at INTEGER
    );

    CREATE TABLE device_pairings (
      id TEXT PRIMARY KEY,
      code_hash TEXT NOT NULL,
      secret_hash TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      approved_by TEXT REFERENCES users(id),
      label TEXT NOT NULL DEFAULT '',
      device_token TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      at TEXT NOT NULL,
      actor_kind TEXT NOT NULL,
      actor_id TEXT,
      action TEXT NOT NULL,
      target TEXT,
      meta_json TEXT NOT NULL DEFAULT '{}'
    );
    CREATE INDEX idx_audit_at ON audit_log(at);

    CREATE TABLE curriculum_expectation (
      code TEXT PRIMARY KEY,
      grade INTEGER NOT NULL,
      course TEXT,
      schema TEXT NOT NULL,
      strand TEXT NOT NULL,
      strand_name TEXT NOT NULL,
      substrand TEXT,
      text TEXT NOT NULL
    );
    CREATE TABLE prereq_edge (
      from_code TEXT NOT NULL,
      to_code TEXT NOT NULL,
      chain TEXT NOT NULL,
      PRIMARY KEY (from_code, to_code)
    );
    CREATE TABLE course_prereq (
      course TEXT NOT NULL,
      recommended TEXT NOT NULL,
      PRIMARY KEY (course, recommended)
    );
    CREATE TABLE microskill (
      id TEXT PRIMARY KEY,
      expectation TEXT NOT NULL,
      name TEXT NOT NULL,
      tiers INTEGER NOT NULL CHECK (tiers >= 3)
    );
    CREATE TABLE microskill_prereq (
      microskill TEXT NOT NULL,
      prereq TEXT NOT NULL,
      PRIMARY KEY (microskill, prereq)
    );

    CREATE TABLE mastery (
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      skill_id TEXT NOT NULL,
      p_known REAL NOT NULL,
      tier INTEGER NOT NULL DEFAULT 1,
      attempts INTEGER NOT NULL DEFAULT 0,
      correct INTEGER NOT NULL DEFAULT 0,
      state_json TEXT NOT NULL DEFAULT '{}',
      last_seen_at INTEGER,
      next_review_at INTEGER,
      review_step INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (student_id, skill_id)
    );

    CREATE TABLE attempt (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      skill_id TEXT NOT NULL,
      tier INTEGER NOT NULL,
      correct INTEGER NOT NULL,
      hints INTEGER NOT NULL DEFAULT 0,
      tries INTEGER NOT NULL DEFAULT 1,
      ms INTEGER NOT NULL DEFAULT 0,
      at INTEGER NOT NULL
    );
    CREATE INDEX idx_attempt_student ON attempt(student_id, at);

    CREATE TABLE kv (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    `,
  },
  {
    id: 2,
    name: 'learning',
    sql: `
    ALTER TABLE attempt ADD COLUMN kind TEXT NOT NULL DEFAULT 'practice';

    CREATE TABLE ladder_state (
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      target TEXT NOT NULL,
      state_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (student_id, target)
    );

    CREATE TABLE practice_session (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      params_json TEXT NOT NULL,
      started_at INTEGER NOT NULL,
      last_at INTEGER NOT NULL,
      answered INTEGER NOT NULL DEFAULT 0,
      correct INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX idx_session_student ON practice_session(student_id, started_at);

    -- Items waiting for an answer. The answer stays on the server until the student has answered.
    CREATE TABLE pending_item (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      session_id TEXT,
      kind TEXT NOT NULL CHECK (kind IN ('practice','review','placement')),
      target TEXT NOT NULL,
      item_json TEXT NOT NULL,
      hints INTEGER NOT NULL DEFAULT 0,
      issued_at INTEGER NOT NULL
    );
    CREATE INDEX idx_pending_student ON pending_item(student_id);

    CREATE TABLE placement (
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      grade INTEGER NOT NULL,
      state_json TEXT NOT NULL,
      done_at INTEGER,
      result_json TEXT,
      PRIMARY KEY (student_id, grade)
    );
    `,
  },
  {
    id: 3,
    name: 'ai_pipeline',
    sql: `
    -- Items written by Claude. Nothing is served until an admin approves it.
    CREATE TABLE bank_item (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      skill TEXT NOT NULL,
      tier INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','rejected','retired')),
      item_json TEXT NOT NULL,
      compute TEXT NOT NULL,
      model TEXT NOT NULL,
      created_at TEXT NOT NULL,
      reviewed_by TEXT,
      reviewed_at TEXT,
      reject_reason TEXT,
      served INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX idx_bank_serve ON bank_item(status, skill, tier);

    CREATE TABLE ai_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      at INTEGER NOT NULL,
      kind TEXT NOT NULL,
      model TEXT NOT NULL,
      input_tokens INTEGER NOT NULL DEFAULT 0,
      output_tokens INTEGER NOT NULL DEFAULT 0,
      cost_micro_usd INTEGER NOT NULL DEFAULT 0,
      ok INTEGER NOT NULL DEFAULT 1
    );
    CREATE INDEX idx_usage_at ON ai_usage(at);

    CREATE TABLE item_report (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      item_ref TEXT NOT NULL,
      bank_id INTEGER REFERENCES bank_item(id) ON DELETE SET NULL,
      reason TEXT NOT NULL,
      at INTEGER NOT NULL,
      resolved INTEGER NOT NULL DEFAULT 0,
      UNIQUE (student_id, item_ref)
    );
    `,
  },
  {
    id: 4,
    name: 'rewards',
    sql: `
    CREATE TABLE reward_state (
      student_id TEXT PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
      xp INTEGER NOT NULL DEFAULT 0,
      streak INTEGER NOT NULL DEFAULT 0,
      best_streak INTEGER NOT NULL DEFAULT 0,
      last_day TEXT,
      freezes INTEGER NOT NULL DEFAULT 0,
      avatar TEXT NOT NULL DEFAULT 'avatar-fox',
      palette TEXT NOT NULL DEFAULT 'palette-classic',
      daily_goal_day TEXT,
      updated_at INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE reward_event (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      at INTEGER NOT NULL,
      kind TEXT NOT NULL,
      xp INTEGER NOT NULL DEFAULT 0,
      meta_json TEXT NOT NULL DEFAULT '{}'
    );
    CREATE INDEX idx_reward_event ON reward_event(student_id, at);

    CREATE TABLE badge_earned (
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      badge_id TEXT NOT NULL,
      at INTEGER NOT NULL,
      PRIMARY KEY (student_id, badge_id)
    );

    -- A caregiver's real-world goal for a student, such as "movie night after 500 XP". Progress counts XP earned since the goal was set.
    CREATE TABLE goal (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      created_by TEXT NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      xp_target INTEGER NOT NULL,
      baseline_xp INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      reached_at INTEGER,
      redeemed_at INTEGER,
      redeemed_by TEXT REFERENCES users(id),
      archived INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX idx_goal_student ON goal(student_id);
    `,
  },
  {
    id: 5,
    name: 'tours',
    sql: `
    -- Which first-run walkthroughs a person has finished or skipped. Kept on the server so it follows them across devices.
    CREATE TABLE tour_seen (
      subject_kind TEXT NOT NULL CHECK (subject_kind IN ('user','student')),
      subject_id TEXT NOT NULL,
      tour TEXT NOT NULL,
      seen_at INTEGER NOT NULL,
      PRIMARY KEY (subject_kind, subject_id, tour)
    );
    `,
  },
  {
    id: 6,
    name: 'offline-practice',
    sql: `
    -- A pack of questions a student downloaded to practise without a connection. The server keeps the list (skill, tier and seed
    -- of each question) so that when the answers come back it can rebuild every question itself and grade it; the device is never trusted.
    CREATE TABLE offline_pack (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      items_json TEXT NOT NULL,
      done_json TEXT NOT NULL DEFAULT '[]',
      issued_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      synced_at INTEGER
    );
    CREATE INDEX idx_offline_pack_student ON offline_pack(student_id);
    `,
  },
  {
    id: 7,
    name: 'placement-by-strand',
    sql: `
    -- A quick check can now cover one strand (B Number is the original check). The primary key gains the strand, so the table is rebuilt.
    CREATE TABLE placement_new (
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      grade INTEGER NOT NULL,
      strand TEXT NOT NULL DEFAULT 'B',
      state_json TEXT NOT NULL,
      done_at INTEGER,
      result_json TEXT,
      PRIMARY KEY (student_id, grade, strand)
    );
    INSERT INTO placement_new (student_id, grade, strand, state_json, done_at, result_json) SELECT student_id, grade, 'B', state_json, done_at, result_json FROM placement;
    DROP TABLE placement;
    ALTER TABLE placement_new RENAME TO placement;
    `,
  },
];

export function openDb(path: string): DB {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  migrate(db);
  return db;
}

export function migrate(db: DB): void {
  db.exec('CREATE TABLE IF NOT EXISTS schema_version (id INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL)');
  const applied = new Set((db.prepare('SELECT id FROM schema_version').all() as { id: number }[]).map((r) => r.id));
  for (const m of MIGRATIONS) {
    if (applied.has(m.id)) continue;
    db.transaction(() => {
      db.exec(m.sql);
      db.prepare('INSERT INTO schema_version (id, name, applied_at) VALUES (?,?,?)').run(m.id, m.name, new Date().toISOString());
    })();
  }
}

export const newId = (): string => crypto.randomUUID();
export const nowIso = (): string => new Date().toISOString();
