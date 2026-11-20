import { speakable } from '../../shared/mathspeech';
import type { Lang } from '../../shared/items/types';

type Listener = (caption: string | null) => void;
const listeners = new Set<Listener>();
let speaking = false;

export const speechSupported = (): boolean => typeof window !== 'undefined' && 'speechSynthesis' in window;
export const onCaption = (l: Listener): (() => void) => {
  listeners.add(l);
  return () => void listeners.delete(l);
};
const emit = (c: string | null) => listeners.forEach((l) => l(c));

/** Picks the best installed voice for the language, preferring Canadian variants (en-CA, fr-CA). */
export function pickVoice(lang: Lang): SpeechSynthesisVoice | null {
  if (!speechSupported()) return null;
  const want = lang === 'fr' ? 'fr' : 'en';
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith(want));
  return voices.find((v) => v.lang.toLowerCase().replace('_', '-') === (lang === 'fr' ? 'fr-ca' : 'en-ca')) ?? voices[0] ?? null;
}

export function stopSpeaking(): void {
  if (speechSupported()) speechSynthesis.cancel();
  speaking = false;
  emit(null);
}

/**
 * Reads learner-facing text aloud. Math between $...$ is converted to words first ("three fourths", "x squared").
 * The spoken words are also shown as a caption, and the page always keeps the original text on screen.
 */
export function speak(text: string, lang: Lang, rate = 1): void {
  if (!speechSupported()) return;
  const words = speakable(text, lang);
  if (!words) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(words);
  u.lang = lang === 'fr' ? 'fr-CA' : 'en-CA';
  u.rate = Math.min(2, Math.max(0.5, rate));
  const v = pickVoice(lang);
  if (v) u.voice = v;
  u.onstart = () => { speaking = true; emit(words); };
  u.onend = u.onerror = () => { speaking = false; emit(null); };
  speechSynthesis.speak(u);
}

export const isSpeaking = (): boolean => speaking;
