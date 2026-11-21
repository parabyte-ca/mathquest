import { useEffect, useRef, useState } from 'preact/hooks';
import { api, type Me } from './api';
import { t, useLang } from './i18n';

export type TourKind = 'caregiver' | 'student';
export interface TourStep { id: string; target?: string }

/** The steps of each tour. Text lives in the locale files under tour.<kind>.<id>.title and .body. A missing target just means a text-only step. */
export const TOURS: Record<TourKind, TourStep[]> = {
  caregiver: [
    { id: 'welcome' },
    { id: 'add', target: '[data-tour="add-student"]' },
    { id: 'devices', target: '[data-tour="devices"]' },
    { id: 'defaults', target: '[data-tour="defaults"]' },
    { id: 'progress', target: '[data-tour="progress"]' },
    { id: 'share', target: '[data-tour="share"]' },
    { id: 'data' },
  ],
  student: [
    { id: 'welcome' },
    { id: 'topics', target: '[data-tour="topics"]' },
    { id: 'learn' },
    { id: 'hints' },
    { id: 'tools' },
    { id: 'map', target: '[data-tour="skillmap"]' },
    { id: 'voice', target: '[data-tour="settings"]' },
    { id: 'rewards', target: '[data-tour="rewards"]' },
  ],
};

// ── a tiny shared store, so the Help link can start the tour from anywhere ──────────

interface Active { kind: TourKind; step: number; focus: boolean }
let active: Active | null = null;
const listeners = new Set<(a: Active | null) => void>();
const set = (a: Active | null): void => { active = a; listeners.forEach((l) => l(a)); };
export const startTour = (kind: TourKind, focus = true): void => set({ kind, step: 0, focus });
const useActive = (): Active | null => {
  const [a, setA] = useState<Active | null>(active);
  useEffect(() => { listeners.add(setA); return () => { listeners.delete(setA); }; }, []);
  return a;
};

const kindOf = (me: Me | null | undefined): TourKind | null => (me ? (me.kind === 'student' ? 'student' : 'caregiver') : null);
/** The start page of each kind of person: where the tour appears by itself the first time. */
const isHome = (me: Me, path: string): boolean => (me.kind === 'student' ? !path.startsWith('/app/learn/') : path === '/app');

export function TourHost({ me, path }: { me: Me | null | undefined; path: string }) {
  useLang();
  const a = useActive();
  const kind = kindOf(me);
  const asked = useRef<string>('');

  // First run: show the tour once, on the person's start page, unless they have finished or skipped it before.
  useEffect(() => {
    if (!me || !kind || !isHome(me, path)) return;
    const who = `${kind}:${me.kind === 'student' ? me.student.id : me.user.id}`;
    if (asked.current === who) return;
    asked.current = who;
    void api<{ done: string[] }>('GET', '/tours').then((r) => {
      if (r.ok && !r.data.done.includes(kind) && !active) startTour(kind, false);
    });
  }, [me, path]);

  // A different person signing in on this page must not inherit a tour that was open.
  useEffect(() => { if (!me && active) set(null); }, [me]);

  if (!a || !kind || a.kind !== kind) return null;
  return <TourCard key={a.kind} a={a} />;
}

function TourCard({ a }: { a: Active }) {
  const steps = TOURS[a.kind];
  const [i, setI] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const step = steps[i]!;
  const last = i === steps.length - 1;

  // Highlight what the step is about, and bring it into view without stealing keyboard focus.
  useEffect(() => {
    document.querySelectorAll('.tour-target').forEach((el) => el.classList.remove('tour-target'));
    const el = step.target ? document.querySelector(step.target) : null;
    if (el) {
      el.classList.add('tour-target');
      const calm = document.documentElement.classList.contains('rm') || matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ block: 'center', behavior: calm ? 'auto' : 'smooth' });
    }
    return () => { document.querySelectorAll('.tour-target').forEach((x) => x.classList.remove('tour-target')); };
  }, [i]);

  // When the person chose to open the tour (Help), move focus to it; when it opened by itself, leave focus where it was.
  useEffect(() => { if (a.focus) heading.current?.focus(); }, []);

  const finish = async () => { set(null); await api('POST', `/tours/${a.kind}/complete`, {}); };
  const text = (k: string): string => t(`tour.${a.kind}.${step.id}.${k}`);

  return (
    <section class="tour" role="region" aria-label={t('tour.label')} onKeyDown={(e) => { if (e.key === 'Escape') void finish(); }}>
      <p class="eyebrow">{t('tour.label')} · {t('tour.step', { n: i + 1, total: steps.length })}</p>
      <h2 id="tour-title" tabIndex={-1} ref={heading}>{text('title')}</h2>
      <p>{text('body')}</p>
      <p class="sr" role="status" aria-live="polite">{t('tour.step', { n: i + 1, total: steps.length })}: {text('title')}</p>
      <div class="row-actions">
        <button type="button" class="secondary" disabled={i === 0} onClick={() => setI(i - 1)}>{t('tour.back')}</button>
        <button type="button" onClick={() => (last ? void finish() : setI(i + 1))}>{last ? t('tour.done') : t('tour.next')}</button>
        {!last && <button type="button" class="link" onClick={() => void finish()}>{t('tour.skip')}</button>}
      </div>
    </section>
  );
}
