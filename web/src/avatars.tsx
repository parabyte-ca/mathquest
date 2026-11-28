import type { ComponentChildren } from 'preact';
import { PALETTES } from '../../shared/palettes';
import { COSMETICS } from '../../shared/rewards';

// Original MathQuest avatars: simple flat shapes drawn for this app (no emoji fonts, no third-party art), so they look the same on every
// device. Each is drawn on a 64 x 64 grid inside a soft round background.

const BG: Record<string, string> = {
  'avatar-fox': '#ffe3c7', 'avatar-panda': '#d9efe0', 'avatar-owl': '#e8dcf5', 'avatar-octopus': '#f9d9e6', 'avatar-butterfly': '#dbe6fb',
  'avatar-dolphin': '#d3ecf6', 'avatar-axolotl': '#d4f1ef', 'avatar-unicorn': '#fde1f1', 'avatar-dragon': '#dff0cf', 'avatar-rocket': '#dfe3f3', 'avatar-trophy': '#fff0c2',
};

const ART: Record<string, ComponentChildren> = {
  'avatar-fox': (
    <>
      <path d="M8 10 L26 24 L38 24 L56 10 L55 38 Q32 64 9 38 Z" fill="#e8731a" />
      <path d="M8 10 L22 21 L12 30 Z M56 10 L42 21 L52 30 Z" fill="#7a3510" opacity="0.35" />
      <path d="M9 38 Q32 62 55 38 Q44 46 32 46 Q20 46 9 38 Z" fill="#fff4e6" />
      <circle cx="22" cy="34" r="3.2" fill="#2a1608" /><circle cx="42" cy="34" r="3.2" fill="#2a1608" />
      <ellipse cx="32" cy="48" rx="4" ry="3" fill="#2a1608" />
    </>
  ),
  'avatar-panda': (
    <>
      <circle cx="13" cy="15" r="8" fill="#222" /><circle cx="51" cy="15" r="8" fill="#222" />
      <circle cx="32" cy="35" r="23" fill="#fbfbfb" />
      <ellipse cx="22" cy="33" rx="6.5" ry="8.5" fill="#222" transform="rotate(-20 22 33)" /><ellipse cx="42" cy="33" rx="6.5" ry="8.5" fill="#222" transform="rotate(20 42 33)" />
      <circle cx="23" cy="32" r="2.2" fill="#fff" /><circle cx="41" cy="32" r="2.2" fill="#fff" />
      <ellipse cx="32" cy="43" rx="4.5" ry="3.2" fill="#222" />
      <path d="M26 49 Q32 54 38 49" stroke="#222" stroke-width="2" fill="none" stroke-linecap="round" />
    </>
  ),
  'avatar-owl': (
    <>
      <path d="M12 8 L24 18 L40 18 L52 8 L54 34 Q54 58 32 58 Q10 58 10 34 Z" fill="#8a5a2b" />
      <ellipse cx="32" cy="44" rx="13" ry="12" fill="#d9b98a" />
      <circle cx="22" cy="29" r="10" fill="#fff6dc" /><circle cx="42" cy="29" r="10" fill="#fff6dc" />
      <circle cx="22" cy="29" r="4.5" fill="#222" /><circle cx="42" cy="29" r="4.5" fill="#222" />
      <circle cx="23.5" cy="27.5" r="1.4" fill="#fff" /><circle cx="43.5" cy="27.5" r="1.4" fill="#fff" />
      <path d="M28 37 L36 37 L32 45 Z" fill="#f0a020" />
    </>
  ),
  'avatar-octopus': (
    <>
      <path d="M12 44 Q10 54 16 56 M22 46 Q20 58 26 58 M42 46 Q44 58 38 58 M52 44 Q54 54 48 56" stroke="#9b4dca" stroke-width="6" stroke-linecap="round" fill="none" />
      <circle cx="32" cy="28" r="20" fill="#b565e0" />
      <circle cx="24" cy="26" r="6" fill="#fff" /><circle cx="40" cy="26" r="6" fill="#fff" />
      <circle cx="25" cy="27" r="2.8" fill="#2b1040" /><circle cx="39" cy="27" r="2.8" fill="#2b1040" />
      <path d="M26 38 Q32 43 38 38" stroke="#2b1040" stroke-width="2" fill="none" stroke-linecap="round" />
    </>
  ),
  'avatar-butterfly': (
    <>
      <ellipse cx="20" cy="24" rx="14" ry="16" fill="#6c5ce7" transform="rotate(-20 20 24)" /><ellipse cx="44" cy="24" rx="14" ry="16" fill="#6c5ce7" transform="rotate(20 44 24)" />
      <ellipse cx="22" cy="44" rx="10" ry="11" fill="#f78fb3" transform="rotate(15 22 44)" /><ellipse cx="42" cy="44" rx="10" ry="11" fill="#f78fb3" transform="rotate(-15 42 44)" />
      <circle cx="19" cy="24" r="4" fill="#fff" opacity="0.8" /><circle cx="45" cy="24" r="4" fill="#fff" opacity="0.8" />
      <rect x="29.5" y="14" width="5" height="36" rx="2.5" fill="#3b2a52" />
      <path d="M31 14 Q27 6 22 6 M33 14 Q37 6 42 6" stroke="#3b2a52" stroke-width="2" fill="none" stroke-linecap="round" />
    </>
  ),
  'avatar-dolphin': (
    <>
      <path d="M6 40 Q8 18 34 16 Q52 16 58 30 Q46 28 44 38 Q38 54 18 52 Q8 50 6 40 Z" fill="#3d9bd1" />
      <path d="M30 16 Q34 6 42 8 Q38 14 38 18 Z" fill="#2c7fb0" />
      <path d="M14 46 Q30 50 42 38 Q30 44 14 40 Z" fill="#d9f0fb" />
      <circle cx="20" cy="33" r="2.6" fill="#10283a" />
      <path d="M8 42 Q12 46 17 45" stroke="#10283a" stroke-width="1.6" fill="none" stroke-linecap="round" />
    </>
  ),
  'avatar-unicorn': (
    <>
      <path d="M32 2 L37 20 L27 20 Z" fill="#f4c430" />
      <path d="M14 22 Q10 40 20 52 L24 60 L44 60 Q54 48 52 30 Q50 20 38 18 L26 18 Q16 18 14 22 Z" fill="#ffffff" stroke="#c9b8d8" stroke-width="1.5" />
      <path d="M40 20 Q54 24 52 40 Q48 30 44 34 Q46 26 38 24 Z" fill="#f06ac0" />
      <circle cx="26" cy="34" r="3" fill="#3b2a52" />
      <ellipse cx="34" cy="54" rx="9" ry="5" fill="#fde1f1" /><circle cx="31" cy="54" r="1.2" fill="#3b2a52" /><circle cx="37" cy="54" r="1.2" fill="#3b2a52" />
    </>
  ),
  'avatar-axolotl': (
    <>
      <path d="M15 31 Q8 29 5 22 M14 37 Q6 38 2 33 M16 43 Q9 46 7 52" stroke="#ff6f96" stroke-width="3.6" stroke-linecap="round" fill="none" />
      <path d="M49 31 Q56 29 59 22 M50 37 Q58 38 62 33 M48 43 Q55 46 57 52" stroke="#ff6f96" stroke-width="3.6" stroke-linecap="round" fill="none" />
      <g fill="#ff9db9"><circle cx="5" cy="22" r="2.7" /><circle cx="2.4" cy="33" r="2.7" /><circle cx="7" cy="52" r="2.7" /><circle cx="59" cy="22" r="2.7" /><circle cx="61.6" cy="33" r="2.7" /><circle cx="57" cy="52" r="2.7" /></g>
      <ellipse cx="22" cy="55" rx="6" ry="3.6" fill="#f59bb6" /><ellipse cx="42" cy="55" rx="6" ry="3.6" fill="#f59bb6" />
      <ellipse cx="32" cy="37" rx="19.5" ry="17" fill="#ffb7cb" />
      <ellipse cx="32" cy="46" rx="11" ry="6" fill="#ffdbe5" />
      <circle cx="23.5" cy="34" r="3" fill="#2d1420" /><circle cx="40.5" cy="34" r="3" fill="#2d1420" />
      <circle cx="24.5" cy="32.8" r="1" fill="#fff" /><circle cx="41.5" cy="32.8" r="1" fill="#fff" />
      <circle cx="17.5" cy="41" r="3.2" fill="#ff8fab" opacity="0.65" /><circle cx="46.5" cy="41" r="3.2" fill="#ff8fab" opacity="0.65" />
      <path d="M25 41.5 Q32 48 39 41.5" stroke="#7a2a44" stroke-width="2.2" fill="none" stroke-linecap="round" />
      <circle cx="30" cy="38.2" r="0.8" fill="#d97a98" /><circle cx="34" cy="38.2" r="0.8" fill="#d97a98" />
    </>
  ),
  'avatar-dragon': (
    <>
      <path d="M12 20 L18 4 L26 18 Z M52 20 L46 4 L38 18 Z" fill="#f4c430" />
      <path d="M8 36 Q8 14 32 14 Q56 14 56 36 Q56 58 32 58 Q8 58 8 36 Z" fill="#4caf50" />
      <path d="M24 50 Q32 62 40 50 Q32 54 24 50 Z" fill="#8bd48e" />
      <circle cx="22" cy="32" r="5" fill="#fff6a8" /><circle cx="42" cy="32" r="5" fill="#fff6a8" />
      <ellipse cx="22" cy="32" rx="1.6" ry="4" fill="#222" /><ellipse cx="42" cy="32" rx="1.6" ry="4" fill="#222" />
      <circle cx="28" cy="46" r="1.8" fill="#1d5a22" /><circle cx="36" cy="46" r="1.8" fill="#1d5a22" />
      <path d="M26 8 L28 14 M32 6 L32 13 M38 8 L36 14" stroke="#2f7d33" stroke-width="3" stroke-linecap="round" />
    </>
  ),
  'avatar-rocket': (
    <>
      <path d="M32 4 Q46 16 46 38 L46 46 L18 46 L18 38 Q18 16 32 4 Z" fill="#f3f4f8" stroke="#aeb4c8" stroke-width="1.5" />
      <path d="M32 4 Q40 10 43 22 L21 22 Q24 10 32 4 Z" fill="#e5484d" />
      <circle cx="32" cy="32" r="6" fill="#4aa3df" stroke="#aeb4c8" stroke-width="2" />
      <path d="M18 36 L8 50 L18 46 Z M46 36 L56 50 L46 46 Z" fill="#e5484d" />
      <path d="M24 48 Q32 62 40 48 Z" fill="#ff9f1c" /><path d="M28 48 Q32 56 36 48 Z" fill="#ffd166" />
    </>
  ),
  'avatar-trophy': (
    <>
      <path d="M18 8 L46 8 L44 28 Q42 38 32 40 Q22 38 20 28 Z" fill="#f4b400" />
      <path d="M18 12 Q6 12 8 22 Q10 30 22 30 M46 12 Q58 12 56 22 Q54 30 42 30" stroke="#d99a00" stroke-width="4" fill="none" stroke-linecap="round" />
      <rect x="29" y="40" width="6" height="10" fill="#d99a00" />
      <rect x="20" y="50" width="24" height="8" rx="2" fill="#a86a00" />
      <path d="M32 14 L34 20 L40 20 L35 24 L37 30 L32 26 L27 30 L29 24 L24 20 L30 20 Z" fill="#fff3b0" />
    </>
  ),
};

// Frames: the brand's shield drawn around the avatar. Each has a rim colour, an inner edge colour and an optional trail.
const SHIELD = 'M36 3 L66 13 L66 40 Q66 66 36 77 Q6 66 6 40 L6 13 Z';
const FRAME: Record<string, { rim: string; edge: string; extra?: ComponentChildren }> = {
  'frame-blue': { rim: '#1565c0', edge: '#64b5f6' },
  'frame-silver': { rim: '#8d99ab', edge: '#eef2f7' },
  'frame-gold': { rim: '#c98a00', edge: '#fbc02d' },
  'frame-rocket': {
    rim: '#1565c0', edge: '#fbc02d',
    extra: <path d="M20 70 Q24 79 28 70 M32 72 Q36 82 40 72 M44 70 Q48 79 52 70" stroke="#f57c00" stroke-width="3.2" stroke-linecap="round" fill="none" />,
  },
};

/** A round avatar, inside a shield if a frame is chosen. Falls back to the emoji for an avatar this build does not know. */
export function Avatar({ id, size = 40, frame }: { id: string; size?: number; frame?: string }) {
  const art = ART[id];
  if (!art) return <span class="avatar-fallback" aria-hidden="true">{COSMETICS.find((c) => c.id === id)?.icon ?? '🦊'}</span>;
  const f = frame ? FRAME[frame] : undefined;
  if (f) {
    return (
      <svg class="avatar-art framed" width={size} height={Math.round((size * 86) / 72)} viewBox="0 0 72 86" aria-hidden="true" focusable="false">
        <path d={SHIELD} fill={f.rim} />
        <path d={SHIELD} fill="none" stroke={f.edge} stroke-width="2.5" transform="translate(36 38) scale(0.9) translate(-36 -38)" />
        <svg x="12" y="14" width="48" height="48" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="32" fill={BG[id] ?? '#eee'} />
          <g>{art}</g>
        </svg>
        {f.extra}
      </svg>
    );
  }
  return (
    <svg class="avatar-art" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <circle cx="32" cy="32" r="32" fill={BG[id] ?? '#eee'} />
      <g>{art}</g>
    </svg>
  );
}

/** A small preview of a frame, for the picker (an empty circle for "no frame"). */
export function FramePreview({ id, size = 36 }: { id: string; size?: number }) {
  if (!FRAME[id]) return <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle cx="32" cy="32" r="28" fill="none" stroke="#8a8f9c" stroke-width="4" stroke-dasharray="6 6" /></svg>;
  return <Avatar id="avatar-fox" size={size} frame={id} />;
}

/** A small round swatch showing a palette's page and brand colours. */
export function PaletteSwatch({ id, size = 28 }: { id: string; size?: number }) {
  const p = PALETTES.find((x) => x.id === id);
  const bg = p?.vars['--bg'] ?? '#f5f7fb', brand = p?.vars['--brand'] ?? '#1565c0', card = p?.vars['--card'] ?? '#ffffff';
  return (
    <svg class="swatch" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <circle cx="16" cy="16" r="15" fill={bg} stroke="#8a8f9c" stroke-width="1" />
      <path d="M16 1 A15 15 0 0 1 16 31 Z" fill={brand} />
      <circle cx="16" cy="16" r="5" fill={card} stroke="#8a8f9c" stroke-width="1" />
    </svg>
  );
}
