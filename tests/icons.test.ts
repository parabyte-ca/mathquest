import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { CHALLENGES } from '../shared/rewards.js';

// Icons are drawn in web/src/icons.tsx (inline SVG, no emoji fonts). Check every icon the pages ask for is drawn, that the server's emoji
// have a drawing, and that the install icons and theme colour match what the manifest promises.
const src = readFileSync('web/src/icons.tsx', 'utf8');
const names = (block: string): string[] => [...block.matchAll(/^\s{2}'?([\w-]+)'?: </gm)].map((m) => m[1]!);
const section = (from: string, to: string): string => src.slice(src.indexOf(from), src.indexOf(to));
const LINE = names(section('const LINE', 'export const ICON_NAMES'));
const FILLED = names(section('const FILLED', 'export const GLYPH_NAMES'));
const STRAND = names(section('const STRAND', 'export const STRAND_LETTERS'));

const files = (dir: string): string[] => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : f.endsWith('.tsx') ? [join(dir, f)] : []));
const pages = files('web/src').filter((f) => !f.endsWith('icons.tsx'));
const used = (re: RegExp): string[] => pages.flatMap((f) => [...readFileSync(f, 'utf8').matchAll(re)].map((m) => m[1]!));

describe('icons', () => {
  it('draws every line icon the pages use, and every filled icon', () => {
    expect(LINE.length).toBeGreaterThan(10);
    for (const n of used(/<Icon name="([\w-]+)"/g)) expect(LINE, n).toContain(n);
    for (const n of used(/<Glyph name="([\w-]+)"/g)) expect(FILLED, n).toContain(n);
  });
  it('has a topic icon for strands B to F', () => {
    expect(STRAND).toEqual(['B', 'C', 'D', 'E', 'F']);
  });
  it('replaces every challenge emoji with a drawing', () => {
    const map = src.slice(src.indexOf('const EMOJI_GLYPH'), src.indexOf('export function EmojiIcon'));
    for (const c of CHALLENGES) expect(map, `${c.id} ${c.icon}`).toContain(`'${c.icon}'`);
    for (const g of [...map.matchAll(/: '(\w+)'/g)].map((m) => m[1]!)) expect(FILLED, g).toContain(g);
  });
  it('is free of scripts, links and external images', () => {
    expect(src).not.toMatch(/<script|<image|href=|xlink|javascript:/i);
  });
  it('leaves no decorative emoji in the pages that now draw them', () => {
    for (const f of pages.filter((p) => /rewards|Practice|Caregiver|Progress/.test(p))) expect(readFileSync(f, 'utf8'), f).not.toMatch(/[🔥🧊⭐🎁✅🏡]/u);
  });
});

describe('install icons and colours', () => {
  const manifest = JSON.parse(readFileSync('web/public/manifest.webmanifest', 'utf8')) as { theme_color: string; icons: { src: string; sizes: string }[] };
  const size = (f: string): [number, number] => { const b = readFileSync(f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
  it('has a PNG of the size the manifest promises for each icon', () => {
    for (const i of manifest.icons) {
      const [w, h] = size(join('web/public', i.src));
      expect(`${w}x${h}`, i.src).toBe(i.sizes);
    }
    expect(size('web/public/icons/apple-touch-icon.png')).toEqual([180, 180]);
  });
  it('uses one theme colour in the manifest and the page', () => {
    expect(readFileSync('web/index.html', 'utf8')).toContain(`name="theme-color" content="${manifest.theme_color}"`);
    expect(manifest.theme_color).toBe('#1565c0');
  });
  it('has a favicon that shows the logo', () => {
    expect(readFileSync('web/public/favicon.svg', 'utf8')).toMatch(/<svg[\s\S]*<image href="data:image\/png;base64,/);
  });
});
