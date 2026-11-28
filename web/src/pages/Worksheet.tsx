import { useEffect, useState } from 'preact/hooks';
import type { Given, PublicItem, Text, Visual as VisualSpec } from '../../../shared/items/types';
import { api } from '../api';
import { ItemInput } from '../ItemInput';
import { givenFromText } from '../../../shared/transcribe';
import { getLang, t, useLang } from '../i18n';
import { MathText } from '../MathText';
import { Visual } from '../visuals';

interface Row { n: number; format: string; prompt: Text; options?: Text[]; right?: Text[]; visual?: VisualSpec; answer: Text; steps: Text[] }
interface Sheet { student: { displayName: string; grade: number; language: 'en' | 'fr' }; focus: string; topic: string; topics: { code: string }[]; tier: string; seed: number; count: number; marked: { answered: number; correct: number; total: number; xp: number } | null; photo: boolean; items: Row[] }
interface Marked { total: number; answered: number; correct: number; xp: number; finished: boolean; bonus: number; results: { n: number; correct: boolean; xp: number }[]; level: number | null; leveledUp: boolean }

const LETTERS = 'ABCDEFGH';

/** A short plain-text reading of what was entered, for the review list. */
const entered = (g: Given): string => {
  switch (g.kind) {
    case 'number': case 'expression': return g.text;
    case 'fraction': return `${g.n}/${g.d}`;
    case 'mixed': return `${g.whole} ${g.n}/${g.d}`;
    case 'choice': return LETTERS[g.index] ?? String(g.index + 1);
    case 'multi': return g.indices.map((i) => LETTERS[i] ?? String(i + 1)).join(', ');
    case 'order': return g.order.map((i) => LETTERS[i] ?? String(i + 1)).join(' → ');
    case 'match': return g.pairs.map(([l, r]) => `${l + 1}–${LETTERS[r] ?? r + 1}`).join(', ');
    case 'point': return `(${g.x}, ${g.y})`;
  }
};

const asPublic = (it: Row): PublicItem => ({ id: `sheet-${it.n}`, skill: '', tier: 1, category: 'KU', format: it.format as PublicItem['format'], prompt: it.prompt, visual: it.visual, options: it.options, right: it.right });

/** A printable practice sheet with an optional answer key on its own page. */
export function Worksheet({ go }: { go: (to: string) => void }) {
  useLang();
  const q = new URLSearchParams(location.search);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [error, setError] = useState('');
  const [key, setKey] = useState(true);
  const [solutions, setSolutions] = useState(false);
  // marking: 'off' shows the printable sheet; 'enter' takes one answer at a time; 'review' lists them; 'done' shows the result
  const [mode, setMode] = useState<'off' | 'enter' | 'review' | 'done' | 'confirm'>('off');
  const [step, setStep] = useState(0);
  const [given, setGiven] = useState<Record<number, Given>>({});
  const [busy, setBusy] = useState(false);
  const [markError, setMarkError] = useState('');
  const [result, setResult] = useState<Marked | null>(null);
  // reading a photo: the picture stays in this page's memory only, and goes nowhere but the one request that reads it
  const [photoUrl, setPhotoUrl] = useState('');
  const [reading, setReading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [read, setRead] = useState<Record<number, { text: string; low: boolean }>>({});
  const [rowError, setRowError] = useState<Record<number, boolean>>({});
  const dropPhoto = (): void => { if (photoUrl) URL.revokeObjectURL(photoUrl); setPhotoUrl(''); setRead({}); setRowError({}); };
  const lang = getLang();
  const tx = (x: Text): string => x[lang];

  useEffect(() => {
    const params = new URLSearchParams({ focus: q.get('focus') ?? '', tier: q.get('tier') ?? 'mixed', count: q.get('count') ?? '12', seed: q.get('seed') ?? '' });
    if (!params.get('seed')) params.delete('seed');
    void api<Sheet>('GET', `/students/${q.get('student')}/worksheet?${params}`).then((r) => {
      if (r.ok) setSheet(r.data); else setError(r.status === 404 ? t('ws.none') : t('common.error'));
    });
  }, []);

  const submitMarks = async (): Promise<void> => {
    if (!sheet) return;
    setBusy(true); setMarkError('');
    const r = await api<Marked>('POST', `/students/${q.get('student')}/worksheet/mark`, {
      focus: sheet.topics.map((x) => x.code), tier: sheet.tier, count: sheet.count, seed: sheet.seed,
      answers: Object.entries(given).map(([n, g]) => ({ n: Number(n), given: g })),
    });
    setBusy(false);
    if (r.ok) { dropPhoto(); setResult(r.data); setMode('done'); setSheet({ ...sheet, marked: { answered: r.data.answered, correct: r.data.correct, total: r.data.total, xp: r.data.xp } }); }
    else if (r.status === 409) { setMode('off'); setSheet({ ...sheet, marked: { answered: r.data.answered, correct: r.data.correct, total: r.data.total, xp: r.data.xp } }); }
    else setMarkError(t('ws.markError'));
  };
  /** Shrinks the picture (and drops its hidden details, such as where it was taken) by drawing it again, then sends it to be read. */
  const readPhoto = async (file: File): Promise<void> => {
    if (!sheet) return;
    setReading(true); setPhotoError('');
    try {
      const bmp = await createImageBitmap(file);
      const scale = Math.min(1, 1568 / Math.max(bmp.width, bmp.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bmp.width * scale)); canvas.height = Math.max(1, Math.round(bmp.height * scale));
      canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/jpeg', 0.85));
      if (!blob) throw new Error('no image');
      const image = await new Promise<string>((ok, fail) => { const f = new FileReader(); f.onload = () => ok(String(f.result).split(',')[1] ?? ''); f.onerror = () => fail(f.error); f.readAsDataURL(blob); });
      const r = await api<{ readings: { n: number; text: string | null; confidence: 'high' | 'low' | null }[] }>('POST', `/students/${q.get('student')}/worksheet/photo`, {
        focus: sheet.topics.map((x) => x.code), tier: sheet.tier, count: sheet.count, seed: sheet.seed, mediaType: 'image/jpeg', image,
      });
      if (!r.ok) {
        setPhotoError(r.status === 402 ? t('ws.photoCap') : r.status === 429 ? t('ws.photoSlow') : r.status === 409 ? t('ws.photoOff') : t('ws.photoError'));
      } else {
        dropPhoto();
        setPhotoUrl(URL.createObjectURL(blob));
        setRead(Object.fromEntries(r.data.readings.map((x) => [x.n, { text: x.text ?? '', low: x.text === null || x.confidence === 'low' }])));
        setMode('confirm');
      }
    } catch {
      setPhotoError(t('ws.photoError'));
    }
    setReading(false);
  };
  /** The caregiver has checked each answer against the photo: turn the text into answers, or show which ones still cannot be read. */
  const useRead = (): void => {
    if (!sheet) return;
    const next: Record<number, Given> = {};
    const bad: Record<number, boolean> = {};
    for (const it of sheet.items) {
      const text = read[it.n]?.text.trim() ?? '';
      if (!text) continue;
      const g = givenFromText(it.format as Parameters<typeof givenFromText>[0], text, it.options?.length ?? 0, it.right?.length ?? 0);
      if (g) next[it.n] = g; else bad[it.n] = true;
    }
    setRowError(bad);
    if (Object.keys(bad).length) return;
    setGiven(next);
    dropPhoto();
    setMode('review');
  };
  const save = (n: number, g: Given | null): void => {
    const next = { ...given };
    if (g) next[n] = g; else delete next[n];
    setGiven(next);
    setStep(n < (sheet?.items.length ?? 0) ? n : n - 1);
    if (n >= (sheet?.items.length ?? 0)) setMode('review');
  };

  if (error) return <section class="card"><p class="note" role="alert">{error}</p><button type="button" onClick={() => history.back()}>{t('common.back')}</button></section>;
  if (!sheet) return <section class="card"><p role="status">{t('common.loading')}</p></section>;

  return (
    <>
      <section class="card noprint">
        <h1>{t('ws.ready')}</h1>
        <p class="muted">{t('ws.printHelp')}</p>
        <label class="check"><input type="checkbox" checked={key} onChange={() => setKey(!key)} /> {t('ws.includeKey')}</label>
        <label class="check"><input type="checkbox" checked={solutions} onChange={() => setSolutions(!solutions)} /> {t('ws.includeSolutions')}</label>
        <div class="actions row-actions">
          <button type="button" onClick={() => window.print()}>{t('ws.print')}</button>
          <button type="button" class="secondary" onClick={() => go(`/app/progress?student=${q.get('student')}`)}>{t('common.back')}</button>
        </div>
      </section>

      {mode === 'off' && (
        <section class="card noprint" aria-labelledby="mark-title">
          <h2 id="mark-title">{t('ws.mark')}</h2>
          {sheet.marked
            ? <p role="status">{t('ws.alreadyMarked', { c: sheet.marked.correct, t: sheet.marked.total })}</p>
            : (<>
                <p class="muted">{t('ws.markHelp')}</p>
                <p class="muted small">{t('ws.markNote')}</p>
                <div class="actions row-actions"><button type="button" onClick={() => { setStep(0); setMode('enter'); }}>{t('ws.markStart')}</button></div>
                {sheet.photo && (
                  <div class="photobox">
                    <h3>{t('ws.photoTitle')}</h3>
                    <p class="muted">{t('ws.photoHelp')}</p>
                    <p class="muted small">{t('ws.photoPrivacy')}</p>
                    <label class="filebtn">
                      <span class="secondary btnlike">{reading ? t('ws.photoReading') : t('ws.photoChoose')}</span>
                      <input type="file" accept="image/*" class="sr" disabled={reading} onChange={(e) => { const f = (e.target as HTMLInputElement).files?.[0]; (e.target as HTMLInputElement).value = ''; if (f) void readPhoto(f); }} />
                    </label>
                    {photoError && <p class="note" role="alert">{photoError}</p>}
                  </div>
                )}
              </>)}
        </section>
      )}

      {mode === 'confirm' && (
        <section class="card noprint" aria-labelledby="confirm-title">
          <h2 id="confirm-title">{t('ws.confirmTitle')}</h2>
          <p class="muted">{t('ws.confirmHelp')}</p>
          <div class="confirmgrid">
            <img class="sheetphoto" src={photoUrl} alt={t('ws.photoAlt')} />
            <ol class="plain readlist">
              {sheet.items.map((it) => {
                const r = read[it.n] ?? { text: '', low: true };
                const id = `read-${it.n}`;
                return (
                  <li key={it.n} class="readrow">
                    <label for={id}>{t('ws.questionN', { n: it.n })}</label>
                    <input id={id} value={r.text} autocomplete="off" aria-invalid={rowError[it.n] ? 'true' : undefined} placeholder={t('ws.blank')}
                      onInput={(e) => { const text = (e.target as HTMLInputElement).value; setRead({ ...read, [it.n]: { text, low: false } }); if (rowError[it.n]) setRowError({ ...rowError, [it.n]: false }); }} />
                    {rowError[it.n] && <span class="note" role="alert">{t('ws.rowBad')}</span>}
                    {!rowError[it.n] && r.low && <span class="muted small">{r.text ? t('ws.rowUnsure') : t('ws.rowNothing')}</span>}
                  </li>
                );
              })}
            </ol>
          </div>
          <div class="actions row-actions">
            <button type="button" onClick={useRead}>{t('ws.useRead')}</button>
            <button type="button" class="secondary" onClick={() => { dropPhoto(); setMode('off'); }}>{t('common.cancel')}</button>
          </div>
        </section>
      )}

      {mode === 'enter' && sheet.items[step] && (
        <section class="card noprint" aria-labelledby="enter-title">
          <h2 id="enter-title">{t('ws.qOf', { n: step + 1, total: sheet.items.length })}</h2>
          <p><MathText text={tx(sheet.items[step]!.prompt)} /></p>
          <ItemInput key={step} item={asPublic(sheet.items[step]!)} disabled={false} submitLabel={t('ws.saveAnswer')} onSubmit={(g) => save(step + 1, g)} />
          <div class="actions row-actions">
            <button type="button" class="secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>{t('common.back')}</button>
            <button type="button" class="secondary" onClick={() => save(step + 1, given[step + 1] ?? null)}>{t('ws.skip')}</button>
            <button type="button" class="secondary" onClick={() => setMode('review')}>{t('ws.review')}</button>
          </div>
        </section>
      )}

      {mode === 'review' && (
        <section class="card noprint" aria-labelledby="review-title">
          <h2 id="review-title">{t('ws.review')}</h2>
          <ol class="plain">
            {sheet.items.map((it, i) => (
              <li key={it.n}>
                {it.n}. {given[it.n] ? <strong>{entered(given[it.n]!)}</strong> : <span class="muted">{t('ws.blank')}</span>}{' '}
                <button type="button" class="secondary" onClick={() => { setStep(i); setMode('enter'); }}>{t('ws.change')}</button>
              </li>
            ))}
          </ol>
          {Object.keys(given).length < sheet.items.length && <p class="muted">{t('ws.blankWarn', { n: sheet.items.length - Object.keys(given).length })}</p>}
          <p class="muted small">{t('ws.markNote')}</p>
          {markError && <p class="note" role="alert">{markError}</p>}
          <div class="actions row-actions">
            <button type="button" disabled={busy || Object.keys(given).length === 0} onClick={() => void submitMarks()}>{t('ws.submitMark')}</button>
            <button type="button" class="secondary" onClick={() => setMode('off')}>{t('common.cancel')}</button>
          </div>
        </section>
      )}

      {mode === 'done' && result && (
        <section class="card noprint" aria-labelledby="result-title">
          <h2 id="result-title">{t('ws.result', { c: result.correct, t: result.total })}</h2>
          <p role="status">{t('ws.xpEarned', { xp: result.xp })}{result.bonus ? ` · ${t('ws.bonusLine', { xp: result.bonus })}` : ''}{result.leveledUp && result.level ? ` · ${t('ws.levelUp', { level: result.level })}` : ''}</p>
          <ol class="plain">
            {sheet.items.map((it) => {
              const r = result.results.find((x) => x.n === it.n);
              return (
                <li key={it.n}>
                  {it.n}. {!r ? <span class="muted">{t('ws.blank')}</span> : r.correct ? <strong>{t('ws.right')}</strong> : <span>{t('ws.notYet')} <MathText text={tx(it.answer)} /></span>}
                </li>
              );
            })}
          </ol>
          <div class="actions row-actions"><button type="button" onClick={() => setMode('off')}>{t('ws.close')}</button></div>
        </section>
      )}

      <article class="sheet" aria-labelledby="sheet-title">
        <h1 id="sheet-title">{t('ws.sheetTitle')} · {sheet.focus}</h1>
        <p>{sheet.topic}</p>
        <p>{t('ws.nameLine')} ______________________ &nbsp; {t('ws.dateLine')} ______________</p>
        <ol class="qs">
          {sheet.items.map((it) => (
            <li key={it.n}>
              <MathText text={tx(it.prompt)} />
              {it.visual && <div class="visual"><Visual v={it.visual} /></div>}
              {it.options && it.format !== 'match' && (
                <ol class="opts">{it.options.map((o, i) => <li key={i}><MathText text={tx(o)} /></li>)}</ol>
              )}
              {it.format === 'match' && it.options && it.right && (
                <div>
                  <ul class="plain">{it.options.map((o, i) => <li key={i}>{i + 1}. <MathText text={tx(o)} /></li>)}</ul>
                  <ul class="plain">{it.right.map((o, i) => <li key={i}>{LETTERS[i]}. <MathText text={tx(o)} /></li>)}</ul>
                </div>
              )}
              {it.format !== 'choice' && it.format !== 'multi' && it.format !== 'point' && <div class="answerline" aria-hidden="true" />}
            </li>
          ))}
        </ol>
        {key && (
          <section class="key" aria-labelledby="key-title">
            <h2 id="key-title">{t('ws.key')}</h2>
            <ol>
              {sheet.items.map((it) => <li key={it.n}><MathText text={tx(it.answer)} /></li>)}
            </ol>
          </section>
        )}
        {solutions && (
          <section class="key" aria-labelledby="sol-title">
            <h2 id="sol-title">{t('ws.solutions')}</h2>
            <ol>
              {sheet.items.map((it) => (
                <li key={it.n}>
                  <MathText text={tx(it.prompt)} />
                  <ol class="opts worked">{it.steps.map((st, i) => <li key={i}><MathText text={tx(st)} /></li>)}</ol>
                  <p><strong>{t('ws.answerLabel')}:</strong> <MathText text={tx(it.answer)} /></p>
                </li>
              ))}
            </ol>
          </section>
        )}
      </article>
    </>
  );
}
