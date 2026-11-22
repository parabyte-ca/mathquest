// Registry of the Grade 8 generators: one per micro-skill, each taking (tier, seed). Register a new Grade 8 generator here.
import type { Generator } from '../items/types.js';
import { binomials8, comparePatterns8, equations8, evalRational8, inequalities8, patternRules8, rationalPatterns8 } from './algebra8.js';
import { correlation8, multiEvents8, tables8, venn8 } from './data8.js';
import { analysis8, infographic8, patterns8c, scatter8, variables8, views8 } from './gaps8.js';
import { budget8, credit8, growth8, offers8, payments8, plan8 } from './finance8.js';
import { addSubFrac8, integers8, mulDivFrac8, mulDivInt8, orderOps8, percents8, powersOfTen8, proportions8, realNumbers8, roots8, scientific8, squaresRecall8 } from './number8.js';
import { compositeArea8, compositeVolume8, hypotenuse8, leg8, lineAngles8, polygonAngles8, scale8, tessellations8, transform8, unitsExp8 } from './spatial8.js';

export const GENERATORS_G8: Record<string, Generator> = {
  'MS.G8.B1.1.a': scientific8,
  'MS.G8.B1.2.a': realNumbers8,
  'MS.G8.B1.3.a': roots8,
  'MS.G8.B1.4.a': percents8,
  'MS.G8.B2.1.a': orderOps8,
  'MS.G8.B2.2.a': squaresRecall8,
  'MS.G8.B2.3.a': powersOfTen8,
  'MS.G8.B2.4.a': integers8,
  'MS.G8.B2.5.a': addSubFrac8,
  'MS.G8.B2.6.a': mulDivFrac8,
  'MS.G8.B2.7.a': mulDivInt8,
  'MS.G8.B2.8.a': proportions8,
  'MS.G8.C1.1.a': comparePatterns8,
  'MS.G8.C1.2.a': patterns8c,
  'MS.G8.C1.3.a': patternRules8,
  'MS.G8.C1.4.a': rationalPatterns8,
  'MS.G8.C2.1.a': binomials8,
  'MS.G8.C2.2.a': evalRational8,
  'MS.G8.C2.3.a': equations8,
  'MS.G8.C2.4.a': inequalities8,
  'MS.G8.D1.1.a': variables8,
  'MS.G8.D1.2.a': tables8,
  'MS.G8.D1.3.a': scatter8,
  'MS.G8.D1.4.a': infographic8,
  'MS.G8.D1.5.a': correlation8,
  'MS.G8.D1.6.a': analysis8,
  'MS.G8.D2.1.a': venn8,
  'MS.G8.D2.2.a': multiEvents8,
  'MS.G8.E1.1.a': tessellations8,
  'MS.G8.E1.2.a': views8,
  'MS.G8.E1.3.a': scale8,
  'MS.G8.E1.4.a': transform8,
  'MS.G8.E2.1.a': unitsExp8,
  'MS.G8.E2.2.a': lineAngles8,
  'MS.G8.E2.2.b': polygonAngles8,
  'MS.G8.E2.3.a': compositeArea8,
  'MS.G8.E2.3.b': compositeVolume8,
  'MS.G8.E2.4.a': hypotenuse8,
  'MS.G8.E2.4.b': leg8,
  'MS.G8.F1.1.a': payments8,
  'MS.G8.F1.2.a': plan8,
  'MS.G8.F1.3.a': budget8,
  'MS.G8.F1.4.a': growth8,
  'MS.G8.F1.5.a': offers8,
  'MS.G8.F1.6.a': credit8,
};
