import { useEffect, useState } from 'preact/hooks';
import type { Me } from '../api';
import type { StudentSettings } from '../learnTypes';
import { LearnHome } from './LearnHome';
import { Lazy } from '../lazy';
import { RewardBar, Rewards } from '../rewards';

const loadPractice = () => import('./Practice').then((m) => m.Practice);
const loadMap = () => import('./SkillMap').then((m) => m.SkillMap);
const loadPlacement = () => import('./Placement').then((m) => m.Placement);
const loadSettings = () => import('./StudentSettings').then((m) => m.Settings);
const loadLesson = () => import('./LessonRoute').then((m) => m.LessonRoute);

/** Everything a signed-in student sees. Their display settings apply to the whole page. */
export function StudentArea({ me, path, go }: { me: Extract<Me, { kind: 'student' }>; path: string; go: (to: string) => void }) {
  const [settings, setSettings] = useState<StudentSettings>(me.student.settings as StudentSettings);

  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle('hc', !!settings.highContrast);
    el.classList.toggle('dys', !!settings.dyslexiaFont);
    el.classList.toggle('rm', !!settings.reducedMotion);
    return () => { el.classList.remove('hc', 'dys', 'rm'); };
  }, [settings.highContrast, settings.dyslexiaFont, settings.reducedMotion]);

  const hc = !!settings.highContrast;
  const page = (() => {
    if (path === '/app/learn/practice') return <Lazy load={loadPractice} props={{ settings, go }} />;
    if (path === '/app/learn/map') return <Lazy load={loadMap} props={{ go }} />;
    if (path === '/app/learn/placement') return <Lazy load={loadPlacement} props={{ go }} />;
    if (path === '/app/learn/settings') return <Lazy load={loadSettings} props={{ settings, onChange: setSettings, go }} />;
    if (path === '/app/learn/rewards') return <Rewards go={go} highContrast={hc} />;
    if (path === '/app/learn/lesson') return <Lazy load={loadLesson} props={{ settings, go }} />;
    return <LearnHome me={me} go={go} />;
  })();
  return <><RewardBar highContrast={hc} go={go} />{page}</>;
}
