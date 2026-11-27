import type { ComponentChildren } from 'preact';

// Badge icons: filled, in the brand's blue, orange and yellow, drawn for this app (no emoji fonts), so they look the same on every
// device. Each sits on a round medal; a locked badge is the same medal in grey with a padlock. Anything this build does not know falls back
// to the badge's emoji.
const GLYPH: Record<string, ComponentChildren> = {
  'first-steps': <><ellipse cx="24" cy="38" rx="6" ry="9" fill="#1565c0" /><ellipse cx="40" cy="26" rx="6" ry="9" fill="#f57c00" /></>,
  'on-a-roll': <><circle cx="32" cy="32" r="17" fill="#1565c0" /><circle cx="32" cy="32" r="11" fill="#fff" /><circle cx="32" cy="32" r="5" fill="#f57c00" /></>,
  century: <><text x="32" y="40" font-size="22" font-weight="800" text-anchor="middle" fill="#1565c0" font-family="Inter Variable, system-ui, sans-serif">100</text></>,
  marathon: <path d="M18 44 L28 22 L36 34 L42 26 L50 44 Z" fill="#1565c0" />,
  'streak-3': <path d="M32 12 C40 24 46 28 44 40 C43 48 38 52 32 52 C26 52 21 48 20 40 C19 34 24 30 26 24 C28 28 30 28 32 12 Z" fill="#f57c00" />,
  'streak-7': <path d="M32 10 L38 26 L55 27 L41 38 L46 54 L32 44 L18 54 L23 38 L9 27 L26 26 Z" fill="#fbc02d" />,
  'streak-30': <><circle cx="32" cy="32" r="18" fill="#fbc02d" /><path d="M32 18 L36 28 L47 29 L39 36 L41 47 L32 41 L23 47 L25 36 L17 29 L28 28 Z" fill="#f57c00" /></>,
  'skill-master': <><circle cx="32" cy="30" r="15" fill="#1565c0" /><rect x="26" y="42" width="12" height="8" rx="2" fill="#fbc02d" /><path d="M26 28 Q32 20 38 28 M28 34 Q32 38 36 34" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" /></>,
  'skill-collector': <><rect x="16" y="18" width="12" height="30" rx="2" fill="#1565c0" /><rect x="30" y="14" width="12" height="34" rx="2" fill="#f57c00" /><rect x="44" y="22" width="6" height="26" rx="2" fill="#fbc02d" /></>,
  'topic-master': <><path d="M20 14 L44 14 L42 32 Q40 40 32 42 Q24 40 22 32 Z" fill="#fbc02d" /><rect x="29" y="42" width="6" height="8" fill="#f57c00" /><rect x="22" y="50" width="20" height="5" rx="2" fill="#1565c0" /></>,
  explorer: <><circle cx="32" cy="32" r="18" fill="#1565c0" /><path d="M32 16 L38 32 L32 48 L26 32 Z" fill="#fff" /><path d="M32 16 L38 32 L26 32 Z" fill="#f57c00" /></>,
  'bounce-back': <><path d="M16 44 Q16 20 36 20 L36 12 L50 24 L36 36 L36 28 Q26 28 26 44 Z" fill="#1565c0" /><circle cx="46" cy="46" r="6" fill="#f57c00" /></>,
  'hint-wise': <><path d="M32 10 C42 10 48 18 46 27 C45 33 40 36 40 42 L24 42 C24 36 19 33 18 27 C16 18 22 10 32 10 Z" fill="#fbc02d" /><rect x="25" y="45" width="14" height="5" rx="2" fill="#1565c0" /><rect x="27" y="52" width="10" height="4" rx="2" fill="#1565c0" /></>,
  'review-hero': <><path d="M16 30 A16 16 0 0 1 46 22 L50 16 L52 34 L34 32 L40 27 A9 9 0 0 0 24 31 Z" fill="#1565c0" /><path d="M48 34 A16 16 0 0 1 18 42 L14 48 L12 30 L30 32 L24 37 A9 9 0 0 0 40 33 Z" fill="#f57c00" /></>,
  'level-5': <><path d="M32 6 Q44 18 44 38 L44 46 L20 46 L20 38 Q20 18 32 6 Z" fill="#fff" stroke="#9aa5b5" stroke-width="1.5" /><path d="M32 6 Q40 12 42 22 L22 22 Q24 12 32 6 Z" fill="#e5484d" /><circle cx="32" cy="30" r="5" fill="#1565c0" /><path d="M24 48 Q32 62 40 48 Z" fill="#f57c00" /></>,
  'level-10': <path d="M12 46 L16 20 L26 32 L32 14 L38 32 L48 20 L52 46 Z" fill="#fbc02d" stroke="#c98a00" stroke-width="2" stroke-linejoin="round" />,
};

export const BADGE_ICON_IDS = Object.keys(GLYPH);

/** A badge on a round medal; grey with a padlock until it is earned. */
export function BadgeIcon({ id, fallback, locked, size = 40 }: { id: string; fallback: string; locked?: boolean; size?: number }) {
  const art = GLYPH[id];
  if (!art) return <span>{locked ? '🔒' : fallback}</span>;
  return (
    <svg class={`badge-art${locked ? ' locked' : ''}`} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <circle cx="32" cy="32" r="31" fill={locked ? '#d5dbe6' : '#e3eefb'} stroke={locked ? '#9aa5b5' : '#1565c0'} stroke-width="2" />
      {locked ? (
        <>
          <rect x="20" y="30" width="24" height="18" rx="3" fill="#6b7587" />
          <path d="M24 30 L24 24 Q24 14 32 14 Q40 14 40 24 L40 30" stroke="#6b7587" stroke-width="4" fill="none" />
        </>
      ) : <g>{art}</g>}
    </svg>
  );
}

// ── navigation: line icons ──────────────────────────────────────────────────────
// One stroke weight and one 24 px grid, in the text colour, for buttons and links that also say what they do in words (so they are
// decorative to a screen reader).
const LINE: Record<string, ComponentChildren> = {
  play: <path d="M8 5 L19 12 L8 19 Z" />,
  offline: <><path d="M12 4 L12 15" /><path d="M7 11 L12 16 L17 11" /><path d="M5 20 L19 20" /></>,
  check: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" /></>,
  map: <><path d="M4 6 L9 4 L15 6 L20 4 L20 18 L15 20 L9 18 L4 20 Z" /><path d="M9 4 L9 18 M15 6 L15 20" /></>,
  trophy: <><path d="M7 4 L17 4 L16 11 Q15 14 12 14 Q9 14 8 11 Z" /><path d="M7 6 Q3 6 4 9 Q5 11 8 11 M17 6 Q21 6 20 9 Q19 11 16 11" /><path d="M12 14 L12 18 M8 20 L16 20" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 3 L12 6 M12 18 L12 21 M3 12 L6 12 M18 12 L21 12 M5.6 5.6 L7.8 7.8 M16.2 16.2 L18.4 18.4 M5.6 18.4 L7.8 16.2 M16.2 7.8 L18.4 5.6" /></>,
  home: <><path d="M4 11 L12 4 L20 11" /><path d="M6 10 L6 20 L18 20 L18 10" /></>,
  help: <><circle cx="12" cy="12" r="8.5" /><path d="M9.5 9.5 Q9.5 7 12 7 Q14.5 7 14.5 9.3 Q14.5 11 12 12 L12 13.5" /><path d="M12 16.5 L12 16.6" /></>,
  language: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12 L20.5 12 M12 3.5 Q8 12 12 20.5 M12 3.5 Q16 12 12 20.5" /></>,
  signout: <><path d="M10 4 L5 4 L5 20 L10 20" /><path d="M9 12 L20 12 M16 8 L20 12 L16 16" /></>,
  install: <><rect x="6" y="3" width="12" height="18" rx="2.5" /><path d="M12 8 L12 14 M9.5 12 L12 14.5 L14.5 12" /></>,
  progress: <><path d="M4 20 L20 20" /><path d="M7 20 L7 12 M12 20 L12 6 M17 20 L17 10" /></>,
  print: <><path d="M7 9 L7 4 L17 4 L17 9" /><rect x="4" y="9" width="16" height="8" rx="2" /><path d="M7 14 L17 14 L17 20 L7 20 Z" /></>,
  back: <path d="M14 6 L8 12 L14 18" />,
  menu: <path d="M5 8 L19 8 M5 12 L19 12 M5 16 L19 16" />,
  close: <path d="M6 6 L18 18 M18 6 L6 18" />,
};
export const ICON_NAMES = Object.keys(LINE);

export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const art = LINE[name];
  if (!art) return null;
  return (
    <svg class="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      {art}
    </svg>
  );
}

// ── rewards and topics: filled icons ────────────────────────────────────────────
// Filled, in the brand's own colours (they do not follow a palette), for streaks, goals and the topic list.
const FILLED: Record<string, ComponentChildren> = {
  flame: <><path d="M12 2 C16 7 19 10 19 15 C19 19 16 22 12 22 C8 22 5 19 5 15 C5 12 7 10 8 8 C9.5 10 10.5 10 12 2 Z" fill="#f57c00" /><path d="M12 12 C14 14 15.5 15.5 15.5 17.5 C15.5 19.5 14 21 12 21 C10 21 8.5 19.5 8.5 17.5 C8.5 16 10 15 12 12 Z" fill="#fbc02d" /></>,
  snow: <><path d="M12 2 L12 22 M3.3 7 L20.7 17 M3.3 17 L20.7 7" stroke="#1565c0" stroke-width="2.4" stroke-linecap="round" fill="none" /><circle cx="12" cy="12" r="3" fill="#64b5f6" /></>,
  star: <path d="M12 2 L15 9 L22.5 9.6 L16.8 14.6 L18.5 22 L12 18 L5.5 22 L7.2 14.6 L1.5 9.6 L9 9 Z" fill="#fbc02d" stroke="#c98a00" stroke-width="1" stroke-linejoin="round" />,
  gift: <><rect x="3" y="9" width="18" height="12" rx="2" fill="#f57c00" /><rect x="2" y="6" width="20" height="5" rx="1.5" fill="#fbc02d" /><rect x="10.5" y="6" width="3" height="15" fill="#1565c0" /><path d="M12 6 Q8 0 6 3 Q5 6 12 6 M12 6 Q16 0 18 3 Q19 6 12 6" fill="#1565c0" /></>,
  tick: <><circle cx="12" cy="12" r="10" fill="#2e7d32" /><path d="M7 12.5 L10.5 16 L17 8.5" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round" /></>,
  house: <><path d="M2 12 L12 3 L22 12 Z" fill="#f57c00" /><rect x="5" y="11" width="14" height="10" fill="#fbc02d" /><rect x="10" y="14" width="4" height="7" fill="#1565c0" /></>,
  clock: <><circle cx="12" cy="12" r="10" fill="#1565c0" /><circle cx="12" cy="12" r="7.5" fill="#fff" /><path d="M12 7 L12 12 L15.5 14" stroke="#f57c00" stroke-width="2.2" fill="none" stroke-linecap="round" /></>,
  gem: <><path d="M6 3 L18 3 L22 9 L12 21 L2 9 Z" fill="#1565c0" /><path d="M2 9 L22 9 M9 3 L7 9 L12 21 L17 9 L15 3" stroke="#64b5f6" stroke-width="1.4" fill="none" stroke-linejoin="round" /></>,
};
export const GLYPH_NAMES = Object.keys(FILLED);

export function Glyph({ name, size = 18 }: { name: string; size?: number }) {
  const art = FILLED[name];
  if (!art) return null;
  return <svg class="glyph" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">{art}</svg>;
}

// Topic icons, one per strand letter: B Number, C Algebra, D Data, E Spatial sense, F Financial literacy.
const STRAND: Record<string, ComponentChildren> = {
  B: <><circle cx="12" cy="12" r="10" fill="#1565c0" /><path d="M12 6 L12 18 M6 12 L18 12" stroke="#fff" stroke-width="2.8" stroke-linecap="round" /></>,
  C: <><circle cx="12" cy="12" r="10" fill="#f57c00" /><path d="M7.5 7.5 L16.5 16.5 M16.5 7.5 L7.5 16.5" stroke="#14263f" stroke-width="2.8" stroke-linecap="round" /></>,
  D: <><circle cx="12" cy="12" r="10" fill="#e3eefb" stroke="#1565c0" stroke-width="1.5" /><rect x="6" y="12" width="3" height="6" fill="#1565c0" /><rect x="10.5" y="7" width="3" height="11" fill="#f57c00" /><rect x="15" y="10" width="3" height="8" fill="#fbc02d" /></>,
  E: <><path d="M12 2.5 L21 7.5 L21 16.5 L12 21.5 L3 16.5 L3 7.5 Z" fill="#1565c0" /><path d="M12 12 L21 7.5 M12 12 L3 7.5 M12 12 L12 21.5" stroke="#fbc02d" stroke-width="1.8" fill="none" /></>,
  F: <><circle cx="12" cy="12" r="10" fill="#fbc02d" stroke="#c98a00" stroke-width="1.5" /><text x="12" y="16.5" font-size="12" font-weight="800" text-anchor="middle" fill="#14263f" font-family="Inter Variable, system-ui, sans-serif">$</text></>,
};
export const STRAND_LETTERS = Object.keys(STRAND);

export function StrandIcon({ strand, size = 22 }: { strand: string; size?: number }) {
  const art = STRAND[strand];
  if (!art) return null;
  return <svg class="glyph" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">{art}</svg>;
}

// The challenge and certificate icons arrive from the server as emoji. Where there is a drawn equivalent it is shown instead; anything else
// stays as the emoji.
const EMOJI_GLYPH: Record<string, string> = { '✏️': 'star', '📝': 'star', '⏱️': 'clock', '⌛': 'clock', '📅': 'gift', '🗓️': 'gift', '🌈': 'gem', '🎯': 'gem', '🧠': 'gem', '🔁': 'snow', '🧭': 'gem', '🏹': 'gem', '🏡': 'house', '🚀': 'flame' };
export function EmojiIcon({ emoji, size = 20 }: { emoji: string; size?: number }) {
  const g = EMOJI_GLYPH[emoji];
  return g ? <Glyph name={g} size={size} /> : <span aria-hidden="true">{emoji}</span>;
}
export const EMOJI_GLYPH_NAMES = Object.values(EMOJI_GLYPH);
