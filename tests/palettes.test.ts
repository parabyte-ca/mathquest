import { describe, it, expect } from 'vitest';
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
      ['danger', v['--danger'], v['--card']], ['ok', v['--ok'], v['--card']], ['warn', v['--warn'], v['--card']],
    ];
    for (const [what, fg, bg] of need) expect(contrast(fg, bg), `${p.id} ${what} ${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
  });

  it('computes contrast the standard way', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrast('#777777', '#777777')).toBeCloseTo(1, 5);
  });
});
