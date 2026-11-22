import { useEffect, useState } from 'preact/hooks';
import { Glyph } from '../icons';
import { api } from '../api';
import type { Me, StudentInfo } from '../api';
import { t, useLang } from '../i18n';
import { startTour } from '../tour';

interface Device { id: string; label: string; lastSeenAt: number }

export function Caregiver({ me, go }: { me: Extract<Me, { kind: 'user' }>; go: (to: string) => void }) {
  useLang();
  const [students, setStudents] = useState<StudentInfo[] | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);

  const load = async () => {
    const s = await api<{ students: StudentInfo[] }>('GET', '/students');
    if (s.ok) setStudents(s.data.students);
    const d = await api<{ devices: Device[] }>('GET', '/devices');
    if (d.ok) setDevices(d.data.devices);
  };
  useEffect(() => {
    void load();
  }, []);

  return (
    <>
      <Welcome />
      <section class="card">
        <h1>{t('caregiver.title')}</h1>
        {students === null && <p role="status">{t('common.loading')}</p>}
        {students?.length === 0 && <p>{t('caregiver.none')}</p>}
        <ul class="plain">
          {students?.map((s) => <StudentRow key={s.id} s={s} onChange={load} go={go} first={students?.[0]?.id === s.id} />)}
        </ul>
      </section>
      <AddStudent onAdded={load} />
      {students && students.length > 0 && <FamilyGoals students={students} go={go} />}
      {students && students.some((s) => s.linkRole === 'owner') && <InviteParent students={students.filter((s) => s.linkRole === 'owner')} />}
      <Devices devices={devices} onChange={load} />
      <Defaults me={me} />
      <Account me={me} />
    </>
  );
}

function StudentRow({ s, onChange, go, first }: { s: StudentInfo; onChange: () => void; go: (to: string) => void; first: boolean }) {
  const [email, setEmail] = useState('');
  const [personal, setPersonal] = useState('');
  const [note, setNote] = useState('');
  const [shareRole, setShareRole] = useState<'co' | 'owner'>('co');
  const share = async (e: Event) => {
    e.preventDefault();
    if (!confirm(t('household.confirmShare', { names: s.displayName, email, role: shareRole === 'owner' ? t('household.roleOwner') : t('household.roleCo') }))) return;
    const r = await api<{ error?: string }>('POST', `/students/${s.id}/caregivers`, { email, role: shareRole, note: personal.trim() || undefined });
    setNote(r.ok ? t('caregiver.shareDone') : r.data.error === 'note_has_link' ? t('invite.noteLink') : t('common.error'));
    if (r.ok) { setEmail(''); setPersonal(''); }
  };
  const remove = async () => {
    if (confirm(t('caregiver.deleteConfirm'))) {
      await api('DELETE', `/students/${s.id}`);
      onChange();
    }
  };
  const isOwner = s.linkRole === 'owner';
  return (
    <li class="row">
      <div>
        <strong>{s.displayName}</strong> <span class="muted">@{s.username} · {t('caregiver.grade')} {s.grade} · {s.language.toUpperCase()}</span>
        {!isOwner && <span class="badge">{t('caregiver.shared')}</span>}
      </div>
      <div class="actions">
        <a class="btn" data-tour={first ? 'progress' : undefined} href={`/app/progress?student=${s.id}`} onClick={(e) => { e.preventDefault(); go(`/app/progress?student=${s.id}`); }}>{t('caregiver.progress')}</a>
        <a class="btn secondary" href={`/api/students/${s.id}/export`} download={`${s.username}.json`}>{t('caregiver.export')}</a>
        {isOwner && <button type="button" class="danger" onClick={remove}>{t('common.delete')}</button>}
      </div>
      {isOwner && (
        <form class="inline" data-tour={first ? 'share' : undefined} onSubmit={share}>
          <label for={`share-${s.id}`}>{t('caregiver.share')}</label>
          <input id={`share-${s.id}`} type="email" placeholder={t('caregiver.shareEmail')} required value={email} onInput={(e) => setEmail((e.target as HTMLInputElement).value)} />
          <label for={`role-${s.id}`}>{t('household.role')}</label>
          <select id={`role-${s.id}`} value={shareRole} onChange={(e) => setShareRole((e.target as HTMLSelectElement).value as 'co' | 'owner')}>
            <option value="co">{t('household.roleCo')}</option>
            <option value="owner">{t('household.roleOwner')}</option>
          </select>
          <label for={`pnote-${s.id}`}>{t('invite.note')}</label>
          <textarea id={`pnote-${s.id}`} rows={2} maxLength={500} value={personal} aria-describedby={`pnote-help-${s.id}`} onInput={(e) => setPersonal((e.target as HTMLTextAreaElement).value)} />
          <p class="muted small" id={`pnote-help-${s.id}`}>{t('invite.noteHelp', { n: 500 - personal.length })}</p>
          <button type="submit">{t('caregiver.shareSend')}</button>
          <span role="status">{note}</span>
        </form>
      )}
      <Caregivers s={s} onChange={onChange} />
      <Activity s={s} />
    </li>
  );
}

function AddStudent({ onAdded }: { onAdded: () => void }) {
  const [f, setF] = useState({ displayName: '', username: '', pin: '', grade: 5, language: 'en' });
  const [msg, setMsg] = useState('');
  const set = (k: string, v: string | number) => setF((o) => ({ ...o, [k]: v }));
  const submit = async (e: Event) => {
    e.preventDefault();
    const r = await api('POST', '/students', { ...f, grade: Number(f.grade) });
    if (r.ok) {
      setF({ displayName: '', username: '', pin: '', grade: 5, language: 'en' });
      setMsg('');
      onAdded();
    } else setMsg(r.status === 409 ? t('caregiver.usernameTaken') : t('caregiver.invalid'));
  };
  return (
    <section class="card" data-tour="add-student">
      <h2>{t('caregiver.add')}</h2>
      <form onSubmit={submit}>
        <label for="dn">{t('caregiver.displayName')}</label>
        <input id="dn" required maxLength={40} value={f.displayName} onInput={(e) => set('displayName', (e.target as HTMLInputElement).value)} />
        <label for="un">{t('caregiver.username')}</label>
        <input id="un" required pattern="[A-Za-z0-9_]{3,20}" autocapitalize="none" value={f.username} onInput={(e) => set('username', (e.target as HTMLInputElement).value)} />
        <label for="pn">{t('caregiver.pin')}</label>
        <input id="pn" required inputmode="numeric" pattern="[0-9]{4}" maxLength={4} value={f.pin} onInput={(e) => set('pin', (e.target as HTMLInputElement).value)} />
        <label for="gr">{t('caregiver.grade')}</label>
        <select id="gr" value={f.grade} onChange={(e) => set('grade', Number((e.target as HTMLSelectElement).value))}>
          {[5, 6, 7, 8, 9, 10, 11, 12].map((g) => <option value={g}>{g}</option>)}
        </select>
        <label for="lg">{t('caregiver.language')}</label>
        <select id="lg" value={f.language} onChange={(e) => set('language', (e.target as HTMLSelectElement).value)}>
          <option value="en">{t('caregiver.english')}</option>
          <option value="fr">{t('caregiver.french')}</option>
        </select>
        <button type="submit">{t('caregiver.create')}</button>
        <p role="alert" class="note warn">{msg}</p>
      </form>
    </section>
  );
}

function Devices({ devices, onChange }: { devices: Device[]; onChange: () => void }) {
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [msg, setMsg] = useState('');
  const approve = async (e: Event) => {
    e.preventDefault();
    const r = await api('POST', '/devices/approve', { code, label });
    setMsg(r.ok ? t('caregiver.deviceApproved') : t('caregiver.deviceBad'));
    if (r.ok) {
      setCode('');
      setLabel('');
      onChange();
    }
  };
  return (
    <section class="card" data-tour="devices">
      <h2>{t('caregiver.devices')}</h2>
      <form onSubmit={approve}>
        <label for="dc">{t('caregiver.deviceCode')}</label>
        <input id="dc" required inputmode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onInput={(e) => setCode((e.target as HTMLInputElement).value)} />
        <label for="dl">{t('caregiver.deviceLabel')}</label>
        <input id="dl" maxLength={60} value={label} onInput={(e) => setLabel((e.target as HTMLInputElement).value)} />
        <button type="submit">{t('caregiver.deviceApprove')}</button>
        <p role="status">{msg}</p>
      </form>
      {devices.length === 0 ? <p class="muted">{t('caregiver.noDevices')}</p> : (
        <ul class="plain">
          {devices.map((d) => (
            <li class="row" key={d.id}>
              <span>{d.label || d.id.slice(0, 8)}</span>
              <button type="button" class="danger" onClick={async () => { await api('DELETE', `/devices/${d.id}`); onChange(); }}>{t('caregiver.deviceRevoke')}</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

interface FamilyGoal { id: string; title: string; xpTarget: number; progress: number; reached: boolean; redeemed: boolean }

/** One real-world goal for all of a caregiver's students together: everyone's XP counts toward it. */
function FamilyGoals({ students, go }: { students: StudentInfo[]; go: (to: string) => void }) {
  const [goals, setGoals] = useState<FamilyGoal[]>([]);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState(1000);
  const [msg, setMsg] = useState('');
  const load = async () => { const r = await api<{ goals: FamilyGoal[] }>('GET', '/me/family-goals'); if (r.ok) setGoals(r.data.goals); };
  useEffect(() => { void load(); }, []);
  const add = async (e: Event) => {
    e.preventDefault();
    const r = await api<{ error?: string }>('POST', '/me/family-goals', { title, xpTarget: target });
    setMsg(r.ok ? '' : r.status === 409 ? t('caregiver.familyMax') : t('common.error'));
    if (r.ok) { setTitle(''); await load(); }
  };
  const act = async (what: 'redeem' | 'remove', id: string) => {
    await api(what === 'redeem' ? 'POST' : 'DELETE', what === 'redeem' ? `/me/family-goals/${id}/redeem` : `/me/family-goals/${id}`);
    await load();
  };
  return (
    <section class="card" aria-labelledby="fg-title">
      <h2 id="fg-title">{t('caregiver.family')}</h2>
      <p class="muted small">{t('caregiver.familyHelp')}</p>
      {goals.length === 0 && <p>{t('caregiver.familyNone')}</p>}
      <ul class="plain">
        {goals.map((g) => (
          <li class="goal" key={g.id}>
            <Glyph name="house" /> <strong>{g.title}</strong> {g.redeemed && <span class="badge"><Glyph name="tick" /></span>}
            <div class="xpmeter wide" role="progressbar" aria-valuemin={0} aria-valuemax={g.xpTarget} aria-valuenow={g.progress} aria-label={g.title}><span style={{ width: `${Math.round((g.progress / g.xpTarget) * 100)}%` }} /></div>
            <span class="muted small">{t('caregiver.familyProgress', { progress: g.progress, target: g.xpTarget })}</span>
            {g.reached && !g.redeemed && <p class="note ok"><Glyph name="gift" /> {t('caregiver.familyReady')}</p>}
            <div class="actions row-actions">
              {g.reached && !g.redeemed && <button type="button" onClick={() => void act('redeem', g.id)}>{t('caregiver.familyDone')}</button>}
              {g.reached && students.map((st) => <button type="button" class="secondary" key={st.id} onClick={() => go(`/app/certificate?student=${st.id}&kind=family&ref=${g.id}`)}>{t('caregiver.familyCert', { name: st.displayName })}</button>)}
              <button type="button" class="secondary" onClick={() => void act('remove', g.id)}>{t('caregiver.familyRemove')}</button>
            </div>
          </li>
        ))}
      </ul>
      <form onSubmit={add}>
        <label for="fgt">{t('caregiver.familyTitle')}</label>
        <input id="fgt" type="text" value={title} minLength={2} maxLength={80} required onInput={(e) => setTitle((e.target as HTMLInputElement).value)} />
        <label for="fgx">{t('caregiver.familyTarget')}</label>
        <input id="fgx" type="number" min={100} max={1000000} step={50} value={target} onInput={(e) => setTarget(Number((e.target as HTMLInputElement).value))} />
        <button type="submit">{t('caregiver.familyAdd')}</button>
        <span role="status">{msg}</span>
      </form>
    </section>
  );
}

function Defaults({ me }: { me: Extract<Me, { kind: 'user' }> }) {
  const [goal, setGoal] = useState(Number(me.user.defaults.dailyGoalMinutes ?? 15));
  const [limit, setLimit] = useState(Number(me.user.defaults.sessionLimitMinutes ?? 30));
  const [weekly, setWeekly] = useState(me.user.weeklyEmail);
  const [weekday, setWeekday] = useState(Number(me.user.defaults.weeklyDay ?? 1));
  const [saved, setSaved] = useState(false);
  const [testMsg, setTestMsg] = useState('');
  const save = async (e: Event) => {
    e.preventDefault();
    const r = await api('PUT', '/me/defaults', { dailyGoalMinutes: goal, sessionLimitMinutes: limit, weeklyEmail: weekly, weeklyDay: weekday });
    setSaved(r.ok);
  };
  const sendTest = async () => {
    setTestMsg('');
    const r = await api<{ sent: boolean; reason?: string }>('POST', '/me/weekly-test', {});
    setTestMsg(!r.ok ? (r.status === 429 ? t('caregiver.weeklyTestWait') : t('caregiver.weeklyTestFailed')) : r.data.reason === 'no_students' ? t('caregiver.weeklyTestNone') : r.data.sent ? t('caregiver.weeklyTestSent', { email: me.user.email }) : t('caregiver.weeklyTestFailed'));
  };
  return (
    <section class="card" data-tour="defaults">
      <h2>{t('caregiver.defaults')}</h2>
      <form onSubmit={save}>
        <label for="dg">{t('caregiver.dailyGoal')}</label>
        <input id="dg" type="number" min={0} max={240} value={goal} onInput={(e) => setGoal(Number((e.target as HTMLInputElement).value))} />
        <label for="sl">{t('caregiver.sessionLimit')}</label>
        <input id="sl" type="number" min={0} max={240} value={limit} onInput={(e) => setLimit(Number((e.target as HTMLInputElement).value))} />
        <label class="check"><input type="checkbox" checked={weekly} onChange={(e) => setWeekly((e.target as HTMLInputElement).checked)} /> {t('caregiver.weeklyEmail')}</label>
        <label for="wd">{t('caregiver.weeklyDay')}</label>
        <select id="wd" value={weekday} onChange={(e) => setWeekday(Number((e.target as HTMLSelectElement).value))}>
          {[1, 2, 3, 4, 5, 6, 0].map((d) => <option value={d} key={d}>{t(`caregiver.day.${d}`)}</option>)}
        </select>
        <p class="muted small">{t('caregiver.weeklyNote')}</p>
        <button type="submit">{t('common.save')}</button>
        <span role="status">{saved ? '✓' : ''}</span>
      </form>
      <div class="actions row-actions">
        <button type="button" class="secondary" onClick={() => void sendTest()}>{t('caregiver.weeklyTest')}</button>
        <span role="status">{testMsg}</span>
      </div>
    </section>
  );
}

interface Cg { id: string; email: string; displayName: string; role: 'owner' | 'co'; you: boolean }
interface Delta { students: { id: string; displayName: string; outcome: 'stays' | 'deleted' | 'transfer-needed' | 'leave' }[]; graceDays: number }

/** Who is on one student, with the actions each role may take. */
function Caregivers({ s, onChange }: { s: StudentInfo; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Cg[]>([]);
  const [youRole, setYouRole] = useState<'owner' | 'co'>('co');
  const [msg, setMsg] = useState('');
  const load = async () => {
    const r = await api<{ youRole: 'owner' | 'co'; caregivers: Cg[] }>('GET', `/students/${s.id}/caregivers`);
    if (r.ok) { setList(r.data.caregivers); setYouRole(r.data.youRole); }
  };
  useEffect(() => { if (open) void load(); }, [open]);
  const run = async (method: string, path: string, body: unknown, ok: string, confirmText?: string) => {
    if (confirmText && !confirm(confirmText)) return;
    const r = await api<{ error?: string }>(method, `/students/${s.id}${path}`, body);
    setMsg(r.ok ? ok : r.data.error === 'last_owner' ? t('household.lastOwner') : t('common.error'));
    await load();
    onChange();
  };
  const owners = list.filter((c) => c.role === 'owner').length;
  return (
    <details class="household" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary>{t('household.who')}</summary>
      <ul class="plain">
        {list.map((c) => (
          <li class="row" key={c.id}>
            <span>{c.displayName || c.email}{c.you ? ` (${t('household.you')})` : ''} <span class="muted">{c.email}</span> <span class="badge">{c.role === 'owner' ? t('household.roleOwner') : t('household.roleCo')}</span></span>
            <span class="actions">
              {youRole === 'owner' && !c.you && c.role === 'co' && <button type="button" class="secondary" onClick={() => void run('PATCH', `/caregivers/${c.id}`, { role: 'owner' }, t('household.madeOwner'))}>{t('household.makeOwner')}</button>}
              {youRole === 'owner' && !c.you && <button type="button" class="secondary" onClick={() => void run('POST', '/transfer', { caregiverId: c.id }, t('household.handedOver'), t('household.handOverConfirm', { name: c.displayName || c.email }))}>{t('household.handOver')}</button>}
              {youRole === 'owner' && !c.you && c.role === 'co' && <button type="button" class="danger" onClick={() => void run('DELETE', `/caregivers/${c.id}`, undefined, t('household.removed'), t('household.removeConfirm', { name: c.displayName || c.email }))}>{t('household.remove')}</button>}
              {c.you && c.role === 'owner' && owners > 1 && <button type="button" class="secondary" onClick={() => void run('PATCH', `/caregivers/${c.id}`, { role: 'co' }, t('household.steppedDown'), t('household.stepDownConfirm'))}>{t('household.stepDown')}</button>}
              {c.you && (c.role === 'co' || owners > 1) && <button type="button" class="danger" onClick={() => void run('DELETE', `/caregivers/${c.id}`, undefined, t('household.left'), t('household.leaveConfirm', { name: s.displayName }))}>{t('household.leave')}</button>}
            </span>
          </li>
        ))}
      </ul>
      <p class="muted small" role="status">{msg}</p>
    </details>
  );
}

/** Share the students you choose with another parent in one step. Nothing is ticked to begin with, and you confirm the address before it is sent. */
function InviteParent({ students }: { students: StudentInfo[] }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'co' | 'owner'>('co');
  const [note, setNote] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [msg, setMsg] = useState('');
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const send = async (e: Event) => {
    e.preventDefault();
    if (picked.length === 0) return setMsg(t('household.pickOne'));
    const names = students.filter((s) => picked.includes(s.id)).map((s) => s.displayName).join(', ');
    if (!confirm(t('household.confirmShare', { names, email, role: role === 'owner' ? t('household.roleOwner') : t('household.roleCo') }))) return;
    const r = await api<{ error?: string }>('POST', '/me/invite-parent', { email, role, note: note.trim() || undefined, studentIds: picked });
    setMsg(r.ok ? t('household.inviteDone') : r.data.error === 'note_has_link' ? t('invite.noteLink') : r.status === 429 ? t('household.tooMany') : t('common.error'));
    if (r.ok) { setEmail(''); setNote(''); setPicked([]); }
  };
  return (
    <section class="card">
      <h2>{t('household.invite')}</h2>
      <p class="muted">{t('household.inviteHelp')}</p>
      <form onSubmit={send}>
        <fieldset>
          <legend>{t('household.which')}</legend>
          {students.map((s) => (
            <label class="check" key={s.id}><input type="checkbox" checked={picked.includes(s.id)} onChange={() => toggle(s.id)} /> {s.displayName}</label>
          ))}
          <button type="button" class="secondary small" onClick={() => setPicked(picked.length === students.length ? [] : students.map((s) => s.id))}>{picked.length === students.length ? t('household.pickNone') : t('household.pickAll')}</button>
        </fieldset>
        <label for="ip-email">{t('caregiver.shareEmail')}</label>
        <input id="ip-email" type="email" required value={email} onInput={(e) => setEmail((e.target as HTMLInputElement).value)} />
        <label for="ip-role">{t('household.role')}</label>
        <select id="ip-role" value={role} onChange={(e) => setRole((e.target as HTMLSelectElement).value as 'co' | 'owner')}>
          <option value="co">{t('household.roleCo')}</option>
          <option value="owner">{t('household.roleOwner')}</option>
        </select>
        <label for="ip-note">{t('invite.note')}</label>
        <textarea id="ip-note" rows={2} maxLength={500} value={note} onInput={(e) => setNote((e.target as HTMLTextAreaElement).value)} />
        <button type="submit">{t('household.inviteSend')}</button>
        <span role="status">{msg}</span>
      </form>
    </section>
  );
}

/** Download everything, or ask for the account to be deleted after a waiting period. */
function Account({ me }: { me: Extract<Me, { kind: 'user' }> }) {
  const [deleteAt, setDeleteAt] = useState<number | null>(me.user.deleteAt ?? null);
  const [preview, setPreview] = useState<Delta | null>(null);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [msg, setMsg] = useState('');
  const outcome = (o: string) => t(`household.out.${o}`);
  const look = async () => {
    const r = await api<Delta>('GET', '/me/delete-preview');
    if (r.ok) setPreview(r.data);
  };
  const request = async (e: Event) => {
    e.preventDefault();
    const r = await api<{ error?: string; deleteAt?: number }>('POST', '/me/delete', { confirm: confirmEmail });
    if (r.ok && r.data.deleteAt) { setDeleteAt(r.data.deleteAt); setPreview(null); setConfirmEmail(''); setMsg(''); }
    else setMsg(r.data.error === 'transfer_needed' ? t('household.transferFirst') : r.data.error === 'confirm_email' ? t('household.confirmWrong') : t('common.error'));
  };
  const cancel = async () => {
    const r = await api('POST', '/me/delete/cancel', {});
    if (r.ok) setDeleteAt(null);
  };
  return (
    <section class="card">
      <h2>{t('household.account')}</h2>
      <p class="muted">{t('household.exportHelp')}</p>
      <p><a class="btn secondary" href="/api/me/export" download="mathquest-account.json">{t('household.exportAll')}</a></p>
      {deleteAt !== null ? (
        <div role="alert" class="notice">
          <p>{t('household.deleting', { date: new Date(deleteAt).toLocaleDateString() })}</p>
          <button type="button" onClick={() => void cancel()}>{t('household.cancelDelete')}</button>
        </div>
      ) : preview === null ? (
        <button type="button" class="danger" onClick={() => void look()}>{t('household.delete')}</button>
      ) : (
        <form onSubmit={request}>
          <p>{t('household.deleteHelp', { days: preview.graceDays })}</p>
          <ul>{preview.students.map((s) => <li key={s.id}><strong>{s.displayName}</strong>: {outcome(s.outcome)}</li>)}</ul>
          <label for="del-email">{t('household.typeEmail', { email: me.user.email })}</label>
          <input id="del-email" type="email" autocomplete="off" value={confirmEmail} onInput={(e) => setConfirmEmail((e.target as HTMLInputElement).value)} />
          <button type="submit" class="danger" disabled={preview.students.some((s) => s.outcome === 'transfer-needed')}>{t('household.deleteSend')}</button>
          <button type="button" class="secondary" onClick={() => setPreview(null)}>{t('common.cancel')}</button>
          <span role="status">{msg}</span>
        </form>
      )}
    </section>
  );
}

interface Ev { id: number; at: string; action: string; actor: { name?: string; you?: boolean; former?: boolean; student?: boolean; system?: boolean }; other?: { name?: string; former?: boolean }; detail: Record<string, unknown> }

/** What has happened on one student: who looked, changed or shared what, and when. Loaded when opened. */
function Activity({ s }: { s: StudentInfo }) {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<Ev[] | null>(null);
  const [more, setMore] = useState(false);
  const [days, setDays] = useState(180);
  const load = async (before?: number) => {
    const r = await api<{ entries: Ev[]; more: boolean; keepDays: number }>('GET', `/students/${s.id}/activity${before ? `?before=${before}` : ''}`);
    if (!r.ok) return;
    setEvents((old) => (before && old ? [...old, ...r.data.entries] : r.data.entries));
    setMore(r.data.more);
    setDays(r.data.keepDays);
  };
  useEffect(() => { if (open && events === null) void load(); }, [open]);
  const name = (p?: { name?: string; former?: boolean }) => (p?.former || !p?.name ? t('activity.former') : p.name);
  const line = (e: Ev) => {
    const actor = e.actor.system ? t('activity.system') : e.actor.you ? t('activity.you') : e.actor.student ? e.actor.name! : name(e.actor);
    const role = e.detail.role === 'owner' ? t('household.roleOwner') : t('household.roleCo');
    const key = `activity.${e.action}`;
    const text = t(key, { actor, other: name(e.other), role, fields: Array.isArray(e.detail.fields) ? e.detail.fields.join(', ') : '' });
    return text === key ? `${actor}: ${e.action}` : text;
  };
  return (
    <details class="household" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary>{t('activity.title')}</summary>
      {events === null && <p role="status">{t('common.loading')}</p>}
      {events?.length === 0 && <p class="muted">{t('activity.none')}</p>}
      <ul class="plain">
        {events?.map((e) => <li key={e.id}><span>{line(e)}</span> <span class="muted small"><time dateTime={e.at}>{new Date(e.at).toLocaleString()}</time></span></li>)}
      </ul>
      {more && events && <button type="button" class="secondary" onClick={() => void load(events[events.length - 1]!.id)}>{t('activity.more')}</button>}
      <p class="muted small">{t('activity.keep', { days })}</p>
    </details>
  );
}

interface WelcomeData { show: boolean; invitedBy: string[]; students: { id: string; displayName: string; grade: number; role: 'owner' | 'co' }[] }

/** Shown once to a caregiver who was invited to students: who shared what, what their role allows, and how a student signs in. */
function Welcome() {
  const [w, setW] = useState<WelcomeData | null>(null);
  useEffect(() => { void api<WelcomeData>('GET', '/me/welcome').then((r) => { if (r.ok && r.data.show) setW(r.data); }); }, []);
  if (!w) return null;
  const done = async (tour: boolean) => {
    await api('POST', '/tours/welcome/complete', {});
    setW(null);
    if (tour) startTour('caregiver');
  };
  const owner = w.students.some((s) => s.role === 'owner');
  return (
    <section class="card welcome" role="region" aria-labelledby="welcome-title">
      <h1 id="welcome-title">{t('welcome.title')}</h1>
      <p>{t('welcome.shared', { who: w.invitedBy.join(', '), n: w.students.length })}</p>
      <ul>
        {w.students.map((s) => <li key={s.id}><strong>{s.displayName}</strong> <span class="muted">{t('caregiver.grade')} {s.grade} · {s.role === 'owner' ? t('household.roleOwner') : t('household.roleCo')}</span></li>)}
      </ul>
      <h2>{t('welcome.canTitle')}</h2>
      <p>{owner ? t('welcome.canOwner') : t('welcome.canHelper')}</p>
      <h2>{t('welcome.signInTitle')}</h2>
      <ol>
        <li>{t('welcome.step1')}</li>
        <li>{t('welcome.step2')}</li>
        <li>{owner ? t('welcome.step3Owner') : t('welcome.step3Helper')}</li>
      </ol>
      <h2>{t('welcome.privacyTitle')}</h2>
      <p>{t('welcome.privacy')}</p>
      <div class="actions row-actions">
        <button type="button" class="go" onClick={() => void done(true)}>{t('welcome.tour')}</button>
        <button type="button" class="secondary" onClick={() => void done(false)}>{t('welcome.gotIt')}</button>
      </div>
    </section>
  );
}
