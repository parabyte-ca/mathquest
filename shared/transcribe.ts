// Turns what was read from a photo of a worksheet (plain text for each numbered answer) into the same answer shapes practice uses.
// The photo reader only ever supplies text. Whether an answer is right is decided afterwards by check(), the same exact rules as practice.
import type { Format, Given } from './items/types.js';

const LETTERS = 'ABCDEFGH';
const letterIndex = (s: string, max: number): number | null => {
  const i = LETTERS.indexOf(s.trim().toUpperCase());
  return i >= 0 && i < max && s.trim().length === 1 ? i : null;
};
const int = (s: string): string | null => (/^-?\d{1,9}$/.test(s.trim()) ? s.trim() : null);
const letters = (text: string, max: number): number[] | null => {
  const parts = text.split(/[\s,;→>–-]+/).filter(Boolean);
  const out = parts.map((p) => letterIndex(p, max));
  return parts.length > 0 && out.every((x) => x !== null) ? (out as number[]) : null;
};

/** The answer shape for one question, from text read off a sheet. Returns null when the text cannot be read as an answer to that kind of question. */
export function givenFromText(format: Format, raw: string, options = 0, right = 0): Given | null {
  const text = raw.replace(/[  ]/g, ' ').trim();
  if (!text || text.length > 60) return null;
  switch (format) {
    case 'number':
    case 'slider':
    case 'angle':
      return { kind: 'number', text: text.replace(/°$/, '').trim() };
    case 'expression':
      return { kind: 'expression', text };
    case 'fraction': {
      const m = /^(-?\d{1,9})\s*\/\s*(-?\d{1,9})$/.exec(text);
      return m ? { kind: 'fraction', n: m[1]!, d: m[2]! } : null;
    }
    case 'mixed': {
      const m = /^(-?\d{1,9})\s+(\d{1,9})\s*\/\s*(\d{1,9})$/.exec(text);
      return m ? { kind: 'mixed', whole: m[1]!, n: m[2]!, d: m[3]! } : null;
    }
    case 'choice': {
      const i = letterIndex(text, options) ?? (int(text) !== null && Number(text) >= 1 && Number(text) <= options ? Number(text) - 1 : null);
      return i === null ? null : { kind: 'choice', index: i };
    }
    case 'multi': {
      const l = letters(text, options);
      return l ? { kind: 'multi', indices: [...new Set(l)].sort((a, b) => a - b) } : null;
    }
    case 'order': {
      const l = letters(text, options);
      return l && l.length === options && new Set(l).size === options ? { kind: 'order', order: l } : null;
    }
    case 'match': {
      const pairs: [number, number][] = [];
      for (const part of text.split(/[,;]+/).map((p) => p.trim()).filter(Boolean)) {
        const m = /^(\d{1,2})\s*[-–—:=>]+\s*([A-Za-z])$/.exec(part);
        const r = m ? letterIndex(m[2]!, right) : null;
        if (!m || r === null || Number(m[1]) < 1 || Number(m[1]) > options) return null;
        pairs.push([Number(m[1]) - 1, r]);
      }
      return pairs.length === options ? { kind: 'match', pairs } : null;
    }
    case 'point': {
      const m = /^\(?\s*(-?\d{1,6})\s*[,;]\s*(-?\d{1,6})\s*\)?$/.exec(text);
      return m ? { kind: 'point', x: Number(m[1]), y: Number(m[2]) } : null;
    }
  }
}

/** What the reader is told to expect for each kind of question, in words. It never sees the correct answers. */
export function formatHint(format: Format, options = 0, right = 0): string {
  switch (format) {
    case 'number': case 'slider': case 'angle': return 'a number';
    case 'expression': return 'an expression, written exactly as on the sheet';
    case 'fraction': return 'a fraction written n/d';
    case 'mixed': return 'a mixed number written whole n/d, for example 2 3/4';
    case 'choice': return `one letter, A to ${LETTERS[Math.max(0, options - 1)]}`;
    case 'multi': return `one or more letters, A to ${LETTERS[Math.max(0, options - 1)]}, separated by commas`;
    case 'order': return `all ${options} letters in the order written, separated by commas`;
    case 'match': return `${options} pairs written like 1-B, separated by commas (numbers 1 to ${options}, letters A to ${LETTERS[Math.max(0, right - 1)]})`;
    case 'point': return 'a point written (x, y)';
  }
}

/** An answer in the plain form the reader writes and a caregiver edits, so a confirmed answer goes back through givenFromText unchanged. */
export function textFromGiven(g: Given): string {
  switch (g.kind) {
    case 'number': case 'expression': return g.text;
    case 'fraction': return `${g.n}/${g.d}`;
    case 'mixed': return `${g.whole} ${g.n}/${g.d}`;
    case 'choice': return LETTERS[g.index] ?? String(g.index + 1);
    case 'multi': return g.indices.map((i) => LETTERS[i] ?? String(i + 1)).join(', ');
    case 'order': return g.order.map((i) => LETTERS[i] ?? String(i + 1)).join(', ');
    case 'match': return g.pairs.map(([l, r]) => `${l + 1}-${LETTERS[r] ?? r + 1}`).join(', ');
    case 'point': return `(${g.x}, ${g.y})`;
  }
}
