// Lessons for one group of grades. The web app loads one group at a time, only when a lesson from it is opened.
import type { Lesson } from './types.js';
import { NUMBER7_LESSONS } from './number7.js';
import { STRAND7_LESSONS } from './strands7.js';
import { GAPS7_LESSONS } from './gaps7.js';

export const LESSONS_G7: Lesson[] = [...NUMBER7_LESSONS, ...STRAND7_LESSONS, ...GAPS7_LESSONS];
