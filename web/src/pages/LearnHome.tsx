import { useEffect, useState } from 'preact/hooks';
import { api } from '../api';
import type { Me } from '../api';
import { t } from '../i18n';
import type { LearnOptions } from '../learnTypes';

/** Choose a grade, then a course where relevant, then strands or "Mix it up". */
export function LearnHome({ me, go }: { me: Extract<Me, { kind: 'student' }>; go: (to: string) => void }) {
  const [opts, setOpts] = useState<LearnOptions | null>(null);
  const [grade, setGrade] = useState(me.student.grade);
  const [course, setCourse] = useState<string | null>(null);
  const [strands, setStrands] = useState<string[]>([]);
  const [mix, setMix] = useState(true);

  useEffect(() => {
    void api<LearnOptions>('GET', '/learn/options').then((r) => {
      if (!r.ok) return;
      setOpts(r.data);
      if (!r.data.grades.some((g) => g.grade === me.student.grade)) setGrade(r.data.grades[0]?.grade ?? me.student.grade);
    });
  }, []);

  const g = opts?.grades.find((x) => x.grade === grade);
  const group = g?.groups.find((x) => x.course === course) ?? g?.groups[0];
  // The choices reset only when the student changes the grade or course, never when the options finish loading,
  // so a strand ticked right after the page appears is not lost.
  const resetChoices = () => { setStrands([]); setMix(true); };
  useEffect(() => { setCourse((c) => (g?.groups.some((x) => x.course === c) ? c : g?.groups[0]?.course ?? null)); }, [grade, opts]);

  const anyContent = group?.strands.some((s) => s.available) ?? false;
  const q = new URLSearchParams({ grade: String(grade) });
  if (course) q.set('course', course);
  if (!mix && strands.length) q.set('strands', strands.join(','));
  // One topic ticked: the quick check covers that topic; otherwise it is the Number check.
  const checkStrand = !mix && strands.length === 1 && /^[B-F]$/.test(strands[0]!) ? strands[0]! : null;

  return (
    <>
      <section class="card" aria-labelledby="learn-title">
        <h1 id="learn-title">{t('student.welcome', { name: me.student.displayName })}</h1>
        <p class="muted">{t('learn.intro')}</p>

        <label for="grade">{t('caregiver.grade')}</label>
        <select id="grade" value={grade} onChange={(e) => { setGrade(Number((e.target as HTMLSelectElement).value)); setCourse(null); resetChoices(); }}>
          {opts?.grades.map((x) => <option value={x.grade} key={x.grade}>{x.grade}</option>)}
        </select>

        {g && g.groups.length > 1 && (
          <>
            <label for="course">{t('learn.course')}</label>
            <select id="course" value={course ?? ''} onChange={(e) => { setCourse((e.target as HTMLSelectElement).value || null); resetChoices(); }}>
              {g.groups.map((x) => <option value={x.course ?? ''} key={x.course ?? 'none'}>{x.course}</option>)}
            </select>
            {grade >= 10 && <p class="muted small">{t('learn.recommended')}</p>}
          </>
        )}

        {group && (
          <fieldset class="strands" data-tour="topics">
            <legend>{t('learn.topics')}</legend>
            <label class="check"><input type="checkbox" checked={mix} onChange={() => { setMix(true); setStrands([]); }} /> {t('learn.mix')}</label>
            {group.strands.map((s) => (
              <label class="check" key={s.strand}>
                <input type="checkbox" disabled={!s.available} checked={!mix && strands.includes(s.strand)}
                  onChange={() => { setMix(false); setStrands(strands.includes(s.strand) ? strands.filter((x) => x !== s.strand) : [...strands, s.strand]); }} />
                {s.strand}. {s.name} {!s.available && <span class="muted small">({t('learn.soon')})</span>}
              </label>
            ))}
          </fieldset>
        )}

        {!anyContent && opts && <p class="note">{t('play.noContent')}</p>}
        <div class="actions row-actions">
          <button type="button" disabled={!anyContent || (!mix && strands.length === 0)} onClick={() => go(`/app/learn/practice?${q}`)}>{t('learn.start')}</button>
          <button type="button" class="secondary" disabled={!anyContent || (!mix && strands.length === 0)} onClick={() => go(`/app/learn/offline?${q}`)}>{t('learn.offline')}</button>
          <button type="button" class="secondary" disabled={!anyContent} onClick={() => go(`/app/learn/placement?grade=${grade}${course ? `&course=${course}` : ''}${checkStrand ? `&strand=${checkStrand}` : ''}`)}>{t('learn.placement')}</button>
          <button type="button" class="secondary" data-tour="skillmap" onClick={() => go(`/app/learn/map?grade=${grade}${course ? `&course=${course}` : ''}`)}>{t('learn.skillMap')}</button>
          <button type="button" class="secondary" onClick={() => go('/app/learn/rewards')}>{t('learn.rewards')}</button>
          <button type="button" class="secondary" data-tour="settings" onClick={() => go('/app/learn/settings')}>{t('learn.settings')}</button>
        </div>
      </section>
    </>
  );
}
