// Answer checking with a small CAS (math.js). Works in the browser and on the server, so offline practice can reuse it.
import {
  create, parseDependencies, evaluateDependencies, addDependencies, subtractDependencies, multiplyDependencies,
  divideDependencies, powDependencies, sqrtDependencies, unaryMinusDependencies, unaryPlusDependencies,
  piDependencies, absDependencies, ConstantNodeDependencies, SymbolNodeDependencies, OperatorNodeDependencies,
  ParenthesisNodeDependencies, FunctionNodeDependencies,
} from 'mathjs';
import type { Answer, Given } from './items/types.js';

// The typings mark every *Dependencies export as possibly undefined, so assert them once here.
const math = create({
  parseDependencies: parseDependencies!, evaluateDependencies: evaluateDependencies!, addDependencies: addDependencies!,
  subtractDependencies: subtractDependencies!, multiplyDependencies: multiplyDependencies!, divideDependencies: divideDependencies!,
  powDependencies: powDependencies!, sqrtDependencies: sqrtDependencies!, unaryMinusDependencies: unaryMinusDependencies!,
  unaryPlusDependencies: unaryPlusDependencies!, piDependencies: piDependencies!, absDependencies: absDependencies!,
  ConstantNodeDependencies: ConstantNodeDependencies!, SymbolNodeDependencies: SymbolNodeDependencies!,
  OperatorNodeDependencies: OperatorNodeDependencies!, ParenthesisNodeDependencies: ParenthesisNodeDependencies!,
  FunctionNodeDependencies: FunctionNodeDependencies!,
});

const ALLOWED = /^[0-9a-z+\-*/^().\s%]*$/i;

/** Cleans what a student typed: Unicode operators, decimal comma, percent sign. Returns null when it is not usable. */
export function normalizeInput(raw: string): string | null {
  let s = raw.trim();
  if (!s || s.length > 60) return null;
  s = s.replace(/[−–]/g, '-').replace(/[×·]/g, '*').replace(/÷/g, '/').replace(/√/g, 'sqrt').replace(/π/g, 'pi').replace(/%$/, '');
  if (/^\d+,\d+$/.test(s)) s = s.replace(',', '.'); // 0,75 -> 0.75 (French)
  if (!ALLOWED.test(s)) return null;
  return s;
}

/**
 * Every sensible reading of a typed number. "1 234" and "1,234" are digit groups in English but 1,234 is also a French
 * decimal, so both readings are offered and either one can match.
 */
export function numberCandidates(raw: string): number[] {
  const out: number[] = [];
  const t = raw.trim().replace(/[\u00a0\u202f]/g, ' ');
  if (/^[+-]?\d{1,3}( \d{3})+([.,]\d+)?$/.test(t)) {
    const v = parseNumber(t.replace(/ /g, ''));
    if (v !== null) out.push(v);
    return out;
  }
  const v = parseNumber(t);
  if (v !== null) out.push(v);
  if (/^[+-]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) {
    const g = parseNumber(t.replace(/,/g, ''));
    if (g !== null) out.push(g);
  }
  return out;
}

/** Evaluates a numeric entry such as "3/4", "0.75", "2^3" or "sqrt(2)". Returns null if it is not a finite number. */
export function parseNumber(raw: string): number | null {
  const s = normalizeInput(raw);
  if (s === null) return null;
  try {
    const v = math.evaluate(s) as unknown;
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
};
const isInt = (n: number): boolean => Number.isInteger(n) && Math.abs(n) < 1e9;
const toInt = (s: string): number | null => (/^-?\d{1,9}$/.test(s.trim()) ? Number(s.trim()) : null);
const close = (a: number, b: number, tol: number): boolean => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

/** Two expressions are equivalent when they agree at several sample points: x(x+3) equals x^2+3x. */
export function expressionsEquivalent(a: string, b: string, vars: string[]): boolean {
  const implicit = (e: string | null): string | null => {
    if (e === null) return null;
    // x(x+3) means x*(x+3), not a call of a function named x
    return vars.reduce((acc, v) => acc.replace(new RegExp(`(?<![a-z])${v}\\s*\\(`, 'gi'), `${v}*(`), e);
  };
  const na = implicit(normalizeInput(a));
  const nb = implicit(normalizeInput(b));
  if (na === null || nb === null) return false;
  try {
    const fa = math.parse(na).compile();
    const fb = math.parse(nb).compile();
    const samples = [0.5, 1.5, -2.25, 3.125, 7, -0.75];
    for (let i = 0; i < samples.length; i++) {
      const scope: Record<string, number> = {};
      vars.forEach((v, j) => (scope[v] = samples[(i + j * 2) % samples.length]!));
      const va = fa.evaluate({ ...scope }) as unknown;
      const vb = fb.evaluate({ ...scope }) as unknown;
      if (typeof va !== 'number' || typeof vb !== 'number' || !Number.isFinite(va) || !Number.isFinite(vb)) return false;
      if (!close(va, vb, 1e-9)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

const sameSet = (a: number[], b: number[]): boolean => a.length === b.length && [...a].sort((x, y) => x - y).every((v, i) => v === [...b].sort((x, y) => x - y)[i]);

/** True when `given` is a correct response for `answer`. Mismatched shapes are simply incorrect. */
export function check(answer: Answer, given: Given, literal = false): boolean {
  switch (answer.kind) {
    case 'number': {
      if (given.kind !== 'number') return false;
      return numberCandidates(given.text).some((v) => close(v, answer.value, answer.tolerance ?? 1e-9) || (answer.absTolerance !== undefined && Math.abs(v - answer.value) <= answer.absTolerance));
    }
    case 'expression':
      return given.kind === 'expression' && expressionsEquivalent(given.text, answer.expr, answer.vars);
    case 'fraction': {
      if (given.kind !== 'fraction') return false;
      const n = toInt(given.n);
      const d = toInt(given.d);
      if (n === null || d === null || d === 0 || !isInt(n) || !isInt(d)) return false;
      if (answer.mustReduce) return n * answer.d === answer.n * d && gcd(n, d) === 1 && d > 0;
      return n * answer.d === answer.n * d && d > 0;
    }
    case 'mixed': {
      if (given.kind !== 'mixed') return false;
      const w = toInt(given.whole);
      const n = toInt(given.n);
      const d = toInt(given.d);
      if (literal) return w === answer.whole && n === answer.n && d === answer.d; // matching a mapped wrong answer: compare as typed
      if (w === null || n === null || d === null || d <= 0 || n < 0 || n >= d) return false; // must be a proper fraction part
      return (w * d + n) * answer.d === (answer.whole * answer.d + answer.n) * d;
    }
    case 'choice':
      return given.kind === 'choice' && given.index === answer.index;
    case 'multi':
      return given.kind === 'multi' && sameSet(given.indices, answer.indices);
    case 'order':
      return given.kind === 'order' && given.order.length === answer.order.length && given.order.every((v, i) => v === answer.order[i]);
    case 'match': {
      if (given.kind !== 'match' || given.pairs.length !== answer.pairs.length) return false;
      const key = (p: [number, number]) => `${p[0]}:${p[1]}`;
      const want = new Set(answer.pairs.map(key));
      return given.pairs.every((p) => want.has(key(p)));
    }
    case 'point':
      return given.kind === 'point' && Math.hypot(given.x - answer.x, given.y - answer.y) <= answer.tol;
  }
}

/** Shape-only validation of untrusted JSON from a client (sizes and types), before it reaches check(). */
export function isGiven(v: unknown): v is Given {
  if (!v || typeof v !== 'object') return false;
  const g = v as Record<string, unknown>;
  const str = (x: unknown, max = 60): x is string => typeof x === 'string' && x.length <= max;
  const ints = (x: unknown): x is number[] => Array.isArray(x) && x.length <= 20 && x.every((n) => Number.isInteger(n) && (n as number) >= 0 && (n as number) < 100);
  switch (g.kind) {
    case 'number':
    case 'expression':
      return str(g.text);
    case 'fraction':
      return str(g.n, 12) && str(g.d, 12);
    case 'mixed':
      return str(g.whole, 12) && str(g.n, 12) && str(g.d, 12);
    case 'choice':
      return Number.isInteger(g.index) && (g.index as number) >= 0 && (g.index as number) < 100;
    case 'multi':
      return ints(g.indices);
    case 'order':
      return ints(g.order);
    case 'match':
      return Array.isArray(g.pairs) && g.pairs.length <= 20 && g.pairs.every((p) => Array.isArray(p) && p.length === 2 && ints(p));
    case 'point':
      return typeof g.x === 'number' && typeof g.y === 'number' && Number.isFinite(g.x) && Number.isFinite(g.y) && Math.abs(g.x) < 1000 && Math.abs(g.y) < 1000;
    default:
      return false;
  }
}

export { gcd };

/** The Given that a perfect student would produce for an answer. Used by tests, placement and worked examples. */
export function answerToGiven(a: Answer): Given {
  switch (a.kind) {
    case 'number': return { kind: 'number', text: String(a.value) };
    case 'expression': return { kind: 'expression', text: a.expr };
    case 'fraction': return { kind: 'fraction', n: String(a.n), d: String(a.d) };
    case 'mixed': return { kind: 'mixed', whole: String(a.whole), n: String(a.n), d: String(a.d) };
    case 'choice': return { kind: 'choice', index: a.index };
    case 'multi': return { kind: 'multi', indices: [...a.indices] };
    case 'order': return { kind: 'order', order: [...a.order] };
    case 'match': return { kind: 'match', pairs: a.pairs.map((p) => [...p] as [number, number]) };
    case 'point': return { kind: 'point', x: a.x, y: a.y };
  }
}

/** Evaluates a plain arithmetic expression (digits, + - * / ^ and brackets only). Used to re-compute answers independently. */
export function evalArithmetic(expr: string): number | null {
  if (!/^[0-9+\-*/^().\s]+$/.test(expr) || expr.length > 200) return null;
  try {
    const v = math.evaluate(expr) as unknown;
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}
