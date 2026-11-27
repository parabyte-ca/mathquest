import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { COSMETICS } from '../shared/rewards.js';
import { BACKGROUNDS, backgroundById, backgroundUrl } from '../shared/backgrounds.js';

// Each palette a student can unlock has a tiled background drawn for it. They must stay quiet behind the content, be safe to inline,
// and be switched off by "Plain background" and by high contrast.

const paletteIds = COSMETICS.filter((c) => c.kind === 'palette').map((c) => c.id);
const svgOf = (id: string): string => decodeURIComponent(backgroundUrl(backgroundById(id)!).replace(/^url\("data:image\/svg\+xml,/, '').replace(/"\)$/, ''));

/** The opacity of each top-level shape in a tile, and how deep the nesting goes, read with a small tag walker. */
function topLevel(body: string): { tag: string; opacity: number | null }[] {
  const out: { tag: string; opacity: number | null }[] = [];
  let depth = 0;
  for (const m of body.matchAll(/<(\/?)([a-z]+)([^>]*?)(\/?)>/g)) {
    const [, close, tag, attrs, self] = m as unknown as [string, string, string, string, string];
    if (close) { depth--; continue; }
    if (depth === 0) out.push({ tag, opacity: /\sopacity="([\d.]+)"/.exec(attrs)?.[1] ? Number(/\sopacity="([\d.]+)"/.exec(attrs)![1]) : null });
    if (!self) depth++;
  }
  expect(depth, 'every tag is closed').toBe(0);
  return out;
}

describe('palette backgrounds', () => {
  it('has exactly one background for each palette, Classic included', () => {
    expect(paletteIds).toHaveLength(6);
    expect(BACKGROUNDS.map((b) => b.id).sort()).toEqual([...paletteIds].sort());
  });

  it('is drawn faint: every top-level shape has an opacity of 0.45 or less, so text keeps its checked contrast', () => {
    for (const b of BACKGROUNDS) {
      const shapes = topLevel(b.body);
      expect(shapes.length, b.id).toBeGreaterThan(3);
      for (const s of shapes) {
        expect(s.opacity, `${b.id} <${s.tag}> needs an opacity`).not.toBeNull();
        expect(s.opacity!, `${b.id} <${s.tag}>`).toBeLessThanOrEqual(0.45);
      }
    }
  });

  it('is a small, well-formed, self-contained SVG: no scripts, links, images or fonts fetched from anywhere', () => {
    for (const b of BACKGROUNDS) {
      const svg = svgOf(b.id);
      expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
      expect(svg).toContain(`width="${b.w}" height="${b.h}" viewBox="0 0 ${b.w} ${b.h}"`);
      expect(svg, b.id).not.toMatch(/<script|<image|<use|<foreignObject|href=|xlink|javascript:|url\(|@import|on\w+=/i);
      expect(svg.length, b.id).toBeLessThan(2500);
      expect(b.w).toBeGreaterThanOrEqual(120);
      expect(b.h).toBeGreaterThanOrEqual(120);
    }
  });

  it('draws the theme each palette is named for', () => {
    const has = (id: string, re: RegExp) => expect(backgroundById(id)!.body, id).toMatch(re);
    has('palette-forest', /M0 -44 L14 -22/); // pine trees
    has('palette-ocean', /q14 -14 28 0 t28 0/); // waves
    has('palette-twilight', /a14 14 0 1 0 10 22/); // a crescent moon
    has('palette-sunrise', /a16 16 0 0 1 32 0z/); // a sun on the horizon
    has('palette-candy', /height="26" rx="2" fill="#ba6b8c"/); // a lollipop stick
    has('palette-classic', />∑</); // maths symbols
  });
});

describe('where the background is applied', () => {
  const rewards = readFileSync('web/src/rewards.tsx', 'utf8');
  const css = readFileSync('web/src/style.css', 'utf8');
  it('is skipped in high contrast and with the plain-background setting, and always cleared first', () => {
    const fn = rewards.slice(rewards.indexOf('export function applyPalette'), rewards.indexOf('// ── the strip at the top'));
    expect(fn).toMatch(/removeAttribute\('data-pattern'\)/);
    expect(fn).toMatch(/if \(highContrast\) return;/);
    expect(fn).toMatch(/if \(b && !plainBackground\)/);
  });
  it('paints the pattern behind the page only, never on print or in high contrast', () => {
    expect(css).toMatch(/html\[data-pattern\] body \{[^}]*var\(--tile\)/);
    expect(css).toMatch(/@media print \{ html\[data-pattern\] body \{ background-image: none; \} \}/);
  });
  it('offers the setting in English and French', () => {
    for (const lang of ['en', 'fr']) {
      const j = JSON.parse(readFileSync(`web/src/locales/${lang}.json`, 'utf8')) as Record<string, string>;
      expect(j['settings.plain'], lang).toBeTruthy();
      expect(j['settings.plainHelp'], lang).toBeTruthy();
    }
  });
});
