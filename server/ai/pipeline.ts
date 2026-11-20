import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Ctx } from '../context.js';
import { callClaude } from './anthropic.js';
import { draftToItem, verifyDraft, type Rejection } from './verify.js';

interface Micro { id: string; name: string; expectation: string }
let micros: Micro[] | null = null;
export function allMicros(): Micro[] {
  microById('');
  return micros!;
}
export function microById(id: string): Micro | undefined {
  micros ??= (JSON.parse(readFileSync(join(process.cwd(), 'content', 'microskills.json'), 'utf8')) as { microskills: Micro[] }).microskills;
  return micros.find((m) => m.id === id);
}

const SYSTEM = `You write practice questions for Ontario students in Grades 5 to 6, in English and in Canadian French.
Return ONLY a JSON array, no prose. Each element has exactly these keys:
en, fr (the question; wrap maths in $...$ for KaTeX), compute (the answer as a plain arithmetic expression using only digits, + - * / ^ and brackets),
answer (a number equal to compute), stepsEn, stepsFr (2 to 5 short worked steps), hintsEn, hintsFr (exactly 3: a nudge, a worked step, the full worked example).
Questions must have one numeric answer, use Canadian contexts and metric units, be kind and encouraging, and never include links, names of real people or brands.
Never reveal the answer in the question or the first hint.`;

export interface GenerateResult { created: number; rejected: Record<string, number>; ids: number[] }

/** Asks Claude for `count` questions for a micro-skill and tier, verifies each independently, and stores survivors as drafts. */
export async function generateDrafts(ctx: Ctx, skill: string, tier: number, count: number): Promise<GenerateResult> {
  const micro = microById(skill);
  if (!micro) throw new Error('unknown_skill');
  const user = `Skill: ${micro.name} (Ontario expectation ${micro.expectation}).\nDifficulty tier ${tier} of 3 (1 = easiest, 3 = hardest).\nWrite ${count} different questions.`;
  const text = await callClaude(ctx, 'generate', SYSTEM, user);
  const json = text.slice(text.indexOf('['), text.lastIndexOf(']') + 1);
  let rows: unknown[] = [];
  try {
    const parsed: unknown = JSON.parse(json);
    if (Array.isArray(parsed)) rows = parsed.slice(0, count);
  } catch { /* leave empty: counted below */ }

  const existing = new Set(
    (ctx.db.prepare("SELECT item_json FROM bank_item WHERE skill = ? AND status != 'rejected'").all(skill) as { item_json: string }[]).map((r) => (JSON.parse(r.item_json) as { prompt: { en: string } }).prompt.en.toLowerCase().replace(/\s+/g, ' ').trim()),
  );
  const rejected: Record<string, number> = {};
  const ids: number[] = [];
  if (rows.length === 0) rejected['schema'] = 1;
  for (const row of rows) {
    const v = verifyDraft(row, existing);
    if (!v.ok) { rejected[v.reason satisfies Rejection] = (rejected[v.reason] ?? 0) + 1; continue; }
    existing.add(v.draft.en.toLowerCase().replace(/\s+/g, ' ').trim());
    const info = ctx.db
      .prepare("INSERT INTO bank_item (skill, tier, status, item_json, compute, model, created_at) VALUES (?,?, 'draft', ?,?,?,?)")
      .run(skill, tier, JSON.stringify(draftToItem(v.draft, skill, tier)), v.draft.compute, ctx.cfg.anthropicModel, new Date(ctx.now()).toISOString());
    ids.push(Number(info.lastInsertRowid));
  }
  return { created: ids.length, rejected, ids };
}
