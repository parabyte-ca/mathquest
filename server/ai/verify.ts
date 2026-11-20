import { z } from 'zod';
import { evalArithmetic } from '../../shared/check.js';
import type { Item, Text } from '../../shared/items/types.js';

/** What we ask Claude to return for each question. Everything else is rejected. */
export const draftSchema = z
  .object({
    en: z.string().min(8).max(400),
    fr: z.string().min(8).max(400),
    compute: z.string().min(1).max(200),
    answer: z.number().finite(),
    stepsEn: z.array(z.string().min(3).max(300)).min(2).max(5),
    stepsFr: z.array(z.string().min(3).max(300)).min(2).max(5),
    hintsEn: z.array(z.string().min(3).max(300)).length(3),
    hintsFr: z.array(z.string().min(3).max(300)).length(3),
  })
  .strict();
export type Draft = z.infer<typeof draftSchema>;

// Words that never belong in a learner-facing question or hint here (negative framing, unsafe or off-topic content).
const BANNED = [
  'stupid', 'dumb', 'idiot', 'lazy', 'wrong', 'incorrect', 'fail', 'hate', 'kill', 'die', 'dead', 'gun', 'weapon', 'beer', 'wine', 'drug', 'sex',
  'stupide', 'idiot', 'paresseux', 'mauvais', 'échec', 'haine', 'tuer', 'mort', 'arme', 'bière', 'vin', 'drogue',
];
const BANNED_RE = new RegExp(`(^|[^\\p{L}])(${BANNED.join('|')})([^\\p{L}]|$)`, 'iu');
const URL_RE = /https?:|www\.|@\w+\.\w|<[a-z/]/i;

export type Rejection = 'schema' | 'recompute' | 'banned_term' | 'link_or_markup' | 'math_markup' | 'same_language' | 'duplicate';

const dollarsBalanced = (s: string): boolean => (s.match(/\$/g) ?? []).length % 2 === 0;

/** Independent checks on one draft. The answer must match a recomputation by our own math.js, never just Claude's word. */
export function verifyDraft(raw: unknown, existingPrompts: Set<string>): { ok: true; draft: Draft } | { ok: false; reason: Rejection } {
  const parsed = draftSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, reason: 'schema' };
  const d = parsed.data;
  const v = evalArithmetic(d.compute);
  if (v === null || Math.abs(v - d.answer) > 1e-9 * Math.max(1, Math.abs(d.answer))) return { ok: false, reason: 'recompute' };
  const all = [d.en, d.fr, ...d.stepsEn, ...d.stepsFr, ...d.hintsEn, ...d.hintsFr];
  if (all.some((s) => BANNED_RE.test(s))) return { ok: false, reason: 'banned_term' };
  if (all.some((s) => URL_RE.test(s))) return { ok: false, reason: 'link_or_markup' };
  if (!all.every(dollarsBalanced)) return { ok: false, reason: 'math_markup' };
  if (d.en.trim() === d.fr.trim()) return { ok: false, reason: 'same_language' };
  const key = d.en.toLowerCase().replace(/\s+/g, ' ').trim();
  if (existingPrompts.has(key)) return { ok: false, reason: 'duplicate' };
  return { ok: true, draft: d };
}

const tx = (en: string, fr: string): Text => ({ en, fr });

/** A verified draft becomes a normal number-answer Item. The id is set when it is served. */
export function draftToItem(d: Draft, skill: string, tier: number): Item {
  const hints = d.hintsEn.map((e, i) => tx(e, d.hintsFr[i]!)) as [Text, Text, Text];
  return {
    id: 'bank:draft', skill, tier, seed: 0, category: 'AP', format: 'number',
    prompt: tx(d.en, d.fr),
    answer: { kind: 'number', value: d.answer },
    steps: d.stepsEn.map((e, i) => tx(e, d.stepsFr[i] ?? e)),
    hints, wrong: [], expectedMs: 60_000,
  };
}
