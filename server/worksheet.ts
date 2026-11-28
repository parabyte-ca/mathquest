import type { Ctx, StudentRow } from './context.js';
import { newId } from './db.js';
import { isGiven } from '../shared/check.js';
import { XP_WORKSHEET_FINISH } from '../shared/rewards.js';
import { answer as recordAnswer } from './learn/service.js';
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

/** What a question was made from, kept on the server so marking can regenerate it. Never sent to a browser. */
export interface MarkableItem extends WorksheetItem { ref: { skill: string; tier: number; seed: number } }

export interface WorksheetInput {
  focus: string | string[]; // one expectation code, or several to mix on one sheet
  tier: number | 'mixed';
  count: number;
  seed: number;
}

export const MAX_TOPICS = 6;

/** Questions answered by moving a slider or an on-screen protractor cannot be answered on paper, so a sheet leaves those skills out. */
const printable = (skill: string): boolean => hasGenerator(skill) && !['slider', 'angle'].includes(generate(skill, 1, 1).format);

/**
 * A printable set of questions for one or more expectations. Questions take the topics in turn, and within a topic its micro-skills
 * in turn, at the chosen tier (or tiers 1, 2, 3 in turn for "mixed"), with seed + i, so the same seed always reprints the same sheet
 * and answer key. Topics without practice content are left out.
 */
export function buildWorksheet(ctx: Ctx, input: WorksheetInput): MarkableItem[] {
  const focuses = [...new Set(Array.isArray(input.focus) ? input.focus : [input.focus])].slice(0, MAX_TOPICS);
  const lists = focuses
    .map((f) => (ctx.db.prepare('SELECT id FROM microskill WHERE expectation = ? ORDER BY rowid').all(f) as { id: string }[]).map((m) => m.id).filter(printable))
    .filter((l) => l.length > 0);
  if (lists.length === 0) return [];
  const out: MarkableItem[] = [];
  const seen = new Set<string>();
  for (let i = 0, tries = 0; out.length < input.count && tries < input.count * 6; i++, tries++) {
    const tier = input.tier === 'mixed' ? 1 + (out.length % 3) : input.tier;
    const list = lists[out.length % lists.length]!;
    const skill = list[Math.floor(out.length / lists.length) % list.length]!;
    const item = generate(skill, tier, input.seed + i);
    const key = JSON.stringify([item.prompt.en, item.options]);
    if (seen.has(key)) continue; // no two identical questions on one sheet
    seen.add(key);
    out.push({ n: out.length + 1, format: item.format, prompt: item.prompt, options: item.options, right: item.right, visual: item.visual, answer: answerText(item), steps: item.steps, ref: { skill, tier, seed: input.seed + i } });
  }
  return out;
}

/** The same sheet always has the same name: its topics in order, difficulty, length and seed. A sheet counts towards points once. */
export const sheetName = (input: WorksheetInput): string => `${[...new Set(Array.isArray(input.focus) ? input.focus : [input.focus])].slice(0, MAX_TOPICS).join(',')}|${input.tier}|${input.count}|${input.seed}`;

export interface MarkedSheet {
  already: boolean;
  total: number;
  answered: number;
  correct: number;
  xp: number;
  finished: boolean;
  bonus: number;
  results: { n: number; correct: boolean; xp: number }[];
  level: number | null;
  leveledUp: boolean;
  newBadges: string[];
}

export class WorksheetError extends Error {
  constructor(public code: string, public status = 400) { super(code); }
}

/** What an earlier marking of this sheet recorded, if any. */
export function markedSheet(ctx: Ctx, studentId: string, input: WorksheetInput): { total: number; answered: number; correct: number; xp: number; at: number } | null {
  const r = ctx.db.prepare('SELECT total, answered, correct, xp, marked_at AS at FROM worksheet_marked WHERE student_id = ? AND sheet = ?').get(studentId, sheetName(input)) as { total: number; answered: number; correct: number; xp: number; at: number } | undefined;
  return r ?? null;
}

/**
 * Marks the answers entered for a sheet. Each answer is checked by the same rules as practice and earns the same XP, and it updates
 * the student's skill progress the same way. Finishing the whole sheet (every question answered) adds a small bonus. A sheet counts once:
 * a second marking of the same sheet changes nothing.
 */
export function markWorksheet(ctx: Ctx, student: StudentRow, input: WorksheetInput, given: { n: number; given: unknown }[]): MarkedSheet {
  const items = buildWorksheet(ctx, input);
  if (items.length === 0) throw new WorksheetError('no_content', 404);
  const before = markedSheet(ctx, student.id, input);
  if (before) return { already: true, total: before.total, answered: before.answered, correct: before.correct, xp: before.xp, finished: before.answered >= before.total, bonus: 0, results: [], level: null, leveledUp: false, newBadges: [] };

  const byN = new Map<number, unknown>();
  for (const g of given) if (Number.isInteger(g.n) && g.n >= 1 && g.n <= items.length && !byN.has(g.n) && isGiven(g.given)) byN.set(g.n, g.given);
  if (byN.size === 0) throw new WorksheetError('no_answers');
  const finished = byN.size === items.length;
  const last = Math.max(...byN.keys());

  const out: MarkedSheet = { already: false, total: items.length, answered: byN.size, correct: 0, xp: 0, finished, bonus: finished ? XP_WORKSHEET_FINISH : 0, results: [], level: null, leveledUp: false, newBadges: [] };
  const run = newId().slice(0, 10);
  ctx.db.transaction(() => {
    for (const it of items) {
      const g = byN.get(it.n);
      if (g === undefined) continue;
      const q = generate(it.ref.skill, it.ref.tier, it.ref.seed);
      const target = (ctx.db.prepare('SELECT expectation FROM microskill WHERE id = ?').get(it.ref.skill) as { expectation: string } | undefined)?.expectation ?? it.ref.skill;
      const pid = `ws:${run}:${it.n}`;
      ctx.db.prepare('INSERT OR REPLACE INTO pending_item (id, student_id, session_id, kind, target, item_json, hints, issued_at) VALUES (?,?,NULL,?,?,?,?,?)').run(pid, student.id, 'practice', target, JSON.stringify(q), 0, ctx.now());
      const r = recordAnswer(ctx, student, pid, g, 0, it.n === last && finished ? { worksheetBonus: XP_WORKSHEET_FINISH } : {});
      if (r.correct) out.correct += 1;
      const xp = r.reward?.xp ?? 0;
      out.xp += xp;
      out.results.push({ n: it.n, correct: r.correct, xp });
      if (r.reward) { out.level = r.reward.level; out.leveledUp = out.leveledUp || r.reward.leveledUp; for (const b of r.reward.newBadges) if (!out.newBadges.includes(b)) out.newBadges.push(b); }
    }
    ctx.db.prepare('INSERT INTO worksheet_marked (student_id, sheet, marked_at, total, answered, correct, xp) VALUES (?,?,?,?,?,?,?)').run(student.id, sheetName(input), ctx.now(), out.total, out.answered, out.correct, out.xp);
  })();
  return out;
}
