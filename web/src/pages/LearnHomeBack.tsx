import { t } from '../i18n';

/** Shown when a link points at a lesson that does not exist. */
export function LearnHomeBack({ go }: { go: (to: string) => void }) {
  return (
    <section class="card narrow">
      <p class="note" role="alert">{t('lesson.missing')}</p>
      <button type="button" onClick={() => go('/app/learn')}>{t('nav.home')}</button>
    </section>
  );
}
