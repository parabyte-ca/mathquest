// Lessons for one group of grades. The web app loads one group at a time, only when a lesson from it is opened.
import type { Lesson } from './types.js';
import { GRADE12_LESSONS } from './grade12.js';
import { GRADE12C_LESSONS } from './grade12c.js';
import { GRADE12D_LESSONS } from './grade12d.js';
import { GRADE12E_LESSONS } from './grade12e.js';

export const LESSONS_G12: Lesson[] = [...GRADE12_LESSONS, ...GRADE12C_LESSONS, ...GRADE12D_LESSONS, ...GRADE12E_LESSONS];
