// Registry of the Grade 11 generators (university preparation, MCR3U): one per micro-skill, each taking (tier, seed).
// Register a new Grade 11 generator here, under MS.G11.{COURSE}.{strand}{n}.{n}.{letter}.
import type { Generator } from '../items/types.js';
import { discriminantGen } from './algebra10.js';
import { annuity11, arithmetic11, compound11, geometric11, pascal11, recursive11 } from './discrete11.js';
import { distinguish11, growth11, rationalExp11 } from './expo11.js';
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
};
