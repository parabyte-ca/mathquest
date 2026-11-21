import { useEffect, useState } from 'preact/hooks';
import type { Text } from '../../../shared/items/types';
import { api } from '../api';
import { t, useLang } from '../i18n';
import { tt } from '../MathText';

interface Goal { id: string; title: string; xpTarget: number; progress: number; reached: boolean; redeemed: boolean }
interface Dash {
  student: { id: string; displayName: string; grade: number; language: string };
  level: number; xp: number; streak: number; bestStreak: number; freezes: number; minutesToday: number; dailyGoalMinutes: number;
  week: { answered: number; accuracy: number | null; minutes: number };
  prevWeek: { answered: number; accuracy: number | null; minutes: number };
  month: { answered: number; accuracy: number | null; minutes: number };
  days: { day: string; answered: number; correct: number; minutes: number }[];
  skillsMastered: number; skillsPractised: number;
  strands: { strand: string; name: string; attempts: number; accuracy: number | null; mastered: number; practised: number }[];
  attention: { skill: string; name: string; expectation: string; accuracy: number; attempts: number }[];
  dueReviews: number;
  recentBadges: { id: string; at: number; name?: Text }[];
  goals: Goal[];
}
interface Expectation { code: string; grade: number; strand: string; strandName: string; text: string }

const pct = (n: number | null): string => (n === null ? '—' : `${n}%`);
const signed = (n: number): string => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');

export function Progress({ go }: { go: (to: string) => void }) {
  useLang();
  const id = new URLSearchParams(location.search).get('student') ?? '';
  const [d, setD] = useState<Dash | null>(null);
  const [error, setError] = useState('');
  const load = async () => {
    const r = await api<Dash>('GET', `/students/${id}/dashboard`);
    if (r.ok) setD(r.data); else setError(t('common.error'));
  };
  useEffect(() => { void load(); }, [id]);

  if (error) return <section class="card"><p class="note" role="alert">{error}</p><button type="button" onClick={() => go('/app')}>{t('common.back')}</button></section>;
  if (!d) return <section class="card"><p role="status">{t('common.loading')}</p></section>;
  const max = Math.max(1, ...d.days.map((x) => x.answered));
  const dayLabel = (s: string): string => s.slice(5);

  return (
    <>
      <section class="card" aria-labelledby="pr-title">
        <h1 id="pr-title">{t('progress.title', { name: d.student.displayName })}</h1>
        <p class="muted">{t('caregiver.grade')} {d.student.grade}</p>
        <div class="statgrid">
          <div class="stat"><span class="num">{d.level}</span>{t('progress.level')} · {d.xp} XP</div>
          <div class="stat"><span class="num">{d.streak}</span>{t('progress.streak', { best: d.bestStreak })}</div>
          <div class="stat"><span class="num">{d.minutesToday}</span>{t('progress.today', { goal: d.dailyGoalMinutes })}</div>
          <div class="stat"><span class="num">{d.week.answered}</span>{t('progress.weekQs', { min: d.week.minutes })}{d.prevWeek.answered > 0 && <span class="delta">{t('progress.vsQs', { delta: signed(d.week.answered - d.prevWeek.answered) })}</span>}</div>
          <div class="stat"><span class="num">{pct(d.week.accuracy)}</span>{t('progress.weekAcc')}{d.week.accuracy !== null && d.prevWeek.accuracy !== null && <span class="delta">{t('progress.vsAcc', { delta: signed(d.week.accuracy - d.prevWeek.accuracy) })}</span>}</div>
          <div class="stat"><span class="num">{d.skillsMastered}</span>{t('progress.mastered', { n: d.skillsPractised })}</div>
        </div>
        <div class="actions row-actions"><button type="button" class="secondary" onClick={() => go('/app')}>{t('common.back')}</button></div>
      </section>

      <section class="card" aria-labelledby="days-title">
        <h2 id="days-title">{t('progress.days')}</h2>
        <div class="bars" aria-hidden="true">
          {d.days.map((x) => (
            <div class="col" key={x.day}><div class="bar" style={{ height: `${(x.answered / max) * 100}%` }} /><span class="lab">{dayLabel(x.day)}</span></div>
          ))}
        </div>
        <details>
          <summary>{t('progress.asTable')}</summary>
          <div class="tablewrap"><table class="data">
            <thead><tr><th scope="col">{t('progress.day')}</th><th scope="col">{t('progress.questions')}</th><th scope="col">{t('progress.right')}</th><th scope="col">{t('progress.minutes')}</th></tr></thead>
            <tbody>{d.days.map((x) => <tr key={x.day}><th scope="row">{x.day}</th><td>{x.answered}</td><td>{x.correct}</td><td>{x.minutes}</td></tr>)}</tbody>
          </table></div>
        </details>
        <p class="muted small">{d.prevWeek.answered > 0 ? t('progress.lastWeek', { n: d.prevWeek.answered, acc: pct(d.prevWeek.accuracy), min: d.prevWeek.minutes }) : t('progress.noLastWeek')}</p>
        <p class="muted small">{t('progress.month', { n: d.month.answered, acc: pct(d.month.accuracy), min: d.month.minutes })}</p>
      </section>


      <section class="card" aria-labelledby="cert-title">
        <h2 id="cert-title">{t('progress.certs')}</h2>
        <p class="muted small">{t('progress.certsHelp', { name: d.student.displayName })}</p>
        <ul class="plain certlist">
          <li><button type="button" class="secondary" onClick={() => go(`/app/certificate?student=${id}&kind=level`)}>🚀 {t('progress.certLevel', { n: d.level })} · {t('progress.certPrint')}</button></li>
          {d.goals.filter((g) => g.reached).map((g) => <li key={g.id}><button type="button" class="secondary" onClick={() => go(`/app/certificate?student=${id}&kind=goal&ref=${g.id}`)}>🎯 {t('progress.certGoal', { title: g.title })} · {t('progress.certPrint')}</button></li>)}
          {d.recentBadges.map((b) => <li key={b.id}><button type="button" class="secondary" onClick={() => go(`/app/certificate?student=${id}&kind=badge&ref=${b.id}`)}>🏅 {t('progress.certBadge', { name: b.name ? tt(b.name) : b.id })} · {t('progress.certPrint')}</button></li>)}
        </ul>
      </section>

      <section class="card" aria-labelledby="strands-title">
        <h2 id="strands-title">{t('progress.strands')}</h2>
        {d.strands.length === 0 ? <p>{t('progress.none')}</p> : (
          <div class="tablewrap"><table class="data">
            <thead><tr><th scope="col">{t('progress.strand')}</th><th scope="col">{t('progress.questions')}</th><th scope="col">{t('progress.accuracy')}</th><th scope="col">{t('progress.skills')}</th></tr></thead>
            <tbody>{d.strands.map((s) => <tr key={s.strand}><th scope="row">{s.strand}. {s.name}</th><td>{s.attempts}</td><td>{pct(s.accuracy)}</td><td>{s.mastered} / {s.practised}</td></tr>)}</tbody>
          </table></div>
        )}
      </section>

      <section class="card" aria-labelledby="att-title">
        <h2 id="att-title">{t('progress.attention')}</h2>
        {d.attention.length === 0 ? <p>{t('progress.attentionNone')}</p> : (
          <ul class="plain">{d.attention.map((a) => <li key={a.skill}>{a.name} <span class="muted small">({a.expectation}, {a.accuracy}% {t('progress.over', { n: a.attempts })})</span></li>)}</ul>
        )}
        {d.dueReviews > 0 && <p class="note">{t('progress.due', { n: d.dueReviews })}</p>}
        {d.recentBadges.length > 0 && <p class="muted">{t('progress.badges')} {d.recentBadges.map((b) => (b.name ? tt(b.name) : b.id)).join(', ')}</p>}
      </section>

      <Goals id={id} goals={d.goals} onChange={load} />
      <WorksheetBuilder id={id} grade={d.student.grade} go={go} />
    </>
  );
}

function Goals({ id, goals, onChange }: { id: string; goals: Goal[]; onChange: () => void }) {
  const [title, setTitle] = useState('');
  const [xp, setXp] = useState(500);
  const [msg, setMsg] = useState('');
  const add = async (e: Event) => {
    e.preventDefault();
    const r = await api('POST', `/students/${id}/goals`, { title, xpTarget: xp });
    setMsg(r.ok ? t('goals.added') : r.status === 409 ? t('goals.tooMany') : t('goals.invalid'));
    if (r.ok) { setTitle(''); onChange(); }
  };
  const redeem = async (g: Goal) => { await api('POST', `/students/${id}/goals/${g.id}/redeem`, {}); onChange(); };
  const remove = async (g: Goal) => { if (confirm(t('goals.removeConfirm'))) { await api('DELETE', `/students/${id}/goals/${g.id}`); onChange(); } };
  return (
    <section class="card" aria-labelledby="goals-title">
      <h2 id="goals-title">{t('goals.title')}</h2>
      <p class="muted">{t('goals.help')}</p>
      <ul class="plain">
        {goals.filter((g) => !g.redeemed).concat(goals.filter((g) => g.redeemed)).map((g) => (
          <li class="goal" key={g.id}>
            <strong>{g.title}</strong>{' '}
            {g.redeemed ? <span class="badge">✅ {t('goals.done')}</span> : g.reached ? <span class="badge">🎁 {t('goals.ready')}</span> : null}
            <div class="xpmeter wide" role="progressbar" aria-valuemin={0} aria-valuemax={g.xpTarget} aria-valuenow={g.progress} aria-label={g.title}><span style={{ width: `${Math.round((g.progress / g.xpTarget) * 100)}%` }} /></div>
            <span class="muted small">{g.progress} / {g.xpTarget} XP</span>
            <div class="row-actions">
              {g.reached && !g.redeemed && <button type="button" onClick={() => redeem(g)}>{t('goals.redeem')}</button>}
              {!g.redeemed && <button type="button" class="secondary small" onClick={() => remove(g)}>{t('goals.remove')}</button>}
            </div>
          </li>
        ))}
      </ul>
      <form onSubmit={add}>
        <label for="goal-title">{t('goals.name')}</label>
        <input id="goal-title" required minLength={2} maxLength={80} placeholder={t('goals.example')} value={title} onInput={(e) => setTitle((e.target as HTMLInputElement).value)} />
        <label for="goal-xp">{t('goals.xp')}</label>
        <input id="goal-xp" type="number" required min={50} max={100000} step={50} value={xp} onInput={(e) => setXp(Number((e.target as HTMLInputElement).value))} />
        <button type="submit">{t('goals.add')}</button>
        <p role="status">{msg}</p>
      </form>
    </section>
  );
}

function WorksheetBuilder({ id, grade, go }: { id: string; grade: number; go: (to: string) => void }) {
  const [exps, setExps] = useState<Expectation[]>([]);
  const [focus, setFocus] = useState('');
  const [tier, setTier] = useState('mixed');
  const [count, setCount] = useState(12);
  useEffect(() => {
    void api<{ expectations: Expectation[] }>('GET', `/students/${id}/worksheet/options`).then((r) => {
      if (!r.ok) return;
      setExps(r.data.expectations);
      const first = r.data.expectations.find((e) => e.grade === grade) ?? r.data.expectations[0];
      if (first) setFocus(first.code);
    });
  }, [id]);
  const open = (e: Event) => {
    e.preventDefault();
    const seed = 1 + Math.floor(Math.random() * 1_000_000_000);
    go(`/app/worksheet?student=${encodeURIComponent(id)}&focus=${encodeURIComponent(focus)}&tier=${tier}&count=${count}&seed=${seed}`);
  };
  const grades = [...new Set(exps.map((e) => e.grade))];
  return (
    <section class="card" aria-labelledby="ws-title">
      <h2 id="ws-title">{t('ws.title')}</h2>
      <p class="muted">{t('ws.help')}</p>
      <form onSubmit={open}>
        <label for="ws-topic">{t('ws.topic')}</label>
        <select id="ws-topic" value={focus} onChange={(e) => setFocus((e.target as HTMLSelectElement).value)}>
          {grades.map((g) => (
            <optgroup key={g} label={`${t('caregiver.grade')} ${g}`}>
              {exps.filter((e) => e.grade === g).map((e) => <option key={e.code} value={e.code}>{e.code} · {e.strandName}: {e.text.slice(0, 70)}</option>)}
            </optgroup>
          ))}
        </select>
        <label for="ws-tier">{t('ws.tier')}</label>
        <select id="ws-tier" value={tier} onChange={(e) => setTier((e.target as HTMLSelectElement).value)}>
          <option value="mixed">{t('ws.mixed')}</option>
          {[1, 2, 3].map((n) => <option key={n} value={String(n)}>{t(`tier.${n}`)}</option>)}
        </select>
        <label for="ws-count">{t('ws.count')}</label>
        <input id="ws-count" type="number" min={4} max={30} value={count} onInput={(e) => setCount(Number((e.target as HTMLInputElement).value))} />
        <button type="submit" disabled={!focus}>{t('ws.open')}</button>
      </form>
    </section>
  );
}
