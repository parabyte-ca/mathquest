// Tiled backgrounds that go with each colour palette a student can unlock: pine trees for Forest, waves and fish for Ocean, and so on.
// Each is a small original SVG, drawn faint (every shape has a low opacity) so that text, which always sits on solid cards, keeps the
// contrast the palette tests check. They are applied as a CSS background by the student pages, and left out by the "Plain background"
// setting and by high contrast.

export interface Background {
  /** The palette this goes with. */
  id: string;
  /** Tile size in CSS pixels. */
  w: number;
  h: number;
  /** The inside of the <svg>: shapes only, no scripts, links or images. */
  body: string;
}

const pine = (x: number, y: number, s: number, c: string, o: number): string =>
  `<g opacity="${o}" transform="translate(${x} ${y}) scale(${s})"><path fill="${c}" d="M0 -44 L14 -22 L7 -22 L18 -4 L-18 -4 L-7 -22 L-14 -22 Z"/><rect x="-3" y="-4" width="6" height="10" fill="#6d4c41"/></g>`;
const star = (x: number, y: number, r: number, o: number, c = '#ffe082'): string => {
  const k = r * 0.28;
  return `<path opacity="${o}" fill="${c}" d="M${x} ${y - r} L${x + k} ${y - k} L${x + r} ${y} L${x + k} ${y + k} L${x} ${y + r} L${x - k} ${y + k} L${x - r} ${y} L${x - k} ${y - k}Z"/>`;
};
const sym = (c: string, x: number, y: number, t: string, s = 26, o = 0.2): string =>
  `<text x="${x}" y="${y}" opacity="${o}" fill="${c}" font-size="${s}" font-weight="800" font-family="Inter,system-ui,sans-serif">${t}</text>`;

export const BACKGROUNDS: Background[] = [
  { id: 'palette-classic', w: 170, h: 150, body: sym('#1565c0', 22, 48, '+') + sym('#f57c00', 104, 40, '÷', 30) + sym('#1565c0', 62, 112, 'π', 30) + sym('#fbc02d', 132, 112, '∑', 30, 0.3) + sym('#f57c00', 16, 128, '×', 24) + sym('#1565c0', 140, 66, '=', 24) },
  {
    id: 'palette-sunrise', w: 170, h: 150,
    body: '<g opacity=".26" stroke="#f9a825" stroke-width="3" stroke-linecap="round"><circle cx="40" cy="44" r="14" fill="#fbc02d" stroke="none"/><path fill="none" d="M40 16v-8M40 72v8M12 44H4M68 44h8M20 24l-6 -6M60 64l6 6M60 24l6 -6M20 64l-6 6"/></g>'
      + '<g opacity=".2" fill="none" stroke="#a8420a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M104 36 q6 -8 12 0 q6 -8 12 0"/><path d="M128 86 q5 -7 10 0 q5 -7 10 0"/></g>'
      + '<g opacity=".18" fill="#ef6c00"><ellipse cx="96" cy="124" rx="22" ry="9"/><ellipse cx="112" cy="116" rx="14" ry="9"/><ellipse cx="80" cy="118" rx="12" ry="8"/></g>'
      + '<g opacity=".22" fill="#f57c00"><path d="M24 118 a16 16 0 0 1 32 0z"/></g>',
  },
  {
    id: 'palette-forest', w: 160, h: 160,
    body: pine(36, 62, 1, '#2e7d32', 0.22) + pine(112, 40, 0.7, '#43a047', 0.2) + pine(120, 134, 1.1, '#1b6e3c', 0.22) + pine(40, 146, 0.6, '#66bb6a', 0.18)
      + '<g opacity=".24"><path d="M74 96 q10 -16 22 0 q-10 6 -22 0z" fill="#c62828"/><rect x="82" y="96" width="6" height="9" rx="2" fill="#d7ccc8"/></g>'
      + '<g opacity=".2" fill="#2e7d32"><path d="M70 20 q10 -10 18 0 q-8 10 -18 0z"/></g>',
  },
  {
    id: 'palette-ocean', w: 170, h: 150,
    body: '<g fill="none" stroke="#0b6b8f" stroke-width="3" stroke-linecap="round" opacity=".2"><path d="M8 40 q14 -14 28 0 t28 0 t28 0"/><path d="M60 118 q14 -14 28 0 t28 0 t28 0"/></g>'
      + '<g opacity=".24" fill="#0288d1"><path d="M110 40 q14 -14 30 0 q-14 14 -30 0z"/><path d="M142 40 l12 -8 v16z"/><circle cx="118" cy="38" r="1.8" fill="#fff"/></g>'
      + '<g opacity=".22" fill="#f57c00"><path d="M22 92 q12 -12 26 0 q-12 12 -26 0z"/><path d="M48 92 l11 -7 v14z"/></g>'
      + '<g opacity=".25" fill="none" stroke="#0b6b8f" stroke-width="2"><circle cx="136" cy="96" r="5"/><circle cx="148" cy="80" r="3"/><circle cx="26" cy="132" r="4"/></g>'
      + '<g opacity=".2" fill="#26a69a"><path d="M92 150 q-8 -20 2 -34 q4 16 8 8 q4 14 -2 26z"/></g>',
  },
  {
    id: 'palette-twilight', w: 170, h: 160,
    body: star(30, 34, 10, 0.42) + star(120, 22, 6, 0.35) + star(148, 92, 9, 0.38, '#b39ddb') + star(70, 110, 7, 0.35) + star(24, 140, 5, 0.3, '#b39ddb') + star(104, 148, 5, 0.3)
      + '<g opacity=".3" fill="#ffe082"><path d="M76 30 a14 14 0 1 0 10 22 a11 11 0 1 1 -10 -22z"/></g>'
      + '<g opacity=".25" fill="#fff"><circle cx="52" cy="76" r="1.6"/><circle cx="96" cy="76" r="1.4"/><circle cx="136" cy="56" r="1.6"/><circle cx="12" cy="96" r="1.4"/><circle cx="150" cy="128" r="1.5"/></g>',
  },
  {
    id: 'palette-candy', w: 170, h: 160,
    body: '<g opacity=".3"><circle cx="38" cy="40" r="15" fill="#f06292"/><path d="M29 40 a9 9 0 0 1 18 0" fill="none" stroke="#fff" stroke-width="3"/><rect x="36" y="54" width="4" height="26" rx="2" fill="#ba6b8c"/></g>'
      + '<g opacity=".28"><ellipse cx="118" cy="52" rx="14" ry="8" fill="#ab47bc"/><path d="M104 52 l-10 -8 v16z M132 52 l10 -8 v16z" fill="#ce93d8"/></g>'
      + '<g opacity=".3" stroke-width="4" stroke-linecap="round"><path d="M60 118 l8 -6" stroke="#ffb300"/><path d="M92 128 l-4 -9" stroke="#26c6da"/><path d="M130 112 l9 3" stroke="#ec407a"/><path d="M26 130 l9 -2" stroke="#7e57c2"/><path d="M152 144 l-3 -9" stroke="#ffb300"/></g>'
      + '<g opacity=".24"><circle cx="82" cy="78" r="10" fill="#ffb300"/><circle cx="82" cy="78" r="5" fill="#fff0f6"/></g>',
  },
];

export const backgroundById = (id: string): Background | undefined => BACKGROUNDS.find((b) => b.id === id);

/** The tile as a CSS `url(...)` value. */
export const backgroundUrl = (b: Background): string =>
  `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${b.w}" height="${b.h}" viewBox="0 0 ${b.w} ${b.h}">${b.body}</svg>`)}")`;

/**
 * A background that is a picture instead of a small tile: held still behind the page, as tall as the screen, with its pattern repeating
 * sideways so it fits any screen shape without cropping or stretching. The picture is a file of the app, so it is never fetched from
 * anywhere else, and it is switched off by the "Plain background" setting and by high contrast like the tiled ones.
 */
export interface ImageBackground {
  /** The palette this goes with. */
  id: string;
  /** The picture, a file of the app. */
  url: string;
}
export const IMAGE_BACKGROUNDS: ImageBackground[] = [{ id: 'palette-retro', url: '/backgrounds/golden-retro.webp' }];
export const imageBackgroundById = (id: string): ImageBackground | undefined => IMAGE_BACKGROUNDS.find((b) => b.id === id);
