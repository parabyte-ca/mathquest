import { useEffect, useState } from 'preact/hooks';
import { toPublic, type Given, type Item } from '../../../shared/items/types';
import type { Lesson } from '../../../shared/lessons/types';
import { check } from '../../../shared/check';
import { generateLoaded, loadGenerators } from '../generators';
import { ItemInput } from '../ItemInput';
import { T2, tt } from '../MathText';
import { speak, speechSupported, stopSpeaking } from '../speech';
import { Visual } from '../visuals';
import { getLang, t } from '../i18n';
import type { StudentSettings } from '../learnTypes';

/** "Learn it first": definitions, worked examples that build, then a guided "try one with me". */
export function LessonView({ lesson, settings, onDone, doneLabel }: { lesson: Lesson; settings: StudentSettings; onDone: () => void; doneLabel?: string }) {
  const [section, setSection] = useState(0); // 0 = definitions, 1..n = examples, n+1 = try it
  const [stepIdx, setStepIdx] = useState(0);
  const examples = lesson.examples;
  const tryIdx = examples.length + 1;

  useEffect(() => { setSection(0); setStepIdx(0); }, [lesson.id]);
  useEffect(() => () => stopSpeaking(), []);

  const say = (text: string) => speechSupported() && settings.voice && speak(text, getLang(), settings.voiceRate ?? 1);
  const readCurrent = () => {
    if (section === 0) say([tt(lesson.intro), ...lesson.definitions.map((d) => `${tt(d.term)}. ${tt(d.text)}`)].join(' '));
    else if (section <= examples.length) say(examples[section - 1]!.steps.slice(0, stepIdx + 1).map((s) => tt(s.text)).join(' '));
  };
  useEffect(() => { if (settings.autoRead) readCurrent(); }, [section, stepIdx]);

  const ex = section >= 1 && section <= examples.length ? examples[section - 1]! : null;

  return (
    <section class="card lesson" aria-labelledby="lesson-title">
      <p class="eyebrow">{t('lesson.label')}</p>
      <h1 id="lesson-title"><T2 x={lesson.title} /></h1>
      <ol class="progress" aria-label={t('lesson.progress')}>
        {Array.from({ length: tryIdx + 1 }, (_, i) => <li key={i} class={i === section ? 'on' : i < section ? 'done' : ''} aria-current={i === section ? 'step' : undefined}><span class="sr">{i + 1}</span></li>)}
      </ol>

      {section === 0 && (
        <div>
          <p class="lead"><T2 x={lesson.intro} /></p>
          {lesson.definitions.map((d, i) => (
            <div class="def" key={i}>
              <h2><T2 x={d.term} /></h2>
              <p><T2 x={d.text} /></p>
              {d.visual && <div class="visual"><Visual v={d.visual} /></div>}
            </div>
          ))}
        </div>
      )}

      {ex && (
        <div>
          <h2><T2 x={ex.title} /></h2>
          {ex.steps.slice(0, stepIdx + 1).map((s, i) => (
            <div class="exstep" key={i} aria-live={i === stepIdx ? 'polite' : undefined}>
              <p><T2 x={s.text} /></p>
              {s.visual && <div class="visual"><Visual v={s.visual} /></div>}
            </div>
          ))}
        </div>
      )}

      {section === tryIdx && <TryIt lesson={lesson} settings={settings} />}

      <div class="actions row-actions">
        {speechSupported() && settings.voice && section < tryIdx && <button type="button" class="secondary" onClick={readCurrent}>🔊 {t('play.readAloud')}</button>}
        {section > 0 && <button type="button" class="secondary" onClick={() => { setSection(section - 1); setStepIdx(0); }}>{t('common.back')}</button>}
        {ex && stepIdx < ex.steps.length - 1 ? (
          <button type="button" class="go" onClick={() => setStepIdx(stepIdx + 1)}>{t('lesson.nextStep')}</button>
        ) : section < tryIdx ? (
          <button type="button" class="go" onClick={() => { setSection(section + 1); setStepIdx(0); }}>{section === examples.length ? t('lesson.tryOne') : t('lesson.next')}</button>
        ) : (
          <button type="button" class="go" onClick={onDone}>{doneLabel ?? t('lesson.finish')}</button>
        )}
      </div>
    </section>
  );
}

/** A guided question. The hint ladder is open; nothing here is scored. */
function TryIt({ lesson, settings }: { lesson: Lesson; settings: StudentSettings }) {
  // the question generators load on demand (one grade at a time), so a lesson itself stays small
  const [item, setItem] = useState<Item | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    setItem(null); setFailed(false);
    loadGenerators([lesson.tryIt.skill]).then(
      () => alive && setItem(generateLoaded(lesson.tryIt.skill, lesson.tryIt.tier, lesson.tryIt.seed)),
      () => alive && setFailed(true),
    );
    return () => { alive = false; };
  }, [lesson.id]);
  if (failed) return <div><p class="note" role="alert">{t('common.error')}</p></div>;
  if (!item) return <div><p role="status">{t('common.loading')}</p></div>;
  return <TryItBody item={item} settings={settings} />;
}

function TryItBody({ item, settings }: { item: Item; settings: StudentSettings }) {
  const [hints, setHints] = useState(0);
  const [result, setResult] = useState<'right' | 'again' | null>(null);

  useEffect(() => { setHints(0); setResult(null); }, [item.id]);

  const submit = (g: Given) => {
    const ok = check(item.answer, g);
    setResult(ok ? 'right' : 'again');
    if (settings.voice && speechSupported()) speak(ok ? t('lesson.right') : t('lesson.again'), getLang(), settings.voiceRate ?? 1);
  };

  return (
    <div>
      <h2>{t('lesson.tryTitle')}</h2>
      <p class="muted">{t('lesson.tryIntro')}</p>
      <p class="prompt"><T2 x={item.prompt} /></p>
      <ItemInput key={item.id} item={toPublic(item)} disabled={result === 'right'} onSubmit={submit} />
      <div role="status" aria-live="polite" class="trybox">
        {result === 'right' && <p class="note ok">✓ {t('lesson.right')} <T2 x={item.praise ?? { en: '', fr: '' }} /></p>}
        {result === 'again' && <p class="note">{t('lesson.again')}</p>}
        {Array.from({ length: hints }, (_, i) => <p class="hint" key={i}><strong>{t('play.hint')} {i + 1}:</strong> <T2 x={item.hints[i]!} /></p>)}
      </div>
      {hints < 3 && result !== 'right' && <button type="button" class="secondary" onClick={() => setHints(hints + 1)}>{t('play.hintBtn')}</button>}
    </div>
  );
}
