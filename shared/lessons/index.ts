// Lessons, grouped by grade so the web app can load only the group it needs (see web/src/lessonLoader.ts). The server and the tests use all of them.
import type { Lesson } from './types.js';
import { LESSONS_G56 } from './bucket-g56.js';
import { LESSONS_G7 } from './bucket-g7.js';
import { LESSONS_G8 } from './bucket-g8.js';
import { LESSONS_G9 } from './bucket-g9.js';
import { LESSONS_G10 } from './bucket-g10.js';
import { LESSONS_G11 } from './bucket-g11.js';

export const LESSON_BUCKETS = { g56: LESSONS_G56, g7: LESSONS_G7, g8: LESSONS_G8, g9: LESSONS_G9, g10: LESSONS_G10, g11: LESSONS_G11 } as const;
export type LessonBucket = keyof typeof LESSON_BUCKETS;

export const LESSONS: Lesson[] = Object.values(LESSON_BUCKETS).flat();

export const lessonForSkill = (skill: string): Lesson | undefined => LESSONS.find((l) => l.skills.includes(skill));
export const lessonById = (id: string): Lesson | undefined => LESSONS.find((l) => l.id === id);
export type { Lesson } from './types.js';
