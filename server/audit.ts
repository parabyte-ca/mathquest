import type { DB } from './db.js';
import { nowIso } from './db.js';

/** Actions whose target is a student: they appear in that student's activity log. */
const STUDENT_SCOPED = /^(student\.|goal\.|message\.send$|worksheet\.(create|mark|photo)$)/;
const FORBIDDEN = /token|secret|pin|password|link|key/i;

/** Records who did what. Metadata keys that look secret are dropped so tokens never reach the log. */
export function audit(
  db: DB,
  actor: { kind: 'admin' | 'caregiver' | 'student' | 'system'; id?: string | null },
  action: string,
  target?: string | null,
  meta: Record<string, unknown> = {},
  studentId?: string | null,
): void {
  const safe: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) if (!FORBIDDEN.test(k)) safe[k] = v;
  const student = studentId !== undefined ? studentId : actor.kind === 'student' && action === 'auth.student_login' ? (actor.id ?? null) : STUDENT_SCOPED.test(action) && action !== 'student.delete' ? (target ?? null) : null;
  const known = student ? (db.prepare('SELECT 1 FROM students WHERE id = ?').get(student) ? student : null) : null;
  db.prepare('INSERT INTO audit_log (at, actor_kind, actor_id, action, target, meta_json, student_id) VALUES (?,?,?,?,?,?,?)').run(
    nowIso(), actor.kind, actor.id ?? null, action, target ?? null, JSON.stringify(safe), known,
  );
}
