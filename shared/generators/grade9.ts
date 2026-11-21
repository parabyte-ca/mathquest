// Registry of the Grade 9 generators: one per micro-skill, each taking (tier, seed). Register a new Grade 9 generator here.
import type { Generator } from '../items/types.js';
import { compareLines9, createExpr9, equivalent9, graphEquations9, lineEquations9, linearRelations9, linearVs9, simplify9, solveEq9, transformLines9 } from './algebra9.js';
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
};
