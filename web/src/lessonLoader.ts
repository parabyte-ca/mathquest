import type { Lesson } from '../../shared/lessons/types';
import { LESSON_BUCKET_OF } from '../../shared/lessons/map';

// Lesson text is large, so the app loads it one group of grades at a time, only when a lesson from that group is opened.
// (The server and the tests use the whole set in shared/lessons/index.ts.)
type Bucket = 'g56' | 'g7' | 'g8' | 'g9' | 'g10' | 'g11';
const LOADERS: Record<Bucket, () => Promise<Lesson[]>> = {
  g56: () => import('../../shared/lessons/bucket-g56').then((m) => m.LESSONS_G56),
  g7: () => import('../../shared/lessons/bucket-g7').then((m) => m.LESSONS_G7),
  g8: () => import('../../shared/lessons/bucket-g8').then((m) => m.LESSONS_G8),
  g9: () => import('../../shared/lessons/bucket-g9').then((m) => m.LESSONS_G9),
  g10: () => import('../../shared/lessons/bucket-g10').then((m) => m.LESSONS_G10),
  g11: () => import('../../shared/lessons/bucket-g11').then((m) => m.LESSONS_G11),
};
const loaded = new Map<Bucket, Lesson[]>();

/** The lesson with this id, or undefined if there is none. Rejects if the group's code cannot be fetched (for example, offline and not yet cached). */
export async function loadLesson(id: string): Promise<Lesson | undefined> {
  const bucket = LESSON_BUCKET_OF[id];
  if (!bucket) return undefined;
  let lessons = loaded.get(bucket);
  if (!lessons) { lessons = await LOADERS[bucket](); loaded.set(bucket, lessons); }
  return lessons.find((l) => l.id === id);
}
