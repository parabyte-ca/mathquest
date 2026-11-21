import type { Ctx } from './context.js';
import { generate, hasGenerator } from '../shared/generators/index.js';
import type { Answer, Item, Text, Visual } from '../shared/items/types.js';

const tx = (en: string, fr: string): Text => ({ en, fr });
const tex = (s: string | number): string => `$${s}$`;
const frac = (n: number, d: number): string => `\\frac{${n}}{${d}}`;

/** The answer-key line for an item, written in both languages (math in $...$). */
export function answerText(item: Item): Text {
  const a: Answer = item.answer;
  const opt = (i: number): Text => item.options?.[i] ?? tx(String(i + 1), String(i + 1));
  switch (a.kind) {
    case 'number': return tx(tex(a.value), tex(String(a.value).replace('.', '{,}')));
    case 'fraction': return tx(tex(frac(a.n, a.d)), tex(frac(a.n, a.d)));
    case 'mixed': return tx(tex(`${a.whole}${frac(a.n, a.d)}`), tex(`${a.whole}${frac(a.n, a.d)}`));
    case 'expression': return tx(tex(a.expr), tex(a.expr));
    case 'choice': return opt(a.index);
    case 'multi': return tx(a.indices.map((i) => opt(i).en).join('; '), a.indices.map((i) => opt(i).fr).join(' ; '));
    case 'order': return tx(a.order.map((i) => opt(i).en).join(' → '), a.order.map((i) => opt(i).fr).join(' → '));
    case 'match': return tx(a.pairs.map(([l, r]) => `${opt(l).en} – ${item.right?.[r]?.en ?? r + 1}`).join('; '), a.pairs.map(([l, r]) => `${opt(l).fr} – ${item.right?.[r]?.fr ?? r + 1}`).join(' ; '));
    case 'point': return tx(tex(`(${a.x},\\ ${a.y})`), tex(`(${a.x},\\ ${a.y})`));
  }
}

export interface WorksheetItem {
  n: number;
  format: Item['format'];
  prompt: Text;
  options?: Text[];
  right?: Text[];
  visual?: Visual;
  answer: Text;
  steps: Text[];
}

export interface WorksheetInput {
  focus: string; // expectation code
  tier: number | 'mixed';
  count: number;
  seed: number;
}

/**
 * A printable set of questions for one expectation. Item i comes from the expectation's micro-skills in turn, at the chosen tier
 * (or tiers 1, 2, 3 in turn for "mixed"), with seed + i, so the same seed always reprints the same sheet and answer key.
 */
export function buildWorksheet(ctx: Ctx, input: WorksheetInput): WorksheetItem[] {
  const micros = (ctx.db.prepare('SELECT id FROM microskill WHERE expectation = ? ORDER BY rowid').all(input.focus) as { id: string }[]).map((m) => m.id).filter(hasGenerator);
  if (micros.length === 0) return [];
  const out: WorksheetItem[] = [];
  const seen = new Set<string>();
  for (let i = 0, tries = 0; out.length < input.count && tries < input.count * 6; i++, tries++) {
    const tier = input.tier === 'mixed' ? 1 + (out.length % 3) : input.tier;
    const item = generate(micros[out.length % micros.length]!, tier, input.seed + i);
    const key = JSON.stringify([item.prompt.en, item.options]);
    if (seen.has(key)) continue; // no two identical questions on one sheet
    seen.add(key);
    out.push({ n: out.length + 1, format: item.format, prompt: item.prompt, options: item.options, right: item.right, visual: item.visual, answer: answerText(item), steps: item.steps });
  }
  return out;
}
