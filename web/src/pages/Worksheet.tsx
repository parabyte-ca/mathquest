import { useEffect, useState } from 'preact/hooks';
import type { Text, Visual as VisualSpec } from '../../../shared/items/types';
import { api } from '../api';
import { getLang, t, useLang } from '../i18n';
import { MathText } from '../MathText';
import { Visual } from '../visuals';

interface Row { n: number; format: string; prompt: Text; options?: Text[]; right?: Text[]; visual?: VisualSpec; answer: Text; steps: Text[] }
interface Sheet { student: { displayName: string; grade: number; language: 'en' | 'fr' }; focus: string; topic: string; tier: string; seed: number; items: Row[] }

const LETTERS = 'ABCDEFGH';

/** A printable practice sheet with an optional answer key on its own page. */
export function Worksheet({ go }: { go: (to: string) => void }) {
  useLang();
  const q = new URLSearchParams(location.search);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [error, setError] = useState('');
  const [key, setKey] = useState(true);
  const [solutions, setSolutions] = useState(false);
  const lang = getLang();
  const tx = (x: Text): string => x[lang];

  useEffect(() => {
    const params = new URLSearchParams({ focus: q.get('focus') ?? '', tier: q.get('tier') ?? 'mixed', count: q.get('count') ?? '12', seed: q.get('seed') ?? '' });
    if (!params.get('seed')) params.delete('seed');
    void api<Sheet>('GET', `/students/${q.get('student')}/worksheet?${params}`).then((r) => {
      if (r.ok) setSheet(r.data); else setError(r.status === 404 ? t('ws.none') : t('common.error'));
    });
  }, []);

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
