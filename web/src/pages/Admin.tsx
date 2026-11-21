import { useEffect, useState } from 'preact/hooks';
import { api } from '../api';
import { getLang, t, useLang } from '../i18n';
import { stepStates, type StepKey, type StepStatus } from '../upgradeSteps';

interface UserRow { id: string; email: string; role: string; displayName: string; status: string; lastLoginAt: string | null }
interface AuditRow { id: number; at: string; actorKind: string; action: string; target: string | null }
interface UpdateInfo {
  current: string;
  latest: { version: string; notes: string } | null;
  between: { version: string; notes: string }[];
  updateAvailable: boolean;
  releaseError: string | null;
  agent: { seenAt: string | null; ok: boolean };
  status: StepStatus & { message: string; version: string | null; previousVersion: string | null; updatedAt: string | null; stepNumber: number | null; stepCount: number | null; error: string | null; startedAt: string | null; finishedAt: string | null; backupFile: string | null };
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

const when = (iso: string | null): string => (iso ? new Date(iso).toLocaleString(getLang() === 'fr' ? 'fr-CA' : 'en-CA', { dateStyle: 'medium', timeStyle: 'short' }) : t('updates.whenUnknown'));

function Updates() {
  useLang();
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
  const st = info.status;
  const busy = ['queued', 'validating', 'running'].includes(st.state);
  const finished = ['succeeded', 'failed', 'rolled_back'].includes(st.state);
  const steps = busy || finished ? stepStates(st) : [];
  const stateLabel = (s: string): string => t(`updates.step${s === 'done' ? 'Done' : s === 'current' ? 'Current' : s === 'failed' ? 'Failed' : 'Pending'}`);
  const icon = { done: '✓', current: '▶', failed: '✗', pending: '·' } as const;
  return (
    <section class="card" aria-labelledby="upd">
      <h2 id="upd">{t('updates.title')}</h2>
      <dl>
        <dt>{t('updates.current')}</dt><dd>{info.current}</dd>
        <dt>{t('updates.latest')}</dt><dd>{info.latest?.version ?? '—'}</dd>
        <dt>{t('updates.status')}</dt>
        <dd data-testid="upgrade-state">{t(`state.${st.state}`)}{st.message ? ` — ${st.message}` : ''}</dd>
      </dl>

      {info.agent.ok
        ? <p class="muted small" data-testid="agent-state">{t('updates.agentOk', { when: when(info.agent.seenAt) })}</p>
        : <p class="note warn" data-testid="agent-state">{info.agent.seenAt ? t('updates.agentStale', { when: when(info.agent.seenAt) }) : t('updates.agentNever')}</p>}
      {info.releaseError && <p class="note warn" data-testid="release-error">{t('updates.releaseErrorWhy', { reason: info.releaseError })}</p>}
      {!info.releaseError && !info.latest && <p class="note warn">{t('updates.noRelease')}</p>}
      {info.latest && !info.updateAvailable && <p class="note ok">{t('updates.upToDate')}</p>}

      {steps.length > 0 && (
        <>
          <h3>{t('updates.steps')}</h3>
          <ol class="steps" data-testid="upgrade-steps">
            {steps.map((x) => (
              <li key={x.key} class={`step ${x.state}`} aria-current={x.state === 'current' ? 'step' : undefined}>
                <span aria-hidden="true">{icon[x.state]}</span> {t(`updates.step.${x.key}`)} <span class="muted small">({stateLabel(x.state)})</span>
              </li>
            ))}
          </ol>
        </>
      )}

      {finished && (
        <div class="lastupgrade" data-testid="last-upgrade">
          <h3>{t('updates.last')}</h3>
          <p><strong>{t('updates.lastLine', { version: st.version ?? '?', result: t(`state.${st.state}`) })}</strong></p>
          {st.previousVersion && <p>{t('updates.previous', { version: st.previousVersion })}</p>}
          {st.startedAt && <p class="muted small">{t('updates.started', { when: when(st.startedAt) })}{st.finishedAt ? ` · ${t('updates.finished', { when: when(st.finishedAt) })}` : ''}</p>}
          {st.error && st.state !== 'succeeded' && <p class="note warn">{t('updates.reason', { error: st.error })}</p>}
          {st.state === 'failed' && ['backup', 'download', 'verify'].includes(st.step ?? '') && <p>{t('updates.unchanged')}</p>}
          {st.state === 'rolled_back' && <p>{t('updates.restored')}</p>}
          {st.state === 'failed' && !['backup', 'download', 'verify'].includes(st.step ?? '') && st.step !== null && <p class="note warn">{t('updates.manualRollback')}</p>}
          {st.backupFile && <p class="muted small">{t('updates.backup', { file: st.backupFile })}</p>}
          {st.state === 'succeeded' && <p class="muted small">{t('updates.rollbackHint')}</p>}
        </div>
      )}

      {info.updateAvailable && info.latest && (
        <>
          <p class="note">{t('updates.available')}</p>
          <h3>{t('updates.between', { current: info.current })}</h3>
          {(info.between.length ? info.between : [info.latest]).map((v, i) => (
            <details key={v.version} open={i === 0}>
              <summary>{t('updates.versionNotes', { version: v.version })}</summary>
              <pre class="notes">{v.notes}</pre>
            </details>
          ))}
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
interface BankSize { id: string; name: string; expectation: string; generator: boolean; variety: number[]; thin: boolean; approved: number; drafts: number; served: number; openReports: number }
interface UsageDay { day: string; calls: number; costUsd: number; failures: number }

/** How many different questions each skill can give, and what the Claude bank holds for it. Loaded only when opened. */
function BankSizes() {
  useLang();
  const [rows, setRows] = useState<BankSize[] | null>(null);
  const [thinOnly, setThinOnly] = useState(true);
  const load = async () => { if (rows) return; const r = await api<{ skills: BankSize[] }>('GET', '/admin/ai/bank'); if (r.ok) setRows(r.data.skills); };
  const thin = rows?.filter((r) => r.thin).length ?? 0;
  const shown = (rows ?? []).filter((r) => !thinOnly || r.thin || !r.generator);
  return (
    <details onToggle={(e) => { if ((e.target as HTMLDetailsElement).open) void load(); }}>
      <summary>{t('bank.title')}</summary>
      <p class="muted small">{t('bank.help')}</p>
      {!rows ? <p role="status">{t('common.loading')}</p> : (
        <>
          <p role="status">{t('bank.summary', { thin, total: rows.length })}</p>
          <label class="check"><input type="checkbox" checked={thinOnly} onChange={() => setThinOnly(!thinOnly)} /> {t('bank.thinOnly')}</label>
          
            <table class="data small">
              <thead><tr><th scope="col">{t('bank.skill')}</th><th scope="col">{t('bank.variety')}</th><th scope="col">{t('bank.approved')}</th><th scope="col">{t('bank.drafts')}</th><th scope="col">{t('bank.served')}</th><th scope="col">{t('bank.reports')}</th></tr></thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id}>
                    <th scope="row">{r.id} <span class="muted">{r.name}</span> {r.thin && <span class="badge">{t('bank.thin')}</span>}</th>
                    <td>{r.generator ? r.variety.join(' / ') : t('bank.none')}</td><td>{r.approved}</td><td>{r.drafts}</td><td>{r.served}</td><td>{r.openReports}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </>
      )}
    </details>
  );
}

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
      <BankSizes />
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
