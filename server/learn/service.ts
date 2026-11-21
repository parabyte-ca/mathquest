// The learning loop: choose what to practise, serve items, grade answers, update mastery, run the struggle ladder,
// schedule spaced review, run placement and build the skill map. All answers are checked here, on the server.
import { randomInt } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Ctx, StudentRow } from '../context.js';
import { newId } from '../db.js';
import { check, isGiven } from '../../shared/check.js';
import { bktUpdate, aggregate, DEFAULT_BKT, MASTERED, PROFICIENT, skillState, type SkillState } from '../../shared/engine/bkt.js';
import { newLadder, nextAction, onAttempt, type Ladder, type LadderEnv } from '../../shared/engine/ladder.js';
import { isDue, onReview, scheduleFirstReview } from '../../shared/engine/review.js';
import { nextProbe, placementPriors, recordPlacement, startPlacement, startingIndex, type PlacementState } from '../../shared/engine/placement.js';
import { buildFeedback, type Feedback } from '../../shared/feedback.js';
import { generate, hasGenerator, MAX_TIER } from '../../shared/generators/index.js';
import { effectiveSettings, onAnswered, type RewardResult } from '../rewards/service.js';
import { toPublic, type Given, type Item, type PublicItem, type Text } from '../../shared/items/types.js';
import { lessonForSkill } from '../../shared/lessons/index.js';
import { makeRng } from '../../shared/rng.js';

export class LearnError extends Error {
  constructor(public code: string, public status = 400) {
    super(code);
  }
}

export interface SessionParams {
  grade: number;
  course: string | null;
  strands: string[]; // empty = mix it up
  /** Practise one expectation only, for example "G5.C2.3" (used by the skill map). */
  focus: string | null;
}

interface MasteryRow {
  p_known: number; tier: number; attempts: number; correct: number;
  last_seen_at: number | null; next_review_at: number | null; review_step: number;
}

const rand = (ctx: Ctx): number => (ctx.rand ?? Math.random)();
const seedFor = (ctx: Ctx): number => (ctx.rand ? Math.floor(ctx.rand() * 2_000_000_000) + 1 : randomInt(1, 2_000_000_000));
const isMicro = (id: string): boolean => id.startsWith('MS.');

// ── content lookups ──────────────────────────────────────────────────────────────

function microsOf(ctx: Ctx, expectation: string): string[] {
  const rows = ctx.db.prepare('SELECT id FROM microskill WHERE expectation = ? ORDER BY rowid').all(expectation) as { id: string }[];
  return rows.map((r) => r.id).filter(hasGenerator);
}

function expectationOf(ctx: Ctx, micro: string): string | null {
  const r = ctx.db.prepare('SELECT expectation FROM microskill WHERE id = ?').get(micro) as { expectation: string } | undefined;
  return r?.expectation ?? null;
}

function allowedGrades(student: StudentRow): number[] {
  const allowed = (JSON.parse(student.allowed_json) as { grades?: number[] }).grades ?? [];
  return allowed.length ? allowed : [5, 6, 7, 8, 9, 10, 11, 12];
}

export function options(ctx: Ctx, student: StudentRow) {
  const grades = allowedGrades(student).map((grade) => {
    const rows = ctx.db.prepare('SELECT code, course, strand, strand_name AS strandName FROM curriculum_expectation WHERE grade = ? ORDER BY code').all(grade) as { code: string; course: string | null; strand: string; strandName: string }[];
    const groups = new Map<string, { course: string | null; strands: Map<string, { strand: string; name: string; available: boolean }> }>();
    for (const r of rows) {
      const key = r.course ?? '';
      if (!groups.has(key)) groups.set(key, { course: r.course, strands: new Map() });
      const g = groups.get(key)!;
      const s = g.strands.get(r.strand) ?? { strand: r.strand, name: r.strandName, available: false };
      if (microsOf(ctx, r.code).length > 0) s.available = true;
      g.strands.set(r.strand, s);
    }
    return { grade, groups: [...groups.values()].map((g) => ({ course: g.course, strands: [...g.strands.values()] })) };
  });
  return { defaultGrade: student.grade, grades };
}

function targetsFor(ctx: Ctx, p: SessionParams): string[] {
  const rows = ctx.db
    .prepare('SELECT code, strand FROM curriculum_expectation WHERE grade = ? AND course IS ? ORDER BY code')
    .all(p.grade, p.course) as { code: string; strand: string }[];
  return rows.filter((r) => (p.focus ? r.code === p.focus : p.strands.length === 0 || p.strands.includes(r.strand)) && microsOf(ctx, r.code).length > 0).map((r) => r.code);
}

// ── mastery ──────────────────────────────────────────────────────────────────────

function getMastery(ctx: Ctx, sid: string, skill: string): MasteryRow {
  const r = ctx.db.prepare('SELECT p_known, tier, attempts, correct, last_seen_at, next_review_at, review_step FROM mastery WHERE student_id = ? AND skill_id = ?').get(sid, skill) as MasteryRow | undefined;
  return r ?? { p_known: DEFAULT_BKT.pInit, tier: 1, attempts: 0, correct: 0, last_seen_at: null, next_review_at: null, review_step: 0 };
}

function saveMastery(ctx: Ctx, sid: string, skill: string, m: MasteryRow): void {
  ctx.db
    .prepare(`INSERT INTO mastery (student_id, skill_id, p_known, tier, attempts, correct, last_seen_at, next_review_at, review_step)
              VALUES (?,?,?,?,?,?,?,?,?)
              ON CONFLICT(student_id, skill_id) DO UPDATE SET p_known=excluded.p_known, tier=excluded.tier, attempts=excluded.attempts,
              correct=excluded.correct, last_seen_at=excluded.last_seen_at, next_review_at=excluded.next_review_at, review_step=excluded.review_step`)
    .run(sid, skill, m.p_known, m.tier, m.attempts, m.correct, m.last_seen_at, m.next_review_at, m.review_step);
}

const expectationP = (ctx: Ctx, sid: string, exp: string): number => aggregate(microsOf(ctx, exp).map((m) => getMastery(ctx, sid, m).p_known));
const expectationMastered = (ctx: Ctx, sid: string, exp: string): boolean => {
  const ms = microsOf(ctx, exp);
  return ms.length > 0 && ms.every((m) => getMastery(ctx, sid, m).p_known >= MASTERED);
};

// ── ladder ─────────────────────────────────────────────────────────────────────────

function ladderEnv(ctx: Ctx, sid: string): LadderEnv {
  return {
    microSkillsOf: (exp) => microsOf(ctx, exp),
    pKnown: (id) => getMastery(ctx, sid, id).p_known,
    weakestPrereq: (id) => {
      const pre = (ctx.db.prepare('SELECT prereq FROM microskill_prereq WHERE microskill = ?').all(id) as { prereq: string }[]).map((r) => r.prereq).filter(hasGenerator);
      if (pre.length === 0) return null;
      return pre.sort((a, b) => getMastery(ctx, sid, a).p_known - getMastery(ctx, sid, b).p_known)[0]!;
    },
  };
}

function loadLadder(ctx: Ctx, sid: string, target: string): Ladder {
  const row = ctx.db.prepare('SELECT state_json FROM ladder_state WHERE student_id = ? AND target = ?').get(sid, target) as { state_json: string } | undefined;
  if (row) return JSON.parse(row.state_json) as Ladder;
  const p = expectationP(ctx, sid, target);
  return newLadder(target, p < 0.4 ? 1 : p < 0.7 ? 2 : 3, MAX_TIER);
}

function saveLadder(ctx: Ctx, sid: string, l: Ladder): void {
  ctx.db
    .prepare('INSERT INTO ladder_state (student_id, target, state_json, updated_at) VALUES (?,?,?,?) ON CONFLICT(student_id, target) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at')
    .run(sid, l.skill, JSON.stringify(l), ctx.now());
}

// ── sessions and items ─────────────────────────────────────────────────────────────

interface SessionRow { id: string; student_id: string; params_json: string }
interface Stored { params: SessionParams; last?: { target: string; skill: string; tier: number; kind: 'practice' | 'review' } }

function loadSession(ctx: Ctx, student: StudentRow, id: string): { row: SessionRow; data: Stored } {
  const row = ctx.db.prepare('SELECT id, student_id, params_json FROM practice_session WHERE id = ? AND student_id = ?').get(id, student.id) as SessionRow | undefined;
  if (!row) throw new LearnError('session_not_found', 404);
  return { row, data: JSON.parse(row.params_json) as Stored };
}

/** After a session reaches its caregiver-set limit, a new one waits this long. */
const BREAK_MS = 20 * 60_000;

export function startSession(ctx: Ctx, student: StudentRow, input: { grade: number; course?: string | null; strands?: string[]; focus?: string | null }) {
  if (!allowedGrades(student).includes(input.grade)) throw new LearnError('grade_not_allowed', 403);
  const rested = ctx.db.prepare('SELECT value FROM kv WHERE key = ?').get(`rest:${student.id}`) as { value: string } | undefined;
  if (rested && ctx.now() - Number(rested.value) < BREAK_MS) throw new LearnError('take_a_break', 429);
  const params: SessionParams = { grade: input.grade, course: input.course ?? null, strands: input.strands ?? [], focus: input.focus ?? null };
  const targets = targetsFor(ctx, params);
  if (targets.length === 0) throw new LearnError('no_content', 404);
  const id = newId();
  ctx.db.prepare('INSERT INTO practice_session (id, student_id, params_json, started_at, last_at) VALUES (?,?,?,?,?)').run(id, student.id, JSON.stringify({ params } satisfies Stored), ctx.now(), ctx.now());
  return { sessionId: id, targetCount: targets.length };
}

/** About one practice question in four comes from the admin-approved bank, when there is one for this skill and tier. */
const BANK_SHARE = 0.25;
function pickBank(ctx: Ctx, skill: string, tier: number): Item | null {
  if (rand(ctx) >= BANK_SHARE) return null;
  const rows = ctx.db.prepare("SELECT id, item_json FROM bank_item WHERE status = 'approved' AND skill = ? AND tier = ?").all(skill, tier) as { id: number; item_json: string }[];
  if (rows.length === 0) return null;
  const row = rows[Math.floor(rand(ctx) * rows.length) % rows.length]!;
  ctx.db.prepare('UPDATE bank_item SET served = served + 1 WHERE id = ?').run(row.id);
  return { ...(JSON.parse(row.item_json) as Item), id: `bank${row.id}` };
}

export function reportItem(ctx: Ctx, student: StudentRow, itemRef: string, reason: string): { ok: true } {
  const ref = itemRef.split(':').slice(0, -1).join(':') || itemRef; // drop the per-issue random suffix
  const bankId = /^bank(\d+)$/.exec(ref)?.[1];
  const today = ctx.now() - 86_400_000;
  const recent = (ctx.db.prepare('SELECT COUNT(*) AS n FROM item_report WHERE student_id = ? AND at > ?').get(student.id, today) as { n: number }).n;
  if (recent >= 20) throw new LearnError('rate_limited', 429);
  ctx.db.prepare('INSERT OR IGNORE INTO item_report (student_id, item_ref, bank_id, reason, at) VALUES (?,?,?,?,?)').run(student.id, ref, bankId ? Number(bankId) : null, reason, ctx.now());
  if (bankId) {
    const distinct = (ctx.db.prepare('SELECT COUNT(DISTINCT student_id) AS n FROM item_report WHERE bank_id = ? AND resolved = 0').get(Number(bankId)) as { n: number }).n;
    if (distinct >= 2) ctx.db.prepare("UPDATE bank_item SET status = 'retired' WHERE id = ? AND status = 'approved'").run(Number(bankId));
  }
  return { ok: true };
}

function issue(ctx: Ctx, student: StudentRow, sessionId: string | null, kind: 'practice' | 'review' | 'placement', target: string, skill: string, tier: number): PublicItem & { micro: string } {
  let micro = skill;
  if (!isMicro(skill)) {
    const ms = microsOf(ctx, skill);
    if (ms.length === 0) throw new LearnError('no_content', 404);
    const weights = ms.map((m) => 1.1 - getMastery(ctx, student.id, m).p_known);
    let r = rand(ctx) * weights.reduce((a, b) => a + b, 0);
    micro = ms[ms.length - 1]!;
    for (let i = 0; i < ms.length; i++) { r -= weights[i]!; if (r <= 0) { micro = ms[i]!; break; } }
  }
  const banked = kind === 'practice' ? pickBank(ctx, micro, tier) : null;
  const item = banked ?? generate(micro, tier, seedFor(ctx));
  const pid = `${item.id}:${newId().slice(0, 8)}`; // the id the client sees; never reveals more than skill, tier and seed
  ctx.db.prepare('INSERT INTO pending_item (id, student_id, session_id, kind, target, item_json, hints, issued_at) VALUES (?,?,?,?,?,?,0,?)').run(pid, student.id, sessionId, kind, target, JSON.stringify(item), ctx.now());
  return { ...toPublic({ ...item, id: pid }), micro };
}

/** The lesson that teaches a skill, if there is one (the page opens it from "Show me how"). */
const lessonIdFor = (skill: string): string | null => lessonForSkill(skill)?.id ?? null;

const pub = ({ micro: _micro, ...rest }: PublicItem & { micro: string }): PublicItem => rest;

export type NextResult =
  | { type: 'item'; item: PublicItem; kind: string; target: string; phase: string; resumed?: boolean; lessonId?: string | null }
  | { type: 'lesson'; lessonId: string; skill: string; target: string; reason: 'stuck' }
  | { type: 'done'; reason?: 'limit'; summary: { answered: number; correct: number; masteredExpectations: string[] } };

function summary(ctx: Ctx, student: StudentRow, sessionId: string, targets: string[]) {
  const s = ctx.db.prepare('SELECT answered, correct FROM practice_session WHERE id = ?').get(sessionId) as { answered: number; correct: number };
  return { answered: s.answered, correct: s.correct, masteredExpectations: targets.filter((t) => expectationMastered(ctx, student.id, t)) };
}

export function next(ctx: Ctx, student: StudentRow, sessionId: string, opts: { similar?: boolean } = {}): NextResult {
  const { data } = loadSession(ctx, student, sessionId);
  const targets = targetsFor(ctx, data.params);
  ctx.db.prepare('UPDATE practice_session SET last_at = ? WHERE id = ?').run(ctx.now(), sessionId);

  // Resume an unanswered item after a reload instead of silently skipping it.
  const pending = ctx.db.prepare('SELECT id, kind, target, item_json FROM pending_item WHERE student_id = ? AND session_id = ? ORDER BY rowid DESC LIMIT 1').get(student.id, sessionId) as { id: string; kind: string; target: string; item_json: string } | undefined;
  if (pending && !opts.similar) {
    const item = JSON.parse(pending.item_json) as Item;
    return { type: 'item', item: toPublic({ ...item, id: pending.id }), kind: pending.kind, target: pending.target, phase: loadLadder(ctx, student.id, pending.target).phase, resumed: true, lessonId: lessonIdFor(item.skill) };
  }
  ctx.db.prepare('DELETE FROM pending_item WHERE student_id = ? AND session_id = ?').run(student.id, sessionId);

  // A caregiver-set limit per sitting: finish the question in hand, then suggest a break.
  const limit = effectiveSettings(ctx, student).sessionLimitMinutes;
  const started = (ctx.db.prepare('SELECT started_at FROM practice_session WHERE id = ?').get(sessionId) as { started_at: number }).started_at;
  if (limit > 0 && ctx.now() - started >= limit * 60_000) {
    ctx.db.prepare('INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(`rest:${student.id}`, String(ctx.now()));
    return { type: 'done', reason: 'limit', summary: summary(ctx, student, sessionId, targets) };
  }

  if (opts.similar && data.last) {
    const l = data.last;
    const it = issue(ctx, student, sessionId, l.kind, l.target, l.skill, l.tier);
    return { type: 'item', item: pub(it), kind: l.kind, target: l.target, phase: loadLadder(ctx, student.id, l.target).phase, lessonId: lessonIdFor(it.skill) };
  }

  for (let guard = 0; guard < 6; guard++) {
    // 1. finish any remediation in progress
    const active = targets
      .map((t) => ({ t, l: loadLadder(ctx, student.id, t) }))
      .filter((x) => x.l.phase !== 'normal' && !expectationMastered(ctx, student.id, x.t))
      .sort((a, b) => (b.l.needsHelp ? 0 : 1) - (a.l.needsHelp ? 0 : 1));
    // 2. due reviews, about one in four serves (or when everything else is mastered)
    const due = targets.flatMap((t) => microsOf(ctx, t).filter((m) => { const r = getMastery(ctx, student.id, m); return r.next_review_at !== null && isDue({ nextReviewAt: r.next_review_at }, ctx.now()); }).map((m) => ({ t, m })));
    const unmastered = targets.filter((t) => !expectationMastered(ctx, student.id, t));

    let choice: { target: string; ladder: Ladder } | null = null;
    if (active.length > 0) choice = { target: active[0]!.t, ladder: active[0]!.l };
    else if (due.length > 0 && (unmastered.length === 0 || rand(ctx) < 0.25)) {
      const d = due[Math.floor(rand(ctx) * due.length)]!;
      const it = issue(ctx, student, sessionId, 'review', d.t, d.m, 2);
      setLast(ctx, sessionId, data, { target: d.t, skill: d.m, tier: 2, kind: 'review' });
      return { type: 'item', item: pub(it), kind: 'review', target: d.t, phase: 'normal', lessonId: lessonIdFor(it.skill) };
    } else if (unmastered.length > 0) {
      const ranked = unmastered.map((t) => ({ t, p: expectationP(ctx, student.id, t), r: rand(ctx) })).sort((a, b) => a.p - b.p || a.r - b.r);
      // Prefer targets whose recommended prerequisites are not clearly weak; never block.
      const pre = (t: string) => (ctx.db.prepare('SELECT from_code FROM prereq_edge WHERE to_code = ?').all(t) as { from_code: string }[]).map((r) => r.from_code);
      const ready = ranked.filter((x) => pre(x.t).every((p) => microsOf(ctx, p).length === 0 || expectationP(ctx, student.id, p) >= 0.5));
      const pick = (ready.length ? ready : ranked)[0]!;
      choice = { target: pick.t, ladder: loadLadder(ctx, student.id, pick.t) };
    } else {
      return { type: 'done', summary: summary(ctx, student, sessionId, targets) };
    }

    const action = nextAction(choice!.ladder);
    if (action.type === 'lesson') {
      const lesson = lessonForSkill(action.skill) ?? lessonForSkill(microsOf(ctx, action.skill)[0] ?? '');
      if (lesson) return { type: 'lesson', lessonId: lesson.id, skill: action.skill, target: choice!.target, reason: 'stuck' };
      // No lesson written for this skill yet: carry on rather than leave the student stuck.
      saveLadder(ctx, student.id, onAttempt(choice!.ladder, { correct: true, hints: 0, ms: 0, expectedMs: 0 }, ladderEnv(ctx, student.id)));
      continue;
    }
    const it = issue(ctx, student, sessionId, 'practice', choice!.target, action.skill, action.tier);
    setLast(ctx, sessionId, data, { target: choice!.target, skill: it.micro, tier: action.tier, kind: 'practice' });
    return { type: 'item', item: pub(it), kind: 'practice', target: choice!.target, phase: choice!.ladder.phase, lessonId: lessonIdFor(it.skill) };
  }
  return { type: 'done', summary: summary(ctx, student, sessionId, targets) };
}

function setLast(ctx: Ctx, id: string, data: Stored, last: Stored['last']): void {
  ctx.db.prepare('UPDATE practice_session SET params_json = ? WHERE id = ?').run(JSON.stringify({ ...data, last }), id);
}

/** The student read the lesson the ladder inserted; the ladder moves on to the micro-skill that tripped them. */
export function lessonDone(ctx: Ctx, student: StudentRow, target: string): void {
  const l = loadLadder(ctx, student.id, target);
  if (l.phase !== 'lesson') return;
  saveLadder(ctx, student.id, onAttempt(l, { correct: true, hints: 0, ms: 0, expectedMs: 0 }, ladderEnv(ctx, student.id)));
}

export function hint(ctx: Ctx, student: StudentRow, itemId: string): { level: number; text: Text } {
  const p = ctx.db.prepare('SELECT id, item_json, hints FROM pending_item WHERE id = ? AND student_id = ?').get(itemId, student.id) as { id: string; item_json: string; hints: number } | undefined;
  if (!p) throw new LearnError('item_not_found', 404);
  const item = JSON.parse(p.item_json) as Item;
  const level = Math.min(3, p.hints + 1);
  ctx.db.prepare('UPDATE pending_item SET hints = ? WHERE id = ?').run(level, p.id);
  return { level, text: item.hints[level - 1]! };
}

export type LadderEvent = 'none' | 'advance' | 'stepdown' | 'micro' | 'lesson' | 'buildup' | 'recovered' | 'help';

export interface AnswerResult {
  correct: boolean;
  feedback: Feedback;
  event: LadderEvent;
  skill: string;
  pKnown: number;
  state: SkillState;
  masteredSkill: boolean;
  masteredExpectation: boolean;
  reward?: RewardResult | null;
  placement?: { done: boolean; next?: PublicItem; result?: { startingSkill: string | null; ladder: string[]; startingIndex: number } };
}

export function answer(ctx: Ctx, student: StudentRow, itemId: string, given: unknown, ms: number): AnswerResult {
  if (!isGiven(given)) throw new LearnError('invalid_answer', 400);
  const p = ctx.db.prepare('SELECT id, session_id, kind, target, item_json, hints, issued_at FROM pending_item WHERE id = ? AND student_id = ?').get(itemId, student.id) as
    | { id: string; session_id: string | null; kind: 'practice' | 'review' | 'placement'; target: string; item_json: string; hints: number; issued_at: number }
    | undefined;
  if (!p) throw new LearnError('item_not_found', 404);
  const item = JSON.parse(p.item_json) as Item;
  const correct = check(item.answer, given as Given);
  ctx.db.prepare('DELETE FROM pending_item WHERE id = ?').run(p.id);

  const elapsed = Math.max(0, Math.min(Math.round(ms) || ctx.now() - p.issued_at, 600_000));
  const m = getMastery(ctx, student.id, item.skill);
  const before = m.p_known;
  m.p_known = bktUpdate(m.p_known, { correct, hints: p.hints, tries: 1, ms: elapsed, expectedMs: item.expectedMs });
  m.attempts += 1;
  if (correct) m.correct += 1;
  m.tier = item.tier;
  m.last_seen_at = ctx.now();

  let masteredSkill = false;
  if (p.kind === 'review') {
    const r = onReview({ step: m.review_step, nextReviewAt: m.next_review_at }, correct, ctx.now());
    m.review_step = r.step;
    m.next_review_at = r.nextReviewAt;
    if (r.backToPractice) m.p_known = Math.min(m.p_known, 0.6); // a slip sends the skill back to practice
  } else if (m.p_known >= MASTERED && m.next_review_at === null && m.attempts >= 3) {
    const s = scheduleFirstReview(ctx.now());
    m.review_step = s.step;
    m.next_review_at = s.nextReviewAt;
    masteredSkill = before < MASTERED;
  }
  saveMastery(ctx, student.id, item.skill, m);
  ctx.db.prepare('INSERT INTO attempt (student_id, skill_id, tier, correct, hints, tries, ms, at, kind) VALUES (?,?,?,?,?,?,?,?,?)').run(student.id, item.skill, item.tier, correct ? 1 : 0, p.hints, 1, elapsed, ctx.now(), p.kind);
  if (p.session_id) ctx.db.prepare('UPDATE practice_session SET answered = answered + 1, correct = correct + ?, last_at = ? WHERE id = ?').run(correct ? 1 : 0, ctx.now(), p.session_id);

  let event: LadderEvent = 'none';
  if (p.kind === 'practice') {
    const before = loadLadder(ctx, student.id, p.target);
    const after = onAttempt(before, { correct, hints: p.hints, ms: elapsed, expectedMs: item.expectedMs }, ladderEnv(ctx, student.id));
    saveLadder(ctx, student.id, after);
    event = ladderEvent(before, after);
  }

  const result: AnswerResult = {
    correct,
    feedback: buildFeedback(item, given as Given, correct, student.grade, p.hints, makeRng(seedFor(ctx))),
    event,
    skill: item.skill,
    pKnown: m.p_known,
    state: skillState(m.p_known, m.attempts, m.next_review_at !== null && isDue({ nextReviewAt: m.next_review_at }, ctx.now())),
    masteredSkill,
    masteredExpectation: masteredSkill && (expectationOf(ctx, item.skill) ? expectationMastered(ctx, student.id, expectationOf(ctx, item.skill)!) : false),
  };
  if (p.kind === 'placement') result.placement = placementStep(ctx, student, p.target, correct);
  result.reward = onAnswered(ctx, student, { correct, tier: item.tier, hints: p.hints, kind: p.kind, masteredSkill: result.masteredSkill, masteredExpectation: result.masteredExpectation, recovered: event === 'recovered' });
  return result;
}

function ladderEvent(a: Ladder, b: Ladder): LadderEvent {
  if (!a.needsHelp && b.needsHelp) return 'help';
  if (a.phase === b.phase) return b.tier > a.tier ? 'advance' : 'none';
  if (b.phase === 'stepdown') return 'stepdown';
  if (b.phase === 'micro') return 'micro';
  if (b.phase === 'lesson') return 'lesson';
  if (b.phase === 'buildup') return 'buildup';
  if (b.phase === 'normal' && (a.phase === 'buildup' || a.phase === 'stepdown')) return 'recovered';
  return 'none';
}

// ── placement ──────────────────────────────────────────────────────────────────────

function placementLadder(grade: number): string[] {
  const file = JSON.parse(readFileSync(join(process.cwd(), 'content', 'placement.json'), 'utf8')) as { ladders: Record<string, string[]> };
  return (file.ladders[String(grade)] ?? []).filter(hasGenerator);
}

export function placementStart(ctx: Ctx, student: StudentRow, grade: number): { item: PublicItem; ladderSize: number } {
  if (!allowedGrades(student).includes(grade)) throw new LearnError('grade_not_allowed', 403);
  const ladder = placementLadder(grade);
  if (ladder.length === 0) throw new LearnError('no_content', 404);
  const state = startPlacement(ladder.length);
  ctx.db.prepare('INSERT INTO placement (student_id, grade, state_json) VALUES (?,?,?) ON CONFLICT(student_id, grade) DO UPDATE SET state_json = excluded.state_json, done_at = NULL, result_json = NULL').run(student.id, grade, JSON.stringify(state));
  ctx.db.prepare('DELETE FROM pending_item WHERE student_id = ? AND kind = ?').run(student.id, 'placement');
  const it = issue(ctx, student, null, 'placement', `placement:${grade}`, ladder[nextProbe(state)]!, 2);
  return { item: pub(it), ladderSize: ladder.length };
}

function placementStep(ctx: Ctx, student: StudentRow, target: string, correct: boolean): NonNullable<AnswerResult['placement']> {
  const grade = Number(target.split(':')[1]);
  const row = ctx.db.prepare('SELECT state_json FROM placement WHERE student_id = ? AND grade = ?').get(student.id, grade) as { state_json: string } | undefined;
  const ladder = placementLadder(grade);
  if (!row) return { done: true };
  const state = recordPlacement(JSON.parse(row.state_json) as PlacementState, correct, 8);
  if (!state.done) {
    ctx.db.prepare('UPDATE placement SET state_json = ? WHERE student_id = ? AND grade = ?').run(JSON.stringify(state), student.id, grade);
    const it = issue(ctx, student, null, 'placement', target, ladder[nextProbe(state)]!, 2);
    return { done: false, next: pub(it) };
  }
  // Finish: raise what the student plainly knows so practice starts at the right level (never lowers anything).
  const priors = placementPriors(ladder.length, state);
  ladder.forEach((skill, i) => {
    const m = getMastery(ctx, student.id, skill);
    if (priors[i]! > m.p_known) { m.p_known = priors[i]!; saveMastery(ctx, student.id, skill, m); }
  });
  const start = startingIndex(state);
  const result = { startingSkill: ladder[Math.min(start, ladder.length - 1)] ?? null, ladder, startingIndex: start };
  ctx.db.prepare('UPDATE placement SET state_json = ?, done_at = ?, result_json = ? WHERE student_id = ? AND grade = ?').run(JSON.stringify(state), ctx.now(), JSON.stringify(result), student.id, grade);
  return { done: true, result };
}

// ── skill map ───────────────────────────────────────────────────────────────────────

export type MapState = SkillState | 'locked' | 'soon';
export interface MapNode { code: string; grade: number; strand: string; text: string; state: MapState; p: number; micro: number; unmet: string[] }

export function skillMap(ctx: Ctx, student: StudentRow, grade: number, course: string | null) {
  if (!allowedGrades(student).includes(grade)) throw new LearnError('grade_not_allowed', 403);
  const base = (ctx.db.prepare('SELECT code FROM curriculum_expectation WHERE grade = ? AND course IS ? ORDER BY code').all(grade, course) as { code: string }[]).map((r) => r.code);
  const edgesAll = ctx.db.prepare('SELECT from_code AS "from", to_code AS "to" FROM prereq_edge').all() as { from: string; to: string }[];
  const codes = new Set(base);
  for (const e of edgesAll) if (codes.has(e.to)) codes.add(e.from); // include direct prerequisites from earlier grades
  const edges = edgesAll.filter((e) => codes.has(e.from) && codes.has(e.to));

  const info = (code: string) => ctx.db.prepare('SELECT code, grade, strand, text FROM curriculum_expectation WHERE code = ?').get(code) as { code: string; grade: number; strand: string; text: string };
  const nodes: MapNode[] = [...codes].map((code) => {
    const e = info(code);
    const micros = microsOf(ctx, code);
    const rows = micros.map((m) => getMastery(ctx, student.id, m));
    const attempts = rows.reduce((a, r) => a + r.attempts, 0);
    const p = micros.length ? aggregate(rows.map((r) => r.p_known)) : 0;
    const reviewDue = rows.some((r) => r.next_review_at !== null && isDue({ nextReviewAt: r.next_review_at }, ctx.now()));
    const unmet = edges.filter((x) => x.to === code).map((x) => x.from).filter((f) => microsOf(ctx, f).length > 0 && expectationP(ctx, student.id, f) < PROFICIENT * 0.85);
    let state: MapState;
    if (micros.length === 0) state = 'soon';
    else if (attempts === 0) state = unmet.length > 0 ? 'locked' : 'new';
    else state = rows.every((r) => r.p_known >= MASTERED) ? (reviewDue ? 'needs_review' : 'mastered') : 'in_progress';
    return { code, grade: e.grade, strand: e.strand, text: e.text, state, p, micro: micros.length, unmet };
  });
  return { grade, nodes, edges };
}

// ── offline practice ────────────────────────────────────────────────────────────────
// A student can download a pack of questions while online, answer them without a connection, and send the answers back later.
// The pack is just a list of (skill, tier, seed). When answers arrive the server rebuilds each question from its seed, grades it
// itself and updates mastery and rewards exactly as if the student had been online. A question can be answered once.

const PACK_SIZE = 20;
const PACK_MS = 7 * 86_400_000;
const PACK_GRACE_MS = 7 * 86_400_000;
const MAX_OPEN_PACKS = 5;

export interface OfflineRef { skill: string; tier: number; seed: number; target: string }
export interface OfflinePack { packId: string; grade: number; issuedAt: number; expiresAt: number; items: OfflineRef[] }

export function offlinePack(ctx: Ctx, student: StudentRow, input: { grade: number; course?: string | null; strands?: string[]; focus?: string | null }): OfflinePack {
  if (!allowedGrades(student).includes(input.grade)) throw new LearnError('grade_not_allowed', 403);
  const targets = targetsFor(ctx, { grade: input.grade, course: input.course ?? null, strands: input.strands ?? [], focus: input.focus ?? null });
  if (targets.length === 0) throw new LearnError('no_content', 404);

  const ranked = targets.map((t) => ({ t, p: expectationP(ctx, student.id, t), r: rand(ctx) })).sort((a, b) => a.p - b.p || a.r - b.r);
  const open = ranked.filter((x) => !expectationMastered(ctx, student.id, x.t));
  const pool = open.length > 0 ? open : ranked;
  const items: OfflineRef[] = [];
  const used = new Set<string>();
  for (let n = 0; items.length < PACK_SIZE && n < PACK_SIZE * 4; n++) {
    const x = pool[n % pool.length]!;
    const micros = microsOf(ctx, x.t).filter(hasGenerator);
    if (micros.length === 0) continue;
    const weights = micros.map((m) => 1.1 - getMastery(ctx, student.id, m).p_known);
    let r = rand(ctx) * weights.reduce((a, b) => a + b, 0);
    let micro = micros[micros.length - 1]!;
    for (let i = 0; i < micros.length; i++) { r -= weights[i]!; if (r <= 0) { micro = micros[i]!; break; } }
    const m = getMastery(ctx, student.id, micro);
    const tier = Math.min(MAX_TIER, Math.max(1, m.attempts === 0 ? 1 : m.tier));
    const seed = seedFor(ctx);
    const key = `${micro}:${tier}:${seed}`;
    if (used.has(key)) continue;
    used.add(key);
    items.push({ skill: micro, tier, seed, target: x.t });
  }
  if (items.length === 0) throw new LearnError('no_content', 404);

  const id = newId();
  const now = ctx.now();
  ctx.db.transaction(() => {
    ctx.db.prepare('DELETE FROM offline_pack WHERE student_id = ? AND expires_at + ? < ?').run(student.id, PACK_GRACE_MS, now);
    const keep = (ctx.db.prepare('SELECT id FROM offline_pack WHERE student_id = ? ORDER BY issued_at DESC, rowid DESC').all(student.id) as { id: string }[]).slice(0, MAX_OPEN_PACKS - 1).map((r) => r.id);
    for (const r of ctx.db.prepare('SELECT id FROM offline_pack WHERE student_id = ?').all(student.id) as { id: string }[]) if (!keep.includes(r.id)) ctx.db.prepare('DELETE FROM offline_pack WHERE id = ?').run(r.id);
    ctx.db.prepare('INSERT INTO offline_pack (id, student_id, items_json, issued_at, expires_at) VALUES (?,?,?,?,?)').run(id, student.id, JSON.stringify(items), now, now + PACK_MS);
  })();
  return { packId: id, grade: input.grade, issuedAt: now, expiresAt: now + PACK_MS, items };
}

export interface OfflineAnswer { i: number; given: unknown; hints?: number; ms?: number }
export interface OfflineSyncResult {
  results: { i: number; status: 'graded' | 'skipped'; correct?: boolean; xp?: number }[];
  answered: number;
  correct: number;
  xp: number;
  level: number | null;
  leveledUp: boolean;
  newBadges: string[];
  remaining: number;
}

export function offlineSync(ctx: Ctx, student: StudentRow, packId: string, answers: OfflineAnswer[]): OfflineSyncResult {
  const row = ctx.db.prepare('SELECT id, items_json, done_json, expires_at FROM offline_pack WHERE id = ? AND student_id = ?').get(packId, student.id) as
    | { id: string; items_json: string; done_json: string; expires_at: number }
    | undefined;
  if (!row) throw new LearnError('pack_not_found', 404);
  if (ctx.now() > row.expires_at + PACK_GRACE_MS) throw new LearnError('pack_expired', 410);
  const items = JSON.parse(row.items_json) as OfflineRef[];
  const done = new Set<number>(JSON.parse(row.done_json) as number[]);

  const out: OfflineSyncResult = { results: [], answered: 0, correct: 0, xp: 0, level: null, leveledUp: false, newBadges: [], remaining: 0 };
  const seen = new Set<number>();
  ctx.db.transaction(() => {
    for (const a of [...answers].sort((x, y) => x.i - y.i)) {
      if (!Number.isInteger(a.i) || a.i < 0 || a.i >= items.length || done.has(a.i) || seen.has(a.i) || !isGiven(a.given)) { out.results.push({ i: a.i, status: 'skipped' }); continue; }
      seen.add(a.i);
      const ref = items[a.i]!;
      let item: Item;
      try { item = generate(ref.skill, ref.tier, ref.seed); } catch { out.results.push({ i: a.i, status: 'skipped' }); continue; }
      const pid = `off:${row.id.slice(0, 12)}:${a.i}`;
      const hints = Math.min(3, Math.max(0, Math.round(a.hints ?? 0)));
      ctx.db.prepare('INSERT OR REPLACE INTO pending_item (id, student_id, session_id, kind, target, item_json, hints, issued_at) VALUES (?,?,NULL,?,?,?,?,?)').run(pid, student.id, 'practice', ref.target, JSON.stringify(item), hints, ctx.now());
      const r = answer(ctx, student, pid, a.given, Math.max(0, Math.min(Math.round(a.ms ?? 0), 600_000)));
      done.add(a.i);
      out.answered += 1;
      if (r.correct) out.correct += 1;
      out.xp += r.reward?.xp ?? 0;
      if (r.reward) { out.level = r.reward.level; out.leveledUp = out.leveledUp || r.reward.leveledUp; for (const b of r.reward.newBadges) if (!out.newBadges.includes(b)) out.newBadges.push(b); }
      out.results.push({ i: a.i, status: 'graded', correct: r.correct, xp: r.reward?.xp ?? 0 });
    }
    ctx.db.prepare('UPDATE offline_pack SET done_json = ?, synced_at = ? WHERE id = ?').run(JSON.stringify([...done].sort((x, y) => x - y)), done.size >= items.length ? ctx.now() : null, row.id);
  })();
  out.remaining = items.length - done.size;
  return out;
}
