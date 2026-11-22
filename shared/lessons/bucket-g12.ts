// Lessons for one group of grades. The web app loads one group at a time, only when a lesson from it is opened.
import type { Lesson } from './types.js';
import { GRADE12_LESSONS } from './grade12.js';

export const LESSONS_G12: Lesson[] = [...GRADE12_LESSONS];
