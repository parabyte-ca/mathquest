import { useEffect, useRef, useState } from 'preact/hooks';
import { check } from '../../../shared/check';
import { buildFeedback, type Feedback } from '../../../shared/feedback';
import { generate } from '../../../shared/generators/index';
import { toPublic, type Given, type Item } from '../../../shared/items/types';
import { makeRng } from '../../../shared/rng';
import { ItemInput } from '../ItemInput';
import { T2 } from '../MathText';
import { getLang, t, useLang } from '../i18n';
import type { StudentMe } from '../offlineStore';
import { downloadPack, nextIndex, remaining, syncPack, waiting, type StoredPack, type SyncSummary } from '../offline';
import { loadPack, savePack } from '../offlineStore';
import { useOnline } from '../pwa';

/** Answers can be sent for a week after a pack expires (the server's grace period). */
const SEND_BY_MS = 7 * 86_400_000;

const dateText = (ms: number): string => new Date(ms).toLocaleDateString(getLang() === 'fr' ? 'fr-CA' : 'en-CA', { month: 'long', day: 'numeric' });

/** Practice without a connection: questions come from a downloaded pack and are built here from their seeds; answers wait on this device until they are sent. */
export function OfflinePractice({ me, go }: { me: StudentMe; go: (to: string) => void }) {
  useLang();
  const online = useOnline();
  const params = new URLSearchParams(location.search);
  const sid = me.student.id;
  const [pack, setPack] = useState<StoredPack | null | undefined>(undefined);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ kind: 'ok' | 'warn'; text: string } | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [answered, setAnswered] = useState<Item | null>(null);
  const shownAt = useRef(Date.now());
  const syncing = useRef(false);

  useEffect(() => { void loadPack(sid).then((p) => setPack(p ?? null)); }, [sid]);

  const send = async (quiet = false): Promise<void> => {
    if (syncing.current) return;
    syncing.current = true;
    setBusy(true);
    const r = await syncPack(sid);
    syncing.current = false;
    setBusy(false);
    if (r.ok) {
      setPack(r.pack);
      if (r.summary) setNote({ kind: 'ok', text: summaryText(r.summary) });
      return;
    }
    if (r.reason === 'gone') { setPack(await loadPack(sid) ?? null); return void setNote({ kind: 'warn', text: t('offlinep.gone') }); }
    if (quiet) return;
    setNote({ kind: 'warn', text: r.reason === 'signin' ? t('offlinep.signIn') : r.reason === 'offline' ? t('offlinep.waitOnline') : t('common.error') });
  };

  // Send waiting answers by themselves whenever the connection is there.
  useEffect(() => { if (online && pack && waiting(pack).length > 0 && !me.offline) void send(true); }, [online, pack === undefined, me.offline]);

  const download = async (): Promise<void> => {
    setBusy(true);
    setNote(null);
    const grade = Number(params.get('grade')) || me.student.grade;
    const r = await downloadPack(sid, { grade, course: params.get('course') || null, strands: (params.get('strands') ?? '').split(',').filter(Boolean) });
    setBusy(false);
    if (r.ok) { setPack(r.pack); setPlaying(false); return; }
    setNote({ kind: 'warn', text: r.reason === 'offline' ? t('offlinep.needOnline') : r.reason === 'content' ? t('play.noContent') : t('common.error') });
  };

  const summaryText = (s: SyncSummary): string => `${t('offlinep.synced', { correct: s.correct, answered: s.answered, xp: s.xp })}${s.leveledUp && s.level ? ` ${t('rewards.levelUp', { n: s.level })}` : ''}`;

  if (pack === undefined) return <section class="card narrow"><p role="status">{t('common.loading')}</p></section>;

  const idx = pack ? nextIndex(pack) : null;
  const item: Item | null = (() => {
    if (!pack || idx === null) return null;
    const ref = pack.items[idx]!;
    try { return generate(ref.skill, ref.tier, ref.seed); } catch { return null; }
  })();

  const submit = async (given: Given): Promise<void> => {
    if (!pack || idx === null || !item) return;
    const correct = check(item.answer, given);
    const ms = Math.min(Date.now() - shownAt.current, 600_000);
    const next: StoredPack = { ...pack, answers: [...pack.answers, { i: idx, given, hints: hintLevel, ms }] };
    await savePack(sid, next);
    setPack(next);
    setAnswered(item);
    setFeedback(buildFeedback(item, given, correct, me.student.grade, hintLevel, makeRng(pack.items[idx]!.seed)));
  };

  const nextQuestion = (): void => {
    setFeedback(null);
    setHintLevel(0);
    shownAt.current = Date.now();
    if (pack && nextIndex(pack) === null) setPlaying(false);
    if (online && !me.offline) void send(true);
  };

  const left = pack ? remaining(pack) : 0;
  const pending = waiting(pack ?? undefined).length;
  const header = <p class="note">{me.offline || !online ? t('offlinep.notice') : t('offlinep.noticeOnline')}</p>;

  if (playing && pack && (item || (feedback && answered))) {
    const total = pack.items.length;
    const number = feedback ? pack.answers.length : pack.answers.length + 1;
    const shown = (feedback ? answered : item)!;
    return (
      <div class="play">
        <section class="card question" aria-labelledby="oq-title">
          <p class="eyebrow" id="oq-title">{t('offlinep.question', { n: number, total })} · {t(`tier.${shown.tier}`)}</p>
          <p class="prompt"><T2 x={shown.prompt} /></p>
          <ItemInput key={shown.id} item={toPublic(shown)} disabled={!!feedback} onSubmit={(g) => void submit(g)} />
          {!feedback && (
            <div class="helpers">
              {hintLevel < 3 && <button type="button" class="secondary" onClick={() => setHintLevel(hintLevel + 1)}>💡 {t('play.hintBtn')}{hintLevel ? ` (${hintLevel}/3)` : ''}</button>}
            </div>
          )}
          <div role="status" aria-live="polite">
            {shown.hints.slice(0, hintLevel).map((h, i) => <p class="hint" key={i}><strong>{t('play.hint')} {i + 1}:</strong> <T2 x={h} /></p>)}
            {hintLevel > 0 && !feedback && <p class="muted small">{t('play.hintNote')}</p>}
          </div>
          {feedback && (
            <div class={`feedback ${feedback.correct ? 'good' : 'tip'}`} role="status" aria-live="polite">
              <p class="fmsg"><span aria-hidden="true">{feedback.correct ? '✓' : '💡'}</span> <T2 x={feedback.message} /></p>
              {feedback.detail && <p><T2 x={feedback.detail} /></p>}
              {!feedback.correct && feedback.why && <p><T2 x={feedback.why} /></p>}
              {!feedback.correct && feedback.step && <p><strong>{t('play.stepNote', { n: feedback.stepNumber ?? 1 })}</strong> <T2 x={feedback.step} /></p>}
              {!feedback.correct && feedback.correctAnswer && <p><strong>{t('play.correctAnswer')}</strong> <T2 x={feedback.correctAnswer} /></p>}
              {feedback.usedHints > 0 && feedback.correct && <p class="muted small">{t('play.hintCredit')}</p>}
              <div class="actions row-actions">
                <button type="button" onClick={nextQuestion}>{nextIndex(pack) === null ? t('offlinep.finish') : t('play.next')}</button>
                <button type="button" class="link" onClick={() => { setFeedback(null); setPlaying(false); }}>{t('play.stop')}</button>
              </div>
            </div>
          )}
        </section>
      </div>
    );
  }

  const finished = !!pack && left === 0;
  const loading = busy ? ` ${t('offlinep.working')}` : '';
  return (
    <section class="card narrow" aria-labelledby="op-title">
      <h1 id="op-title">{t('offlinep.title')}</h1>
      {header}
      {!pack && <p>{t('offlinep.intro')}</p>}
      {pack && !finished && <p>{t('offlinep.left', { left, total: pack.items.length })}</p>}
      {pack && finished && <p class="note ok">{t('offlinep.finished')}</p>}
      {pack && <p class="muted small">{t('offlinep.sendBy', { date: dateText(pack.expiresAt + SEND_BY_MS) })}</p>}
      {pending > 0 && <p role="status">{t('offlinep.waiting', { n: pending })}</p>}
      {note && <p class={`note${note.kind === 'ok' ? ' ok' : ''}`} role="status">{note.text}</p>}
      <div class="actions row-actions">
        {pack && !finished && <button type="button" disabled={!item} onClick={() => { shownAt.current = Date.now(); setPlaying(true); }}>{pack.answers.length > 0 ? t('offlinep.keep') : t('offlinep.start')}</button>}
        {pending > 0 && <button type="button" class="secondary" disabled={busy || !online || !!me.offline} onClick={() => void send()}>{t('offlinep.sync')}{loading}</button>}
        {(!pack || finished) && pending === 0 && <button type="button" disabled={busy || !online || !!me.offline} onClick={() => void download()}>{pack ? t('offlinep.new') : t('offlinep.download')}{loading}</button>}
        {(!online || me.offline) && (!pack || finished) && pending === 0 && <span class="muted small">{t('offlinep.needOnline')}</span>}
        {!me.offline && <button type="button" class="secondary" onClick={() => go('/app/learn')}>{t('nav.home')}</button>}
      </div>
    </section>
  );
}

