import { useEffect, useState } from 'preact/hooks';
import en from './locales/en.json';
import fr from './locales/fr.json';

export type Lang = 'en' | 'fr';
const packs: Record<Lang, Record<string, string>> = { en, fr };

let lang: Lang = 'en';
const listeners = new Set<() => void>();

try {
  const saved = localStorage.getItem('mq_lang');
  if (saved === 'fr' || saved === 'en') lang = saved;
} catch {
  /* storage can be unavailable (private mode); default to English */
}

export function setLang(next: Lang): void {
  lang = next;
  try {
    localStorage.setItem('mq_lang', next);
  } catch {
    /* ignore */
  }
  document.documentElement.lang = next === 'fr' ? 'fr-CA' : 'en-CA';
  listeners.forEach((l) => l());
}
setLang(lang);

export const getLang = (): Lang => lang;

export function t(key: string, vars: Record<string, string | number> = {}): string {
  const s = packs[lang][key] ?? packs.en[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_m, k: string) => String(vars[k] ?? ''));
}

/** Re-renders the calling component when the language changes. */
export function useLang(): Lang {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => void listeners.delete(l);
  }, []);
  return lang;
}
