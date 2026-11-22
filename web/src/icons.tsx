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
