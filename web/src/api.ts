import { cacheStudent, cachedStudent, forgetStudent } from './offlineStore';

let csrf = '';
export const setCsrf = (v: string): void => {
  csrf = v;
};

export interface ApiResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

export async function api<T = Record<string, unknown>>(method: string, path: string, body?: unknown): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (method !== 'GET' && csrf) headers['x-csrf-token'] = csrf;
  try {
    const res = await fetch(`/api${path}`, { method, headers, credentials: 'same-origin', body: body === undefined ? undefined : JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as T;
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: {} as T };
  }
}

export interface UserInfo { id: string; email: string; role: 'admin' | 'caregiver'; displayName: string; weeklyEmail: boolean; defaults: Record<string, number | boolean> }
export interface StudentInfo { id: string; username: string; displayName: string; grade: number; language: 'en' | 'fr'; linkRole?: string; settings?: Record<string, unknown> }
export type Me =
  | { kind: 'user'; csrf: string; user: UserInfo; version: string }
  /** `offline` is set when the server could not be reached and the student's details came from this device. */
  | { kind: 'student'; csrf: string; student: StudentInfo; version: string; offline?: boolean };

/** Who is signed in. A student who was signed in before the connection dropped is remembered, so the app can still open to offline practice. */
export async function loadMe(): Promise<Me | null> {
  const r = await api<Me>('GET', '/me');
  if (r.ok) {
    setCsrf(r.data.csrf);
    if (r.data.kind === 'student') void cacheStudent({ ...r.data, csrf: '', offline: undefined });
    return r.data;
  }
  if (r.status === 0) {
    const cached = await cachedStudent();
    if (cached) return { ...cached, offline: true };
  }
  if (r.status === 401) void forgetStudent();
  return null;
}
