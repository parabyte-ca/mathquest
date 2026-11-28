// Colour palettes a student can unlock. Applied as CSS variables; each pair is checked against WCAG 2.2 AA (4.5:1) in the tests.
export interface Palette {
  id: string;
  vars: Record<'--bg' | '--card' | '--text' | '--muted' | '--brand' | '--brand-text' | '--line' | '--danger' | '--ok' | '--warn' | '--ink' | '--seg' | '--segfill' | '--segfill2' | '--good' | '--tip' | '--soft' | '--blue-soft' | '--orange' | '--on-orange' | '--orange-soft' | '--yellow' | '--yellow-soft' | '--amber-text', string>;
}

export const PALETTES: Palette[] = [
  { id: 'palette-sunrise', vars: { '--bg': '#fff6ec', '--card': '#ffffff', '--text': '#3b1f0e', '--muted': '#6b4a35', '--brand': '#a8420a', '--brand-text': '#ffffff', '--line': '#edcfb4', '--danger': '#b3261e', '--ok': '#1b6e3c', '--warn': '#8a4b00', '--ink': '#3b1f0e', '--seg': '#f6dcc3', '--segfill': '#a8420a', '--segfill2': '#6b3fa0', '--good': '#1b6e3c', '--tip': '#8a4b00', '--soft': '#fff0e0', '--blue-soft': '#f6dcc3', '--orange': '#f9a825', '--on-orange': '#3b1f0e', '--orange-soft': '#ffe6b8', '--yellow': '#ffd54f', '--yellow-soft': '#fff1c9', '--amber-text': '#7a4a00' } },
  { id: 'palette-forest', vars: { '--bg': '#eff6ef', '--card': '#ffffff', '--text': '#14301c', '--muted': '#3f5c48', '--brand': '#1b6e3c', '--brand-text': '#ffffff', '--line': '#c9e0ce', '--danger': '#b3261e', '--ok': '#1b6e3c', '--warn': '#8a4b00', '--ink': '#14301c', '--seg': '#d3e8d8', '--segfill': '#1b6e3c', '--segfill2': '#0b6b8f', '--good': '#1b6e3c', '--tip': '#8a4b00', '--soft': '#e6f2e8', '--blue-soft': '#d3e8d8', '--orange': '#f57c00', '--on-orange': '#14301c', '--orange-soft': '#ffe9d2', '--yellow': '#fbc02d', '--yellow-soft': '#fff3d6', '--amber-text': '#8a5200' } },
  { id: 'palette-retro', vars: { '--bg': '#fff3ea', '--card': '#ffffff', '--text': '#2a1650', '--muted': '#5b4680', '--brand': '#4b2a9a', '--brand-text': '#ffffff', '--line': '#e6d3f2', '--danger': '#b3261e', '--ok': '#0c6f69', '--warn': '#8a4b00', '--ink': '#2a1650', '--seg': '#f1def5', '--segfill': '#c2187a', '--segfill2': '#e8590c', '--good': '#0c6f69', '--tip': '#8a4b00', '--soft': '#f6e9fb', '--blue-soft': '#eadcf8', '--orange': '#ff7a45', '--on-orange': '#2a1650', '--orange-soft': '#ffe3d2', '--yellow': '#ffc94d', '--yellow-soft': '#fff0c4', '--amber-text': '#8a4b00' } },
  { id: 'palette-ocean', vars: { '--bg': '#ecf6fb', '--card': '#ffffff', '--text': '#0b2a3c', '--muted': '#3d5f73', '--brand': '#0b6b8f', '--brand-text': '#ffffff', '--line': '#c2dcea', '--danger': '#b3261e', '--ok': '#1b6e3c', '--warn': '#8a4b00', '--ink': '#0b2a3c', '--seg': '#cfe6f1', '--segfill': '#0b6b8f', '--segfill2': '#6b3fa0', '--good': '#1b6e3c', '--tip': '#8a4b00', '--soft': '#e0f0f8', '--blue-soft': '#cfe6f1', '--orange': '#f57c00', '--on-orange': '#0b2a3c', '--orange-soft': '#ffe9d2', '--yellow': '#fbc02d', '--yellow-soft': '#fff3d6', '--amber-text': '#8a5200' } },
  { id: 'palette-twilight', vars: { '--bg': '#1a1530', '--card': '#251e45', '--text': '#f1ecff', '--muted': '#bdb2e0', '--brand': '#a99bff', '--brand-text': '#14102b', '--line': '#3a3166', '--danger': '#ff8a80', '--ok': '#6fdc9b', '--warn': '#ffc266', '--ink': '#f1ecff', '--seg': '#3a3166', '--segfill': '#a99bff', '--segfill2': '#ffb3e6', '--good': '#6fdc9b', '--tip': '#ffc266', '--soft': '#2e2655', '--blue-soft': '#3a3166', '--orange': '#ffa726', '--on-orange': '#14102b', '--orange-soft': '#3d2f4d', '--yellow': '#ffd54f', '--yellow-soft': '#3a3156', '--amber-text': '#ffcc66' } },
  { id: 'palette-candy', vars: { '--bg': '#fff0f6', '--card': '#ffffff', '--text': '#3d1030', '--muted': '#6e3a5c', '--brand': '#b3124f', '--brand-text': '#ffffff', '--line': '#f1c3d7', '--danger': '#b3261e', '--ok': '#1b6e3c', '--warn': '#8a4b00', '--ink': '#3d1030', '--seg': '#f8d6e5', '--segfill': '#b3124f', '--segfill2': '#6b3fa0', '--good': '#1b6e3c', '--tip': '#8a4b00', '--soft': '#ffe3ee', '--blue-soft': '#f8d6e5', '--orange': '#f57c00', '--on-orange': '#3d1030', '--orange-soft': '#ffe3cf', '--yellow': '#ffca28', '--yellow-soft': '#fff1c4', '--amber-text': '#8a4b00' } },
];
export const paletteById = (id: string): Palette | undefined => PALETTES.find((p) => p.id === id);

const lin = (c: number): number => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = (hex: string): number => {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * lin(((n >> 16) & 255) / 255) + 0.7152 * lin(((n >> 8) & 255) / 255) + 0.0722 * lin((n & 255) / 255);
};
/** WCAG contrast ratio between two #rrggbb colours. */
export const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};
