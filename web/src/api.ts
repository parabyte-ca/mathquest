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
export interface StudentInfo { id: string; username: string; displayName: string; grade: number; language: 'en' | 'fr'; linkRole?: string }
export type Me = { kind: 'user'; csrf: string; user: UserInfo; version: string } | { kind: 'student'; csrf: string; student: StudentInfo; version: string };

export async function loadMe(): Promise<Me | null> {
  const r = await api<Me>('GET', '/me');
  if (!r.ok) return null;
  setCsrf(r.data.csrf);
  return r.data;
}
