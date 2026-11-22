import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const load = (lang: string): Record<string, string> => JSON.parse(readFileSync(`web/src/locales/${lang}.json`, 'utf8')) as Record<string, string>;
const E = load('en');
const F = load('fr');
const placeholders = (s: string): string[] => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!).sort();

/** Words that are the same in both languages. Anything else identical in French is probably an untranslated string. */
const SAME_IN_BOTH = new Set(['app.name', 'placement.progress', 'play.question', 'progress.minutes', 'progress.questions', 'rewards.avatars', 'activity.system', 'updates.versionNotes']);

describe('locale files', () => {
  it('have the same keys in English and French', () => {
    expect(Object.keys(F).sort()).toEqual(Object.keys(E).sort());
  });

  it('use the same placeholders in both languages', () => {
    for (const k of Object.keys(E)) expect(placeholders(F[k]!), k).toEqual(placeholders(E[k]!));
  });

  it('have no empty strings, stray spaces or leftover template syntax', () => {
    for (const [lang, pack] of [['en', E], ['fr', F]] as const) {
      for (const [k, v] of Object.entries(pack)) {
        expect(v.trim().length, `${lang} ${k} empty`).toBeGreaterThan(0);
        expect(v, `${lang} ${k}`).toBe(v.trim());
        expect(v, `${lang} ${k}`).not.toMatch(/ {2}|\{\{|undefined/);
      }
    }
  });

  it('translate every string, apart from a short list of words that are the same in both languages', () => {
    const same = Object.keys(E).filter((k) => E[k] === F[k]);
    expect(same.filter((k) => !SAME_IN_BOTH.has(k))).toEqual([]);
  });

  it('keep English function words out of the French', () => {
    const english = /\b(the|and|your|with|you are|please)\b/i;
    for (const [k, v] of Object.entries(F)) expect(v.replace(/[`'"][^`'"]*[`'"]/g, ''), `fr ${k}: ${v}`).not.toMatch(english);
  });

  it('write French commands and file names exactly as the English does', () => {
    for (const k of Object.keys(E)) {
      const cmds = (E[k]!.match(/(?:sudo |\.\/)\S+/g) ?? []).sort();
      if (cmds.length) for (const c of cmds) expect(F[k], `${k}: ${c}`).toContain(c.replace(/[.,;:)]+$/, ''));
    }
  });
});
