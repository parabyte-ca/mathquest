import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { GENERATORS, generate } from '../shared/generators/index.js';
import { GENERATORS_G5 } from '../shared/generators/grade5.js';
import { GENERATORS_G6 } from '../shared/generators/grade6.js';
import { GENERATORS_G7 } from '../shared/generators/grade7.js';
import { GENERATORS_G8 } from '../shared/generators/grade8.js';
import { GENERATORS_G9 } from '../shared/generators/grade9.js';
import { generateLoaded, generatorLoaded, loadGenerators } from '../web/src/generators.js';

// The web app loads the question generators one grade at a time (so a lesson or an offline pack does not download all of them).
const GRADES = { 5: GENERATORS_G5, 6: GENERATORS_G6, 7: GENERATORS_G7, 8: GENERATORS_G8, 9: GENERATORS_G9 } as const;

describe('generators by grade', () => {
  it('splits the registry cleanly: each grade file holds only its own skills, and together they are the whole registry', () => {
    const seen = new Set<string>();
    for (const [g, map] of Object.entries(GRADES)) {
      for (const id of Object.keys(map)) {
        expect(id.startsWith(`MS.G${g}.`), `${id} is in the Grade ${g} file`).toBe(true);
        expect(seen.has(id), `${id} is registered twice`).toBe(false);
        seen.add(id);
      }
    }
    expect([...seen].sort()).toEqual(Object.keys(GENERATORS).sort());
  });

  it('has a generator, in the right grade file, for every micro-skill', () => {
    const micro = (JSON.parse(readFileSync('content/microskills.json', 'utf8')) as { microskills: { id: string }[] }).microskills;
    for (const m of micro) {
      const g = Number(/^MS\.G(\d+)\./.exec(m.id)![1]);
      expect(GRADES[g as keyof typeof GRADES]?.[m.id], m.id).toBeDefined();
    }
  });
});

describe('the web loader', () => {
  it('refuses a question until its grade has been loaded, then builds exactly what the server builds', async () => {
    expect(generatorLoaded('MS.G7.B1.2.a')).toBe(false);
    expect(() => generateLoaded('MS.G7.B1.2.a', 1, 1)).toThrow(/no generator loaded/);
    await loadGenerators(['MS.G7.B1.2.a', 'MS.G7.B2.1.a']);
    expect(generatorLoaded('MS.G7.B1.2.a')).toBe(true);
    expect(generatorLoaded('MS.G9.B1.2.a')).toBe(false); // other grades stay unloaded
    for (const seed of [1, 7, 99]) for (const tier of [1, 2, 3]) expect(generateLoaded('MS.G7.B1.2.a', tier, seed)).toEqual(generate('MS.G7.B1.2.a', tier, seed));
  });

  it('loads several grades at once, each only once, and ignores skills it does not know', async () => {
    await Promise.all([loadGenerators(['MS.G5.F1.1.a', 'MS.G9.C1.2.a']), loadGenerators(['MS.G5.F1.1.a', 'not-a-skill', 'MS.G4.B1.1.a'])]);
    expect(generatorLoaded('MS.G5.F1.1.a')).toBe(true);
    expect(generatorLoaded('MS.G9.C1.2.a')).toBe(true);
    expect(generatorLoaded('not-a-skill')).toBe(false);
    expect(() => generateLoaded('MS.G4.B1.1.a', 1, 1)).toThrow();
  });

  it('keeps the whole-registry import out of the lesson and offline pages', () => {
    for (const f of ['web/src/pages/LessonView.tsx', 'web/src/pages/OfflinePractice.tsx']) expect(readFileSync(f, 'utf8'), f).not.toMatch(/generators\/index/);
  });
});
