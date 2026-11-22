// Lessons for one group of grades. The web app loads one group at a time, only when a lesson from it is opened.
import type { Lesson } from './types.js';
import { GRADE9_LESSONS } from './grade9.js';
import { GRADE9B_LESSONS } from './grade9b.js';

export const LESSONS_G9: Lesson[] = [...GRADE9_LESSONS, ...GRADE9B_LESSONS];
