import type { Generator, Item } from '../items/types.js';
import { compareLike, compareUnlike, equivalentFraction, mixedNumbers, nameFraction } from './fractions.js';
import { addLike, addUnlike, commonDenominator, mixedAddSub, subLike, subUnlike } from './addsub.js';
import { compareDecimals, decimalToPercent, fractionToDecimal, readDecimals } from './decimals.js';
import { plotPoints } from './coordinates.js';
import { addSub5, compareWhole, composeWhole, divide3by2, facts5, mentalMath5, multiStep5, multiply2x2, properties5, ratios5, roundTenth, unitFractions5 } from './number5.js';
import { addSub6, compareMixed, divideByTenths, divideDecimals, divisibility, fracDec6, integersLine, multiStep6, percentMental, primeFactors, ratiosPercents, roundDecimals, thousandths, timesTenths, wholeDivFraction, wholeTimesFraction, wholeToMillion } from './number6.js';

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
  'MS.G5.B1.1.a': composeWhole,
  'MS.G5.B1.2.a': compareWhole,
  'MS.G5.B1.6.a': roundTenth,
  'MS.G5.B2.1.a': multiStep5,
  'MS.G5.B2.1.b': properties5,
  'MS.G5.B2.2.a': facts5,
  'MS.G5.B2.3.a': mentalMath5,
  'MS.G5.B2.4.a': addSub5,
  'MS.G5.B2.6.a': multiply2x2,
  'MS.G5.B2.7.a': divide3by2,
  'MS.G5.B2.8.a': unitFractions5,
  'MS.G5.B2.9.a': ratios5,
  'MS.G6.B1.1.a': wholeToMillion,
  'MS.G6.B1.2.a': integersLine,
  'MS.G6.B1.3.a': compareMixed,
  'MS.G6.B1.4.a': thousandths,
  'MS.G6.B1.5.a': roundDecimals,
  'MS.G6.B1.6.a': fracDec6,
  'MS.G6.B2.1.a': multiStep6,
  'MS.G6.B2.2.a': divisibility,
  'MS.G6.B2.3.a': percentMental,
  'MS.G6.B2.4.a': addSub6,
  'MS.G6.B2.6.a': primeFactors,
  'MS.G6.B2.7.a': timesTenths,
  'MS.G6.B2.8.a': divideByTenths,
  'MS.G6.B2.9.a': wholeTimesFraction,
  'MS.G6.B2.10.a': wholeDivFraction,
  'MS.G6.B2.11.a': divideDecimals,
  'MS.G6.B2.12.a': ratiosPercents,
};

export const MAX_TIER = 3;

export function generate(skill: string, tier: number, seed: number): Item {
  const g = GENERATORS[skill];
  if (!g) throw new Error(`no generator for ${skill}`);
  const t = Math.min(MAX_TIER, Math.max(1, Math.round(tier)));
  return g(t, seed >>> 0);
}

export const hasGenerator = (skill: string): boolean => skill in GENERATORS;
