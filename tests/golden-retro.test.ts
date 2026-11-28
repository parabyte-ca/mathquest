import { describe, it, expect } from 'vitest';
import { readFileSync, statSync } from 'node:fs';
import Database from 'better-sqlite3';
import { makeEnv, makeStudent } from './helpers.js';
import { COSMETICS, isUnlocked, levelInfo, xpToReach } from '../shared/rewards.js';
import { IMAGE_BACKGROUNDS, imageBackgroundById } from '../shared/backgrounds.js';
import { paletteById, contrast } from '../shared/palettes.js';
import { migrate } from '../server/db.js';

// Golden Retro is a new colour at level 6 with a picture background held still behind the page, and the Axolotl is a new avatar at level 9.
// Ocean, Twilight and Candy moved up the ladder, and nobody loses a colour they already had.

const level = (id: string): number => (COSMETICS.find((c) => c.id === id)!.unlock as { level: number }).level;

describe('the ladder', () => {
  it('puts Golden Retro after Forest, moves the colours after it up two levels, and ends with Candy at 12', () => {
    const colours = COSMETICS.filter((c) => c.kind === 'palette').map((c) => [c.id, level(c.id)]);
    expect(colours).toEqual([['palette-classic', 1], ['palette-sunrise', 2], ['palette-forest', 4], ['palette-retro', 6], ['palette-ocean', 8], ['palette-twilight', 10], ['palette-candy', 12]]);
    const retro = COSMETICS.find((c) => c.id === 'palette-retro')!;
    expect(retro.name).toEqual({ en: 'Golden Retro', fr: 'Rétro doré' });
  });

  it('gives the Axolotl level 9, which had no avatar, and does not move any other avatar or frame', () => {
    expect(level('avatar-axolotl')).toBe(9);
    expect(COSMETICS.filter((c) => c.kind === 'avatar' && 'level' in c.unlock).map((c) => [c.id, level(c.id)])).toEqual([
      ['avatar-fox', 1], ['avatar-panda', 1], ['avatar-owl', 2], ['avatar-octopus', 3], ['avatar-butterfly', 4], ['avatar-dolphin', 5], ['avatar-unicorn', 7], ['avatar-axolotl', 9], ['avatar-dragon', 10],
    ]);
    expect(COSMETICS.filter((c) => c.kind === 'frame' && 'level' in c.unlock).map((c) => level(c.id))).toEqual([1, 2, 5, 9]);
  });

  it('has the palette, its picture and the avatar drawn', () => {
    expect(paletteById('palette-retro')).toBeTruthy();
    expect(contrast(paletteById('palette-retro')!.vars['--text'], paletteById('palette-retro')!.vars['--card'])).toBeGreaterThan(10);
    expect(imageBackgroundById('palette-retro')!.url).toBe('/backgrounds/golden-retro.webp');
    const avatars = readFileSync('web/src/avatars.tsx', 'utf8');
    expect(avatars).toMatch(/'avatar-axolotl': \(/);
    expect(avatars).toMatch(/'avatar-axolotl': '#[0-9a-f]{6}'/);
  });
});

describe('the picture', () => {
  it('is a small WebP file of the app, so nothing is fetched from anywhere else', () => {
    const f = `web/public${IMAGE_BACKGROUNDS[0]!.url}`;
    expect(statSync(f).size).toBeLessThan(250_000);
    const head = readFileSync(f).subarray(0, 12);
    expect(head.subarray(0, 4).toString('latin1')).toBe('RIFF');
    expect(head.subarray(8, 12).toString('latin1')).toBe('WEBP');
  });

  const css = readFileSync('web/src/style.css', 'utf8');
  it('is held still by a fixed layer, as tall as the screen with its pattern repeating sideways, behind everything and not on print', () => {
    const rule = /html\[data-pattern='palette-retro'\] body::before \{([^}]*)\}/.exec(css)![1]!;
    expect(rule).toMatch(/position: fixed/);
    expect(rule).toMatch(/inset: 0/);
    expect(rule).toMatch(/z-index: -1/);
    expect(rule).toMatch(/pointer-events: none/);
    expect(rule).toMatch(/repeat-x center top \/ auto 100%/);
    expect(rule).not.toMatch(/background-attachment/); // iPad Safari ignores it
    expect(css).toMatch(/@media print \{ html\[data-pattern='palette-retro'\] body::before \{ display: none; \} \}/);
  });

  it('is switched off by the Plain background setting and by high contrast, like the tiled ones', () => {
    const rewards = readFileSync('web/src/rewards.tsx', 'utf8');
    const fn = rewards.slice(rewards.indexOf('export function applyPalette'), rewards.indexOf('// ── the strip at the top'));
    expect(fn).toMatch(/if \(highContrast\) return;/);
    expect(fn).toMatch(/if \(imageBackgroundById\(id\) && !plainBackground\) el\.setAttribute\('data-pattern', id\)/);
  });

  it('is kept for offline use once seen', () => {
    expect(readFileSync('web/public/sw.js', 'utf8')).toMatch(/startsWith\('\/backgrounds\/'\)/);
  });
});

describe('keeping what students already have', () => {
  it('records the colours a student had before the move, by the old levels, and nothing else', () => {
    const db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    migrate(db, 16);
    db.prepare("INSERT INTO users (id, email, role, status, created_at) VALUES ('u1','a@x.ca','caregiver','active','2026-01-01')").run();
    const stu = db.prepare("INSERT INTO students (id, username, display_name, pin_hash, grade, created_by, created_at) VALUES (?,?,?,?,?, 'u1','2026-01-01')");
    const rs = db.prepare('INSERT INTO reward_state (student_id, xp) VALUES (?, ?)');
    // the old levels were 6 (Ocean), 8 (Twilight) and 10 (Candy)
    for (const [id, xp] of [['a', xpToReach(6) - 1], ['b', xpToReach(6)], ['c', xpToReach(8)], ['d', xpToReach(10)], ['e', 0]] as const) { stu.run(id, `kid_${id}`, id, 'h', 5); rs.run(id, xp); }
    migrate(db);
    const kept = (id: string): string[] => (db.prepare('SELECT cosmetic_id FROM cosmetic_kept WHERE student_id = ? ORDER BY cosmetic_id').all(id) as { cosmetic_id: string }[]).map((r) => r.cosmetic_id);
    expect(kept('a')).toEqual([]);
    expect(kept('b')).toEqual(['palette-ocean']);
    expect(kept('c')).toEqual(['palette-ocean', 'palette-twilight']);
    expect(kept('d')).toEqual(['palette-candy', 'palette-ocean', 'palette-twilight']);
    expect(kept('e')).toEqual([]);
    db.prepare("DELETE FROM students WHERE id = 'd'").run();
    expect(kept('d')).toEqual([]); // goes with the student
  });

  it('keeps those colours unlocked and equippable, and locks the rest by the new levels', async () => {
    const env = makeEnv();
    const s = await makeStudent(env);
    await s.agent.get('/api/learn/rewards').expect(200); // makes the student's reward row
    // a student at the old level 8 (2,800 XP): now level 7, so Ocean would be locked again without the record
    env.db.prepare('UPDATE reward_state SET xp = ? WHERE student_id = ?').run(xpToReach(8), s.studentId);
    expect(levelInfo(xpToReach(8)).level).toBe(8);
    env.db.prepare('UPDATE reward_state SET xp = ? WHERE student_id = ?').run(xpToReach(8) - 1, s.studentId); // level 7: below the new Ocean (8)
    const locked = (await s.agent.get('/api/learn/rewards').expect(200)).body.cosmetics as { id: string; unlocked: boolean }[];
    expect(locked.find((c) => c.id === 'palette-ocean')!.unlocked).toBe(false);
    expect(locked.find((c) => c.id === 'palette-retro')!.unlocked).toBe(true);
    await s.agent.post('/api/learn/rewards/equip').set('x-csrf-token', s.csrf).send({ id: 'palette-ocean' }).expect(403);
    env.db.prepare("INSERT INTO cosmetic_kept (student_id, cosmetic_id) VALUES (?, 'palette-ocean')").run(s.studentId);
    const kept = (await s.agent.get('/api/learn/rewards').expect(200)).body.cosmetics as { id: string; unlocked: boolean }[];
    expect(kept.find((c) => c.id === 'palette-ocean')!.unlocked).toBe(true);
    expect(kept.find((c) => c.id === 'palette-twilight')!.unlocked).toBe(false);
    await s.agent.post('/api/learn/rewards/equip').set('x-csrf-token', s.csrf).send({ id: 'palette-ocean' }).expect(200);
  });

  it('treats a kept colour as already unlocked, so reaching its new level announces nothing', () => {
    const c = COSMETICS.find((x) => x.id === 'palette-ocean')!;
    expect(isUnlocked(c, 5, new Set())).toBe(false);
    expect(isUnlocked(c, 5, new Set(), new Set(['palette-ocean']))).toBe(true);
    expect(isUnlocked(c, 8, new Set())).toBe(true);
  });
});
