import { useEffect, useState } from 'preact/hooks';
import type { ComponentType } from 'preact';
import { t, useLang } from './i18n';

/**
 * Loads a page's code the first time it is needed, so the first screen stays small. While it loads there is a status message;
 * if it cannot load (for example the network dropped) there is a message and a retry button instead of a blank page.
 */
export function Lazy<P extends object>({ load, props }: { load: () => Promise<ComponentType<P>>; props: P }) {
  useLang();
  // Remember which loader the loaded page came from: the same <Lazy> slot is reused when the route changes, and
  // it must never keep showing the previous route's page.
  const [loaded, setLoaded] = useState<{ from: () => Promise<ComponentType<P>>; Comp: ComponentType<P> } | null>(null);
  const [failed, setFailed] = useState(0);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setFailed(0);
    load().then(
      (c) => alive && setLoaded({ from: load, Comp: c }),
      () => alive && setFailed((n) => n + 1),
    );
    return () => { alive = false; };
  }, [load, attempt]);

  const Comp = loaded && loaded.from === load ? loaded.Comp : null;
  if (Comp) return <Comp {...props} />;
  if (failed) {
    return (
      <section class="card narrow">
        <p class="note" role="alert">{t('lazy.failed')}</p>
        <button type="button" onClick={() => setAttempt(attempt + 1)}>{t('lazy.retry')}</button>
      </section>
    );
  }
  return <section class="card narrow"><p role="status">{t('common.loading')}</p></section>;
}
