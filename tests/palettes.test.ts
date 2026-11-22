import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { COSMETICS } from '../shared/rewards.js';
import { PALETTES, contrast, paletteById } from '../shared/palettes.js';

describe('palettes', () => {
  it('has a palette for every palette cosmetic except the default', () => {
    const ids = COSMETICS.filter((c) => c.kind === 'palette' && c.id !== 'palette-classic').map((c) => c.id).sort();
    expect(PALETTES.map((p) => p.id).sort()).toEqual(ids);
    expect(paletteById('palette-classic')).toBeUndefined();
  });

  it.each(PALETTES.map((p) => [p.id, p] as const))('%s meets WCAG AA (4.5:1) for text, buttons, links and status colours', (_id, p) => {
    const v = p.vars;
    const need: [string, string, string][] = [
      ['text', v['--text'], v['--bg']], ['text', v['--text'], v['--card']],
      ['muted', v['--muted'], v['--bg']], ['muted', v['--muted'], v['--card']],
      ['button', v['--brand-text'], v['--brand']],
      ['link', v['--brand'], v['--card']], ['link', v['--brand'], v['--bg']],
      ['text on soft', v['--text'], v['--soft']], ['ink', v['--ink'], v['--card']], ['ink on soft', v['--ink'], v['--soft']],
      ['good', v['--good'], v['--soft']], ['good', v['--good'], v['--card']], ['tip', v['--tip'], v['--soft']], ['tip', v['--tip'], v['--card']],
      ['on orange', v['--on-orange'], v['--orange']], ['text on orange tint', v['--text'], v['--orange-soft']], ['amber text', v['--amber-text'], v['--orange-soft']], ['amber text', v['--amber-text'], v['--card']],
      ['on yellow', v['--on-orange'], v['--yellow']], ['text on yellow tint', v['--text'], v['--yellow-soft']], ['amber text', v['--amber-text'], v['--yellow-soft']], ['text on blue tint', v['--text'], v['--blue-soft']], ['link on blue tint', v['--brand'], v['--blue-soft']],
      ['danger', v['--danger'], v['--card']], ['ok', v['--ok'], v['--card']], ['warn', v['--warn'], v['--card']],
    ];
    for (const [what, fg, bg] of need) expect(contrast(fg, bg), `${p.id} ${what} ${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
  });

  it('computes contrast the standard way', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrast('#777777', '#777777')).toBeCloseTo(1, 5);
  });

  // The base (Classic) look lives in style.css, in a light block and a dark one. Both must pass for every pair the app uses.
  const css = readFileSync('web/src/style.css', 'utf8');
  const block = (re: RegExp): Record<string, string> => Object.fromEntries([...(re.exec(css)![1]!).matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1]!, m[2]!]));
  const light = block(/:root \{([^}]*)\}/);
  const dark = { ...light, ...block(/prefers-color-scheme: dark\) \{\s*:root \{([^}]*)\}/) };
  it.each([['light', light], ['dark', dark]] as const)('the brand colours in %s mode pass AA for the pairs the app uses', (_n, v) => {
    const pairs: [string, string, string][] = [
      ['text', v['--text']!, v['--bg']!], ['text', v['--text']!, v['--card']!], ['muted', v['--muted']!, v['--card']!],
      ['button', v['--brand-text']!, v['--brand']!], ['link', v['--brand']!, v['--card']!], ['link', v['--brand']!, v['--bg']!], ['link on tint', v['--brand']!, v['--blue-soft']!],
      ['on orange', v['--on-orange']!, v['--orange']!], ['text on orange tint', v['--text']!, v['--orange-soft']!], ['amber text', v['--amber-text']!, v['--orange-soft']!], ['amber text', v['--amber-text']!, v['--card']!],
      ['text on yellow tint', v['--text']!, v['--yellow-soft']!], ['amber text', v['--amber-text']!, v['--yellow-soft']!],
    ];
    for (const [what, fg, bg] of pairs) expect(contrast(fg, bg), `${_n} ${what} ${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
    if (_n === 'light') expect(contrast('#ffffff', v['--orange']!)).toBeLessThan(4.5); // why the text on orange is navy, not white
  });

  it('every palette defines every variable the base defines for orange, yellow and the tints', () => {
    for (const p of PALETTES) for (const k of ['--orange', '--on-orange', '--orange-soft', '--yellow', '--yellow-soft', '--amber-text', '--blue-soft']) expect(p.vars[k as keyof typeof p.vars], `${p.id} ${k}`).toMatch(/^#[0-9a-f]{6}$/);
  });
});
