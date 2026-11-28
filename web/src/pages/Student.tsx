import { useEffect, useRef, useState } from 'preact/hooks';
import { api } from '../api';
import { t, useLang } from '../i18n';
import { Avatar } from '../avatars';

type DeviceState = 'unknown' | 'none' | 'pending' | 'approved' | 'expired';
interface Tile { id: string; name: string; avatar: string; frame: string }

// The child who signed in last on this device, so their tile comes first. Only a convenience: wrapped in try, and the page works without it.
const LAST = 'mq_last_student';
const lastChild = (): string => { try { return localStorage.getItem(LAST) ?? ''; } catch { return ''; } };
const rememberChild = (id: string): void => { try { localStorage.setItem(LAST, id); } catch { /* no storage: the picker simply has no favourite */ } };

export function StudentLogin({ onDone, go }: { onDone: () => void; go: (to: string) => void }) {
  useLang();
  const [device, setDevice] = useState<DeviceState>('unknown');
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState('');
  // the "who is practising?" tiles: null until asked, [] when there is nobody to show; `chosen` is the tapped child, `typed` is the way in by username
  const [tiles, setTiles] = useState<Tile[] | null>(null);
  const [chosen, setChosen] = useState<Tile | null>(null);
  const [typed, setTyped] = useState(false);
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
    if (device !== 'approved' || tiles !== null) return;
    void api<{ students: Tile[] }>('GET', '/devices/students').then((r) => {
      if (!r.ok) return void setTiles([]);
      const last = lastChild();
      setTiles([...r.data.students].sort((a, b) => Number(b.id === last) - Number(a.id === last)));
    });
  }, [device]);

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
    const r = await api<{ error?: string; attemptsLeft?: number; retryAfterSeconds?: number; student?: { id: string } }>('POST', '/auth/student', chosen ? { studentId: chosen.id, pin } : { username, pin });
    if (r.ok) { if (r.data.student?.id) rememberChild(r.data.student.id); return onDone(); }
    if (r.status === 403) return setDevice('none');
    if (r.status === 429) return setMsg(t('student.locked', { minutes: Math.ceil((r.data.retryAfterSeconds ?? 900) / 60) }));
    setMsg(t('student.invalid') + (r.data.attemptsLeft ? ` ${t('student.attemptsLeft', { n: r.data.attemptsLeft })}` : ''));
    setPin('');
  };

  const needsDevice = device === 'none' || device === 'pending' || device === 'expired';
  const picking = device === 'approved' && !typed && tiles !== null && tiles.length > 0;
  const last = lastChild();
  const idled = new URLSearchParams(location.search).get('idle') === '1';

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
      {idled && device === 'approved' && <p class="note" role="status">{t('student.idleNote')}</p>}
      {picking && !chosen && (
        <div class="picker">
          <h2>{t('student.pickTitle')}</h2>
          <p class="muted">{t('student.pickHelp')}</p>
          <ul class="pickgrid plain">
            {tiles!.map((c) => (
              <li key={c.id}>
                <button type="button" class={`tile${c.id === last ? ' last' : ''}`} onClick={() => { setChosen(c); setPin(''); setMsg(''); }}>
                  <Avatar id={c.avatar} frame={c.frame === 'frame-none' ? undefined : c.frame} size={64} />
                  <span class="tilename">{c.name}</span>
                  {c.id === last && <span class="tilelast">{t('student.lastTime')}</span>}
                </button>
              </li>
            ))}
          </ul>
          <p><button type="button" class="linkish" onClick={() => setTyped(true)}>{t('student.useUsername')}</button></p>
        </div>
      )}
      {picking && chosen && (
        <form onSubmit={login} aria-labelledby="hi-title">
          <h2 id="hi-title" class="hi"><Avatar id={chosen.avatar} frame={chosen.frame === 'frame-none' ? undefined : chosen.frame} size={48} /> {t('student.hi', { name: chosen.name })}</h2>
          <label for="pin">{t('student.pin')}</label>
          <input id="pin" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength={4} autocomplete="current-password" required autofocus value={pin} onInput={(e) => setPin((e.target as HTMLInputElement).value)} />
          <button type="submit">{t('student.login')}</button>
          <p role="alert" class="note warn">{msg}</p>
          <p><button type="button" class="linkish" onClick={() => { setChosen(null); setPin(''); setMsg(''); }}>{t('student.notYou')}</button></p>
        </form>
      )}
      {device === 'approved' && !picking && (tiles !== null || typed) && (
        <form onSubmit={login}>
          <label for="username">{t('student.username')}</label>
          <input id="username" autocomplete="username" autocapitalize="none" required value={username} onInput={(e) => setUsername((e.target as HTMLInputElement).value)} />
          <label for="pin">{t('student.pin')}</label>
          <input id="pin" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength={4} autocomplete="current-password" required value={pin} onInput={(e) => setPin((e.target as HTMLInputElement).value)} />
          <button type="submit">{t('student.login')}</button>
          <p role="alert" class="note warn">{msg}</p>
          {tiles !== null && tiles.length > 0 && <p><button type="button" class="linkish" onClick={() => setTyped(false)}>{t('student.pickAgain')}</button></p>}
        </form>
      )}
      <p><a href="/app" onClick={(e) => { e.preventDefault(); go('/app'); }}>{t('common.back')}</a></p>
    </section>
  );
}
