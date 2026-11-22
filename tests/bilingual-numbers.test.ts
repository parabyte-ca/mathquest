import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { generate } from '../shared/generators/index.js';

// A question must show the same numbers in English and in French: the two texts come from one template and one draw of the random
// numbers. (A draw made inside the text function would give each language its own numbers.)
const ids = (JSON.parse(readFileSync('content/microskills.json', 'utf8')) as { microskills: { id: string }[] }).microskills.map((m) => m.id);
const numbers = (s: string): string[] => [...s.replace(/\\,/g, '').replace(/\{,\}/g, '.').replace(/(\d),(\d)/g, '$1.$2').matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => m[0]);

describe('prompts show the same numbers in both languages', () => {
  it('for every micro-skill, tier and several seeds', () => {
    const bad: string[] = [];
    for (const id of ids) for (const tier of [1, 2, 3]) for (const seed of [1, 2, 3, 4, 5, 6]) {
      const it = generate(id, tier, seed);
      const en = numbers(it.prompt.en).sort().join(' '), fr = numbers(it.prompt.fr).sort().join(' ');
      if (en !== fr) bad.push(`${id} t${tier} s${seed}`);
    }
    expect(bad.slice(0, 20)).toEqual([]);
  });
});
