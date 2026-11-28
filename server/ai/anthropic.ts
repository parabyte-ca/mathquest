import type { Ctx } from '../context.js';

export class AiError extends Error {
  constructor(public code: 'not_configured' | 'cap_reached' | 'api_error' | 'bad_response', message?: string) {
    super(message ?? code);
  }
}

const monthStart = (t: number): number => {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
};

/** Spend so far this calendar month (UTC), in micro-dollars; for one kind of call when `kind` is given. */
export function spentThisMonth(ctx: Ctx, kind?: string): number {
  const row = (kind
    ? ctx.db.prepare('SELECT COALESCE(SUM(cost_micro_usd),0) AS s FROM ai_usage WHERE at >= ? AND kind = ?').get(monthStart(ctx.now()), kind)
    : ctx.db.prepare('SELECT COALESCE(SUM(cost_micro_usd),0) AS s FROM ai_usage WHERE at >= ?').get(monthStart(ctx.now()))) as { s: number };
  return row.s;
}

export const capMicro = (ctx: Ctx): number => Math.round(ctx.cfg.aiMonthlyCapUsd * 1_000_000);

/** USD per million tokens equals micro-dollars per token, so cost is a plain multiply. */
export const costMicro = (ctx: Ctx, input: number, output: number): number =>
  Math.round(input * ctx.cfg.aiPriceInPerMTok + output * ctx.cfg.aiPriceOutPerMTok);

/**
 * One Messages API call. Refuses before calling when the worst case (the whole prompt estimated at 4 characters per token,
 * plus max_tokens of output) would push this month past the cap, so the cap is never overshot by a single call.
 * Only the prompt we pass in is sent: no student data ever reaches this function.
 */
export async function callClaude(ctx: Ctx, kind: string, system: string, user: string, maxTokens = 3000): Promise<string> {
  if (!ctx.cfg.anthropicApiKey) throw new AiError('not_configured');
  const worst = costMicro(ctx, Math.ceil((system.length + user.length) / 4) + 50, maxTokens);
  if (spentThisMonth(ctx) + worst > capMicro(ctx)) throw new AiError('cap_reached');

  let res: Response;
  try {
    res = await fetch(`${ctx.cfg.anthropicApiBase}/v1/messages`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': ctx.cfg.anthropicApiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: ctx.cfg.anthropicModel, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] }),
      signal: AbortSignal.timeout(120_000),
    });
  } catch {
    record(ctx, kind, 0, 0, false);
    throw new AiError('api_error', 'network');
  }
  if (!res.ok) {
    record(ctx, kind, 0, 0, false);
    throw new AiError('api_error', `status ${res.status}`);
  }
  const body = (await res.json().catch(() => null)) as { content?: { type: string; text?: string }[]; usage?: { input_tokens?: number; output_tokens?: number } } | null;
  const input = body?.usage?.input_tokens ?? 0;
  const output = body?.usage?.output_tokens ?? 0;
  record(ctx, kind, input, output, true);
  const text = body?.content?.find((c) => c.type === 'text')?.text;
  if (!text) throw new AiError('bad_response');
  return text;
}

export interface ImageInput { mediaType: 'image/jpeg' | 'image/png' | 'image/webp'; base64: string }

/** The kind recorded for photo reads, so their spend can be capped on its own. */
export const PHOTO_KIND = 'photo';
export const photoCapMicro = (ctx: Ctx): number => Math.round(ctx.cfg.photoMonthlyCapUsd * 1_000_000);
/** A worst case for one photo: an image is at most about 1,600 tokens at the size the app sends, plus the prompt. */
const PHOTO_WORST_TOKENS = 2_000;

/** Photo reading is on only when switched on, with a key, and under both caps. */
export function photoAvailable(ctx: Ctx): boolean {
  return ctx.cfg.photoGrading && !!ctx.cfg.anthropicApiKey && spentThisMonth(ctx, PHOTO_KIND) < photoCapMicro(ctx) && spentThisMonth(ctx) < capMicro(ctx);
}

/**
 * One Messages API call with a photo, held to the photo cap as well as the overall cap, each checked against the worst case before the call.
 * The photo goes only to this request: nothing is written to disk or the database, and only the usage (token counts and cost) is recorded.
 */
export async function callClaudeWithImage(ctx: Ctx, system: string, user: string, image: ImageInput, maxTokens = 1200): Promise<string> {
  if (!ctx.cfg.anthropicApiKey || !ctx.cfg.photoGrading) throw new AiError('not_configured');
  const worst = costMicro(ctx, PHOTO_WORST_TOKENS + Math.ceil((system.length + user.length) / 4) + 50, maxTokens);
  if (spentThisMonth(ctx) + worst > capMicro(ctx) || spentThisMonth(ctx, PHOTO_KIND) + worst > photoCapMicro(ctx)) throw new AiError('cap_reached');

  let res: Response;
  try {
    res = await fetch(`${ctx.cfg.anthropicApiBase}/v1/messages`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': ctx.cfg.anthropicApiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: ctx.cfg.anthropicModel, max_tokens: maxTokens, system,
        messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.base64 } }, { type: 'text', text: user }] }],
      }),
      signal: AbortSignal.timeout(90_000),
    });
  } catch {
    record(ctx, PHOTO_KIND, 0, 0, false);
    throw new AiError('api_error', 'network');
  }
  if (!res.ok) {
    record(ctx, PHOTO_KIND, 0, 0, false);
    throw new AiError('api_error', `status ${res.status}`);
  }
  const body = (await res.json().catch(() => null)) as { content?: { type: string; text?: string }[]; usage?: { input_tokens?: number; output_tokens?: number } } | null;
  record(ctx, PHOTO_KIND, body?.usage?.input_tokens ?? 0, body?.usage?.output_tokens ?? 0, true);
  const text = body?.content?.find((c) => c.type === 'text')?.text;
  if (!text) throw new AiError('bad_response');
  return text;
}

function record(ctx: Ctx, kind: string, input: number, output: number, ok: boolean): void {
  ctx.db
    .prepare('INSERT INTO ai_usage (at, kind, model, input_tokens, output_tokens, cost_micro_usd, ok) VALUES (?,?,?,?,?,?,?)')
    .run(ctx.now(), kind, ctx.cfg.anthropicModel, input, output, costMicro(ctx, input, output), ok ? 1 : 0);
}
