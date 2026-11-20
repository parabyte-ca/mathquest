import type { DB } from './db.js';
import { nowIso } from './db.js';

const FORBIDDEN = /token|secret|pin|password|link|key/i;

/** Records who did what. Metadata keys that look secret are dropped so tokens never reach the log. */
export function audit(
  db: DB,
  actor: { kind: 'admin' | 'caregiver' | 'student' | 'system'; id?: string | null },
  action: string,
  target?: string | null,
  meta: Record<string, unknown> = {},
): void {
  const safe: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) if (!FORBIDDEN.test(k)) safe[k] = v;
  db.prepare('INSERT INTO audit_log (at, actor_kind, actor_id, action, target, meta_json) VALUES (?,?,?,?,?,?)').run(
    nowIso(), actor.kind, actor.id ?? null, action, target ?? null, JSON.stringify(safe),
  );
}
