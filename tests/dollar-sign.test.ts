import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import katex from 'katex';
import { generate } from '../shared/generators/index.js';
import { dollarTex, fmt } from '../shared/generators/dsl.js';
import { TEX_MACROS, rawTex } from '../shared/tex.js';
import { moneyWords, speakable } from '../shared/mathspeech.js';

// Amounts of money are written with the dollar sign the Canadian way, "$45.50" in English and "45,50 $" in French, never "45.50 dollars".
// Phrases with no amount ("How many dollars are left?") keep the word, and so do named currencies ("US dollars").

const ids = (JSON.parse(readFileSync('content/microskills.json', 'utf8')) as { microskills: { id: string }[] }).microskills.map((m) => m.id);
const everything: { id: string; json: string }[] = [];
for (const id of ids) for (const tier of [1, 2, 3]) for (const seed of [1, 2, 3, 4]) everything.push({ id: `${id} t${tier} s${seed}`, json: JSON.stringify(generate(id, tier, seed)) });

describe('writing an amount', () => {
  it('puts the sign before the amount in English and after it, with a space, in French', () => {
    expect(dollarTex(45, 'en')).toBe('\\dollar 45');
    expect(dollarTex(45, 'fr')).toBe('45\\ \\dollar');
    expect(dollarTex(45.5, 'en')).toBe('\\dollar 45.50');
    expect(dollarTex(45.5, 'fr')).toBe('45{,}50\\ \\dollar');
    expect(dollarTex(1, 'en', true)).toBe('\\dollar 1.00');
    expect(dollarTex(1, 'fr', true)).toBe('1{,}00\\ \\dollar');
    expect(dollarTex(12500.5, 'en')).toBe('\\dollar 12\\,500.50');
    expect(dollarTex(12500, 'fr')).toBe('12\\,500\\ \\dollar');
    expect(dollarTex(0.1 + 0.2, 'en')).toBe('\\dollar 0.30'); // no floating point tails
    expect(fmt('en').D(7)).toBe('$\\dollar 7$');
    expect(fmt('fr').D(7.25)).toBe('$7{,}25\\ \\dollar$');
  });

  it('draws a real dollar sign, in the right place, with no stray text', () => {
    const plain = (tex: string): string => katex.renderToString(tex, { output: 'mathml', macros: { ...TEX_MACROS }, throwOnError: true, strict: 'ignore' }).replace(/<annotation[\s\S]*?<\/annotation>/, '').replace(/<[^>]+>/g, '').replace(/\s+/g, '');
    expect(plain(dollarTex(45.5, 'en'))).toBe('$45.50');
    expect(plain(dollarTex(45.5, 'fr'))).toBe('45,50$');
    expect(plain(dollarTex(12500, 'en'))).toBe('$12500');
  });

  it('shows a plain dollar sign before the maths has loaded', () => {
    expect(rawTex(dollarTex(45.5, 'en'))).toBe('$45.50');
    expect(rawTex(dollarTex(45.5, 'fr'))).toBe('45{,}50 $');
  });

  it('is read aloud as dollars and cents in both languages', () => {
    expect(moneyWords(dollarTex(45, 'en'), 'en')).toBe('forty-five dollars');
    expect(moneyWords(dollarTex(1, 'en'), 'en')).toBe('one dollar');
    expect(moneyWords(dollarTex(12.5, 'en'), 'en')).toBe('twelve dollars and fifty cents');
    expect(moneyWords(dollarTex(12.01, 'en'), 'en')).toBe('twelve dollars and one cent');
    expect(moneyWords(dollarTex(12.5, 'fr'), 'fr')).toBe('douze dollars et cinquante cents');
    expect(moneyWords(dollarTex(80, 'fr'), 'fr')).toBe('quatre-vingts dollars');
    expect(speakable(`It costs ${fmt('en').D(3.5)} each.`, 'en')).toBe('It costs three dollars and fifty cents each.');
    expect(speakable(`Cela coûte ${fmt('fr').D(3.5)} chacun.`, 'fr')).toBe('Cela coûte trois dollars et cinquante cents chacun.');
  });
});

describe('every question, step and option in the bank', () => {
  it('never writes an amount of money as a plain number followed by the word "dollars" (a formula such as C = 3n + 52 may still end "dollars")', () => {
    const bad = everything.filter((e) => /(?:\$-?[\d.,{}\\ ]+\$|\d)\s+dollars?\b(?!\s+(?:américain|canadien|australien))/.test(e.json)).map((e) => e.id);
    expect(bad.slice(0, 10)).toEqual([]);
  });

  it('uses the dollar sign in many money questions, and keeps the word for phrases and named currencies', () => {
    const withSign = everything.filter((e) => e.json.includes('\\\\dollar')).length;
    expect(withSign).toBeGreaterThan(400);
    expect(everything.some((e) => /How many dollars/.test(e.json))).toBe(true);
    expect(everything.some((e) => /in dollars\?/.test(e.json))).toBe(true);
    expect(everything.some((e) => /US dollars/.test(e.json))).toBe(true);
  });

  it('draws every amount without a maths error', () => {
    const seen = new Set<string>();
    for (const e of everything) for (const m of e.json.matchAll(/\$((?:[^$"\\]|\\\\)*?\\\\dollar(?:[^$"\\]|\\\\)*?)\$/g)) seen.add(m[1]!.replace(/\\\\/g, '\\'));
    expect(seen.size).toBeGreaterThan(200);
    for (const tex of [...seen].slice(0, 400)) expect(() => katex.renderToString(tex, { output: 'mathml', macros: { ...TEX_MACROS }, throwOnError: true, strict: 'ignore' }), tex).not.toThrow();
  });

  it('keeps the same amounts in English and in French', () => {
    const amount = (s: string): string[] => [...s.matchAll(/\$[^$]*?\\dollar[^$]*?\$/g)].map((m) => m[0].replace(/\\dollar/g, '').replace(/\\ /g, '').replace(/\{,\}/g, '.').replace(/[$ ]/g, '')).sort();
    const bad: string[] = [];
    for (const id of ids) for (const tier of [1, 2, 3]) for (const seed of [1, 2]) {
      const it = generate(id, tier, seed);
      if (amount(it.prompt.en).join() !== amount(it.prompt.fr).join()) bad.push(`${id} t${tier} s${seed}`);
    }
    expect(bad.slice(0, 10)).toEqual([]);
  });
});
