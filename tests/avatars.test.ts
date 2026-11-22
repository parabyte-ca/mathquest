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

describe('avatar frames', () => {
  const frames = COSMETICS.filter((x) => x.kind === 'frame');
  it('has "no frame" as the starting choice and draws every other frame', () => {
    expect(frames[0]!.id).toBe('frame-none');
    for (const c of frames.filter((x) => x.id !== 'frame-none')) expect(src, c.id).toContain(`'${c.id}':`);
  });
  it('only draws frames that exist', () => {
    const ids = new Set(frames.map((x) => x.id));
    for (const m of src.matchAll(/'(frame-[a-z]+)':/g)) expect(ids.has(m[1]!), m[1]).toBe(true);
  });
  it('unlocks by level or badge, with the first real frame early and the rocket trail for a long streak', () => {
    const by = Object.fromEntries(frames.map((f) => [f.id, f.unlock]));
    expect(by['frame-none']).toEqual({ level: 1 });
    expect(by['frame-blue']).toEqual({ level: 2 });
    expect(by['frame-rocket']).toEqual({ badge: 'streak-30' });
    const levels = ['frame-blue', 'frame-silver', 'frame-gold'].map((id) => (by[id] as { level: number }).level);
    expect([...levels].sort((a, b) => a - b)).toEqual(levels);
  });
});

describe('badge icons', () => {
  const icons = readFileSync('web/src/icons.tsx', 'utf8');
  it('draws every badge', async () => {
    const { BADGES } = await import('../shared/rewards.js');
    for (const b of BADGES) expect(icons, b.id).toMatch(new RegExp(`'?${b.id}'?:`));
  });
  it('is free of scripts, links and external images', () => {
    expect(icons).not.toMatch(/<script|<image|href=|xlink|javascript:/i);
  });
});
