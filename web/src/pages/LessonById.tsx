import { lessonById } from '../../../shared/lessons/index';
import type { StudentSettings } from '../learnTypes';
import { LessonView } from './LessonView';

/** A lesson by id. Kept in its own file so the lesson text and the guided try-it code load only when a lesson is opened. */
export function LessonById(p: { lessonId: string; settings: StudentSettings; onDone: () => void | Promise<void>; doneLabel?: string }) {
  const lesson = lessonById(p.lessonId);
  if (!lesson) return null;
  return <LessonView lesson={lesson} settings={p.settings} onDone={p.onDone} doneLabel={p.doneLabel} />;
}
