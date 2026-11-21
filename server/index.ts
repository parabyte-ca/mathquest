import { loadConfig } from './config.js';
import { openDb } from './db.js';
import { createApp } from './app.js';
import { ResendMailer } from './mail.js';
import { loadCurriculum } from './curriculum.js';
import { startJobs } from './jobs.js';

const cfg = loadConfig();
const db = openDb(cfg.dbPath);
const content = loadCurriculum(db);
console.log(`[boot] MathQuest ${cfg.version}; content ${content.version}${content.loaded ? ' (loaded)' : ''}`);

const mailer = new ResendMailer(cfg);
const { app } = createApp({ db, cfg, mailer });
const server = app.listen(cfg.port, () => console.log(`[boot] listening on :${cfg.port}`));
const stopJobs = startJobs(db, cfg, mailer);

for (const sig of ['SIGTERM', 'SIGINT'] as const) {
  process.on(sig, () => {
    stopJobs();
    server.close(() => {
      db.close();
      process.exit(0);
    });
  });
}
