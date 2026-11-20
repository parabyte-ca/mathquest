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
