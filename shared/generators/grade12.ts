// Registry of the Grade 12 generators (MHF4U): one per micro-skill, each taking (tier, seed).
// Register a new Grade 12 generator here, under MS.G12.{COURSE}.{strand}{n}.{n}.{letter}.
import type { Generator } from '../items/types.js';
import { expEq12, logEq12, logEval12, logGraph12, logLaws12 } from './logs12.js';
import { factorThm12, inequality12, polyEq12, polyFeatures12, rational12 } from './poly12.js';
import { binomial12, conditional12, counting12, expected12, hyper12, normal12, normalApprox12, pascal12, probRules12, sampling12 } from './prob12.js';
import { marginError12, quartiles12, regression12, residuals12, spread12 } from './stats12.js';
import { chainRule12, curveFeatures12, firstPrinciples12, limits12, optimize12, powerRule12, productQuotient12, trigExpDeriv12 } from './calc12.js';
import { configs12, lineMeetsPlane12, lineplane12, magnitude12, vecApps12, vecOps12 } from './vec12.js';
import { combine12, rateOfChange12, symmetry12 } from './rate12.js';
import { exactRad12, radians12, sinusoid12, trigEq12 } from './trig12.js';
import { arc11, circle11, force11, polyEval11, rearrange11 } from './mct12.js';
import { solveFactorGen } from './algebra10.js';
import { cosineLawGen, sineLawGen, trigSideGen } from './geometry10.js';
import { obtuseLaws11, sineFunction11, sinusoid11 } from './trig11.js';
import { growth11 } from './expo11.js';
import { composite9 } from './geometry9.js';
import { housing11, linearCompare11, mortgage11, optimal11 } from './map12.js';
import { rationalExp11 } from './expo11.js';
import { exponentRules11 } from './mcf11.js';
import { annuity11 } from './discrete11.js';
import { budget9 } from './finance9.js';

// Registry of the Grade 12 generators (MHF4U, MCV4U, MDM4U, MCT4C and MAP4C).
export const GENERATORS_G12: Record<string, Generator> = {
  // MHF4U, Exponential and Logarithmic Functions (A)
  'MS.G12.MHF4U.A1.1.a': logEval12('MS.G12.MHF4U.A1.1.a'),
  'MS.G12.MHF4U.A1.2.a': logLaws12('MS.G12.MHF4U.A1.2.a'),
  'MS.G12.MHF4U.A2.1.a': logGraph12('MS.G12.MHF4U.A2.1.a'),
  'MS.G12.MHF4U.A3.1.a': expEq12('MS.G12.MHF4U.A3.1.a'),
  'MS.G12.MHF4U.A3.2.a': logEq12('MS.G12.MHF4U.A3.2.a'),
  // MHF4U, Trigonometric Functions (B)
  'MS.G12.MHF4U.B1.1.a': radians12('MS.G12.MHF4U.B1.1.a'),
  'MS.G12.MHF4U.B1.2.a': exactRad12('MS.G12.MHF4U.B1.2.a'),
  'MS.G12.MHF4U.B2.1.a': sinusoid12('MS.G12.MHF4U.B2.1.a'),
  'MS.G12.MHF4U.B3.1.a': trigEq12('MS.G12.MHF4U.B3.1.a'),
  // MHF4U, Polynomial and Rational Functions (C)
  'MS.G12.MHF4U.C1.1.a': polyFeatures12('MS.G12.MHF4U.C1.1.a'),
  'MS.G12.MHF4U.C2.1.a': rational12('MS.G12.MHF4U.C2.1.a'),
  'MS.G12.MHF4U.C3.1.a': factorThm12('MS.G12.MHF4U.C3.1.a'),
  'MS.G12.MHF4U.C3.2.a': polyEq12('MS.G12.MHF4U.C3.2.a'),
  'MS.G12.MHF4U.C4.1.a': inequality12('MS.G12.MHF4U.C4.1.a'),
  // MHF4U, Characteristics of Functions (D)
  'MS.G12.MHF4U.D1.1.a': rateOfChange12('MS.G12.MHF4U.D1.1.a'),
  'MS.G12.MHF4U.D2.1.a': combine12('MS.G12.MHF4U.D2.1.a'),
  'MS.G12.MHF4U.D3.1.a': symmetry12('MS.G12.MHF4U.D3.1.a'),
  // MCV4U, Rate of Change (A) and Derivatives and Their Applications (B)
  'MS.G12.MCV4U.A1.1.a': limits12('MS.G12.MCV4U.A1.1.a'),
  'MS.G12.MCV4U.A1.2.a': firstPrinciples12('MS.G12.MCV4U.A1.2.a'),
  'MS.G12.MCV4U.A2.1.a': trigExpDeriv12('MS.G12.MCV4U.A2.1.a'),
  'MS.G12.MCV4U.A3.1.a': powerRule12('MS.G12.MCV4U.A3.1.a'),
  'MS.G12.MCV4U.A3.2.a': productQuotient12('MS.G12.MCV4U.A3.2.a'),
  'MS.G12.MCV4U.A3.3.a': chainRule12('MS.G12.MCV4U.A3.3.a'),
  'MS.G12.MCV4U.B1.1.a': curveFeatures12('MS.G12.MCV4U.B1.1.a'),
  'MS.G12.MCV4U.B2.1.a': optimize12('MS.G12.MCV4U.B2.1.a'),
  // MCV4U, Geometry and Algebra of Vectors (C)
  'MS.G12.MCV4U.C1.1.a': magnitude12('MS.G12.MCV4U.C1.1.a'),
  'MS.G12.MCV4U.C2.1.a': vecOps12('MS.G12.MCV4U.C2.1.a'),
  'MS.G12.MCV4U.C2.2.a': vecApps12('MS.G12.MCV4U.C2.2.a'),
  'MS.G12.MCV4U.C3.1.a': configs12('MS.G12.MCV4U.C3.1.a'),
  'MS.G12.MCV4U.C4.1.a': lineplane12('MS.G12.MCV4U.C4.1.a'),
  'MS.G12.MCV4U.C4.2.a': lineMeetsPlane12('MS.G12.MCV4U.C4.2.a'),
  // MDM4U, Counting and Probability (A) and Probability Distributions (B)
  'MS.G12.MDM4U.A1.1.a': probRules12('MS.G12.MDM4U.A1.1.a'),
  'MS.G12.MDM4U.A1.2.a': conditional12('MS.G12.MDM4U.A1.2.a'),
  'MS.G12.MDM4U.A2.1.a': counting12('MS.G12.MDM4U.A2.1.a'),
  'MS.G12.MDM4U.A2.2.a': pascal12('MS.G12.MDM4U.A2.2.a'),
  'MS.G12.MDM4U.B1.1.a': expected12('MS.G12.MDM4U.B1.1.a'),
  'MS.G12.MDM4U.B1.2.a': binomial12('MS.G12.MDM4U.B1.2.a'),
  'MS.G12.MDM4U.B1.3.a': hyper12('MS.G12.MDM4U.B1.3.a'),
  'MS.G12.MDM4U.B2.1.a': normal12('MS.G12.MDM4U.B2.1.a'),
  'MS.G12.MDM4U.B2.2.a': normalApprox12('MS.G12.MDM4U.B2.2.a'),
  // MDM4U, Organization of Data for Analysis (C) and Statistical Analysis (D)
  'MS.G12.MDM4U.C1.1.a': sampling12('MS.G12.MDM4U.C1.1.a', 'bias'),
  'MS.G12.MDM4U.C2.1.a': sampling12('MS.G12.MDM4U.C2.1.a', 'technique'),
  'MS.G12.MDM4U.D1.1.a': spread12('MS.G12.MDM4U.D1.1.a'),
  'MS.G12.MDM4U.D1.2.a': quartiles12('MS.G12.MDM4U.D1.2.a'),
  'MS.G12.MDM4U.D2.1.a': regression12('MS.G12.MDM4U.D2.1.a'),
  'MS.G12.MDM4U.D2.2.a': residuals12('MS.G12.MDM4U.D2.2.a'),
  'MS.G12.MDM4U.D3.1.a': marginError12('MS.G12.MDM4U.D3.1.a'),
  // MCT4C, Exponential (A), Polynomial (B), Trigonometric (C) and Geometry (D)
  'MS.G12.MCT4C.A1.1.a': growth11('MS.G12.MCT4C.A1.1.a'),
  'MS.G12.MCT4C.A2.1.a': expEq12('MS.G12.MCT4C.A2.1.a'),
  'MS.G12.MCT4C.A2.2.a': logEval12('MS.G12.MCT4C.A2.2.a'),
  'MS.G12.MCT4C.B1.1.a': polyEval11('MS.G12.MCT4C.B1.1.a'),
  'MS.G12.MCT4C.B1.2.a': polyFeatures12('MS.G12.MCT4C.B1.2.a'),
  'MS.G12.MCT4C.B3.1.a': solveFactorGen('MS.G12.MCT4C.B3.1.a'),
  'MS.G12.MCT4C.B3.2.a': polyEq12('MS.G12.MCT4C.B3.2.a'),
  'MS.G12.MCT4C.B3.3.a': rearrange11('MS.G12.MCT4C.B3.3.a'),
  'MS.G12.MCT4C.C1.1.a': trigSideGen('MS.G12.MCT4C.C1.1.a'),
  'MS.G12.MCT4C.C1.2.a': sineLawGen('MS.G12.MCT4C.C1.2.a'),
  'MS.G12.MCT4C.C1.3.a': cosineLawGen('MS.G12.MCT4C.C1.3.a'),
  'MS.G12.MCT4C.C2.1.a': sineFunction11('MS.G12.MCT4C.C2.1.a'),
  'MS.G12.MCT4C.C3.1.a': sinusoid11('MS.G12.MCT4C.C3.1.a'),
  'MS.G12.MCT4C.D1.1.a': force11('MS.G12.MCT4C.D1.1.a'),
  'MS.G12.MCT4C.D2.1.a': composite9('MS.G12.MCT4C.D2.1.a'),
  'MS.G12.MCT4C.D3.1.a': circle11('MS.G12.MCT4C.D3.1.a'),
  'MS.G12.MCT4C.D3.2.a': arc11('MS.G12.MCT4C.D3.2.a'),
  // MAP4C, Mathematical Models (A), Personal Finance (B), Geometry and Trigonometry (C) and Data Management (D)
  'MS.G12.MAP4C.A1.1.a': rationalExp11('MS.G12.MAP4C.A1.1.a'),
  'MS.G12.MAP4C.A1.2.a': exponentRules11('MS.G12.MAP4C.A1.2.a'),
  'MS.G12.MAP4C.A1.3.a': expEq12('MS.G12.MAP4C.A1.3.a'),
  'MS.G12.MAP4C.A2.1.a': linearCompare11('MS.G12.MAP4C.A2.1.a'),
  'MS.G12.MAP4C.A3.1.a': rearrange11('MS.G12.MAP4C.A3.1.a'),
  'MS.G12.MAP4C.B1.1.a': annuity11('MS.G12.MAP4C.B1.1.a'),
  'MS.G12.MAP4C.B1.2.a': mortgage11('MS.G12.MAP4C.B1.2.a'),
  'MS.G12.MAP4C.B2.1.a': housing11('MS.G12.MAP4C.B2.1.a'),
  'MS.G12.MAP4C.B3.1.a': budget9('MS.G12.MAP4C.B3.1.a'),
  'MS.G12.MAP4C.C1.1.a': composite9('MS.G12.MAP4C.C1.1.a'),
  'MS.G12.MAP4C.C2.1.a': optimal11('MS.G12.MAP4C.C2.1.a'),
  'MS.G12.MAP4C.C3.1.a': trigSideGen('MS.G12.MAP4C.C3.1.a'),
  'MS.G12.MAP4C.C3.2.a': obtuseLaws11('MS.G12.MAP4C.C3.2.a'),
  'MS.G12.MAP4C.D1.1.a': regression12('MS.G12.MAP4C.D1.1.a'),
  'MS.G12.MAP4C.D1.2.a': quartiles12('MS.G12.MAP4C.D1.2.a'),
  'MS.G12.MAP4C.D2.1.a': sampling12('MS.G12.MAP4C.D2.1.a', 'bias'),
};
