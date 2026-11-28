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
  anthropicApiBase: string;
  /** Hard monthly spend cap in USD; generation stops when the next call could exceed it. */
  aiMonthlyCapUsd: number;
  /** Price assumptions in USD per million tokens, used only to estimate spend. Set to your model's current rates. */
  aiPriceInPerMTok: number;
  aiPriceOutPerMTok: number;
  /** Reading a photo of a marked worksheet. Off unless switched on, and it needs the Anthropic key. */
  photoGrading: boolean;
  /** Its own monthly spend cap, inside the overall AI cap. */
  photoMonthlyCapUsd: number;
  magicLinkBind: 'strict' | 'off';
  magicLinkTtlMs: number;
  backupRetentionDays: number;
  upgradeDir: string;
  upgradeStatusDir: string;
  releasesUrl: string;
  /** IANA time zone for streak days, daily goals and the weekly email. */
  timezone: string;
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
const num = (v: string | undefined, d: number) => (v && Number.isFinite(Number(v)) && Number(v) >= 0 ? Number(v) : d);
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
    anthropicApiBase: (env.ANTHROPIC_API_BASE ?? 'https://api.anthropic.com').replace(/\/$/, ''),
    aiMonthlyCapUsd: num(env.AI_MONTHLY_CAP_USD, 5),
    aiPriceInPerMTok: num(env.AI_PRICE_IN_PER_MTOK, 3),
    aiPriceOutPerMTok: num(env.AI_PRICE_OUT_PER_MTOK, 15),
    photoGrading: bool(env.PHOTO_GRADING, false),
    photoMonthlyCapUsd: num(env.PHOTO_MONTHLY_CAP_USD, 2),
    magicLinkBind: env.MAGIC_LINK_BIND === 'off' ? 'off' : 'strict',
    magicLinkTtlMs: int(env.MAGIC_LINK_TTL_MINUTES, 15) * 60_000,
    backupRetentionDays: int(env.BACKUP_RETENTION_DAYS, 14),
    upgradeDir: env.UPGRADE_DIR ?? join(process.cwd(), 'upgrade'),
    upgradeStatusDir: env.UPGRADE_STATUS_DIR ?? join(process.cwd(), 'upgrade-status'),
    releasesUrl: env.RELEASES_URL ?? 'https://api.github.com/repos/parabyte-ca/mathquest/releases/latest',
    timezone: env.MATHQUEST_TZ ?? 'America/Toronto',
    version: readVersion(),
  };
}
