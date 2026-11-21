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
