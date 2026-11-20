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

/** Spend so far this calendar month (UTC), in micro-dollars. */
export function spentThisMonth(ctx: Ctx): number {
  const row = ctx.db.prepare('SELECT COALESCE(SUM(cost_micro_usd),0) AS s FROM ai_usage WHERE at >= ?').get(monthStart(ctx.now())) as { s: number };
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

function record(ctx: Ctx, kind: string, input: number, output: number, ok: boolean): void {
  ctx.db
    .prepare('INSERT INTO ai_usage (at, kind, model, input_tokens, output_tokens, cost_micro_usd, ok) VALUES (?,?,?,?,?,?,?)')
    .run(ctx.now(), kind, ctx.cfg.anthropicModel, input, output, costMicro(ctx, input, output), ok ? 1 : 0);
}
