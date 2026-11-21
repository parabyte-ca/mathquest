// Lessons for one group of grades. The web app loads one group at a time, only when a lesson from it is opened.
import type { Lesson } from './types.js';
import { NUMBER8_LESSONS } from './number8.js';
import { STRAND8_LESSONS } from './strands8.js';

export const LESSONS_G8: Lesson[] = [...NUMBER8_LESSONS, ...STRAND8_LESSONS];
