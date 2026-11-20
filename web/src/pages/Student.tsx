import { useEffect, useRef, useState } from 'preact/hooks';
import { api } from '../api';
import type { Me } from '../api';
import { t, useLang } from '../i18n';

type DeviceState = 'unknown' | 'none' | 'pending' | 'approved' | 'expired';

export function StudentLogin({ onDone, go }: { onDone: () => void; go: (to: string) => void }) {
  useLang();
  const [device, setDevice] = useState<DeviceState>('unknown');
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState('');
  const timer = useRef<number | undefined>(undefined);

  // A device that is already trusted will accept a login; otherwise we need a pairing code.
  const tryDevice = async () => {
    const r = await api<{ state: DeviceState }>('GET', '/devices/status');
    if (r.data.state === 'approved') setDevice('approved');
    else if (r.data.state === 'pending') setDevice('pending');
    else setDevice((d) => (d === 'approved' ? d : 'none'));
    return r.data.state;
  };

  useEffect(() => {
    void tryDevice();
    return () => window.clearInterval(timer.current);
  }, []);

  useEffect(() => {
    window.clearInterval(timer.current);
    if (device === 'pending') {
      timer.current = window.setInterval(async () => {
        const s = await tryDevice();
        if (s === 'expired') setDevice('expired');
      }, 3000);
    }
    return () => window.clearInterval(timer.current);
  }, [device]);

  const getCode = async () => {
    const r = await api<{ code: string }>('POST', '/devices/request');
    if (r.ok) {
      setCode(r.data.code);
      setDevice('pending');
    }
  };

  const login = async (e: Event) => {
    e.preventDefault();
    setMsg('');
    const r = await api<{ error?: string; attemptsLeft?: number; retryAfterSeconds?: number }>('POST', '/auth/student', { username, pin });
    if (r.ok) return onDone();
    if (r.status === 403) return setDevice('none');
    if (r.status === 429) return setMsg(t('student.locked', { minutes: Math.ceil((r.data.retryAfterSeconds ?? 900) / 60) }));
    setMsg(t('student.invalid') + (r.data.attemptsLeft ? ` ${t('student.attemptsLeft', { n: r.data.attemptsLeft })}` : ''));
    setPin('');
  };

  const needsDevice = device === 'none' || device === 'pending' || device === 'expired';

  return (
    <section class="card narrow">
      <h1>{t('student.title')}</h1>
      {needsDevice && (
        <div>
          <h2>{t('student.deviceTitle')}</h2>
          {device === 'pending' && (
            <>
              <p>{t('student.deviceBody')}</p>
              <p class="code" aria-label={code.split('').join(' ')}>{code}</p>
              <p role="status">{t('student.deviceWaiting')}</p>
            </>
          )}
          {device === 'expired' && <p class="note warn">{t('student.deviceExpired')}</p>}
          <button type="button" onClick={getCode}>{device === 'none' ? t('student.getCode') : t('student.newCode')}</button>
        </div>
      )}
      {(device === 'approved' || device === 'unknown') && (
        <form onSubmit={login}>
          <label for="username">{t('student.username')}</label>
          <input id="username" autocomplete="username" autocapitalize="none" required value={username} onInput={(e) => setUsername((e.target as HTMLInputElement).value)} />
          <label for="pin">{t('student.pin')}</label>
          <input id="pin" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength={4} autocomplete="current-password" required value={pin} onInput={(e) => setPin((e.target as HTMLInputElement).value)} />
          <button type="submit">{t('student.login')}</button>
          <p role="alert" class="note warn">{msg}</p>
        </form>
      )}
      <p><a href="/app" onClick={(e) => { e.preventDefault(); go('/app'); }}>{t('common.back')}</a></p>
    </section>
  );
}

export function StudentHome({ me }: { me: Extract<Me, { kind: 'student' }> }) {
  useLang();
  return (
    <section class="card narrow">
      <h1>{t('student.welcome', { name: me.student.displayName })}</h1>
      <p>{t('student.soon')}</p>
    </section>
  );
}
