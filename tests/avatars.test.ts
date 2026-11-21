import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { COSMETICS } from '../shared/rewards.js';
import { PALETTES } from '../shared/palettes.js';

// The avatars are drawn in web/src/avatars.tsx (inline SVG, no emoji fonts). Every avatar a student can unlock must have its drawing
// and its soft background colour, and every palette (but the built-in classic one) must be known to the swatch.
const src = readFileSync('web/src/avatars.tsx', 'utf8');

describe('avatars and palette swatches', () => {
  it('draws every avatar a student can unlock, with a background colour', () => {
    for (const c of COSMETICS.filter((x) => x.kind === 'avatar')) {
      expect(src.match(new RegExp(`'${c.id}':`, 'g'))?.length, `${c.id} needs a drawing and a background`).toBe(2);
    }
  });
  it('only draws avatars that exist', () => {
    const ids = new Set(COSMETICS.filter((x) => x.kind === 'avatar').map((x) => x.id));
    for (const m of src.matchAll(/'(avatar-[a-z]+)':/g)) expect(ids.has(m[1]!), m[1]).toBe(true);
  });
  it('shows a swatch for every unlockable palette, from the palette itself', () => {
    for (const c of COSMETICS.filter((x) => x.kind === 'palette' && x.id !== 'palette-classic')) expect(PALETTES.some((p) => p.id === c.id), c.id).toBe(true);
    expect(src).toContain("p?.vars['--bg']");
  });
  it('keeps each drawing small and free of scripts, links and external images', () => {
    expect(src).not.toMatch(/<script|<image|href=|xlink|javascript:/i);
  });
});
