// Registry of the Grade 6 generators: one per micro-skill, each taking (tier, seed). Register a new Grade 6 generator here.
import type { Generator } from '../items/types.js';
import { addUnlike, commonDenominator, subUnlike } from './addsub.js';
import { evalDecimal6, inequality6, linearPattern6, solveEq6 } from './algebra56.js';
import { decimalPatterns6, monomials6, patternKinds6, translatePatterns6 } from './algebra6.js';
import { alterCode6, code6, modelling6 } from './code6.js';
import { probPercent6, range6, twoEvents6 } from './data56.js';
import { chooseGraph6, discreteContinuous6, intervals6, misleading6 } from './data6.js';
import { factors6, goals6, payments6, trade6 } from './finance6.js';
import { addSub6, compareMixed, divideByTenths, divideDecimals, divisibility, fracDec6, integersLine, multiStep6, percentMental, primeFactors, ratiosPercents, roundDecimals, thousandths, timesTenths, wholeDivFraction, wholeTimesFraction, wholeToMillion } from './number6.js';
import { slideInteger6 } from './interactive.js';
import { infographic6, nets6, protractor6, views6 } from './shapes6.js';
import { angles6, area6, fourQuadrants6, metricBoth6, quads6, simpleInterest6, surfaceArea6 } from './spatial56.js';
import { combined6 } from './spatial6.js';

export const GENERATORS_G6: Record<string, Generator> = {
  'MS.G6.E1.1.a': quads6,
  'MS.G6.E1.3.a': fourQuadrants6,
  'MS.G6.E2.1.a': metricBoth6,
  'MS.G6.E2.3.a': angles6,
  'MS.G6.E2.4.a': area6,
  'MS.G6.E2.6.a': surfaceArea6,
  'MS.G6.C3.a': code6,
  'MS.G6.C3.b': alterCode6,
  'MS.G6.C4.a': modelling6,
  'MS.G6.D1.4.a': infographic6,
  'MS.G6.E1.2.a': views6,
  'MS.G6.E2.2.a': protractor6,
  'MS.G6.E2.5.a': nets6,
  'MS.G6.C1.1.a': patternKinds6,
  'MS.G6.C1.2.a': translatePatterns6,
  'MS.G6.C1.4.a': decimalPatterns6,
  'MS.G6.C2.1.a': monomials6,
  'MS.G6.D1.1.a': discreteContinuous6,
  'MS.G6.D1.2.a': intervals6,
  'MS.G6.D1.3.a': chooseGraph6,
  'MS.G6.D1.6.a': misleading6,
  'MS.G6.E1.4.a': combined6,
  'MS.G6.F1.1.a': payments6,
  'MS.G6.F1.2.a': goals6,
  'MS.G6.F1.3.a': factors6,
  'MS.G6.F1.4.a': simpleInterest6,
  'MS.G6.F1.5.a': trade6,
  'MS.G6.D1.5.a': range6,
  'MS.G6.D2.1.a': probPercent6,
  'MS.G6.D2.2.a': twoEvents6,
  'MS.G6.C1.3.a': linearPattern6,
  'MS.G6.C2.2.a': evalDecimal6,
  'MS.G6.C2.3.a': solveEq6,
  'MS.G6.C2.4.a': inequality6,
  'MS.G6.B2.5.a': commonDenominator,
  'MS.G6.B2.5.b': addUnlike,
  'MS.G6.B2.5.c': subUnlike,
  'MS.G6.B1.1.a': wholeToMillion,
  'MS.G6.B1.2.a': integersLine,
  'MS.G6.B1.2.b': slideInteger6,
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
