import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface Config {
  port: number;
  baseUrl: string;
  dbPath: string;
  dataDir: string;
  secure: boolean; // Secure cookies (true behind the Cloudflare Tunnel)
  resendApiKey: string;
  resendApiBase: string;
  mailFrom: string;
  adminEmail: string;
  anthropicApiKey: string;
  anthropicModel: string;
  magicLinkBind: 'strict' | 'off';
  magicLinkTtlMs: number;
  backupRetentionDays: number;
  upgradeDir: string;
  upgradeStatusDir: string;
  releasesUrl: string;
  version: string;
}

const here = dirname(fileURLToPath(import.meta.url));
export function readVersion(): string {
  for (const p of [join(here, '..', 'VERSION'), join(here, '..', '..', 'VERSION'), join(process.cwd(), 'VERSION')]) {
    try {
      return readFileSync(p, 'utf8').trim();
    } catch {
      /* try next */
    }
  }
  return '0.0.0';
}

const bool = (v: string | undefined, d: boolean) => (v === undefined ? d : /^(1|true|yes)$/i.test(v));
const int = (v: string | undefined, d: number) => (v && /^\d+$/.test(v) ? Number(v) : d);

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const dataDir = env.DATA_DIR ?? join(process.cwd(), 'data');
  return {
    port: int(env.PORT, 8086),
    baseUrl: (env.BASE_URL ?? 'http://localhost:8086').replace(/\/$/, ''),
    dbPath: env.DB_PATH ?? join(dataDir, 'mathquest.db'),
    dataDir,
    secure: bool(env.COOKIE_SECURE, false),
    resendApiKey: env.RESEND_API_KEY ?? '',
    resendApiBase: (env.RESEND_API_BASE ?? 'https://api.resend.com').replace(/\/$/, ''),
    mailFrom: env.MAIL_FROM ?? 'MathQuest <mathquest@mathquest.moot.es>',
    adminEmail: (env.ADMIN_EMAIL ?? '').toLowerCase(),
    anthropicApiKey: env.ANTHROPIC_API_KEY ?? '',
    anthropicModel: env.ANTHROPIC_MODEL ?? 'claude-sonnet-5-5',
    magicLinkBind: env.MAGIC_LINK_BIND === 'off' ? 'off' : 'strict',
    magicLinkTtlMs: int(env.MAGIC_LINK_TTL_MINUTES, 15) * 60_000,
    backupRetentionDays: int(env.BACKUP_RETENTION_DAYS, 14),
    upgradeDir: env.UPGRADE_DIR ?? join(process.cwd(), 'upgrade'),
    upgradeStatusDir: env.UPGRADE_STATUS_DIR ?? join(process.cwd(), 'upgrade-status'),
    releasesUrl: env.RELEASES_URL ?? 'https://api.github.com/repos/parabyte-ca/mathquest/releases/latest',
    version: readVersion(),
  };
}
