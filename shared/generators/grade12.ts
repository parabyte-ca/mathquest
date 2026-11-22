// Registry of the Grade 12 generators (MHF4U): one per micro-skill, each taking (tier, seed).
// Register a new Grade 12 generator here, under MS.G12.{COURSE}.{strand}{n}.{n}.{letter}.
import type { Generator } from '../items/types.js';
import { expEq12, logEq12, logEval12, logGraph12, logLaws12 } from './logs12.js';
import { factorThm12, inequality12, polyEq12, polyFeatures12, rational12 } from './poly12.js';
import { combine12, rateOfChange12, symmetry12 } from './rate12.js';
import { exactRad12, radians12, sinusoid12, trigEq12 } from './trig12.js';

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
};
