import { LESSON_BUCKET_OF } from '../../../shared/lessons/map';
import type { StudentSettings } from '../learnTypes';
import { LessonById } from './LessonById';
import { LearnHomeBack } from './LearnHomeBack';

/** The lesson page for /app/learn/lesson?id=...; the lesson text loads (one group of grades at a time) only when a lesson is opened. */
export function LessonRoute({ settings, go }: { settings: StudentSettings; go: (to: string) => void }) {
  const id = new URLSearchParams(location.search).get('id') ?? '';
  if (!LESSON_BUCKET_OF[id]) return <LearnHomeBack go={go} />;
  return <LessonById lessonId={id} settings={settings} onDone={() => go('/app/learn')} />;
}
