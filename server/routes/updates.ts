import { Router, type Request } from 'express';
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

interface UpgradeStatus {
  requestId: string | null;
  state: State;
  version: string | null;
  message: string;
  updatedAt: string | null;
  previousVersion: string | null;
}

const IDLE: UpgradeStatus = { requestId: null, state: 'idle', version: null, message: '', updatedAt: null, previousVersion: null };

/** The status folder is written by the root agent, so treat it as untrusted input: strict shape, no symlinks, size cap. */
export function readStatus(dir: string): UpgradeStatus {
  const file = join(dir, 'status.json');
  try {
    const st = lstatSync(file);
    if (!st.isFile() || st.size > 8192) return IDLE;
    const raw = JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>;
    const state = STATES.includes(raw.state as State) ? (raw.state as State) : 'idle';
    const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : null);
    const ver = (v: unknown) => (typeof v === 'string' && VERSION_RE.test(v) ? v : null);
    return {
      requestId: str(raw.requestId, 64), state, version: ver(raw.version), message: str(raw.message, 300) ?? '',
      updatedAt: str(raw.updatedAt, 40), previousVersion: ver(raw.previousVersion),
    };
  } catch {
    return IDLE;
  }
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

let releaseCache: { at: number; data: unknown } | null = null;

export function updateRoutes(ctx: Ctx): Router {
  const r = Router();
  r.use('/admin/updates', requireUser('admin'));

  r.get('/admin/updates', async (_req, res) => {
    let latest: { version: string; notes: string; url: string } | null = null;
    let releaseError: string | null = null;
    if (releaseCache && ctx.now() - releaseCache.at < 600_000) {
      latest = releaseCache.data as typeof latest;
    } else {
      try {
        const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'User-Agent': 'mathquest-updater' };
        if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
        const resp = await fetch('https://api.github.com/repos/parabyte-ca/mathquest/releases/latest', { headers, signal: AbortSignal.timeout(8000) });
        if (!resp.ok) throw new Error(`GitHub responded ${resp.status}`);
        const j = (await resp.json()) as { tag_name?: string; body?: string; html_url?: string };
        const version = (j.tag_name ?? '').replace(/^v/, '');
        if (VERSION_RE.test(version)) {
          latest = { version, notes: String(j.body ?? '').slice(0, 5000), url: String(j.html_url ?? '') };
          releaseCache = { at: ctx.now(), data: latest };
        }
      } catch (e) {
        releaseError = (e as Error).message;
      }
    }
    res.json({
      current: ctx.cfg.version,
      latest,
      releaseError,
      updateAvailable: !!latest && compare(latest.version, ctx.cfg.version) > 0,
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

export type { Request };
