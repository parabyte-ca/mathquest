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
  const [note, setNote] = useState('');
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
    const r = await api<{ error?: string }>('POST', '/admin/caregivers', { email, note: note.trim() || undefined });
    setMsg(r.ok ? t('admin.inviteSent') : r.data.error === 'note_has_link' ? t('invite.noteLink') : t('common.error'));
    if (r.ok) {
      setEmail('');
      setNote('');
      void load();
    }
  };

  return (
    <>
      <h1 class="page">{t('admin.title')}</h1>
      <Updates />
      <AiPanel />
      <section class="card">
        <h2>{t('admin.invite')}</h2>
        <form class="inline" onSubmit={invite}>
          <label for="ie">{t('signin.email')}</label>
          <input id="ie" type="email" required value={email} onInput={(e) => setEmail((e.target as HTMLInputElement).value)} />
          <label for="inote">{t('invite.note')}</label>
          <textarea id="inote" rows={3} maxLength={500} value={note} aria-describedby="inote-help" onInput={(e) => setNote((e.target as HTMLTextAreaElement).value)} />
          <p class="muted small" id="inote-help">{t('invite.noteHelp', { n: 500 - note.length })}</p>
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

interface AiStatus { configured: boolean; model: string; capUsd: number; spentUsd: number; remainingUsd: number; counts: Record<string, number> }
interface BankRow { id: number; skill: string; tier: number; compute: string; reports: number; item: { prompt: { en: string; fr: string }; answer: { value: number }; steps: { en: string }[] } }
interface ReportRow { id: number; itemRef: string; bankId: number | null; reason: string; itemStatus: string | null }
interface UsageDay { day: string; calls: number; costUsd: number; failures: number }

function AiPanel() {
  useLang();
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [skills, setSkills] = useState<{ id: string; name: string }[]>([]);
  const [items, setItems] = useState<BankRow[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [usage, setUsage] = useState<UsageDay[]>([]);
  const [skill, setSkill] = useState('');
  const [tier, setTier] = useState(1);
  const [count, setCount] = useState(5);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [s, k, i, r, u] = await Promise.all([
      api<AiStatus>('GET', '/admin/ai/status'),
      api<{ skills: { id: string; name: string }[] }>('GET', '/admin/ai/skills'),
      api<{ items: BankRow[] }>('GET', '/admin/ai/items?status=draft'),
      api<{ reports: ReportRow[] }>('GET', '/admin/ai/reports'),
      api<{ days: UsageDay[] }>('GET', '/admin/ai/usage'),
    ]);
    if (s.ok) setStatus(s.data);
    if (k.ok) { setSkills(k.data.skills); setSkill((cur) => cur || k.data.skills[0]?.id || ''); }
    if (i.ok) setItems(i.data.items);
    if (r.ok) setReports(r.data.reports);
    if (u.ok) setUsage(u.data.days);
  };
  useEffect(() => { void load(); }, []);

  const generate = async (e: Event) => {
    e.preventDefault();
    setBusy(true);
    const r = await api<{ created: number; rejected: Record<string, number> }>('POST', '/admin/ai/generate', { skill, tier, count });
    setBusy(false);
    if (r.ok) setMsg(t('ai.generated', { n: r.data.created }) + (Object.keys(r.data.rejected).length ? ' ' + t('ai.rejectedNote') : ''));
    else setMsg(r.status === 402 ? t('ai.capReached') : r.status === 409 ? t('ai.notConfigured') : t('ai.apiError'));
    void load();
  };
  const act = async (path: string) => { await api('POST', path, {}); void load(); };

  if (!status) return null;
  return (
    <section class="card" aria-labelledby="ai-title">
      <h2 id="ai-title">{t('ai.title')}</h2>
      {!status.configured ? <p class="note">{t('ai.notConfigured')}</p> : (
        <>
          <p>{t('ai.spend', { spent: status.spentUsd.toFixed(2), cap: status.capUsd.toFixed(2), left: status.remainingUsd.toFixed(2) })}</p>
          <form class="inline" onSubmit={generate}>
            <label for="ai-skill">{t('ai.skill')}</label>
            <select id="ai-skill" value={skill} onChange={(e) => setSkill((e.target as HTMLSelectElement).value)}>
              {skills.map((s) => <option key={s.id} value={s.id}>{s.id} · {s.name}</option>)}
            </select>
            <label for="ai-tier">{t('ai.tier')}</label>
            <select id="ai-tier" value={tier} onChange={(e) => setTier(Number((e.target as HTMLSelectElement).value))}>{[1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}</select>
            <label for="ai-count">{t('ai.count')}</label>
            <input id="ai-count" type="number" min={1} max={10} value={count} onInput={(e) => setCount(Number((e.target as HTMLInputElement).value))} />
            <button type="submit" disabled={busy}>{t('ai.generate')}</button>
          </form>
          <p role="status">{msg}</p>
        </>
      )}
      <h3>{t('ai.queue')} ({items.length})</h3>
      {items.length === 0 && <p class="muted">{t('ai.empty')}</p>}
      <ul class="plain">
        {items.map((b) => (
          <li class="card inner" key={b.id}>
            <p class="small muted">{b.skill} · {t('ai.tier')} {b.tier}</p>
            <p>{b.item.prompt.en}</p>
            <p lang="fr">{b.item.prompt.fr}</p>
            <p><strong>{t('ai.answer')}:</strong> {b.item.answer.value} <span class="muted small">({b.compute})</span></p>
            <div class="row-actions">
              <button type="button" onClick={() => act(`/admin/ai/items/${b.id}/approve`)}>{t('ai.approve')}</button>
              <button type="button" class="secondary" onClick={() => act(`/admin/ai/items/${b.id}/reject`)}>{t('ai.reject')}</button>
            </div>
          </li>
        ))}
      </ul>
      {reports.length > 0 && (
        <>
          <h3>{t('ai.reports')} ({reports.length})</h3>
          <ul class="plain small">
            {reports.map((r) => (
              <li class="row" key={r.id}>
                <span>{r.itemRef} · {r.reason}{r.itemStatus ? ` · ${r.itemStatus}` : ''}</span>
                <span class="row-actions">
                  {r.bankId !== null && r.itemStatus === 'approved' && <button type="button" class="secondary small" onClick={() => act(`/admin/ai/items/${r.bankId}/retire`)}>{t('ai.retire')}</button>}
                  <button type="button" class="link small" onClick={() => act(`/admin/ai/reports/${r.id}/resolve`)}>{t('ai.resolve')}</button>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
      {usage.length > 0 && (
        <details>
          <summary>{t('ai.usage')}</summary>
          <ul class="plain small">{usage.map((d) => <li key={d.day}>{d.day} · {d.calls} · ${d.costUsd.toFixed(2)}{d.failures ? ` · ${d.failures} failed` : ''}</li>)}</ul>
          <p class="muted small">{t('ai.priceNote')}</p>
        </details>
      )}
    </section>
  );
}
