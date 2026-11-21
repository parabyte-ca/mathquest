// Offline practice, device side: choosing the next question, downloading a pack, and sending the answers back. The server
// rebuilds and grades every question itself when the answers arrive, so what this device says about correctness is never trusted.
import { api, loadMe } from './api';
import { dropPack, loadPack, savePack, type OfflineRef, type StoredAnswer, type StoredPack, type StudentMe, type SyncSummary } from './offlineStore';
export type { OfflineRef, StoredAnswer, StoredPack, SyncSummary } from './offlineStore';

export const remaining = (p: StoredPack): number => p.items.length - p.answers.length;
export const waiting = (p: StoredPack | undefined): StoredAnswer[] => (p ? p.answers.filter((a) => !p.sent.includes(a.i)) : []);
/** The next question not yet answered on this device, in order. */
export const nextIndex = (p: StoredPack): number | null => {
  const done = new Set(p.answers.map((a) => a.i));
  for (let i = 0; i < p.items.length; i++) if (!done.has(i)) return i;
  return null;
};

export async function downloadPack(studentId: string, body: { grade: number; course?: string | null; strands?: string[]; focus?: string | null }): Promise<{ ok: true; pack: StoredPack } | { ok: false; reason: 'offline' | 'content' | 'grade' | 'error' }> {
  const r = await api<{ packId: string; grade: number; issuedAt: number; expiresAt: number; items: OfflineRef[] }>('POST', '/learn/offline/pack', body);
  if (r.status === 0) return { ok: false, reason: 'offline' };
  if (!r.ok) return { ok: false, reason: r.status === 404 ? 'content' : r.status === 403 ? 'grade' : 'error' };
  const pack: StoredPack = { ...r.data, answers: [], sent: [] };
  if (!(await savePack(studentId, pack))) return { ok: false, reason: 'error' };
  return { ok: true, pack };
}

type SyncResult = { ok: true; summary: SyncSummary | null; pack: StoredPack } | { ok: false; reason: 'offline' | 'signin' | 'gone' | 'error' };
let inflight: Promise<SyncResult> | null = null;
/** Sends the answers still waiting. If a send is already under way, everyone waits for that one instead of sending twice. */
export function syncPack(studentId: string): Promise<SyncResult> {
  if (!inflight) inflight = send(studentId).finally(() => { inflight = null; });
  return inflight;
}

async function send(studentId: string): Promise<SyncResult> {
  const pack = await loadPack(studentId);
  if (!pack) return { ok: false, reason: 'gone' };
  const todo = waiting(pack);
  if (todo.length === 0) return { ok: true, summary: null, pack };
  // A fresh sign-in check also refreshes the security token the server needs for this request.
  const me = await loadMe();
  if (!me) return { ok: false, reason: navigator.onLine ? 'signin' : 'offline' };
  if (me.kind !== 'student' || me.student.id !== studentId || (me as StudentMe).offline) return { ok: false, reason: me.kind === 'student' && (me as StudentMe).offline ? 'offline' : 'signin' };
  const r = await api<SyncSummary & { results: { i: number; status: string }[] }>('POST', '/learn/offline/sync', { packId: pack.packId, answers: todo });
  if (r.status === 0) return { ok: false, reason: 'offline' };
  if (r.status === 401) return { ok: false, reason: 'signin' };
  if (r.status === 404 || r.status === 410) { await dropPack(studentId); return { ok: false, reason: 'gone' }; }
  if (!r.ok) return { ok: false, reason: 'error' };
  // Whatever the server accepted or skipped as already graded is finished.
  const next: StoredPack = { ...pack, sent: [...new Set([...pack.sent, ...todo.map((a) => a.i)])] };
  await savePack(studentId, next);
  const { answered, correct, xp, level, leveledUp, newBadges, remaining: left } = r.data;
  return { ok: true, summary: answered > 0 ? { answered, correct, xp, level, leveledUp, newBadges, remaining: left } : null, pack: next };
}
