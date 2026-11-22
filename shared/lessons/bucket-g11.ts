// Lessons for one group of grades. The web app loads one group at a time, only when a lesson from it is opened.
import type { Lesson } from './types.js';
import { GRADE11_LESSONS } from './grade11.js';
import { GRADE11B_LESSONS } from './grade11b.js';
import { GRADE11C_LESSONS } from './grade11c.js';
import { GRADE11D_LESSONS } from './grade11d.js';

export const LESSONS_G11: Lesson[] = [...GRADE11_LESSONS, ...GRADE11B_LESSONS, ...GRADE11C_LESSONS, ...GRADE11D_LESSONS];
