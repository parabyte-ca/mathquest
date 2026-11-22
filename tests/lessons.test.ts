import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { LESSONS, lessonForSkill } from '../shared/lessons/index.js';
import { GENERATORS, generate } from '../shared/generators/index.js';
import type { Text } from '../shared/items/types.js';

const micro = (JSON.parse(readFileSync('content/microskills.json', 'utf8')) as { microskills: { id: string }[] }).microskills.map((m) => m.id);

const texts = (): Text[] => LESSONS.flatMap((l) => [l.title, l.intro, ...l.definitions.flatMap((d) => [d.term, d.text]), ...l.examples.flatMap((e) => [e.title, ...e.steps.map((s) => s.text)])]);

describe('lessons', () => {
  it('have unique ids and only teach micro-skills that exist and have generators', () => {
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(LESSONS.length);
    for (const l of LESSONS) {
      expect(l.skills.length).toBeGreaterThan(0);
      for (const s of l.skills) {
        expect(micro, `${l.id} lists ${s}`).toContain(s);
        expect(GENERATORS[s], `${l.id}: no generator for ${s}`).toBeDefined();
      }
      expect(l.skills, `${l.id}: tryIt skill must be one it teaches`).toContain(l.tryIt.skill);
    }
  });

  it('give every Grade 5-7 Number micro-skill a lesson to fall back on', () => {
    const missing = micro.filter((m) => /^MS\.G[567]\.B/.test(m) && !lessonForSkill(m));
    expect(missing).toEqual([]);
  });

  it('give every Grade 7 to 12 micro-skill a lesson to fall back on', () => {
    const missing = micro.filter((m) => /^MS\.G([789]|1[012])\./.test(m) && !lessonForSkill(m));
    expect(missing).toEqual([]);
  });

  it('follow the shape: definitions, two or three worked examples, a try-it that builds a real item', () => {
    for (const l of LESSONS) {
      expect(l.definitions.length, l.id).toBeGreaterThanOrEqual(1);
      expect(l.examples.length, l.id).toBeGreaterThanOrEqual(2);
      expect(l.examples.length, l.id).toBeLessThanOrEqual(3);
      for (const e of l.examples) expect(e.steps.length, `${l.id} ${e.title.en}`).toBeGreaterThanOrEqual(1);
      const item = generate(l.tryIt.skill, l.tryIt.tier, l.tryIt.seed);
      expect(item.skill).toBe(l.tryIt.skill);
    }
  });

  it('are complete and clean in both languages', () => {
    for (const x of texts()) {
      for (const lang of ['en', 'fr'] as const) {
        expect(x[lang].trim().length).toBeGreaterThan(0);
        expect(x[lang]).not.toMatch(/undefined|NaN|\[object/);
        expect((x[lang].match(/\$/g) ?? []).length % 2).toBe(0);
      }
      if (x.en.length > 25 && /[A-Za-z]{3,}/.test(x.en)) expect(x.en).not.toBe(x.fr);
    }
  });

  it('read every worked example aloud without symbols', async () => {
    const { speakable } = await import('../shared/mathspeech.js');
    for (const x of texts()) for (const lang of ['en', 'fr'] as const) expect(speakable(x[lang], lang)).not.toMatch(/[\\^{}$]|\bfrac\b/);
  });
});

describe('lessons by grade group', () => {
  it('put every lesson in exactly one group, and each lesson only in a group for its own grade', async () => {
    const { LESSON_BUCKETS } = await import('../shared/lessons/index.js');
    const range: Record<string, number[]> = { g56: [5, 6], g7: [7], g8: [8], g9: [9], g10: [10], g11: [11], g12: [12] };
    const seen = new Set<string>();
    for (const [bucket, lessons] of Object.entries(LESSON_BUCKETS)) {
      for (const l of lessons) {
        expect(seen.has(l.id), `${l.id} is in two groups`).toBe(false);
        seen.add(l.id);
        for (const s of l.skills) {
          const grade = Number(/^MS\.G(\d+)\./.exec(s)?.[1]);
          expect(range[bucket], `${l.id} (${s}) is in group ${bucket}`).toContain(grade);
        }
      }
    }
    expect(seen.size).toBe(LESSONS.length);
  });

  it('keep the id-to-group map in step with the lessons (run npm run gen:lessons after adding one)', async () => {
    const { lessonMapSource } = await import('../scripts/gen-lesson-map.js');
    expect(readFileSync('shared/lessons/map.ts', 'utf8')).toBe(lessonMapSource());
  });
});
