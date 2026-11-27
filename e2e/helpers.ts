import { expect, type Browser, type Page } from '@playwright/test';
import Database from 'better-sqlite3';
import { join } from 'node:path';
import type { Item } from '../shared/items/types';

export const MOCK = `http://127.0.0.1:${process.env.MOCK_PORT ?? 18788}`;
export const DB_PATH = join(process.cwd(), 'test-results', 'e2e', 'data', 'mathquest.db');
type Mail = { to: string[]; subject: string; text: string };

// The app trusts X-Forwarded-For from the local proxy, so each test context can present its own client IP
// and the per-IP rate limits (which stay on) are exercised per "device" rather than across the whole suite.
let ipCounter = 0;
export const uniqueIp = (): string => `10.77.${Math.floor(++ipCounter / 250)}.${(ipCounter % 250) + 1}`;


export async function waitForMail(to: string): Promise<Mail> {
  for (let i = 0; i < 50; i++) {
    const outbox = (await (await fetch(`${MOCK}/outbox`)).json()) as Mail[];
    const m = outbox.filter((x) => x.to.includes(to)).at(-1);
    if (m) return m;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`no email for ${to}`);
}

/** Real caregiver sign-in through the mocked Resend outbox. */
export async function signInCaregiver(page: Page, email: string): Promise<void> {
  await fetch(`${MOCK}/outbox`, { method: 'DELETE' });
  await page.goto('/app');
  await page.getByLabel('Email address').fill(email);
  await page.getByRole('button', { name: 'Send sign-in link' }).click();
  await expect(page.getByText('a sign-in link is on its way')).toBeVisible();
  const link = /(http:\/\/\S+\/app\/verify\?token=[\w-]+)/.exec((await waitForMail(email)).text)![1]!;
  await page.goto(link);
  await expect(page.getByRole('heading', { name: 'Your students', exact: true })).toBeVisible();
}

/** Creates a student as the caregiver and signs them in on a fresh "device" (approved with a pairing code). */
export async function studentOnNewDevice(browser: Browser, baseURL: string, parent: Page, opts: { username: string; grade: number; language?: 'en' | 'fr'; addInit?: () => void; tour?: boolean }): Promise<Page> {
  await parent.getByLabel('Display name').fill('Robin');
  await parent.getByLabel(/^Username/).fill(opts.username);
  await parent.getByLabel('4-digit PIN').fill('4821');
  await parent.getByLabel('Grade').selectOption(String(opts.grade));
  await parent.getByRole('button', { name: 'Create student' }).click();
  await expect(parent.getByText(`@${opts.username}`)).toBeVisible();
  if (!opts.tour) { // the student's first-run tour would sit on top of the page under test; the tour spec asks for it
    const d = db();
    d.prepare("INSERT OR IGNORE INTO tour_seen (subject_kind, subject_id, tour, seen_at) VALUES ('student', ?, 'student', ?)").run(studentId(opts.username), Date.now());
    d.close();
  }

  const ctx = await browser.newContext({ baseURL, extraHTTPHeaders: { 'x-forwarded-for': uniqueIp() } });
  const kid = await ctx.newPage();
  const problems: string[] = [];
  pageProblems.set(kid, problems);
  kid.on('console', (m) => { if (/Content Security Policy|Refused to (load|apply|execute|connect)/i.test(m.text())) problems.push(m.text()); });
  kid.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  if (opts.addInit) await kid.addInitScript(opts.addInit);
  await kid.goto('/app/student');
  await kid.getByRole('button', { name: 'Get a code' }).click();
  const code = (await kid.locator('.code').innerText()).trim();
  await parent.getByLabel("Code shown on the student's device").fill(code);
  await parent.getByRole('button', { name: 'Approve device' }).click();
  await expect(parent.getByText('Device approved.')).toBeVisible();
  await expect(kid.getByLabel('Username')).toBeVisible({ timeout: 15_000 });
  await kid.getByLabel('Username').fill(opts.username);
  await kid.getByLabel('4-digit PIN').fill('4821');
  await kid.getByRole('button', { name: 'Sign in' }).click();
  await expect(kid.getByRole('heading', { name: 'Welcome, Robin!' })).toBeVisible();
  return kid;
}

/** Console messages that mean the strict Content Security Policy blocked something, or the page threw. */
export const pageProblems = new WeakMap<Page, string[]>();

export const noHorizontalScroll = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

// ── test oracle: the answer to the item on screen, read from the test database ──────────────

export function db(): Database.Database {
  return new Database(DB_PATH, { fileMustExist: true });
}

export function currentItem(username: string): { id: string; item: Item } {
  const d = db();
  try {
    const s = d.prepare('SELECT id FROM students WHERE username = ?').get(username) as { id: string };
    const row = d.prepare('SELECT id, item_json FROM pending_item WHERE student_id = ? ORDER BY rowid DESC LIMIT 1').get(s.id) as { id: string; item_json: string };
    return { id: row.id, item: JSON.parse(row.item_json) as Item };
  } finally {
    d.close();
  }
}

export const studentId = (username: string): string => {
  const d = db();
  try { return (d.prepare('SELECT id FROM students WHERE username = ?').get(username) as { id: string }).id; } finally { d.close(); }
};

async function clickPoint(page: Page, x: number, y: number, size: number) {
  const svg = page.locator('svg.plane');
  await svg.scrollIntoViewIfNeeded();
  const box = (await svg.boundingBox())!;
  const pad = 28, u = 36, w = pad * 2 + size * u;
  await page.mouse.click(box.x + ((pad + x * u) / w) * box.width, box.y + ((pad + (size - y) * u) / w) * box.height);
}

/** Fills the answer area for the item on screen. `right` picks the correct answer, otherwise a wrong one. Returns false for formats this helper does not drive. */
export async function fillAnswer(page: Page, item: Item, right: boolean): Promise<boolean> {
  const a = item.answer;
  switch (a.kind) {
    case 'number': await page.locator('#ans').fill(right ? String(a.value) : '987654'); return true;
    case 'fraction': await page.locator('#fn').fill(right ? String(a.n) : '999'); await page.locator('#fd').fill(right ? String(a.d) : '1'); return true;
    case 'mixed': await page.locator('#fw').fill(right ? String(a.whole) : '99'); await page.locator('#fn').fill(right ? String(a.n) : '1'); await page.locator('#fd').fill(right ? String(a.d) : '2'); return true;
    case 'choice': await page.locator('label.choice').nth(right ? a.index : (a.index + 1) % item.options!.length).click(); return true;
    case 'multi': for (const i of right ? a.indices : [0, 1, 2, 3].filter((x) => !a.indices.includes(x)).slice(0, 1)) await page.locator('label.choice').nth(i).click(); return true;
    case 'point': {
      const size = (item.visual as { size: number }).size;
      if (right) await clickPoint(page, a.x, a.y, size); else await clickPoint(page, 0, 0, size);
      return true;
    }
    default: return false;
  }
}

const lastAnswered = new Map<string, string>();

/** Waits until a question that has not been answered yet is on screen (and in the database). */
export async function waitForNewItem(page: Page, username: string): Promise<{ id: string; item: Item }> {
  await expect.poll(() => { try { const c = currentItem(username); return c.id !== lastAnswered.get(username) ? c.id : ''; } catch { return ''; } }, { timeout: 15_000 }).not.toBe('');
  const cur = currentItem(username);
  await expect(page.locator(`form.answer[data-item="${cur.id}"]`)).toBeVisible();
  return cur;
}

/** Answers the item currently on screen using the oracle, then presses Check. */
export async function answerCurrent(page: Page, username: string, right: boolean): Promise<Item> {
  const { id, item } = await waitForNewItem(page, username);
  const driven = await fillAnswer(page, item, right);
  if (!driven) throw new Error(`format ${item.format} is not driven by this helper`);
  await page.getByRole('button', { name: 'Check' }).click();
  lastAnswered.set(username, id);
  await expect(page.locator('.feedback')).toBeVisible();
  return item;
}

const parentState = new Map<string, Awaited<ReturnType<import('@playwright/test').BrowserContext['storageState']>>>();

/** A signed-in caregiver page. The magic-link sign-in happens once per caregiver; later tests reuse the session. */
export async function parentPage(browser: Browser, baseURL: string, email: string): Promise<Page> {
  const known = parentState.get(email);
  const ctx = await browser.newContext({ baseURL, storageState: known, extraHTTPHeaders: { 'x-forwarded-for': uniqueIp() } });
  const page = await ctx.newPage();
  if (known) {
    await page.goto('/app');
    await expect(page.getByRole('heading', { name: 'Your students', exact: true })).toBeVisible();
  } else {
    await signInCaregiver(page, email);
    parentState.set(email, await ctx.storageState());
  }
  return page;
}

/** Opens the header menu (Help, Language, Sign out, Install) if it is not open yet. */
export async function openMenu(page: Page): Promise<void> {
  const button = page.getByRole('button', { name: 'Menu', exact: true });
  if ((await button.getAttribute('aria-expanded')) !== 'true') await button.click();
  await expect(page.getByRole('button', { name: 'Menu', exact: true })).toHaveAttribute('aria-expanded', 'true');
  // focus moves to the first item once the sheet is ready (its Escape and tap-outside listeners are attached in the same step)
  await expect(page.locator('#nav-sheet :focus')).toHaveCount(1);
}
