import { useEffect, useRef, useState } from 'preact/hooks';
import type { Given, PublicItem } from '../../../shared/items/types';
import { api } from '../api';
import { ItemInput } from '../ItemInput';
import { T2 } from '../MathText';
import { t } from '../i18n';
import type { AnswerData } from '../learnTypes';

/** A short adaptive check so practice starts at the right level. No scores shown, no pressure. */
export function Placement({ go }: { go: (to: string) => void }) {
  const grade = Number(new URLSearchParams(location.search).get('grade') ?? 5);
  const [item, setItem] = useState<PublicItem | null>(null);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState<{ startingSkill: string | null } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void api<{ item: PublicItem }>('POST', '/learn/placement/start', { grade }).then((r) => (r.ok ? setItem(r.data.item) : setError(r.status === 404 ? t('play.noContent') : t('common.error'))));
  }, []);

  const submit = async (given: Given) => {
    if (!item) return;
    setBusy(true);
    const r = await api<AnswerData>('POST', '/learn/answer', { itemId: item.id, given, ms: 0 });
    setBusy(false);
    if (!r.ok || !r.data.placement) return setError(t('common.error'));
    setCount((c) => c + 1);
    if (r.data.placement.done) setDone({ startingSkill: r.data.placement.result?.startingSkill ?? null });
    else setItem(r.data.placement.next!);
  };

  if (error) return <section class="card narrow"><p class="note" role="alert">{error}</p><button type="button" onClick={() => go('/app/learn')}>{t('common.back')}</button></section>;
  if (done) {
    return (
      <section class="card narrow" aria-labelledby="pl-done">
        <h1 id="pl-done">{t('placement.doneTitle')}</h1>
        <p>{t('placement.doneBody')}</p>
        <button type="button" onClick={() => go(`/app/learn/practice?grade=${grade}`)}>{t('learn.start')}</button>
        <button type="button" class="secondary" onClick={() => go(`/app/learn/map?grade=${grade}`)}>{t('learn.skillMap')}</button>
      </section>
    );
  }
  if (!item) return <section class="card narrow"><p role="status">{t('common.loading')}</p></section>;
  return (
    <section class="card" aria-labelledby="pl-title">
      <p class="eyebrow" id="pl-title">{t('placement.title')} · {t('placement.progress', { n: count + 1 })}</p>
      <p class="muted small">{t('placement.note')}</p>
      <p class="prompt"><T2 x={item.prompt} /></p>
      <ItemInput key={item.id} item={item} disabled={busy} onSubmit={submit} />
      <button type="button" class="link" onClick={() => go('/app/learn')}>{t('play.stop')}</button>
    </section>
  );
}
