// Registry of the Grade 7 generators: one per micro-skill, each taking (tier, seed). Register a new Grade 7 generator here.
import type { Generator } from '../items/types.js';
import { comparePatterns7, equations7, evalDecimal7, inequalities7, integerPatterns7, likeTerms7, patternRules7 } from './algebra7.js';
import { circleGraph7, experimental7, meanChange7, percentData7, twoEvents7 } from './data7.js';
import { addSubFrac7, convert7, decimals7, divFrac7, exponent7, gcf7, intAddSub7, lcm7, mulFrac7, orderOps7, percentChange7, proportional7, rational7, simplify7, squares7 } from './number7.js';
import { budget7, capacity7, circleArea7, circumference7, compareAccounts7, cylinderSA7, cylinderVolume7, dilation7, exchange7, interest7, prismVolume7, solids7, transform7, units7 } from './spatial7.js';

import { alterCode7, between7, equivalents7, largeNumbers7, patterns7, rounding7, subprograms7 } from './gaps7.js';
import { slidePercent7 } from './interactive.js';
import { circles7, decisions7, infographic7, misleading7, percentWhy7, sources7, views7 } from './gaps7b.js';

export const GENERATORS_G7: Record<string, Generator> = {
  'MS.G7.B1.1.a': largeNumbers7,
  'MS.G7.B1.5.a': between7,
  'MS.G7.B1.6.a': rounding7,
  'MS.G7.B2.2.a': equivalents7,
  'MS.G7.B2.2.b': slidePercent7,
  'MS.G7.C1.2.a': patterns7,
  'MS.G7.C3.1.a': subprograms7,
  'MS.G7.C3.2.a': alterCode7,
  'MS.G7.D1.1.a': percentWhy7,
  'MS.G7.D1.4.a': infographic7,
  'MS.G7.D1.6.a': misleading7,
  'MS.G7.E1.2.a': views7,
  'MS.G7.E2.4.a': circles7,
  'MS.G7.F1.2.a': sources7,
  'MS.G7.F1.4.a': decisions7,
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
  'MS.G7.C1.1.a': comparePatterns7,
  'MS.G7.C1.3.a': patternRules7,
  'MS.G7.C1.4.a': integerPatterns7,
  'MS.G7.C2.1.a': likeTerms7,
  'MS.G7.C2.2.a': evalDecimal7,
  'MS.G7.C2.3.a': equations7,
  'MS.G7.C2.4.a': inequalities7,
  'MS.G7.D1.2.a': percentData7,
  'MS.G7.D1.3.a': circleGraph7,
  'MS.G7.D1.5.a': meanChange7,
  'MS.G7.D2.1.a': twoEvents7,
  'MS.G7.D2.2.a': experimental7,
  'MS.G7.E1.1.a': solids7,
  'MS.G7.E1.3.a': dilation7,
  'MS.G7.E1.4.a': transform7,
  'MS.G7.E2.1.a': capacity7,
  'MS.G7.E2.2.a': units7,
  'MS.G7.E2.3.a': circumference7,
  'MS.G7.E2.5.a': circleArea7,
  'MS.G7.E2.6.a': cylinderSA7,
  'MS.G7.E2.7.a': prismVolume7,
  'MS.G7.E2.7.b': cylinderVolume7,
  'MS.G7.F1.1.a': exchange7,
  'MS.G7.F1.3.a': budget7,
  'MS.G7.F1.5.a': interest7,
  'MS.G7.F1.6.a': compareAccounts7,
};
