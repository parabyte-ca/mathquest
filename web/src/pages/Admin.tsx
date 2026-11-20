import { useEffect, useState } from 'preact/hooks';
import { api } from '../api';
import { t, useLang } from '../i18n';

interface UserRow { id: string; email: string; role: string; displayName: string; status: string; lastLoginAt: string | null }
interface AuditRow { id: number; at: string; actorKind: string; action: string; target: string | null }
interface UpdateInfo {
  current: string;
  latest: { version: string; notes: string } | null;
  updateAvailable: boolean;
  releaseError: string | null;
  status: { state: string; message: string; version: string | null; updatedAt: string | null };
  log: string[];
}

export function Admin() {
  useLang();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const load = async () => {
    const u = await api<{ users: UserRow[] }>('GET', '/admin/users');
    if (u.ok) setUsers(u.data.users);
    const a = await api<{ entries: AuditRow[] }>('GET', '/admin/audit?limit=20');
    if (a.ok) setAudit(a.data.entries);
  };
  useEffect(() => {
    void load();
  }, []);

  const invite = async (e: Event) => {
    e.preventDefault();
    const r = await api('POST', '/admin/caregivers', { email });
    setMsg(r.ok ? t('admin.inviteSent') : t('common.error'));
    if (r.ok) {
      setEmail('');
      void load();
    }
  };

  return (
    <>
      <h1 class="page">{t('admin.title')}</h1>
      <Updates />
      <section class="card">
        <h2>{t('admin.invite')}</h2>
        <form class="inline" onSubmit={invite}>
          <label for="ie">{t('signin.email')}</label>
          <input id="ie" type="email" required value={email} onInput={(e) => setEmail((e.target as HTMLInputElement).value)} />
          <button type="submit">{t('admin.invite')}</button>
          <span role="status">{msg}</span>
        </form>
      </section>
      <section class="card">
        <h2>{t('admin.users')}</h2>
        <ul class="plain">
          {users.map((u) => (
            <li class="row" key={u.id}>
              <span>{u.email} <span class="muted">({u.role}, {u.status})</span></span>
            </li>
          ))}
        </ul>
      </section>
      <section class="card">
        <h2>{t('admin.audit')}</h2>
        <ul class="plain small">
          {audit.map((a) => <li key={a.id}>{a.at.slice(0, 19).replace('T', ' ')} · {a.actorKind} · {a.action}</li>)}
        </ul>
      </section>
    </>
  );
}

function Updates() {
  const [info, setInfo] = useState<UpdateInfo | null>(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    const r = await api<UpdateInfo>('GET', '/admin/updates');
    if (r.ok) setInfo(r.data);
  };
  useEffect(() => {
    void load();
    const id = window.setInterval(load, 5000); // live upgrade status
    return () => window.clearInterval(id);
  }, []);

  const upgrade = async () => {
    if (!info?.latest) return;
    const r = await api('POST', '/admin/updates/request', { version: info.latest.version });
    setMsg(r.ok ? t('updates.requested') : r.status === 409 ? t('updates.inProgress') : t('common.error'));
    void load();
  };

  if (!info) return <section class="card"><p role="status">{t('common.loading')}</p></section>;
  const busy = ['queued', 'validating', 'running'].includes(info.status.state);
  return (
    <section class="card" aria-labelledby="upd">
      <h2 id="upd">{t('updates.title')}</h2>
      <dl>
        <dt>{t('updates.current')}</dt><dd>{info.current}</dd>
        <dt>{t('updates.latest')}</dt><dd>{info.latest?.version ?? '—'}</dd>
        <dt>{t('updates.status')}</dt>
        <dd data-testid="upgrade-state">{t(`state.${info.status.state}`)}{info.status.message ? ` — ${info.status.message}` : ''}</dd>
      </dl>
      {info.releaseError && <p class="note warn">{t('updates.releaseError')}</p>}
      {info.latest && !info.updateAvailable && <p class="note ok">{t('updates.upToDate')}</p>}
      {info.updateAvailable && info.latest && (
        <>
          <p class="note">{t('updates.available')}</p>
          <pre class="notes">{info.latest.notes}</pre>
          <button type="button" disabled={busy} onClick={upgrade}>{t('updates.upgrade', { version: info.latest.version })}</button>
        </>
      )}
      <p role="status">{msg}</p>
      {info.log.length > 0 && (
        <details>
          <summary>{t('updates.log')}</summary>
          <pre class="log">{info.log.join('\n')}</pre>
        </details>
      )}
    </section>
  );
}
