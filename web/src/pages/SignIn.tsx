import { useEffect, useState } from 'preact/hooks';
import { api } from '../api';
import { t, useLang } from '../i18n';

export function SignIn({ go }: { go: (to: string) => void }) {
  useLang();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'limited' | 'error'>('idle');

  const submit = async (e: Event) => {
    e.preventDefault();
    setState('sending');
    const r = await api('POST', '/auth/magic', { email });
    setState(r.status === 202 ? 'sent' : r.status === 429 ? 'limited' : 'error');
  };

  return (
    <section class="card narrow">
      <h1>{t('signin.title')}</h1>
      <p>{t('signin.intro')}</p>
      <form onSubmit={submit}>
        <label for="email">{t('signin.email')}</label>
        <input id="email" name="email" type="email" autocomplete="email" required value={email} onInput={(e) => setEmail((e.target as HTMLInputElement).value)} />
        <button type="submit" disabled={state === 'sending'}>{t('signin.send')}</button>
      </form>
      <div role="status" aria-live="polite">
        {state === 'sent' && <p class="note ok">{t('signin.sent')}</p>}
        {state === 'limited' && <p class="note warn">{t('signin.tooMany')}</p>}
        {state === 'error' && <p class="note warn">{t('common.error')}</p>}
      </div>
      <p><a href="/app/student" onClick={(e) => { e.preventDefault(); go('/app/student'); }}>{t('signin.studentLink')}</a></p>
    </section>
  );
}

export function Verify({ onDone, go }: { onDone: () => void; go: (to: string) => void }) {
  useLang();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const token = new URLSearchParams(location.search).get('token') ?? '';
    // Take the one-time token out of the address bar and the history straight away, so it cannot be copied, bookmarked or shared.
    history.replaceState(null, '', location.pathname);
    // The link is opened by a person, then the token is POSTed. A mail scanner that only GETs the page cannot use it up.
    void api<{ csrf?: string }>('POST', '/auth/verify', { token }).then((r) => {
      if (r.ok) onDone();
      else setFailed(true);
    });
  }, []);
  return (
    <section class="card narrow">
      {failed ? (
        <>
          <p class="note warn" role="alert">{t('verify.failed')}</p>
          <a href="/app" onClick={(e) => { e.preventDefault(); go('/app'); }}>{t('verify.again')}</a>
        </>
      ) : (
        <p role="status">{t('verify.working')}</p>
      )}
    </section>
  );
}
