import { useEffect, useState } from 'preact/hooks';
import type { Me } from '../api';
import type { StudentSettings } from '../learnTypes';
import { LearnHome } from './LearnHome';
import { Practice } from './Practice';
import { SkillMap } from './SkillMap';
import { Placement } from './Placement';
import { Settings } from './StudentSettings';
import { lessonById } from '../../../shared/lessons/index';
import { LessonView } from './LessonView';
import { RewardBar, Rewards } from '../rewards';

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
    if (path === '/app/learn/practice') return <Practice settings={settings} go={go} />;
    if (path === '/app/learn/map') return <SkillMap go={go} />;
    if (path === '/app/learn/placement') return <Placement go={go} />;
    if (path === '/app/learn/settings') return <Settings settings={settings} onChange={setSettings} go={go} />;
    if (path === '/app/learn/rewards') return <Rewards go={go} highContrast={hc} />;
    if (path === '/app/learn/lesson') {
      const lesson = lessonById(new URLSearchParams(location.search).get('id') ?? '');
      if (lesson) return <LessonView lesson={lesson} settings={settings} onDone={() => go('/app/learn')} />;
    }
    return <LearnHome me={me} go={go} />;
  })();
  return <><RewardBar highContrast={hc} go={go} />{page}</>;
}
