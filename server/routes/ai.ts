import { Router, type Request } from 'express';
import { z } from 'zod';
import type { Ctx, UserRow } from '../context.js';
import { requireUser } from '../context.js';
import { audit } from '../audit.js';
import { AiError, capMicro, spentThisMonth } from '../ai/anthropic.js';
import { generateDrafts } from '../ai/pipeline.js';
import { allMicros, microById } from '../ai/pipeline.js';

const me = (req: Request): UserRow => (req.auth as { kind: 'user'; user: UserRow }).user;
const usd = (micro: number): number => Math.round(micro / 10_000) / 100;

/** Admin-only: Claude item pipeline, review queue, student reports and spend. */
export function aiRoutes(ctx: Ctx): Router {
  const r = Router();
  r.use('/admin/ai', requireUser('admin'));

  r.get('/admin/ai/status', (_req, res) => {
    res.json({
      configured: !!ctx.cfg.anthropicApiKey,
      model: ctx.cfg.anthropicModel,
      capUsd: ctx.cfg.aiMonthlyCapUsd,
      spentUsd: usd(spentThisMonth(ctx)),
      remainingUsd: usd(Math.max(0, capMicro(ctx) - spentThisMonth(ctx))),
      counts: Object.fromEntries((ctx.db.prepare('SELECT status, COUNT(*) AS n FROM bank_item GROUP BY status').all() as { status: string; n: number }[]).map((x) => [x.status, x.n])),
    });
  });

  r.get('/admin/ai/skills', (_req, res) => void res.json({ skills: allMicros().map((m) => ({ id: m.id, name: m.name })) }));

  r.get('/admin/ai/usage', (_req, res) => {
    const from = Date.UTC(new Date(ctx.now()).getUTCFullYear(), new Date(ctx.now()).getUTCMonth(), 1);
    const days = ctx.db
      .prepare("SELECT strftime('%Y-%m-%d', at/1000, 'unixepoch') AS day, COUNT(*) AS calls, SUM(input_tokens) AS inputTokens, SUM(output_tokens) AS outputTokens, SUM(cost_micro_usd) AS micro, SUM(ok = 0) AS failures FROM ai_usage WHERE at >= ? GROUP BY day ORDER BY day")
      .all(from) as { day: string; calls: number; inputTokens: number; outputTokens: number; micro: number; failures: number }[];
    res.json({ days: days.map(({ micro, ...d }) => ({ ...d, costUsd: usd(micro) })), prices: { inPerMTok: ctx.cfg.aiPriceInPerMTok, outPerMTok: ctx.cfg.aiPriceOutPerMTok } });
  });

  r.post('/admin/ai/generate', async (req, res) => {
    const body = z.object({ skill: z.string().max(40), tier: z.number().int().min(1).max(3), count: z.number().int().min(1).max(10).default(5) }).safeParse(req.body);
    if (!body.success || !microById(body.data.skill)) return void res.status(400).json({ error: 'invalid_request' });
    try {
      const out = await generateDrafts(ctx, body.data.skill, body.data.tier, body.data.count);
      audit(ctx.db, { kind: 'admin', id: me(req).id }, 'ai.generate', body.data.skill, { tier: body.data.tier, created: out.created });
      res.json(out);
    } catch (e) {
      if (e instanceof AiError) return void res.status(e.code === 'cap_reached' ? 402 : e.code === 'not_configured' ? 409 : 502).json({ error: e.code });
      throw e;
    }
  });

  r.get('/admin/ai/items', (req, res) => {
    const status = z.enum(['draft', 'approved', 'rejected', 'retired']).catch('draft').parse(req.query.status);
    const rows = ctx.db
      .prepare('SELECT b.id, b.skill, b.tier, b.status, b.item_json AS item, b.compute, b.created_at AS createdAt, b.served, (SELECT COUNT(*) FROM item_report i WHERE i.bank_id = b.id AND i.resolved = 0) AS reports FROM bank_item b WHERE b.status = ? ORDER BY b.id DESC LIMIT 100')
      .all(status) as { item: string }[];
    res.json({ items: rows.map((x) => ({ ...x, item: JSON.parse(x.item) as unknown })) });
  });

  const review = (to: 'approved' | 'rejected' | 'retired', from: string[]) => (req: Request, res: import('express').Response): void => {
    const body = z.object({ reason: z.string().trim().max(200).optional() }).safeParse(req.body ?? {});
    if (!body.success) return void res.status(400).json({ error: 'invalid_request' });
    const ph = from.map(() => '?').join(',');
    const info = ctx.db
      .prepare(`UPDATE bank_item SET status = ?, reviewed_by = ?, reviewed_at = ?, reject_reason = ? WHERE id = ? AND status IN (${ph})`)
      .run(to, me(req).id, new Date(ctx.now()).toISOString(), body.data.reason ?? null, Number(req.params.id), ...from);
    if (info.changes !== 1) return void res.status(404).json({ error: 'not_found' });
    if (to !== 'approved') ctx.db.prepare('UPDATE item_report SET resolved = 1 WHERE bank_id = ?').run(Number(req.params.id));
    audit(ctx.db, { kind: 'admin', id: me(req).id }, `ai.item.${to}`, req.params.id);
    res.json({ ok: true });
  };
  r.post('/admin/ai/items/:id/approve', review('approved', ['draft']));
  r.post('/admin/ai/items/:id/reject', review('rejected', ['draft']));
  r.post('/admin/ai/items/:id/retire', review('retired', ['approved']));

  r.get('/admin/ai/reports', (_req, res) => {
    res.json({
      reports: ctx.db
        .prepare('SELECT r.id, r.item_ref AS itemRef, r.bank_id AS bankId, r.reason, r.at, b.status AS itemStatus FROM item_report r LEFT JOIN bank_item b ON b.id = r.bank_id WHERE r.resolved = 0 ORDER BY r.id DESC LIMIT 100')
        .all(),
    });
  });
  r.post('/admin/ai/reports/:id/resolve', (req, res) => {
    const info = ctx.db.prepare('UPDATE item_report SET resolved = 1 WHERE id = ?').run(Number(req.params.id));
    if (info.changes !== 1) return void res.status(404).json({ error: 'not_found' });
    audit(ctx.db, { kind: 'admin', id: me(req).id }, 'ai.report.resolve', req.params.id);
    res.json({ ok: true });
  });

  return r;
}
