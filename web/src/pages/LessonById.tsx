import { useEffect, useState } from 'preact/hooks';
import type { Lesson } from '../../../shared/lessons/types';
import { loadLesson } from '../lessonLoader';
import { t, useLang } from '../i18n';
import type { StudentSettings } from '../learnTypes';
import { LessonView } from './LessonView';

/** A lesson by id. Kept in its own file so the lesson text and the guided try-it code load only when a lesson is opened. */
export function LessonById(p: { lessonId: string; settings: StudentSettings; onDone: () => void | Promise<void>; doneLabel?: string }) {
  useLang();
  const [lesson, setLesson] = useState<Lesson | null | 'failed'>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    setLesson(null);
    loadLesson(p.lessonId).then((l) => alive && setLesson(l ?? 'failed'), () => alive && setLesson('failed'));
    return () => { alive = false; };
  }, [p.lessonId, attempt]);
  if (lesson === 'failed') return <section class="card"><p class="note" role="alert">{t('lazy.failed')}</p><button type="button" onClick={() => setAttempt(attempt + 1)}>{t('lazy.retry')}</button></section>;
  if (!lesson) return <section class="card"><p role="status">{t('common.loading')}</p></section>;
  return <LessonView lesson={lesson} settings={p.settings} onDone={p.onDone} doneLabel={p.doneLabel} />;
}
