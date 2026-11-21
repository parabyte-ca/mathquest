import { useEffect, useState } from 'preact/hooks';
import { api } from '../api';
import type { Me, StudentInfo } from '../api';
import { t, useLang } from '../i18n';

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
      <section class="card">
        <h1>{t('caregiver.title')}</h1>
        {students === null && <p role="status">{t('common.loading')}</p>}
        {students?.length === 0 && <p>{t('caregiver.none')}</p>}
        <ul class="plain">
          {students?.map((s) => <StudentRow key={s.id} s={s} onChange={load} go={go} first={students?.[0]?.id === s.id} />)}
        </ul>
      </section>
      <AddStudent onAdded={load} />
      <Devices devices={devices} onChange={load} />
      <Defaults me={me} />
    </>
  );
}

function StudentRow({ s, onChange, go, first }: { s: StudentInfo; onChange: () => void; go: (to: string) => void; first: boolean }) {
  const [email, setEmail] = useState('');
  const [personal, setPersonal] = useState('');
  const [note, setNote] = useState('');
  const share = async (e: Event) => {
    e.preventDefault();
    const r = await api<{ error?: string }>('POST', `/students/${s.id}/caregivers`, { email, note: personal.trim() || undefined });
    setNote(r.ok ? t('caregiver.shareDone') : r.data.error === 'note_has_link' ? t('invite.noteLink') : t('common.error'));
    if (r.ok) { setEmail(''); setPersonal(''); }
  };
  const remove = async () => {
    if (confirm(t('caregiver.deleteConfirm'))) {
      await api('DELETE', `/students/${s.id}`);
      onChange();
    }
  };
  const isOwner = s.linkRole === 'owner' || s.linkRole === 'admin';
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
          <label for={`pnote-${s.id}`}>{t('invite.note')}</label>
          <textarea id={`pnote-${s.id}`} rows={2} maxLength={500} value={personal} aria-describedby={`pnote-help-${s.id}`} onInput={(e) => setPersonal((e.target as HTMLTextAreaElement).value)} />
          <p class="muted small" id={`pnote-help-${s.id}`}>{t('invite.noteHelp', { n: 500 - personal.length })}</p>
          <button type="submit">{t('caregiver.shareSend')}</button>
          <span role="status">{note}</span>
        </form>
      )}
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
