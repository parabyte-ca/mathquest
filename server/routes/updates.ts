import { Router } from 'express';
import { z } from 'zod';
import { existsSync, readFileSync, renameSync, writeFileSync, mkdirSync, lstatSync } from 'node:fs';
import { join } from 'node:path';
import type { Ctx, UserRow } from '../context.js';
import { requireUser } from '../context.js';
import { audit } from '../audit.js';
import { newId, nowIso } from '../db.js';

const VERSION_RE = /^[0-9]+\.[0-9]+\.[0-9]+$/;
const STATES = ['idle', 'queued', 'validating', 'running', 'succeeded', 'failed', 'rolled_back'] as const;
type State = (typeof STATES)[number];

/** The stages of an upgrade, in order. `rollback` only appears when something went wrong. */
export const STEPS = ['backup', 'download', 'verify', 'deploy', 'health', 'rollback', 'done'] as const;
export type Step = (typeof STEPS)[number];

interface UpgradeStatus {
  requestId: string | null;
  state: State;
  version: string | null;
  message: string;
  updatedAt: string | null;
  previousVersion: string | null;
  /** The stage in progress, or the stage that failed. */
  step: Step | null;
  stepNumber: number | null;
  stepCount: number | null;
  /** Plain reason from the host script when an upgrade failed. */
  error: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  /** File name only (never a path) of the backup taken before the upgrade. */
  backupFile: string | null;
}

const IDLE: UpgradeStatus = {
  requestId: null, state: 'idle', version: null, message: '', updatedAt: null, previousVersion: null,
  step: null, stepNumber: null, stepCount: null, error: null, startedAt: null, finishedAt: null, backupFile: null,
};

const isoOrNull = (v: unknown): string | null => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T[\d:.]+Z?$/.test(v) && v.length <= 40 ? v : null);
const smallInt = (v: unknown): number | null => (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 20 ? v : null);
const stepOf = (v: unknown): Step | null => (STEPS.includes(v as Step) ? (v as Step) : null);
const safeFile = (v: unknown): string | null => (typeof v === 'string' && /^[A-Za-z0-9._-]{1,120}$/.test(v) ? v : null);

function readSmallJson(file: string): Record<string, unknown> | null {
  try {
    const st = lstatSync(file);
    if (!st.isFile() || st.size > 8192) return null;
    const raw = JSON.parse(readFileSync(file, 'utf8')) as unknown;
    return raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** The host agent touches heartbeat every minute it runs. No heartbeat, or an old one, means it is not installed or not running. */
export function agentSeen(dir: string, now: number): { seenAt: string | null; ok: boolean } {
  try {
    const st = lstatSync(join(dir, 'heartbeat'));
    if (!st.isFile()) return { seenAt: null, ok: false };
    return { seenAt: new Date(st.mtimeMs).toISOString(), ok: now - st.mtimeMs < 5 * 60_000 };
  } catch {
    return { seenAt: null, ok: false };
  }
}

/** The status folder is written by the root agent, so treat it as untrusted input: strict shape, no symlinks, size cap. */
export function readStatus(dir: string): UpgradeStatus {
  const raw = readSmallJson(join(dir, 'status.json'));
  if (!raw) return IDLE;
  const state = STATES.includes(raw.state as State) ? (raw.state as State) : 'idle';
  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : null);
  const ver = (v: unknown) => (typeof v === 'string' && VERSION_RE.test(v) ? v : null);
  const out: UpgradeStatus = {
    requestId: str(raw.requestId, 64), state, version: ver(raw.version), message: str(raw.message, 300) ?? '',
    updatedAt: isoOrNull(raw.updatedAt) ?? str(raw.updatedAt, 40), previousVersion: ver(raw.previousVersion),
    step: stepOf(raw.step), stepNumber: smallInt(raw.stepNumber), stepCount: smallInt(raw.stepCount), error: str(raw.error, 300),
    startedAt: isoOrNull(raw.startedAt), finishedAt: isoOrNull(raw.finishedAt), backupFile: safeFile(raw.backupFile),
  };
  // While an upgrade runs, update.sh reports the current stage in progress.json.
  if (['validating', 'running'].includes(state)) {
    const p = readSmallJson(join(dir, 'progress.json'));
    if (p) { out.step = stepOf(p.step) ?? out.step; out.stepNumber = smallInt(p.stepNumber) ?? out.stepNumber; out.stepCount = smallInt(p.stepCount) ?? out.stepCount; }
  }
  return out;
}

export function readLogTail(dir: string, lines = 40): string[] {
  const file = join(dir, 'upgrade.log');
  try {
    const st = lstatSync(file);
    if (!st.isFile()) return [];
    const text = readFileSync(file, 'utf8').slice(-20_000);
    return text.split('\n').slice(-lines).map((l) => l.slice(0, 300));
  } catch {
    return [];
  }
}

const compare = (a: string, b: string): number => {
  const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  return 0;
};

interface ReleaseInfo { version: string; notes: string; url: string }
let releaseCache: { at: number; latest: ReleaseInfo | null; all: ReleaseInfo[] } | null = null;
/** Test hook: forget the cached release check. */
export const clearReleaseCache = (): void => { releaseCache = null; };

const toRelease = (j: { tag_name?: string; body?: string; html_url?: string }): ReleaseInfo | null => {
  const version = (j.tag_name ?? '').replace(/^v/, '');
  return VERSION_RE.test(version) ? { version, notes: String(j.body ?? '').slice(0, 3000), url: String(j.html_url ?? '') } : null;
};

export function updateRoutes(ctx: Ctx): Router {
  const r = Router();
  r.use('/admin/updates', requireUser('admin'));

  r.get('/admin/updates', async (_req, res) => {
    let releaseError: string | null = null;
    if (!releaseCache || ctx.now() - releaseCache.at >= 600_000) {
      try {
        const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'User-Agent': 'mathquest-updater' };
        if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
        const resp = await fetch(ctx.cfg.releasesUrl, { headers, signal: AbortSignal.timeout(8000) });
        if (!resp.ok) throw new Error(`GitHub responded ${resp.status}`);
        const latest = toRelease((await resp.json()) as { tag_name?: string; body?: string; html_url?: string });
        // Notes for every version in between come from the release list (best effort: the latest alone is enough).
        let all: ReleaseInfo[] = latest ? [latest] : [];
        if (/\/latest$/.test(ctx.cfg.releasesUrl)) {
          try {
            const lr = await fetch(`${ctx.cfg.releasesUrl.replace(/\/latest$/, '')}?per_page=30`, { headers, signal: AbortSignal.timeout(8000) });
            if (lr.ok) {
              const list = ((await lr.json()) as { tag_name?: string; body?: string; html_url?: string; draft?: boolean; prerelease?: boolean }[])
                .filter((x) => !x.draft && !x.prerelease).map(toRelease).filter((x): x is ReleaseInfo => x !== null);
              if (list.length) all = list;
            }
          } catch { /* keep the latest alone */ }
        }
        releaseCache = { at: ctx.now(), latest, all };
      } catch (e) {
        releaseError = (e as Error).message;
      }
    }
    const latest = releaseCache?.latest ?? null;
    const between = (releaseCache?.all ?? [])
      .filter((x) => compare(x.version, ctx.cfg.version) > 0 && (!latest || compare(x.version, latest.version) <= 0))
      .sort((a, b) => compare(b.version, a.version))
      .slice(0, 10);
    res.json({
      current: ctx.cfg.version,
      latest,
      between,
      releaseError,
      updateAvailable: !!latest && compare(latest.version, ctx.cfg.version) > 0,
      agent: agentSeen(ctx.cfg.upgradeStatusDir, ctx.now()),
      status: readStatus(ctx.cfg.upgradeStatusDir),
      log: readLogTail(ctx.cfg.upgradeStatusDir),
    });
  });

  // The container only drops a request file. The root agent on the host validates it and runs update.sh.
  r.post('/admin/updates/request', (req, res) => {
    const parsed = z.object({ version: z.string().regex(VERSION_RE) }).strict().safeParse(req.body);
    if (!parsed.success) return void res.status(400).json({ error: 'invalid_version' });
    const status = readStatus(ctx.cfg.upgradeStatusDir);
    const requestFile = join(ctx.cfg.upgradeDir, 'request.json');
    if (['queued', 'validating', 'running'].includes(status.state) || existsSync(requestFile)) {
      return void res.status(409).json({ error: 'upgrade_in_progress' });
    }
    const requestId = newId();
    mkdirSync(ctx.cfg.upgradeDir, { recursive: true });
    const tmp = join(ctx.cfg.upgradeDir, `.request-${requestId}.tmp`);
    writeFileSync(tmp, JSON.stringify({ requestId, version: parsed.data.version, requestedAt: nowIso(), from: ctx.cfg.version }), { mode: 0o640 });
    renameSync(tmp, requestFile);
    audit(ctx.db, { kind: 'admin', id: ((req.auth as { user: UserRow }).user).id }, 'upgrade.request', parsed.data.version);
    res.status(202).json({ requestId });
  });

  return r;
}

