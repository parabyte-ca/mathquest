import { useEffect, useState } from 'preact/hooks';
import type { Text } from '../../shared/items/types';
import { PALETTES } from '../../shared/palettes';
import { COSMETICS } from '../../shared/rewards';
import { api } from './api';
import { t } from './i18n';
import { tt } from './MathText';

export interface RewardHeader { level: number; xp: number; into: number; need: number; streak: number; avatar: string; palette: string }
export interface RewardResult {
  xp: number;
  parts: { kind: string; xp: number }[];
  totalXp: number;
  level: number;
  leveledUp: boolean;
  into: number;
  need: number;
  streak: number;
  streakGrew: boolean;
  freezeUsed: boolean;
  freezeEarned: boolean;
  newBadges: string[];
  newCosmetics: string[];
  goalsReached: string[];
  dailyGoalReached: boolean;
}

export const avatarIcon = (id: string): string => COSMETICS.find((c) => c.id === id)?.icon ?? '🦊';

// ── a tiny shared store so the header updates the moment an answer earns XP ─────────

let header: RewardHeader | null = null;
const listeners = new Set<(h: RewardHeader | null) => void>();
const publish = (h: RewardHeader | null): void => { header = h; listeners.forEach((l) => l(h)); };

export function useRewardHeader(): RewardHeader | null {
  const [h, setH] = useState<RewardHeader | null>(header);
  useEffect(() => {
    listeners.add(setH);
    if (!header) void api<RewardHeader>('GET', '/learn/rewards/header').then((r) => r.ok && publish(r.data));
    return () => { listeners.delete(setH); };
  }, []);
  return h;
}

/** Called after an answer: moves the header to the new totals without another request. */
export function applyReward(r: RewardResult): void {
  if (!r) return;
  publish({ level: r.level, xp: r.totalXp, into: r.into, need: r.need, streak: r.streak, avatar: header?.avatar ?? 'avatar-fox', palette: header?.palette ?? 'palette-classic' });
}
export const refreshHeader = async (): Promise<void> => { const r = await api<RewardHeader>('GET', '/learn/rewards/header'); if (r.ok) publish(r.data); };

/** Applies the equipped palette as CSS variables, unless high contrast is on (which has its own colours). */
export function applyPalette(id: string, highContrast: boolean): void {
  const el = document.documentElement;
  for (const p of PALETTES) for (const k of Object.keys(p.vars)) el.style.removeProperty(k);
  el.removeAttribute('data-palette');
  const p = PALETTES.find((x) => x.id === id);
  if (!p || highContrast) return;
  for (const [k, v] of Object.entries(p.vars)) el.style.setProperty(k, v);
  el.setAttribute('data-palette', id);
}

// ── the strip at the top of every student page ─────────────────────────────────────

export function RewardBar({ highContrast, go }: { highContrast: boolean; go: (to: string) => void }) {
  const h = useRewardHeader();
  useEffect(() => {
    if (h) applyPalette(h.palette, highContrast);
    return () => applyPalette('palette-classic', false);
  }, [h?.palette, highContrast]);
  if (!h) return null;
  const pct = Math.min(100, Math.round((h.into / h.need) * 100));
  return (
    <a class="rewardbar" data-tour="rewards" href="/app/learn/rewards" onClick={(e) => { e.preventDefault(); go('/app/learn/rewards'); }} aria-label={t('rewards.barLabel', { level: h.level, xp: h.xp, streak: h.streak })}>
      <span class="avatar" aria-hidden="true">{avatarIcon(h.avatar)}</span>
      <span class="lvl">{t('rewards.level', { n: h.level })}</span>
      <span class="xpmeter" role="progressbar" aria-valuemin={0} aria-valuemax={h.need} aria-valuenow={h.into} aria-label={t('rewards.toNext')}><span style={{ width: `${pct}%` }} /></span>
      <span class="xpnum">{h.xp} XP</span>
      <span class="streak" title={t('rewards.streak')}><span aria-hidden="true">🔥</span> {h.streak}</span>
    </a>
  );
}

// ── what a student sees after an answer ────────────────────────────────────────────

const PART_KEY: Record<string, string> = {
  correct: 'rewards.part.correct', effort: 'rewards.part.effort', review: 'rewards.part.review', skill: 'rewards.part.skill', expectation: 'rewards.part.expectation',
  comeback: 'rewards.part.comeback', 'daily-start': 'rewards.part.dailyStart', 'daily-goal': 'rewards.part.dailyGoal',
};

export function RewardNote({ r, badgeNames }: { r: RewardResult; badgeNames: Record<string, Text> }) {
  return (
    <div class="rewardnote" role="status" aria-live="polite">
      <p class="gain"><strong>+{r.xp} XP</strong> <span class="muted small">{r.parts.filter((p) => p.xp > 0).map((p) => `${t(PART_KEY[p.kind] ?? 'rewards.part.correct')} +${p.xp}`).join(' · ')}</span></p>
      {r.leveledUp && <p class="banner">🎉 {t('rewards.levelUp', { n: r.level })}</p>}
      {r.newBadges.map((id) => <p class="banner" key={id}>{badgeNames[id] ? tt(badgeNames[id]!) : id} — {t('rewards.newBadge')}</p>)}
      {r.freezeUsed && <p class="note">🧊 {t('rewards.freezeUsed')}</p>}
      {r.freezeEarned && <p class="note ok">🧊 {t('rewards.freezeEarned')}</p>}
      {r.streakGrew && r.streak > 1 && <p class="note ok">🔥 {t('rewards.streakGrew', { n: r.streak })}</p>}
      {r.dailyGoalReached && <p class="note ok">⏱️ {t('rewards.dailyGoal')}</p>}
      {r.goalsReached.map((g) => <p class="banner" key={g}>🎁 {t('rewards.goalReached', { goal: g })}</p>)}
      {r.newCosmetics.length > 0 && <p class="note ok">✨ {t('rewards.unlocked', { n: r.newCosmetics.length })}</p>}
    </div>
  );
}

// ── the rewards page ───────────────────────────────────────────────────────────────

interface Summary {
  xp: number; level: number; into: number; need: number; streak: number; bestStreak: number; freezes: number; practisedToday: boolean;
  minutesToday: number; dailyGoalMinutes: number; avatar: string; palette: string;
  badges: { id: string; icon: string; name: Text; how: Text; earnedAt: number | null }[];
  cosmetics: { id: string; kind: 'avatar' | 'palette'; icon: string; name: Text; unlocked: boolean; unlock: { level: number } | { badge: string } }[];
  goals: { id: string; title: string; xpTarget: number; progress: number; reached: boolean; redeemed: boolean }[];
}

export function Rewards({ go, highContrast }: { go: (to: string) => void; highContrast: boolean }) {
  const [s, setS] = useState<Summary | null>(null);
  const [msg, setMsg] = useState('');
  const load = async () => { const r = await api<Summary>('GET', '/learn/rewards'); if (r.ok) setS(r.data); };
  useEffect(() => { void load(); }, []);

  const equip = async (id: string) => {
    const r = await api('POST', '/learn/rewards/equip', { id });
    setMsg(r.ok ? t('rewards.equipped') : t('common.error'));
    if (r.ok) { await refreshHeader(); await load(); }
  };

  if (!s) return <section class="card"><p role="status">{t('common.loading')}</p></section>;
  const pct = Math.min(100, Math.round((s.into / s.need) * 100));
  const lock = (c: Summary['cosmetics'][number]): string => ('level' in c.unlock ? t('rewards.unlockLevel', { n: c.unlock.level }) : t('rewards.unlockBadge', { name: tt(s.badges.find((b) => b.id === (c.unlock as { badge: string }).badge)?.name ?? { en: '', fr: '' }) }));
  const group = (kind: 'avatar' | 'palette', equipped: string) => (
    <ul class="cosmetics plain">
      {s.cosmetics.filter((c) => c.kind === kind).map((c) => (
        <li key={c.id}>
          <button type="button" class={`cosmetic secondary${c.id === equipped ? ' on' : ''}`} disabled={!c.unlocked} aria-pressed={c.id === equipped} onClick={() => equip(c.id)}>
            <span class="big" aria-hidden="true">{c.icon}</span> {tt(c.name)}
            {!c.unlocked && <span class="muted small"> 🔒 {lock(c)}</span>}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <section class="card" aria-labelledby="rw-title">
        <h1 id="rw-title">{avatarIcon(s.avatar)} {t('rewards.title')}</h1>
        <p><strong>{t('rewards.level', { n: s.level })}</strong> · {s.xp} XP</p>
        <div class="xpmeter wide" role="progressbar" aria-valuemin={0} aria-valuemax={s.need} aria-valuenow={s.into} aria-label={t('rewards.toNext')}><span style={{ width: `${pct}%` }} /></div>
        <p class="muted small">{t('rewards.xpToNext', { n: s.need - s.into, next: s.level + 1 })}</p>
        <p>🔥 {t('rewards.streakLine', { n: s.streak, best: s.bestStreak })} · 🧊 {t('rewards.freezes', { n: s.freezes })}</p>
        <p class="muted small">{t('rewards.freezeHelp')}</p>
        {s.dailyGoalMinutes > 0 && <p>⏱️ {t('rewards.todayLine', { min: s.minutesToday, goal: s.dailyGoalMinutes })}</p>}
        <div class="actions row-actions"><button type="button" onClick={() => go('/app/learn')}>{t('nav.home')}</button></div>
      </section>

      {s.goals.length > 0 && (
        <section class="card" aria-labelledby="goals-title">
          <h2 id="goals-title">{t('rewards.goals')}</h2>
          <ul class="plain">
            {s.goals.map((g) => (
              <li class="goal" key={g.id}>
                <strong>{g.title}</strong> {g.redeemed ? <span class="badge">✅ {t('rewards.goalDone')}</span> : g.reached ? <span class="badge">🎁 {t('rewards.goalReadyShort')}</span> : null}
                <div class="xpmeter wide" role="progressbar" aria-valuemin={0} aria-valuemax={g.xpTarget} aria-valuenow={g.progress} aria-label={g.title}><span style={{ width: `${Math.round((g.progress / g.xpTarget) * 100)}%` }} /></div>
                <span class="muted small">{g.progress} / {g.xpTarget} XP</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section class="card" aria-labelledby="badges-title">
        <h2 id="badges-title">{t('rewards.badges', { n: s.badges.filter((b) => b.earnedAt).length, total: s.badges.length })}</h2>
        <ul class="badges plain">
          {s.badges.map((b) => (
            <li key={b.id} class={b.earnedAt ? 'earned' : 'locked'}>
              <span class="big" aria-hidden="true">{b.earnedAt ? b.icon : '🔒'}</span>
              <span><strong>{tt(b.name)}</strong><br /><span class="muted small">{tt(b.how)}</span></span>
              <span class="sr">{b.earnedAt ? t('rewards.earned') : t('rewards.notYet')}</span>
            </li>
          ))}
        </ul>
      </section>

      <section class="card" aria-labelledby="cos-title">
        <h2 id="cos-title">{t('rewards.avatars')}</h2>
        {group('avatar', s.avatar)}
        <h2>{t('rewards.palettes')}</h2>
        {highContrast && <p class="note">{t('rewards.hcNote')}</p>}
        {group('palette', s.palette)}
        <p role="status">{msg}</p>
      </section>
    </>
  );
}

