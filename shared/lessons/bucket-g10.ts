// Lessons for one group of grades. The web app loads one group at a time, only when a lesson from it is opened.
import type { Lesson } from './types.js';
import { GRADE10_LESSONS } from './grade10.js';

export const LESSONS_G10: Lesson[] = [...GRADE10_LESSONS];
