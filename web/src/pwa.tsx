import { useEffect, useState } from 'preact/hooks';
import { t, useLang } from './i18n';

/** Registers the service worker that keeps the app shell available offline. Safe to call anywhere: it does nothing where unsupported. */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;
  addEventListener('load', () => {
    navigator.serviceWorker.register(`/sw.js?v=${encodeURIComponent(__APP_VERSION__)}`, { scope: '/' }).catch(() => undefined);
  });
}

export function useOnline(): boolean {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    addEventListener('online', on);
    addEventListener('offline', off);
    return () => { removeEventListener('online', on); removeEventListener('offline', off); };
  }, []);
  return online;
}

/** Tells people, politely, when the connection is down. Practice and sign-in need the server. */
export function OfflineBanner() {
  useLang();
  const online = useOnline();
  if (online) return null;
  return <p class="offlinebar" role="status">{t('offline.banner')}</p>;
}

// ── "Install the app" ────────────────────────────────────────────────────────────────

interface InstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }
let deferred: InstallPromptEvent | null = null;
const watchers = new Set<() => void>();
const poke = (): void => watchers.forEach((w) => w());

// Chromium-based browsers offer a prompt we can keep and show when the person asks. It fires once, early, so listen from the start.
if (typeof addEventListener === 'function') {
  addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e as InstallPromptEvent; poke(); });
  addEventListener('appinstalled', () => { deferred = null; poke(); });
}

const isStandalone = (): boolean => (typeof matchMedia === 'function' && matchMedia('(display-mode: standalone)').matches) || (navigator as Navigator & { standalone?: boolean }).standalone === true;
/** iPhones and iPads cannot be prompted: the person has to use the Share menu, so we tell them how. */
const isApple = (): boolean => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export function InstallButton() {
  useLang();
  const [, force] = useState(0);
  const [help, setHelp] = useState(false);
  useEffect(() => { const w = () => force((n) => n + 1); watchers.add(w); return () => { watchers.delete(w); }; }, []);
  if (typeof navigator === 'undefined' || isStandalone()) return null;
  const apple = isApple();
  if (!deferred && !apple) return null;

  const click = async (): Promise<void> => {
    if (deferred) {
      const ev = deferred;
      await ev.prompt();
      await ev.userChoice.catch(() => undefined);
      deferred = null;
      poke();
    } else setHelp(!help);
  };
  return (
    <span class="install">
      <button type="button" class="link" onClick={() => void click()} aria-expanded={deferred ? undefined : help}>{t('install.button')}</button>
      {help && !deferred && (
        <div class="installhelp" role="dialog" aria-label={t('install.title')}>
          <p><strong>{t('install.title')}</strong></p>
          <p>{apple ? t('install.ios') : t('install.other')}</p>
          <p class="muted small">{t('install.why')}</p>
          <button type="button" class="secondary small" onClick={() => setHelp(false)}>{t('install.close')}</button>
        </div>
      )}
    </span>
  );
}
