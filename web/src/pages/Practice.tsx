import { useEffect, useRef, useState } from 'preact/hooks';
import { Glyph } from '../icons';
import type { Given, Text } from '../../../shared/items/types';
import { applyReward, RewardNote, type RewardResult } from '../rewards';
import { BADGES } from '../../../shared/rewards';
import { api } from '../api';
import { ItemInput } from '../ItemInput';
import { T2, tt } from '../MathText';
import { Scratchpad } from '../Scratchpad';
import { onCaption, speak, speechSupported, stopSpeaking } from '../speech';
import { getLang, t } from '../i18n';
import type { AnswerData, LadderEvent, Step, StudentSettings } from '../learnTypes';
import { Lazy } from '../lazy';

const EVENT_KEY: Partial<Record<LadderEvent, string>> = {
  advance: 'event.advance', stepdown: 'event.stepdown', micro: 'event.micro', lesson: 'event.lesson',
  buildup: 'event.buildup', recovered: 'event.recovered', help: 'event.help',
};

/** The question player: lesson, item, hints, feedback and the next step. Answers are graded on the server. */
const loadLesson = () => import('./LessonById').then((m) => m.LessonById);
const BADGE_NAMES: Record<string, Text> = Object.fromEntries(BADGES.map((b) => [b.id, b.name]));

export function Practice({ settings, go }: { settings: StudentSettings; go: (to: string) => void }) {
  const params = new URLSearchParams(location.search);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [step, setStep] = useState<Step | null>(null);
  const [result, setResult] = useState<AnswerData | null>(null);
  const [hints, setHints] = useState<Text[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showHow, setShowHow] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const [scratch, setScratch] = useState(false);
  const shownAt = useRef(Date.now());

  const say = (text: string) => settings.voice && speechSupported() && speak(text, getLang(), settings.voiceRate ?? 1);

  useEffect(() => {
    const off = onCaption(setCaption);
    const grade = Number(params.get('grade'));
    const course = params.get('course') || null;
    const strands = (params.get('strands') ?? '').split(',').filter(Boolean);
    const focus = params.get('focus') || null;
    void api<{ sessionId: string; step: Step }>('POST', '/learn/session', { grade, course, strands, focus }).then((r) => {
      if (!r.ok) return setError(r.status === 404 ? t('play.noContent') : r.status === 429 ? t('play.takeBreak') : t('common.error'));
      setSessionId(r.data.sessionId);
      show(r.data.step);
    });
    return () => { off(); stopSpeaking(); };
  }, []);

  const show = (s: Step) => {
    setStep(s); setResult(null); setHints([]); setShowHow(false); setReported(false); setReporting(false);
    shownAt.current = Date.now();
    if (s.type === 'item' && settings.autoRead) say(tt(s.item.prompt));
  };

  const load = async (similar = false) => {
    if (!sessionId) return;
    setBusy(true);
    const r = await api<Step>('POST', '/learn/next', { sessionId, similar });
    setBusy(false);
    if (r.ok) show(r.data); else setError(t('common.error'));
  };

  const submit = async (given: Given) => {
    if (step?.type !== 'item') return;
    setBusy(true);
    const r = await api<AnswerData>('POST', '/learn/answer', { itemId: step.item.id, given, ms: Date.now() - shownAt.current });
    setBusy(false);
    if (!r.ok) return setError(t('common.error'));
    setResult(r.data);
    if (r.data.reward) applyReward(r.data.reward);
    const f = r.data.feedback;
    if (settings.autoRead) say([tt(f.message), f.why ? tt(f.why) : '', f.correct ? '' : tt(f.correctAnswer ?? { en: '', fr: '' })].filter(Boolean).join(' '));
  };

  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);
  const sendReport = async (reason: string) => {
    if (step?.type !== 'item') return;
    const r = await api('POST', '/learn/report', { itemId: step.item.id, reason });
    setReporting(false);
    if (r.ok) setReported(true);
  };

  const askHint = async () => {
    if (step?.type !== 'item' || hints.length >= 3) return;
    const r = await api<{ level: number; text: Text }>('POST', '/learn/hint', { itemId: step.item.id });
    if (r.ok) {
      setHints((h) => [...h.slice(0, r.data.level - 1), r.data.text]);
      if (settings.autoRead) say(tt(r.data.text));
    }
  };

  if (error) return <section class="card narrow"><p class="note" role="alert">{error}</p><button type="button" onClick={() => go('/app/learn')}>{t('common.back')}</button></section>;
  if (!step) return <section class="card narrow"><p role="status">{t('common.loading')}</p></section>;

  if (step.type === 'lesson') {
    return (
      <>
        <p class="banner" role="status">{t('event.lesson')}</p>
        <Lazy load={loadLesson} props={{ lessonId: step.lessonId, settings, doneLabel: t('lesson.backToPractice'), onDone: async () => { await api('POST', '/learn/lesson-done', { target: step.target }); await load(); } }} />
      </>
    );
  }

  if (step.type === 'done') {
    const s = step.summary;
    return (
      <section class="card narrow" aria-labelledby="done-title">
        <h1 id="done-title">{step.reason === 'limit' ? t('play.limitTitle') : t('play.doneTitle')}</h1>
        {step.reason === 'limit' && <p class="note">{t('play.limitBody')}</p>}
        <p>{t('play.doneBody', { correct: s.correct, answered: s.answered })}</p>
        {s.masteredExpectations.length > 0 && <p class="note ok"><Glyph name="star" /> {t('play.mastered', { n: s.masteredExpectations.length })}</p>}
        <div class="actions row-actions"><button type="button" onClick={() => go('/app/learn/map?grade=' + params.get('grade'))}>{t('learn.skillMap')}</button><button type="button" class="secondary" onClick={() => go('/app/learn')}>{t('nav.home')}</button></div>
      </section>
    );
  }

  const item = step.item;
  const lesson = step.lessonId ?? null;
  const f = result?.feedback;
  const evKey = result ? EVENT_KEY[result.event] : undefined;

  return (
    <div class={`play${scratch ? ' with-scratch' : ''}`}>
      <section class="card question" aria-labelledby="q-title">
        <div class="qhead">
          <p class="eyebrow" id="q-title">{step.kind === 'review' ? t('play.review') : t('play.question')} · {t(`tier.${item.tier}`)}</p>
          <div class="qtools">
            {settings.voice && speechSupported() && <button type="button" class="secondary small" onClick={() => say(tt(item.prompt))} aria-label={t('play.readAloud')}>🔊</button>}
            <button type="button" class="secondary small" aria-pressed={scratch} onClick={() => setScratch(!scratch)}>✏️ {t('scratch.toggle')}</button>
          </div>
        </div>
        {step.phase !== 'normal' && !result && <p class="banner small" role="status">{t(`phase.${step.phase}`)}</p>}
        <p class="prompt"><T2 x={item.prompt} /></p>

        <ItemInput key={item.id} item={item} disabled={busy || !!result} onSubmit={submit} />

        {!result && (
          <div class="helpers">
            {hints.length < 3 && <button type="button" class="secondary" onClick={askHint}>💡 {t('play.hintBtn')}{hints.length ? ` (${hints.length}/3)` : ''}</button>}
            {lesson && <button type="button" class="link" onClick={() => setShowHow(!showHow)}>{t('play.showHow')}</button>}
          </div>
        )}
        <div role="status" aria-live="polite">
          {hints.map((h, i) => <p class="hint" key={i}><strong>{t('play.hint')} {i + 1}:</strong> <T2 x={h} /></p>)}
          {hints.length > 0 && !result && <p class="muted small">{t('play.hintNote')}</p>}
        </div>

        {result && f && (
          <div class={`feedback ${f.correct ? 'good' : 'tip'}`} role="status" aria-live="polite">
            <p class="fmsg"><span aria-hidden="true">{f.correct ? '✓' : '💡'}</span> <T2 x={f.message} /></p>
            {f.detail && <p><T2 x={f.detail} /></p>}
            {!f.correct && f.why && <p><T2 x={f.why} /></p>}
            {!f.correct && f.step && <p><strong>{t('play.stepNote', { n: f.stepNumber ?? 1 })}</strong> <T2 x={f.step} /></p>}
            {!f.correct && f.correctAnswer && <p><strong>{t('play.correctAnswer')}</strong> <T2 x={f.correctAnswer} /></p>}
            {result.masteredSkill && <p class="note ok"><Glyph name="star" /> {t('play.skillMastered')}</p>}
            {result.reward && <RewardNote r={result.reward} badgeNames={BADGE_NAMES} />}
            {evKey && <p class="banner small">{t(evKey)}</p>}
            {f.usedHints > 0 && f.correct && <p class="muted small">{t('play.hintCredit')}</p>}
            <div class="actions row-actions">
              {!f.correct && <button type="button" class="secondary" disabled={busy} onClick={() => load(true)}>{t('play.similar')}</button>}
              {lesson && !f.correct && <button type="button" class="secondary" onClick={() => setShowHow(true)}>{t('play.showHow')}</button>}
              <button type="button" class="go" disabled={busy} onClick={() => load(false)}>{t('play.next')}</button>
              <button type="button" class="link" onClick={() => go('/app/learn')}>{t('play.stop')}</button>
            </div>
          </div>
        )}
        {showHow && lesson && <div class="overlay"><Lazy load={loadLesson} props={{ lessonId: lesson, settings, doneLabel: t('lesson.backToQuestion'), onDone: () => setShowHow(false) }} /></div>}
      </section>
      <div class="report">
        {reported ? <p class="muted small" role="status">{t('report.thanks')}</p> : reporting ? (
          <div role="group" aria-label={t('report.title')}>
            <p class="small"><strong>{t('report.title')}</strong></p>
            <div class="row-actions">
              {(['unclear', 'answer', 'too_hard', 'other'] as const).map((k) => <button type="button" class="secondary small" key={k} onClick={() => sendReport(k)}>{t(`report.${k}`)}</button>)}
              <button type="button" class="link" onClick={() => setReporting(false)}>{t('report.cancel')}</button>
            </div>
          </div>
        ) : <button type="button" class="link small" onClick={() => setReporting(true)}>{t('report.btn')}</button>}
      </div>
      {scratch && <aside class="card" aria-label={t('scratch.title')}><Scratchpad resetKey={item.id} /></aside>}
      {caption && <div class="caption" role="status" aria-live="off">{caption}</div>}
    </div>
  );
}
