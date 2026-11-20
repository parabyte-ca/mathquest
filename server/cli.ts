// Admin CLI, run inside the container: node dist/server/cli.js create-admin you@example.com
import { loadConfig } from './config.js';
import { openDb, newId, nowIso } from './db.js';
import { ResendMailer } from './mail.js';
import { makeLimits, type Ctx, type UserRow } from './context.js';
import { sendSignInLink } from './routes/auth.js';
import { audit } from './audit.js';

async function main(): Promise<void> {
  const [cmd, emailArg] = process.argv.slice(2);
  const cfg = loadConfig();
  const db = openDb(cfg.dbPath);
  const ctx: Ctx = { db, cfg, mailer: new ResendMailer(cfg), now: Date.now, limits: makeLimits(Date.now) };

  if (cmd === 'create-admin') {
    const email = (emailArg ?? cfg.adminEmail).trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('usage: create-admin <email>');
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;
    if (!user) {
      db.prepare("INSERT INTO users (id, email, role, status, created_at) VALUES (?,?, 'admin','invited',?)").run(newId(), email, nowIso());
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow;
      audit(db, { kind: 'system' }, 'admin.create', user.id);
    } else if (user.role !== 'admin') {
      throw new Error('that email already belongs to a caregiver account');
    }
    await sendSignInLink(ctx, user, { invite: true });
    console.log(`Admin ${email} is ready. A sign-in link was emailed (valid ${Math.round(cfg.magicLinkTtlMs / 60000)} minutes).`);
  } else if (cmd === 'backup') {
    const { runBackup } = await import('./jobs.js');
    console.log(await runBackup(db, cfg));
  } else {
    throw new Error('commands: create-admin <email> | backup');
  }
  db.close();
}

main().catch((e: Error) => {
  console.error(e.message);
  process.exit(1);
});
