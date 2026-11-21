import { useEffect, useState } from 'preact/hooks';
import type { Me } from '../api';
import type { StudentSettings } from '../learnTypes';
import { LearnHome } from './LearnHome';
import { Lazy } from '../lazy';
import { RewardBar, Rewards } from '../rewards';
import { loadPack } from '../offlineStore';
import { syncPack, waiting, type SyncSummary } from '../offline';
import { t } from '../i18n';
import { useOnline } from '../pwa';

const loadPractice = () => import('./Practice').then((m) => m.Practice);
const loadMap = () => import('./SkillMap').then((m) => m.SkillMap);
const loadPlacement = () => import('./Placement').then((m) => m.Placement);
const loadSettings = () => import('./StudentSettings').then((m) => m.Settings);
const loadLesson = () => import('./LessonRoute').then((m) => m.LessonRoute);
const loadOffline = () => import('./OfflinePractice').then((m) => m.OfflinePractice);

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

  // Answers given offline are sent by themselves as soon as the student is online and signed in.
  const online = useOnline();
  const [sent, setSent] = useState<SyncSummary | null>(null);
  useEffect(() => {
    if (!online || me.offline) return;
    void (async () => {
      if (waiting(await loadPack(me.student.id)).length === 0) return;
      const r = await syncPack(me.student.id);
      if (r.ok && r.summary) setSent(r.summary);
    })();
  }, [online, me.offline]);

  const hc = !!settings.highContrast;
  const page = (() => {
    if (me.offline || path === '/app/learn/offline') return <Lazy load={loadOffline} props={{ me, go }} />;
    if (path === '/app/learn/practice') return <Lazy load={loadPractice} props={{ settings, go }} />;
    if (path === '/app/learn/map') return <Lazy load={loadMap} props={{ go }} />;
    if (path === '/app/learn/placement') return <Lazy load={loadPlacement} props={{ go }} />;
    if (path === '/app/learn/settings') return <Lazy load={loadSettings} props={{ settings, onChange: setSettings, go }} />;
    if (path === '/app/learn/rewards') return <Rewards go={go} highContrast={hc} />;
    if (path === '/app/learn/lesson') return <Lazy load={loadLesson} props={{ settings, go }} />;
    return <LearnHome me={me} go={go} />;
  })();
  return (
    <>
      <RewardBar highContrast={hc} go={go} />
      {sent && path !== '/app/learn/offline' && (
        <p class="note ok syncnote" role="status">{t('offlinep.synced', { correct: sent.correct, answered: sent.answered, xp: sent.xp })} <button type="button" class="link" onClick={() => setSent(null)}>{t('install.close')}</button></p>
      )}
      {page}
    </>
  );
}
