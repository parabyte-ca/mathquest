import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import '@fontsource/opendyslexic/400.css';
import '@fontsource/opendyslexic/700.css';
import './style.css';
import { loadMe, api, setCsrf, type Me } from './api';
import { t, useLang, setLang, getLang } from './i18n';
import { SignIn, Verify } from './pages/SignIn';
import { StudentLogin } from './pages/Student';
import { StudentArea } from './pages/StudentArea';
import { Caregiver } from './pages/Caregiver';
import { Admin } from './pages/Admin';
import { Progress } from './pages/Progress';
import { Worksheet } from './pages/Worksheet';

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
  const signOut = async () => {
    await api('POST', '/auth/logout');
    setCsrf('');
    setMe(null);
    go('/app');
  };

  if (path === '/app/verify') return <Shell me={me} signOut={signOut} go={go}><Verify onDone={async () => { await refresh(); go('/app'); }} go={go} /></Shell>;
  if (path === '/app/student') {
    return <Shell me={me} signOut={signOut} go={go}>{me?.kind === 'student' ? <StudentArea me={me} path="/app/learn" go={go} /> : <StudentLogin onDone={refresh} go={go} />}</Shell>;
  }
  if (me === undefined) return <Shell me={me} signOut={signOut} go={go}><p role="status">{t('common.loading')}</p></Shell>;
  if (me?.kind === 'student') return <Shell me={me} signOut={signOut} go={go}><StudentArea me={me} path={path} go={go} /></Shell>;
  if (!me) return <Shell me={me} signOut={signOut} go={go}><SignIn go={go} /></Shell>;
  if (path === '/app/admin' && me.user.role === 'admin') return <Shell me={me} signOut={signOut} go={go}><Admin /></Shell>;
  if (path === '/app/progress') return <Shell me={me} signOut={signOut} go={go}><Progress go={go} /></Shell>;
  if (path === '/app/worksheet') return <Shell me={me} signOut={signOut} go={go}><Worksheet go={go} /></Shell>;
  return <Shell me={me} signOut={signOut} go={go}><Caregiver me={me} go={go} /></Shell>;
}

function Shell(p: { me: Me | null | undefined; signOut: () => void; go: (to: string) => void; children: preact.ComponentChildren }) {
  const isAdmin = p.me?.kind === 'user' && p.me.user.role === 'admin';
  return (
    <>
      <a class="skip" href="#main">Skip to content</a>
      <header class="bar">
        <a class="brand" href="/app" onClick={(e) => { e.preventDefault(); p.go('/app'); }}>{t('app.name')}</a>
        <nav aria-label="Main">
          {isAdmin && <a href="/app/admin" onClick={(e) => { e.preventDefault(); p.go('/app/admin'); }}>{t('nav.admin')}</a>}
          <button type="button" class="link" onClick={() => setLang(getLang() === 'en' ? 'fr' : 'en')} lang={getLang() === 'en' ? 'fr' : 'en'}>{t('nav.language')}</button>
          {p.me && <button type="button" class="link" onClick={p.signOut}>{t('nav.signOut')}</button>}
        </nav>
      </header>
      <main id="main">{p.children}</main>
    </>
  );
}

render(<App />, document.getElementById('app')!);
