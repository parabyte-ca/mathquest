// Where offline practice keeps things on the device: a small IndexedDB store. Nothing here is a secret: the student's own
// display details (so the app can open offline), the downloaded list of questions (skill, tier, seed) and their answers.
import type { Given } from '../../shared/items/types';
import type { Me } from './api';

export interface OfflineRef { skill: string; tier: number; seed: number; target: string }
export interface StoredAnswer { i: number; given: Given; hints: number; ms: number }
export interface StoredPack {
  packId: string;
  grade: number;
  issuedAt: number;
  expiresAt: number;
  items: OfflineRef[];
  /** Answers given on this device (all of them, including ones already sent). */
  answers: StoredAnswer[];
  /** Indices the server has graded. */
  sent: number[];
}
export interface SyncSummary { answered: number; correct: number; xp: number; level: number | null; leveledUp: boolean; newBadges: string[]; remaining: number }

const DB = 'mathquest-offline';
const STORE = 'kv';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('no indexedDB'));
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Every store call is safe to make: where storage is blocked (some private windows) it simply reports nothing stored. */
async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
  try {
    const db = await open();
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      tx.oncomplete = () => { db.close(); resolve(req.result); };
      tx.onerror = () => { db.close(); reject(tx.error); };
      tx.onabort = () => { db.close(); reject(tx.error); };
    });
  } catch {
    return undefined;
  }
}
const get = <T>(key: string): Promise<T | undefined> => run<T>('readonly', (s) => s.get(key) as IDBRequest<T>);
const put = async (key: string, value: unknown): Promise<boolean> => (await run('readwrite', (s) => s.put(value, key))) !== undefined;
const del = (key: string): Promise<unknown> => run('readwrite', (s) => s.delete(key));

// ── the signed-in student, remembered so the app can open offline ──────────────────────

export type StudentMe = Extract<Me, { kind: 'student' }>;
export const cacheStudent = (me: StudentMe): Promise<boolean> => put('student', me);
export const cachedStudent = (): Promise<StudentMe | undefined> => get<StudentMe>('student');
export const forgetStudent = (): Promise<unknown> => del('student');

// ── the pack and its answers ───────────────────────────────────────────────────────

export const loadPack = (studentId: string): Promise<StoredPack | undefined> => get<StoredPack>(`pack:${studentId}`);
export const savePack = (studentId: string, pack: StoredPack): Promise<boolean> => put(`pack:${studentId}`, pack);
export const dropPack = (studentId: string): Promise<unknown> => del(`pack:${studentId}`);

