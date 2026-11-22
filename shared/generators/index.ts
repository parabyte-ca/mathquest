import type { Generator, Item } from '../items/types.js';

import { GENERATORS_G5 } from './grade5.js';
import { GENERATORS_G6 } from './grade6.js';
import { GENERATORS_G7 } from './grade7.js';
import { GENERATORS_G8 } from './grade8.js';
import { GENERATORS_G9 } from './grade9.js';
import { GENERATORS_G10 } from './grade10.js';
import { GENERATORS_G11 } from './grade11.js';
import { GENERATORS_G12 } from './grade12.js';

/**
 * One generator per micro-skill. Each takes (tier, seed) and is deterministic, so every item can be rebuilt and re-checked.
 * They are registered in the per-grade files (grade5.ts to grade12.ts), which the web app loads one grade at a time.
 */
export const GENERATORS: Record<string, Generator> = {
  ...GENERATORS_G5,
  ...GENERATORS_G6,
  ...GENERATORS_G7,
  ...GENERATORS_G8,
  ...GENERATORS_G9,
  ...GENERATORS_G10,
  ...GENERATORS_G11,
  ...GENERATORS_G12,
};

export const MAX_TIER = 3;

export function generate(skill: string, tier: number, seed: number): Item {
  const g = GENERATORS[skill];
  if (!g) throw new Error(`no generator for ${skill}`);
  const t = Math.min(MAX_TIER, Math.max(1, Math.round(tier)));
  return g(t, seed >>> 0);
}

export const hasGenerator = (skill: string): boolean => skill in GENERATORS;
