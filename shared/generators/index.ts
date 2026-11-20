import type { Generator, Item } from '../items/types.js';
import { compareLike, compareUnlike, equivalentFraction, mixedNumbers, nameFraction } from './fractions.js';
import { addLike, addUnlike, commonDenominator, mixedAddSub, subLike, subUnlike } from './addsub.js';
import { compareDecimals, decimalToPercent, fractionToDecimal, readDecimals } from './decimals.js';
import { plotPoints } from './coordinates.js';

/** One generator per micro-skill. Each takes (tier, seed) and is deterministic, so every item can be rebuilt and re-checked. */
export const GENERATORS: Record<string, Generator> = {
  'MS.G5.B1.3.a': nameFraction,
  'MS.G5.B1.3.b': equivalentFraction,
  'MS.G5.B1.3.c': mixedNumbers,
  'MS.G5.B1.4.a': compareLike,
  'MS.G5.B1.4.b': compareUnlike,
  'MS.G5.B2.5.a': addLike,
  'MS.G5.B2.5.b': subLike,
  'MS.G5.B2.5.c': mixedAddSub,
  'MS.G6.B2.5.a': commonDenominator,
  'MS.G6.B2.5.b': addUnlike,
  'MS.G6.B2.5.c': subUnlike,
  'MS.G5.B1.5.a': readDecimals,
  'MS.G5.B1.5.b': compareDecimals,
  'MS.G5.B1.7.a': fractionToDecimal,
  'MS.G5.B1.7.b': decimalToPercent,
  'MS.G5.E1.4.a': plotPoints,
};

export const MAX_TIER = 3;

export function generate(skill: string, tier: number, seed: number): Item {
  const g = GENERATORS[skill];
  if (!g) throw new Error(`no generator for ${skill}`);
  const t = Math.min(MAX_TIER, Math.max(1, Math.round(tier)));
  return g(t, seed >>> 0);
}

export const hasGenerator = (skill: string): boolean => skill in GENERATORS;
