import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import type { Config } from './config.js';
import type { DB } from './db.js';
import type { Mailer } from './mail.js';
import { purgeDueAccounts } from './household.js';
import { sendWeeklyEmails } from './weekly.js';

/** Online SQLite backup into data/backups, then prune files older than the retention window. */
export async function runBackup(db: DB, cfg: Pick<Config, 'dataDir' | 'backupRetentionDays'>, now = Date.now()): Promise<string> {
  const dir = join(cfg.dataDir, 'backups');
  mkdirSync(dir, { recursive: true });
  const stamp = new Date(now).toISOString().replace(/[:.]/g, '-');
  const dest = join(dir, `mathquest-${stamp}.db`);
  await db.backup(dest);
  const cutoff = now - cfg.backupRetentionDays * 86_400_000;
  for (const f of readdirSync(dir)) {
    if (!/^mathquest-.*\.db$/.test(f)) continue;
    const p = join(dir, f);
    if (statSync(p).mtimeMs < cutoff) unlinkSync(p);
  }
  return dest;
}

export function purgeExpired(db: DB, now = Date.now()): void {
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now);
  db.prepare('DELETE FROM magic_tokens WHERE expires_at < ?').run(now - 86_400_000);
  db.prepare('DELETE FROM device_pairings WHERE expires_at < ?').run(now);
  db.prepare('DELETE FROM pending_item WHERE issued_at < ?').run(now - 24 * 3_600_000);
}

/** Hourly housekeeping plus a nightly backup at about 03:15 local time. */
export function startJobs(db: DB, cfg: Config, mailer?: Mailer): () => void {
  let lastBackupDay = '';
  const tick = (): void => {
    purgeExpired(db);
    if (mailer) sendWeeklyEmails(db, cfg, mailer).catch((e: Error) => console.error(`[weekly] failed: ${e.message}`));
    purgeDueAccounts(db, cfg, mailer).catch((e: Error) => console.error(`[account purge] failed: ${e.message}`));
    const d = new Date();
    const day = d.toISOString().slice(0, 10);
    if (d.getHours() === 3 && d.getMinutes() >= 15 && day !== lastBackupDay && existsSync(cfg.dataDir)) {
      lastBackupDay = day;
      runBackup(db, cfg).then((p) => console.log(`[backup] wrote ${p}`), (e: Error) => console.error(`[backup] failed: ${e.message}`));
    }
  };
  tick();
  const t = setInterval(tick, 60_000);
  t.unref();
  return () => clearInterval(t);
}
