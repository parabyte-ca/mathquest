// Registry of the Grade 9 generators: one per micro-skill, each taking (tier, seed). Register a new Grade 9 generator here.
import type { Generator } from '../items/types.js';
import { compareLines9, createExpr9, equivalent9, graphEquations9, lineEquations9, linearRelations9, linearVs9, simplify9, solveEq9, transformLines9 } from './algebra9.js';
import { alterCode9, codeEquations9, decompose9, linearNon9 } from './code9.js';
import { largeData9, modelling9, quartiles9, scatter9 } from './data9.js';
import { borrowing9, budget9, depreciation9, situations9 } from './finance9.js';
import { circleTriangle9, composite9, convert9, scaling9, volumeRelations9 } from './geometry9.js';
import { density9, expLaws9, exponents9, integers9, ratesPercents9, signedFractions9, signs9, subsets9, unitFractions9 } from './number9.js';

export const GENERATORS_G9: Record<string, Generator> = {
  'MS.G9.B1.2.a': subsets9,
  'MS.G9.B1.3.a': density9,
  'MS.G9.B2.1.a': exponents9,
  'MS.G9.B2.2.a': expLaws9,
  'MS.G9.B3.1.a': integers9,
  'MS.G9.B3.2.a': unitFractions9,
  'MS.G9.B3.3.a': signs9,
  'MS.G9.B3.4.a': signedFractions9,
  'MS.G9.B3.5.a': ratesPercents9,
  'MS.G9.C1.2.a': createExpr9,
  'MS.G9.C1.3.a': equivalent9,
  'MS.G9.C1.4.a': simplify9,
  'MS.G9.C1.5.a': solveEq9,
  'MS.G9.C3.1.a': linearVs9,
  'MS.G9.C3.2.a': linearRelations9,
  'MS.G9.C3.3.a': compareLines9,
  'MS.G9.C4.2.a': graphEquations9,
  'MS.G9.C4.3.a': transformLines9,
  'MS.G9.C4.4.a': lineEquations9,
  // Algebra: coding, and linear against non-linear relations
  'MS.G9.C2.1.a': codeEquations9('MS.G9.C2.1.a'),
  'MS.G9.C2.2.a': decompose9('MS.G9.C2.2.a'),
  'MS.G9.C2.3.a': alterCode9('MS.G9.C2.3.a'),
  'MS.G9.C4.1.a': linearNon9('MS.G9.C4.1.a'),
  // Data and Modelling
  'MS.G9.D1.1.a': largeData9('MS.G9.D1.1.a'),
  'MS.G9.D1.2.a': quartiles9('MS.G9.D1.2.a'),
  'MS.G9.D1.3.a': scatter9('MS.G9.D1.3.a'),
  'MS.G9.D2.1.a': modelling9('MS.G9.D2.1.a', 'question'),
  'MS.G9.D2.2.a': modelling9('MS.G9.D2.2.a', 'plan'),
  'MS.G9.D2.3.a': modelling9('MS.G9.D2.3.a', 'analysis'),
  'MS.G9.D2.4.a': modelling9('MS.G9.D2.4.a', 'fit'),
  'MS.G9.D2.5.a': modelling9('MS.G9.D2.5.a', 'limits'),
  // Geometry and Measurement
  'MS.G9.E1.2.a': circleTriangle9('MS.G9.E1.2.a'),
  'MS.G9.E1.3.a': convert9('MS.G9.E1.3.a'),
  'MS.G9.E1.4.a': scaling9('MS.G9.E1.4.a'),
  'MS.G9.E1.5.a': composite9('MS.G9.E1.5.a'),
  'MS.G9.E1.6.a': volumeRelations9('MS.G9.E1.6.a'),
  // Financial Literacy
  'MS.G9.F1.1.a': situations9('MS.G9.F1.1.a'),
  'MS.G9.F1.2.a': depreciation9('MS.G9.F1.2.a'),
  'MS.G9.F1.3.a': borrowing9('MS.G9.F1.3.a'),
  'MS.G9.F1.4.a': budget9('MS.G9.F1.4.a'),
};
