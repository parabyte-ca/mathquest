// Lessons for one group of grades. The web app loads one group at a time, only when a lesson from it is opened.
import type { Lesson } from './types.js';
import { NUMBER_LESSONS } from './number.js';
import { STRAND_LESSONS } from './strands56.js';
import { GRADE6_LESSONS } from './grade6.js';
import { FRACTION5_LESSONS } from './fractions5.js';
import { INTERACTIVE5_LESSONS } from './interactive5.js';

export const LESSONS_G56: Lesson[] = [...NUMBER_LESSONS, ...STRAND_LESSONS, ...GRADE6_LESSONS, ...FRACTION5_LESSONS, ...INTERACTIVE5_LESSONS];
