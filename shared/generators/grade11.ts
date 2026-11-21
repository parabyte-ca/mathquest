// Registry of the Grade 11 generators (MCR3U and MCF3M): one per micro-skill, each taking (tier, seed).
// Register a new Grade 11 generator here, under MS.G11.{COURSE}.{strand}{n}.{n}.{letter}.
import type { Generator } from '../items/types.js';
import { diffSquaresGen, discriminantGen, factorGeneralGen, quadFormulaGen } from './algebra10.js';
import { annuity11, arithmetic11, compound11, geometric11, pascal11, recursive11 } from './discrete11.js';
import { distinguish11, growth11, rationalExp11 } from './expo11.js';
import { cosineLawGen, sineLawGen } from './geometry10.js';
import { exponentRules11, perfectSquare11, quadRange11, simpleCompound11, vertexStandard11 } from './mcf11.js';
import { ambiguous11, exactValues11, identities11, obtuseLaws11, reciprocal11, sineFunction11, sinusoid11, twoTriangles11 } from './trig11.js';
import { domain11, extreme11, inverse11, lineParabola11, notation11, radicals11, rational11, transform11 } from './function11.js';

export const GENERATORS_G11: Record<string, Generator> = {
  // MCR3U, Characteristics of Functions (A)
  'MS.G11.MCR3U.A1.1.a': notation11('MS.G11.MCR3U.A1.1.a'),
  'MS.G11.MCR3U.A1.2.a': domain11('MS.G11.MCR3U.A1.2.a'),
  'MS.G11.MCR3U.A2.1.a': inverse11('MS.G11.MCR3U.A2.1.a'),
  'MS.G11.MCR3U.A3.1.a': transform11('MS.G11.MCR3U.A3.1.a'),
  'MS.G11.MCR3U.A4.1.a': lineParabola11('MS.G11.MCR3U.A4.1.a'),
  'MS.G11.MCR3U.A4.2.a': extreme11('MS.G11.MCR3U.A4.2.a'),
  'MS.G11.MCR3U.A4.3.a': discriminantGen('MS.G11.MCR3U.A4.3.a'),
  'MS.G11.MCR3U.A5.1.a': radicals11('MS.G11.MCR3U.A5.1.a'),
  'MS.G11.MCR3U.A5.2.a': rational11('MS.G11.MCR3U.A5.2.a'),
  // MCR3U, Exponential Functions (B)
  'MS.G11.MCR3U.B1.1.a': rationalExp11('MS.G11.MCR3U.B1.1.a'),
  'MS.G11.MCR3U.B3.1.a': distinguish11('MS.G11.MCR3U.B3.1.a'),
  'MS.G11.MCR3U.B5.1.a': growth11('MS.G11.MCR3U.B5.1.a'),
  // MCR3U, Discrete Functions (C)
  'MS.G11.MCR3U.C1.1.a': pascal11('MS.G11.MCR3U.C1.1.a'),
  'MS.G11.MCR3U.C1.2.a': recursive11('MS.G11.MCR3U.C1.2.a'),
  'MS.G11.MCR3U.C2.1.a': arithmetic11('MS.G11.MCR3U.C2.1.a'),
  'MS.G11.MCR3U.C2.2.a': geometric11('MS.G11.MCR3U.C2.2.a'),
  'MS.G11.MCR3U.C3.1.a': compound11('MS.G11.MCR3U.C3.1.a'),
  'MS.G11.MCR3U.C4.1.a': annuity11('MS.G11.MCR3U.C4.1.a'),
  // MCR3U, Trigonometric Functions (D)
  'MS.G11.MCR3U.D1.1.a': exactValues11('MS.G11.MCR3U.D1.1.a'),
  'MS.G11.MCR3U.D2.1.a': reciprocal11('MS.G11.MCR3U.D2.1.a'),
  'MS.G11.MCR3U.D3.1.a': identities11('MS.G11.MCR3U.D3.1.a'),
  'MS.G11.MCR3U.D4.1.a': ambiguous11('MS.G11.MCR3U.D4.1.a'),
  'MS.G11.MCR3U.D4.2.a': obtuseLaws11('MS.G11.MCR3U.D4.2.a'),
  'MS.G11.MCR3U.D5.1.a': sinusoid11('MS.G11.MCR3U.D5.1.a'),
  // MCF3M, Quadratic Functions (A), Exponential Functions (B) and Trigonometric Functions (C)
  'MS.G11.MCF3M.A1.1.a': factorGeneralGen('MS.G11.MCF3M.A1.1.a'),
  'MS.G11.MCF3M.A1.2.a': diffSquaresGen('MS.G11.MCF3M.A1.2.a', true),
  'MS.G11.MCF3M.A1.3.a': perfectSquare11('MS.G11.MCF3M.A1.3.a'),
  'MS.G11.MCF3M.A2.1.a': quadFormulaGen('MS.G11.MCF3M.A2.1.a'),
  'MS.G11.MCF3M.A2.2.a': discriminantGen('MS.G11.MCF3M.A2.2.a'),
  'MS.G11.MCF3M.A3.1.a': notation11('MS.G11.MCF3M.A3.1.a'),
  'MS.G11.MCF3M.A3.2.a': quadRange11('MS.G11.MCF3M.A3.2.a'),
  'MS.G11.MCF3M.A4.1.a': vertexStandard11('MS.G11.MCF3M.A4.1.a'),
  'MS.G11.MCF3M.B1.1.a': rationalExp11('MS.G11.MCF3M.B1.1.a'),
  'MS.G11.MCF3M.B1.2.a': exponentRules11('MS.G11.MCF3M.B1.2.a'),
  'MS.G11.MCF3M.B2.1.a': compound11('MS.G11.MCF3M.B2.1.a'),
  'MS.G11.MCF3M.B2.2.a': annuity11('MS.G11.MCF3M.B2.2.a'),
  'MS.G11.MCF3M.B2.3.a': simpleCompound11('MS.G11.MCF3M.B2.3.a'),
  'MS.G11.MCF3M.C1.1.a': twoTriangles11('MS.G11.MCF3M.C1.1.a'),
  'MS.G11.MCF3M.C1.2.a': sineLawGen('MS.G11.MCF3M.C1.2.a'),
  'MS.G11.MCF3M.C1.3.a': cosineLawGen('MS.G11.MCF3M.C1.3.a'),
  'MS.G11.MCF3M.C2.1.a': sineFunction11('MS.G11.MCF3M.C2.1.a'),
};
