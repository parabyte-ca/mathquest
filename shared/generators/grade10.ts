// Registry of the Grade 10 generators (MPM2D and MFM2P): one per micro-skill, each taking (tier, seed). Register a new Grade 10 generator here.
import type { Generator } from '../items/types.js';
import { commonFactorGen, completeSquareGen, diffSquaresGen, discriminantGen, expandGen, factorGeneralGen, factorMonicGen, quadFormulaGen, solveFactorGen } from './algebra10.js';
import { cosineLawGen, distanceGen, circleGen, imperialGen, imperialMetricGen, midpointGen, similarGen, sineLawGen, trigAngleGen, trigProblemGen, trigSideGen } from './geometry10.js';
import { equationFromVertexGen, maxMinGen, openingGen, projectileGen, secondDifferenceGen, vertexXGen, yInterceptGen, zerosGen } from './parabola10.js';
import { eliminationGen, fractionEqGen, intersectionGen, lineEquationGen, meaningGen, rearrangeGen, slopeGen, substitutionGen, systemProblemGen } from './linear10.js';

/** MFM2P: factor x² + bx + c (tiers 1 and 2) and x² − a² (tier 3). */
const trinomialOrSquares = (id: string): Generator => {
  const trinomial = factorMonicGen(id), squares = diffSquaresGen(id, false);
  return (tier, seed) => (tier < 3 ? trinomial : squares)(tier, seed);
};

export const GENERATORS_G10: Record<string, Generator> = {
  // MPM2D, Quadratic Relations (A3) and Analytic Geometry (B1)
  'MS.G10.MPM2D.A3.1.a': expandGen('MS.G10.MPM2D.A3.1.a', true),
  'MS.G10.MPM2D.A3.2.a': commonFactorGen('MS.G10.MPM2D.A3.2.a'),
  'MS.G10.MPM2D.A3.3.a': factorMonicGen('MS.G10.MPM2D.A3.3.a'),
  'MS.G10.MPM2D.A3.4.a': factorGeneralGen('MS.G10.MPM2D.A3.4.a'),
  'MS.G10.MPM2D.A3.5.a': diffSquaresGen('MS.G10.MPM2D.A3.5.a', true),
  'MS.G10.MPM2D.A3.6.a': solveFactorGen('MS.G10.MPM2D.A3.6.a'),
  'MS.G10.MPM2D.A3.7.a': quadFormulaGen('MS.G10.MPM2D.A3.7.a'),
  'MS.G10.MPM2D.A3.8.a': discriminantGen('MS.G10.MPM2D.A3.8.a'),
  'MS.G10.MPM2D.A3.9.a': completeSquareGen('MS.G10.MPM2D.A3.9.a'),
  'MS.G10.MPM2D.B1.1.a': substitutionGen('MS.G10.MPM2D.B1.1.a'),
  'MS.G10.MPM2D.B1.2.a': eliminationGen('MS.G10.MPM2D.B1.2.a'),
  'MS.G10.MPM2D.B1.3.a': systemProblemGen('MS.G10.MPM2D.B1.3.a'),
  // MPM2D, Quadratic Relations (A1, A2, A4), Analytic Geometry (B2) and Measurement and Trigonometry (C)
  'MS.G10.MPM2D.A1.1.a': secondDifferenceGen('MS.G10.MPM2D.A1.1.a'),
  'MS.G10.MPM2D.A2.1.a': vertexXGen('MS.G10.MPM2D.A2.1.a'),
  'MS.G10.MPM2D.A2.2.a': openingGen('MS.G10.MPM2D.A2.2.a'),
  'MS.G10.MPM2D.A2.3.a': equationFromVertexGen('MS.G10.MPM2D.A2.3.a'),
  'MS.G10.MPM2D.A4.1.a': maxMinGen('MS.G10.MPM2D.A4.1.a'),
  'MS.G10.MPM2D.A4.2.a': projectileGen('MS.G10.MPM2D.A4.2.a'),
  'MS.G10.MPM2D.B2.1.a': midpointGen('MS.G10.MPM2D.B2.1.a'),
  'MS.G10.MPM2D.B2.2.a': distanceGen('MS.G10.MPM2D.B2.2.a'),
  'MS.G10.MPM2D.B2.3.a': circleGen('MS.G10.MPM2D.B2.3.a'),
  'MS.G10.MPM2D.C1.1.a': similarGen('MS.G10.MPM2D.C1.1.a'),
  'MS.G10.MPM2D.C2.1.a': trigSideGen('MS.G10.MPM2D.C2.1.a'),
  'MS.G10.MPM2D.C2.2.a': trigAngleGen('MS.G10.MPM2D.C2.2.a'),
  'MS.G10.MPM2D.C2.3.a': trigProblemGen('MS.G10.MPM2D.C2.3.a'),
  'MS.G10.MPM2D.C3.1.a': sineLawGen('MS.G10.MPM2D.C3.1.a'),
  'MS.G10.MPM2D.C3.2.a': cosineLawGen('MS.G10.MPM2D.C3.2.a'),
  // MFM2P, Measurement and Trigonometry (A), Linear Relations (B) and Quadratic Relations (C)
  'MS.G10.MFM2P.B1.1.a': fractionEqGen('MS.G10.MFM2P.B1.1.a'),
  'MS.G10.MFM2P.B1.2.a': rearrangeGen('MS.G10.MFM2P.B1.2.a'),
  'MS.G10.MFM2P.B2.1.a': slopeGen('MS.G10.MFM2P.B2.1.a'),
  'MS.G10.MFM2P.B2.2.a': meaningGen('MS.G10.MFM2P.B2.2.a'),
  'MS.G10.MFM2P.B2.3.a': lineEquationGen('MS.G10.MFM2P.B2.3.a'),
  'MS.G10.MFM2P.B3.1.a': intersectionGen('MS.G10.MFM2P.B3.1.a'),
  'MS.G10.MFM2P.A1.1.a': similarGen('MS.G10.MFM2P.A1.1.a'),
  'MS.G10.MFM2P.A2.1.a': trigSideGen('MS.G10.MFM2P.A2.1.a'),
  'MS.G10.MFM2P.A2.2.a': trigAngleGen('MS.G10.MFM2P.A2.2.a'),
  'MS.G10.MFM2P.A3.1.a': imperialGen('MS.G10.MFM2P.A3.1.a'),
  'MS.G10.MFM2P.A3.2.a': imperialMetricGen('MS.G10.MFM2P.A3.2.a'),
  'MS.G10.MFM2P.C2.1.a': zerosGen('MS.G10.MFM2P.C2.1.a'),
  'MS.G10.MFM2P.C2.2.a': yInterceptGen('MS.G10.MFM2P.C2.2.a'),
  'MS.G10.MFM2P.C1.1.a': expandGen('MS.G10.MFM2P.C1.1.a', false),
  'MS.G10.MFM2P.C1.2.a': commonFactorGen('MS.G10.MFM2P.C1.2.a'),
  'MS.G10.MFM2P.C1.3.a': trinomialOrSquares('MS.G10.MFM2P.C1.3.a'),
};
