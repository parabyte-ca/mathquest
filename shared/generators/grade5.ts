// Registry of the Grade 5 generators: one per micro-skill, each taking (tier, seed). Register a new Grade 5 generator here.
import type { Generator } from '../items/types.js';
import { addLike, mixedAddSub, subLike } from './addsub.js';
import { expressions5, patternKinds5, tablesOfValues5 } from './algebra5.js';
import { decimalPattern, evalWhole, growingPatternRule, inequality5, solveEq5 } from './algebra56.js';
import { alterCode5, code5 } from './code5.js';
import { plotPoints } from './coordinates.js';
import { analyse5, chooseGraph5, relFrequency5, sampling5 } from './data5.js';
import { centralTendency5, experimental5, probFraction5 } from './data56.js';
import { compareDecimals, decimalToPercent, fractionToDecimal, readDecimals } from './decimals.js';
import { budgets5, credit5, taxes5, transfers5 } from './finance5.js';
import { compareLike, compareUnlike, equivalentFraction, mixedNumbers, nameFraction } from './fractions.js';
import { addSub5, compareWhole, composeWhole, divide3by2, facts5, mentalMath5, multiStep5, multiply2x2, properties5, ratios5, roundTenth, unitFractions5 } from './number5.js';
import { congruent5, infographic5, protractor5, views5 } from './shapes5.js';
import { compareAngles5, metricUnits5, transformations5 } from './spatial5.js';
import { areaParTri5, bestValue5, metricDown5, salesTax5, samePerimeter5, triangles5 } from './spatial56.js';

export const GENERATORS_G5: Record<string, Generator> = {
  'MS.G5.E1.1.a': triangles5,
  'MS.G5.E2.2.a': metricDown5,
  'MS.G5.E2.5.a': areaParTri5,
  'MS.G5.E2.6.a': samePerimeter5,
  'MS.G5.F1.2.a': salesTax5,
  'MS.G5.F1.5.a': bestValue5,
  'MS.G5.C1.1.a': patternKinds5,
  'MS.G5.C1.2.a': tablesOfValues5,
  'MS.G5.C2.1.a': expressions5,
  'MS.G5.C3.1.a': code5,
  'MS.G5.C3.2.a': alterCode5,
  'MS.G5.D1.1.a': sampling5,
  'MS.G5.D1.4.a': infographic5,
  'MS.G5.E1.2.a': congruent5,
  'MS.G5.E1.3.a': views5,
  'MS.G5.E2.4.a': protractor5,
  'MS.G5.D1.2.a': relFrequency5,
  'MS.G5.D1.3.a': chooseGraph5,
  'MS.G5.D1.6.a': analyse5,
  'MS.G5.E1.5.a': transformations5,
  'MS.G5.E2.1.a': metricUnits5,
  'MS.G5.E2.3.a': compareAngles5,
  'MS.G5.F1.1.a': transfers5,
  'MS.G5.F1.3.a': budgets5,
  'MS.G5.F1.4.a': credit5,
  'MS.G5.F1.6.a': taxes5,
  'MS.G5.D1.5.a': centralTendency5,
  'MS.G5.D2.1.a': probFraction5,
  'MS.G5.D2.2.a': experimental5,
  'MS.G5.C1.3.a': growingPatternRule,
  'MS.G5.C1.4.a': decimalPattern,
  'MS.G5.C2.2.a': evalWhole,
  'MS.G5.C2.3.a': solveEq5,
  'MS.G5.C2.4.a': inequality5,
  'MS.G5.B1.3.a': nameFraction,
  'MS.G5.B1.3.b': equivalentFraction,
  'MS.G5.B1.3.c': mixedNumbers,
  'MS.G5.B1.4.a': compareLike,
  'MS.G5.B1.4.b': compareUnlike,
  'MS.G5.B2.5.a': addLike,
  'MS.G5.B2.5.b': subLike,
  'MS.G5.B2.5.c': mixedAddSub,
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
};
