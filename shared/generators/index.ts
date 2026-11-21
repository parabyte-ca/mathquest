import type { Generator, Item } from '../items/types.js';
import { compareLike, compareUnlike, equivalentFraction, mixedNumbers, nameFraction } from './fractions.js';
import { addLike, addUnlike, commonDenominator, mixedAddSub, subLike, subUnlike } from './addsub.js';
import { compareDecimals, decimalToPercent, fractionToDecimal, readDecimals } from './decimals.js';
import { plotPoints } from './coordinates.js';
import { addSub5, compareWhole, composeWhole, divide3by2, facts5, mentalMath5, multiStep5, multiply2x2, properties5, ratios5, roundTenth, unitFractions5 } from './number5.js';
import { addSub6, compareMixed, divideByTenths, divideDecimals, divisibility, fracDec6, integersLine, multiStep6, percentMental, primeFactors, ratiosPercents, roundDecimals, thousandths, timesTenths, wholeDivFraction, wholeTimesFraction, wholeToMillion } from './number6.js';
import { decimalPattern, evalDecimal6, evalWhole, growingPatternRule, inequality5, inequality6, linearPattern6, solveEq5, solveEq6 } from './algebra56.js';
import { centralTendency5, experimental5, probFraction5, probPercent6, range6, twoEvents6 } from './data56.js';
import { addSubFrac7, convert7, decimals7, divFrac7, exponent7, gcf7, intAddSub7, lcm7, mulFrac7, orderOps7, percentChange7, proportional7, rational7, simplify7, squares7 } from './number7.js';
import { angles6, area6, areaParTri5, bestValue5, fourQuadrants6, metricBoth6, metricDown5, quads6, salesTax5, samePerimeter5, simpleInterest6, surfaceArea6, triangles5 } from './spatial56.js';

/** One generator per micro-skill. Each takes (tier, seed) and is deterministic, so every item can be rebuilt and re-checked. */
export const GENERATORS: Record<string, Generator> = {
  'MS.G5.E1.1.a': triangles5,
  'MS.G6.E1.1.a': quads6,
  'MS.G6.E1.3.a': fourQuadrants6,
  'MS.G5.E2.2.a': metricDown5,
  'MS.G6.E2.1.a': metricBoth6,
  'MS.G5.E2.5.a': areaParTri5,
  'MS.G5.E2.6.a': samePerimeter5,
  'MS.G6.E2.3.a': angles6,
  'MS.G6.E2.4.a': area6,
  'MS.G6.E2.6.a': surfaceArea6,
  'MS.G5.F1.2.a': salesTax5,
  'MS.G5.F1.5.a': bestValue5,
  'MS.G6.F1.4.a': simpleInterest6,
  'MS.G5.D1.5.a': centralTendency5,
  'MS.G6.D1.5.a': range6,
  'MS.G5.D2.1.a': probFraction5,
  'MS.G6.D2.1.a': probPercent6,
  'MS.G5.D2.2.a': experimental5,
  'MS.G6.D2.2.a': twoEvents6,
  'MS.G5.C1.3.a': growingPatternRule,
  'MS.G5.C1.4.a': decimalPattern,
  'MS.G5.C2.2.a': evalWhole,
  'MS.G5.C2.3.a': solveEq5,
  'MS.G5.C2.4.a': inequality5,
  'MS.G6.C1.3.a': linearPattern6,
  'MS.G6.C2.2.a': evalDecimal6,
  'MS.G6.C2.3.a': solveEq6,
  'MS.G6.C2.4.a': inequality6,
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
  'MS.G7.B1.2.a': squares7,
  'MS.G7.B1.3.a': rational7,
  'MS.G7.B1.4.a': simplify7,
  'MS.G7.B1.7.a': convert7,
  'MS.G7.B2.1.a': orderOps7,
  'MS.G7.B2.3.a': percentChange7,
  'MS.G7.B2.4.a': intAddSub7,
  'MS.G7.B2.5.a': addSubFrac7,
  'MS.G7.B2.6.a': gcf7,
  'MS.G7.B2.6.b': lcm7,
  'MS.G7.B2.7.a': exponent7,
  'MS.G7.B2.8.a': mulFrac7,
  'MS.G7.B2.8.b': divFrac7,
  'MS.G7.B2.9.a': decimals7,
  'MS.G7.B2.10.a': proportional7,
};

export const MAX_TIER = 3;

export function generate(skill: string, tier: number, seed: number): Item {
  const g = GENERATORS[skill];
  if (!g) throw new Error(`no generator for ${skill}`);
  const t = Math.min(MAX_TIER, Math.max(1, Math.round(tier)));
  return g(t, seed >>> 0);
}

export const hasGenerator = (skill: string): boolean => skill in GENERATORS;
