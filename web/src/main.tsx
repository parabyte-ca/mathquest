import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import '@fontsource-variable/inter/wght.css';
import '@fontsource-variable/fira-code/wght.css';
import '@fontsource/opendyslexic/400.css';
import '@fontsource/opendyslexic/700.css';
import './style.css';
import { loadMe, api, setCsrf, type Me } from './api';
import { t, useLang, setLang, getLang } from './i18n';
import { SignIn, Verify } from './pages/SignIn';
import { StudentLogin } from './pages/Student';
import { StudentArea } from './pages/StudentArea';
import { Caregiver } from './pages/Caregiver';
import { Lazy } from './lazy';
import { startTour, TourHost } from './tour';
import { InstallButton, OfflineBanner, registerServiceWorker, useOnline } from './pwa';
import { forgetStudent } from './offlineStore';
import { Icon } from './icons';
import { NavMenu } from './NavMenu';

const loadAdmin = () => import('./pages/Admin').then((m) => m.Admin);
const loadProgress = () => import('./pages/Progress').then((m) => m.Progress);
const loadWorksheet = () => import('./pages/Worksheet').then((m) => m.Worksheet);
const loadCertificate = () => import('./pages/Certificate').then((m) => m.Certificate);

function usePath(): [string, (to: string) => void] {
  const [path, setPath] = useState(location.pathname);
  useEffect(() => {
    const on = () => setPath(location.pathname);
    addEventListener('popstate', on);
    return () => removeEventListener('popstate', on);
  }, []);
  const go = (to: string) => {
    history.pushState({}, '', to);
    setPath(location.pathname);
    scrollTo(0, 0);
  };
  return [path, go];
}

function App() {
  useLang();
  const [path, go] = usePath();
  const [me, setMe] = useState<Me | null | undefined>(undefined);

  useEffect(() => {
    void loadMe().then(setMe);
  }, []);

  const refresh = async () => setMe(await loadMe());
  // A student whose app opened offline is checked again as soon as the connection is back.
  const online = useOnline();
  useEffect(() => { if (online && me?.kind === 'student' && me.offline) void refresh(); }, [online]);
  const signOut = async () => {
    await api('POST', '/auth/logout');
    void forgetStudent();
    setCsrf('');
    setMe(null);
    go('/app');
  };

  if (path === '/app/verify') return <Shell path={path} me={me} signOut={signOut} go={go}><Verify onDone={async () => { await refresh(); go('/app'); }} go={go} /></Shell>;
  if (path === '/app/student') {
    return <Shell path={path} me={me} signOut={signOut} go={go}>{me?.kind === 'student' ? <StudentArea me={me} path="/app/learn" go={go} /> : <StudentLogin onDone={refresh} go={go} />}</Shell>;
  }
  if (me === undefined) return <Shell path={path} me={me} signOut={signOut} go={go}><p role="status">{t('common.loading')}</p></Shell>;
  if (me?.kind === 'student') return <Shell path={path} me={me} signOut={signOut} go={go}><StudentArea me={me} path={path} go={go} /></Shell>;
  if (!me) return <Shell path={path} me={me} signOut={signOut} go={go}><SignIn go={go} /></Shell>;
  if (path === '/app/admin' && me.user.role === 'admin') return <Shell path={path} me={me} signOut={signOut} go={go}><Lazy load={loadAdmin} props={{ go }} /></Shell>;
  if (path === '/app/progress') return <Shell path={path} me={me} signOut={signOut} go={go}><Lazy load={loadProgress} props={{ go }} /></Shell>;
  if (path === '/app/certificate') return <Shell path={path} me={me} signOut={signOut} go={go}><Lazy load={loadCertificate} props={{ go }} /></Shell>;
  if (path === '/app/worksheet') return <Shell path={path} me={me} signOut={signOut} go={go}><Lazy load={loadWorksheet} props={{ go }} /></Shell>;
  return <Shell path={path} me={me} signOut={signOut} go={go}><Caregiver me={me} go={go} /></Shell>;
}

function Shell(p: { path: string; me: Me | null | undefined; signOut: () => void; go: (to: string) => void; children: preact.ComponentChildren }) {
  const isAdmin = p.me?.kind === 'user' && p.me.user.role === 'admin';
  // The student side is playful (rounder, brighter); the caregiver side is calmer. Styles hang off this one attribute.
  const side = p.me?.kind === 'student' || p.path.startsWith('/app/student') || p.path.startsWith('/app/learn') ? 'student' : 'caregiver';
  useEffect(() => { document.documentElement.setAttribute('data-side', side); }, [side]);
  return (
    <>
      <a class="skip" href="#main">Skip to content</a>
      <header class="bar">
        <a class="brand" href="/app" onClick={(e) => { e.preventDefault(); p.go('/app'); }}><img src="/brand/logo.png" alt="" width="30" height="30" />{t('app.name')}</a>
        <nav aria-label="Main">
          <NavMenu>
            {isAdmin && <a href="/app" aria-current={p.path === '/app/admin' ? undefined : 'page'} onClick={(e) => { e.preventDefault(); p.go('/app'); }}>{t('nav.caregiver')}</a>}
            {isAdmin && <a href="/app/admin" aria-current={p.path === '/app/admin' ? 'page' : undefined} onClick={(e) => { e.preventDefault(); p.go('/app/admin'); }}>{t('nav.admin')}</a>}
            <InstallButton />
            {p.me && <button type="button" onClick={() => { p.go(p.me!.kind === 'student' ? '/app/learn' : '/app'); startTour(p.me!.kind === 'student' ? 'student' : 'caregiver'); }}><Icon name="help" /> {t('nav.help')}</button>}
            <button type="button" onClick={() => setLang(getLang() === 'en' ? 'fr' : 'en')} lang={getLang() === 'en' ? 'fr' : 'en'}><Icon name="language" /> {t('nav.language')}</button>
            {p.me && <button type="button" onClick={p.signOut}><Icon name="signout" /> {t('nav.signOut')}</button>}
          </NavMenu>
        </nav>
      </header>
      <OfflineBanner />
      <main id="main"><TourHost me={p.me} path={p.path} />{p.children}</main>
    </>
  );
}

render(<App />, document.getElementById('app')!);
registerServiceWorker();
