import { useEffect, useState } from 'preact/hooks';
import { api } from '../api';
import { t, useLang } from '../i18n';
import { EmojiIcon } from '../icons';

interface Cert {
  student: { displayName: string; grade: number; language: 'en' | 'fr' };
  heading: { en: string; fr: string };
  detail: { en: string; fr: string };
  icon: string;
  date: string;
  issuedOn: string;
  issuedBy: string;
}

/** A certificate a caregiver can print for something a student has really earned. It is written in the student's language. */
export function Certificate({ go }: { go: (to: string) => void }) {
  useLang();
  const q = new URLSearchParams(location.search);
  const student = q.get('student') ?? '';
  const [c, setC] = useState<Cert | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const params = new URLSearchParams({ kind: q.get('kind') ?? '' });
    if (q.get('ref')) params.set('ref', q.get('ref')!);
    void api<Cert>('GET', `/students/${student}/certificate?${params}`).then((r) => (r.ok ? setC(r.data) : setError(r.status === 404 ? t('cert.none') : t('common.error'))));
  }, []);
  if (error) return <section class="card"><p class="note" role="alert">{error}</p><button type="button" onClick={() => history.back()}>{t('common.back')}</button></section>;
  if (!c) return <section class="card"><p role="status">{t('common.loading')}</p></section>;
  const fr = c.student.language === 'fr';
  const L = (en: string, frs: string): string => (fr ? frs : en);
  return (
    <>
      <section class="card noprint">
        <h1>{t('cert.ready')}</h1>
        <p class="muted">{t('cert.help')}</p>
        <div class="actions row-actions">
          <button type="button" onClick={() => window.print()}>{t('cert.print')}</button>
          <button type="button" class="secondary" onClick={() => go(`/app/progress?student=${student}`)}>{t('common.back')}</button>
        </div>
      </section>
      <article class="certificate" lang={c.student.language} aria-labelledby="cert-h">
        <p class="cert-icon" aria-hidden="true"><EmojiIcon emoji={c.icon} size={56} /></p>
        <h1 id="cert-h">{L('Certificate of achievement', 'Certificat de réussite')}</h1>
        <p class="cert-line">{L('Proudly presented to', 'Fièrement remis à')}</p>
        <p class="cert-name">{c.student.displayName}</p>
        <p class="cert-line">{c.heading[c.student.language]}</p>
        <p class="cert-detail">{c.detail[c.student.language]}</p>
        <p class="cert-foot">{L('MathQuest, grade', 'MathQuest, année')} {c.student.grade} · {c.date}</p>
        <div class="cert-sign">
          <span>{c.issuedBy || ' '}</span>
          <small>{L('Signed', 'Signé')} · {c.issuedOn}</small>
        </div>
      </article>
    </>
  );
}
