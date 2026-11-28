import { test, expect, type Browser, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { db, openMenu, parentPage, studentId, studentOnNewDevice } from './helpers';

// iPad sizes in portrait and landscape (CSS pixels), and turning the iPad while a page is open. Every main page of the caregiver and
// student sides is checked for sideways scrolling, controls off the edge of the screen, touch targets under 44 px and inputs under 16 px
// (iPad Safari zooms the page when an input smaller than that gets focus). Set IPAD_SHOTS to a folder to keep a picture of each page.
// The student has the Golden Retro colour and its picture background equipped, the most demanding look for text staying readable.
// This is Chromium sized like an iPad, not Safari itself.
const IPADS = [
  { name: 'iPad mini', w: 744, h: 1133 },
  { name: 'iPad 10.2in', w: 810, h: 1080 },
  { name: 'iPad Air 11in', w: 820, h: 1180 },
  { name: 'iPad Pro 11in', w: 834, h: 1194 },
  { name: 'iPad Pro 12.9in', w: 1024, h: 1366 },
] as const;
const SHOTS = process.env.IPAD_SHOTS ?? '';

const audit = (page: Page): Promise<string[]> =>
  page.evaluate(() => {
    const out: string[] = [];
    const vw = innerWidth;
    if (document.documentElement.scrollWidth > vw + 1) out.push(`the page is ${document.documentElement.scrollWidth}px wide in a ${vw}px window`);
    const shown = (e: Element): boolean => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
    const scrolls = (e: Element): boolean => { for (let p = e.parentElement; p; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if ((o === 'auto' || o === 'scroll') && p.scrollWidth > p.clientWidth) return true; } return false; };
    const label = (e: Element): string => (e.getAttribute('aria-label') ?? (e as HTMLElement).innerText ?? e.id ?? e.tagName).toString().trim().slice(0, 40) || e.tagName.toLowerCase();
    const sel = 'button, a.btn, a.brand, .navsheet a, input:not([type=hidden]), select, textarea, summary, [role=button]';
    for (const e of Array.from(document.querySelectorAll(sel))) {
      if (!shown(e)) continue;
      const r = e.getBoundingClientRect();
      if (!scrolls(e) && (r.right > vw + 1 || r.left < -1)) out.push(`off the edge of the screen: ${label(e)} (${Math.round(r.left)} to ${Math.round(r.right)} of ${vw})`);
      const box = e instanceof HTMLInputElement && (e.type === 'checkbox' || e.type === 'radio') ? (e.closest('label') ?? e) : e;
      const b = box.getBoundingClientRect();
      const sr = e.classList.contains('sr') || (e.parentElement?.classList.contains('filebtn') ?? false);
      if (!sr && (b.height < 43.5 || b.width < 43.5) && !(e instanceof HTMLInputElement && e.type === 'range')) out.push(`touch target ${Math.round(b.width)}x${Math.round(b.height)}: ${label(e)}`);
      if ((e instanceof HTMLInputElement && !['checkbox', 'radio', 'range', 'file', 'button', 'submit'].includes(e.type)) || e instanceof HTMLSelectElement || e instanceof HTMLTextAreaElement) {
        const fs = parseFloat(getComputedStyle(e).fontSize);
        if (fs < 16) out.push(`text smaller than 16px (${fs}px) in a field iPad zooms into: ${label(e)}`);
      }
    }
    // with a picture behind the page, text must sit on something solid, never straight on the picture
    if (document.documentElement.getAttribute('data-pattern') === 'palette-retro') {
      const solid = (e: Element): boolean => {
        for (let p: Element | null = e; p && p !== document.documentElement; p = p.parentElement) {
          const m = /rgba?\(([^)]+)\)/.exec(getComputedStyle(p).backgroundColor);
          const alpha = m ? (m[1]!.split(',').length > 3 ? Number(m[1]!.split(',')[3]) : 1) : 0;
          if (alpha >= 0.9 && p !== document.body) return true;
        }
        return false;
      };
      for (const e of Array.from(document.querySelectorAll('body *'))) {
        const own = Array.from(e.childNodes).some((n) => n.nodeType === 3 && (n.textContent ?? '').trim().length > 0);
        if (own && shown(e) && !solid(e)) out.push(`text straight on the picture: "${((e as HTMLElement).innerText ?? '').trim().slice(0, 40)}"`);
      }
    }
    return out;
  });

type Pages = { parent: Page; admin: Page; kid: Page; sid: string };
let pages: Pages;
const allProblems: string[] = []; // every finding from every size, reported together by the last test

test.describe.configure({ mode: 'serial' });

async function setUp(browser: Browser, baseURL: string): Promise<Pages> {
  const parent = await parentPage(browser, baseURL, 'interactive-tablet@e2e.test');
  const admin = await parentPage(browser, baseURL, 'admin-tablet@e2e.test');
  const username = 'ipad_a';
  const kid = await studentOnNewDevice(browser, baseURL, parent, { username, grade: 5 });
  // a brother or sister, so the "who is practising?" page has two tiles
  await parent.goto('/app');
  await parent.getByLabel('Display name').fill('Alex');
  await parent.getByLabel(/^Username/).fill('ipad_b');
  await parent.getByLabel('4-digit PIN').fill('1357');
  await parent.getByLabel('Grade').selectOption('5');
  await parent.getByRole('button', { name: 'Create student' }).click();
  await expect(parent.getByText('@ipad_b')).toBeVisible();
  const d = db();
  const sid = studentId(username);
  d.prepare("INSERT OR IGNORE INTO tour_seen (subject_kind, subject_id, tour, seen_at) VALUES ('student', ?, 'student', ?)").run(studentId('ipad_b'), Date.now());
  // level 6 with the Golden Retro colour on
  d.prepare("UPDATE reward_state SET xp = 1600, palette = 'palette-retro' WHERE student_id = ?").run(sid);
  d.close();
  for (const p of [parent, admin, kid]) p.setDefaultTimeout(20_000);
  return { parent, admin, kid, sid };
}

test.beforeAll(async ({ browser, baseURL }, info) => {
  if (info.project.name !== 'tablet') return; // sizes are set inside the tests, so it runs once
  pages = await setUp(browser, baseURL!);
});

const look = async (page: Page, view: string, vp: string, problems: string[]): Promise<void> => {
  await page.waitForTimeout(250);
  for (const p of await audit(page)) problems.push(`${vp} · ${view}: ${p}`);
  if (SHOTS) {
    mkdirSync(SHOTS, { recursive: true });
    await page.screenshot({ path: join(SHOTS, `${vp.replace(/[^a-z0-9]+/gi, '-')}-${view.replace(/[^a-z0-9]+/gi, '-')}.png`) });
  }
};

for (const d of IPADS) {
  for (const orient of ['portrait', 'landscape'] as const) {
    const vp = `${d.name} ${orient} ${orient === 'portrait' ? d.w : d.h}x${orient === 'portrait' ? d.h : d.w}`;
    test(vp, async ({}, info) => {
      test.skip(info.project.name !== 'tablet', 'runs once');
      test.setTimeout(240_000);
      const { parent, admin, kid, sid } = pages;
      const problems: string[] = [];
      const size = orient === 'portrait' ? { width: d.w, height: d.h } : { width: d.h, height: d.w };
      for (const p of [parent, admin, kid]) await p.setViewportSize(size);

      // caregiver side
      await parent.goto('/app');
      await expect(parent.getByRole('heading', { name: 'Your students', exact: true })).toBeVisible();
      await look(parent, 'caregiver home', vp, problems);
      await parent.goto(`/app/progress?student=${sid}`);
      await expect(parent.getByRole('heading', { name: 'Certificates' })).toBeVisible();
      await look(parent, 'caregiver progress', vp, problems);
      await parent.goto(`/app/worksheet?student=${sid}&focus=G5.C2.3&tier=mixed&count=10&seed=11`);
      await expect(parent.getByRole('heading', { name: 'Your worksheet is ready' })).toBeVisible();
      await look(parent, 'worksheet', vp, problems);
      await parent.getByRole('button', { name: 'Enter answers' }).click();
      await expect(parent.getByRole('heading', { name: /^Question 1 of/ })).toBeVisible();
      await look(parent, 'worksheet answer entry', vp, problems);
      await admin.goto('/app/admin');
      await expect(admin.getByRole('heading', { name: 'Updates', exact: true })).toBeVisible();
      await look(admin, 'admin', vp, problems);
      await openMenu(admin);
      await look(admin, 'menu open', vp, problems);

      // student side
      await kid.context().clearCookies({ name: 'mq_session' });
      await kid.goto('/app/student');
      await expect(kid.getByRole('heading', { name: 'Who is practising?' })).toBeVisible();
      await look(kid, 'who is practising', vp, problems);
      await kid.getByRole('button', { name: /Robin/ }).click();
      await kid.getByLabel('4-digit PIN').fill('4821');
      await kid.getByRole('button', { name: 'Sign in' }).click();
      await expect(kid.getByRole('heading', { name: 'Welcome, Robin!' })).toBeVisible();
      await look(kid, 'student home', vp, problems);
      await openMenu(kid);
      await look(kid, 'student menu', vp, problems);
      await kid.keyboard.press('Escape');
      await kid.getByLabel('Mix it up').uncheck().catch(() => undefined);
      await kid.getByRole('checkbox', { name: /^B\./ }).check();
      await kid.getByRole('button', { name: 'Start practice' }).click();
      await expect(kid.locator('form.answer')).toBeVisible();
      await look(kid, 'practice', vp, problems);
      const keyboard = kid.getByRole('button', { name: 'Math keyboard' });
      if (await keyboard.count()) {
        await keyboard.click();
        await look(kid, 'practice with keyboard', vp, problems);
      }
      for (const [path, heading] of [['/app/learn/map', null], ['/app/learn/rewards', null], ['/app/learn/settings', null], ['/app/learn/lesson?id=L.fractions.naming', /Fractions: naming/]] as const) {
        await kid.goto(path);
        if (heading) await expect(kid.getByRole('heading', { name: heading })).toBeVisible();
        await look(kid, path.split('/').slice(2).join(' ').replace(/[?=.]/g, ' '), vp, problems);
      }
      allProblems.push(...problems);
    });
  }
}

test('turning the iPad with a page open: what was typed stays, and the layout follows', async ({}, info) => {
  test.skip(info.project.name !== 'tablet', 'runs once');
  test.setTimeout(240_000);
  const { kid } = pages;
  const problems: string[] = [];
  const turn = IPADS[1];
  await kid.setViewportSize({ width: turn.w, height: turn.h });
  await kid.goto('/app/learn');
  await kid.getByLabel('Mix it up').uncheck().catch(() => undefined);
  await kid.getByRole('checkbox', { name: /^B\./ }).check();
  await kid.getByRole('button', { name: 'Start practice' }).click();
  await expect(kid.locator('form.answer')).toBeVisible();
  const field = kid.locator('#ans');
  const typed = (await field.count()) > 0;
  if (typed) await field.fill('37');
  for (const size of [{ width: turn.h, height: turn.w }, { width: turn.w, height: turn.h }, { width: turn.h, height: turn.w }]) {
    await kid.setViewportSize(size);
    await kid.waitForTimeout(300);
    await expect(kid.locator('form.answer')).toBeVisible();
    if (typed) await expect(field).toHaveValue('37');
    for (const p of await audit(kid)) problems.push(`turning to ${size.width}x${size.height} · practice: ${p}`);
  }
  await openMenu(kid);
  await kid.setViewportSize({ width: turn.w, height: turn.h });
  const sheet = await kid.locator('#nav-sheet').boundingBox();
  if (sheet && (sheet.x < 0 || sheet.x + sheet.width > turn.w)) problems.push(`the open menu runs off the screen after turning (${Math.round(sheet.x)} to ${Math.round(sheet.x + sheet.width)} of ${turn.w})`);
  allProblems.push(...problems);
});

test('every size and turning the iPad: nothing off the screen, nothing too small to tap', async ({}, info) => {
  test.skip(info.project.name !== 'tablet', 'runs once');
  expect([...new Set(allProblems)]).toEqual([]);
});
