import type { Generator, Item } from '../../shared/items/types.js';

// The question generators are most of the app's code, so the web app loads them one grade at a time, only when a lesson's try-it or an
// offline pack needs them. (The server uses the whole registry in shared/generators/index.ts.)

type GradeMap = Record<string, Generator>;
const LOADERS: Record<number, () => Promise<GradeMap>> = {
  5: () => import('../../shared/generators/grade5.js').then((m) => m.GENERATORS_G5),
  6: () => import('../../shared/generators/grade6.js').then((m) => m.GENERATORS_G6),
  7: () => import('../../shared/generators/grade7.js').then((m) => m.GENERATORS_G7),
  8: () => import('../../shared/generators/grade8.js').then((m) => m.GENERATORS_G8),
  9: () => import('../../shared/generators/grade9.js').then((m) => m.GENERATORS_G9),
};
const loaded = new Map<number, GradeMap>();
const pending = new Map<number, Promise<void>>();
const gradeOf = (skill: string): number => Number(/^MS\.G(\d+)\./.exec(skill)?.[1] ?? NaN);

/** Loads the generators for the grades these skills belong to (each grade once). Rejects if a grade's code cannot be fetched. */
export async function loadGenerators(skills: Iterable<string>): Promise<void> {
  const grades = new Set<number>();
  for (const s of skills) { const g = gradeOf(s); if (LOADERS[g]) grades.add(g); }
  await Promise.all([...grades].map((g) => {
    if (loaded.has(g)) return Promise.resolve();
    let p = pending.get(g);
    if (!p) {
      p = LOADERS[g]!().then((m) => { loaded.set(g, m); }).finally(() => pending.delete(g));
      pending.set(g, p);
    }
    return p;
  }));
}

/** Builds a question whose grade has been loaded with loadGenerators. Throws for a skill that is not available. */
export function generateLoaded(skill: string, tier: number, seed: number): Item {
  const g = loaded.get(gradeOf(skill))?.[skill];
  if (!g) throw new Error(`no generator loaded for ${skill}`);
  return g(Math.min(3, Math.max(1, Math.round(tier))), seed >>> 0);
}
export const generatorLoaded = (skill: string): boolean => !!loaded.get(gradeOf(skill))?.[skill];
