import { lessonById } from '../../../shared/lessons/index';
import type { StudentSettings } from '../learnTypes';
import { LessonView } from './LessonView';
import { LearnHomeBack } from './LearnHomeBack';

/** The lesson page for /app/learn/lesson?id=...; kept apart so the lesson text loads only when a lesson is opened. */
export function LessonRoute({ settings, go }: { settings: StudentSettings; go: (to: string) => void }) {
  const lesson = lessonById(new URLSearchParams(location.search).get('id') ?? '');
  if (!lesson) return <LearnHomeBack go={go} />;
  return <LessonView lesson={lesson} settings={settings} onDone={() => go('/app/learn')} />;
}
