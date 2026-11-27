import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { generate } from '../shared/generators/index';
import { db, fillAnswer, noHorizontalScroll, openMenu, pageProblems, signInCaregiver, studentId, studentOnNewDevice } from './helpers';

test('the app can be installed, keeps its shell offline, says so politely, and never stores API data', async ({ page, context }) => {
  const problems: string[] = [];
  page.on('console', (m) => { if (/Content Security Policy|Refused to (load|apply|execute|connect)/i.test(m.text())) problems.push(m.text()); });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));

  // installable: the manifest is linked and valid, with icons that load
  await page.goto('/app');
  await expect(page.getByRole('button', { name: 'Send sign-in link' })).toBeVisible();
  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(manifestHref).toBe('/manifest.webmanifest');
  const manifest = await (await page.request.get('/manifest.webmanifest')).json() as { icons: { src: string }[]; start_url: string };
  expect(manifest.start_url).toBe('/app');
  for (const icon of manifest.icons) expect((await page.request.get(icon.src)).status()).toBe(200);

  // the worker takes over and keeps the shell and the built scripts
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(async () => !!(await caches.match('/app')) && !!(await caches.match('/offline.html')))).toBe(true);
  expect(await page.evaluate(async () => (await (await fetch('/asset-manifest.json')).json() as { files: string[] }).files.length)).toBeGreaterThan(5);
  await expect.poll(() => page.evaluate(async () => (await caches.match((await (await fetch('/asset-manifest.json')).json() as { files: string[] }).files[0]!)) !== undefined)).toBe(true);

  // offline: an app page still opens from the shell, with a notice; the plain offline page covers everything else
  await context.setOffline(true);
  await page.goto('/app/learn');
  await expect(page.getByRole('status').filter({ hasText: 'You are offline' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send sign-in link' })).toBeVisible();
  const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(scan.violations.map((v) => `${v.id}: ${v.nodes[0]?.html.slice(0, 120)}`)).toEqual([]);
  await noHorizontalScroll(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'You are offline' })).toBeVisible();
  await expect(page.getByText('Vous êtes hors ligne')).toBeVisible();

  // the API is never answered from the worker
  const api = await page.evaluate(() => fetch('/api/me').then((r) => r.status).catch(() => 'network error'));
  expect(api).toBe('network error');

  // back online: the notice goes away
  await context.setOffline(false);
  await page.goto('/app');
  await expect(page.getByRole('button', { name: 'Send sign-in link' })).toBeVisible();
  await expect(page.getByText('You are offline. You can look around')).toHaveCount(0);

  // nothing from the API was kept
  const kept = await page.evaluate(async () => {
    const urls: string[] = [];
    for (const name of await caches.keys()) for (const r of await (await caches.open(name)).keys()) urls.push(new URL(r.url).pathname);
    return urls;
  });
  expect(kept.some((u) => u.startsWith('/api/'))).toBe(false);
  expect(kept).toContain('/app');
  expect(problems).toEqual([]);
});

test('offline practice: download a pack, practice with no connection, and the answers count once back online', async ({ page, browser, baseURL }, info) => {
  await signInCaregiver(page, `offline-${info.project.name}@e2e.test`);
  const username = `off_${info.project.name}_${Math.floor(Date.now() / 1000).toString(36)}`;
  const kid = await studentOnNewDevice(browser, baseURL!, page, { username, grade: 7 });

  // the worker has kept the whole app, including the page that carries the question generators
  await kid.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => kid.evaluate(async () => {
    const files = ((await (await fetch('/asset-manifest.json')).json()) as { files: string[] }).files.filter((f) => /\.(js|css)$/.test(f));
    for (const f of files) if (!(await caches.match(f))) return false;
    return true;
  })).toBe(true);

  // while online: choose Algebra and download a pack
  await kid.getByLabel(/C\. Algebra/).check();
  await kid.getByRole('button', { name: 'Practice without internet' }).click();
  await expect(kid.getByRole('heading', { name: 'Practice without internet' })).toBeVisible();
  await kid.getByRole('button', { name: 'Download questions' }).click();
  await expect(kid.getByText('20 of 20 questions left')).toBeVisible();

  // the app opens with no connection, straight to the downloaded questions
  await kid.context().setOffline(true);
  await kid.goto('/app/learn/offline');
  await expect(kid.getByRole('heading', { name: 'Practice without internet' })).toBeVisible();
  await expect(kid.getByText('You are practicing offline')).toBeVisible();
  await expect(kid.getByText('20 of 20 questions left')).toBeVisible();
  await expect(kid.getByRole('button', { name: 'Download questions' })).toHaveCount(0);

  // the same page the device has kept tells the test what the questions are (the oracle for answering)
  const items = await kid.evaluate(() => new Promise<{ skill: string; tier: number; seed: number }[]>((resolve, reject) => {
    const open = indexedDB.open('mathquest-offline', 1);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const store = open.result.transaction('kv').objectStore('kv');
      const keys = store.getAllKeys();
      const vals = store.getAll();
      vals.onsuccess = () => { const i = (keys.result as string[]).findIndex((k) => String(k).startsWith('pack:')); resolve((vals.result[i] as { items: { skill: string; tier: number; seed: number }[] }).items); };
    };
  }));
  expect(items.length).toBe(20);
  expect(items.every((it) => it.skill.startsWith('MS.G7.C'))).toBe(true);

  await kid.getByRole('button', { name: 'Start practicing' }).click();
  for (let i = 0; i < 4; i++) {
    const item = generate(items[i]!.skill, items[i]!.tier, items[i]!.seed);
    await expect(kid.getByText(`Question ${i + 1} of 20`)).toBeVisible();
    expect(await fillAnswer(kid, item, i < 3)).toBe(true);
    await kid.getByRole('button', { name: 'Check' }).click();
    await expect(kid.locator('.feedback')).toBeVisible();
    if (i === 1) {
      const scan = await new AxeBuilder({ page: kid }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(scan.violations.map((v) => `${v.id}: ${v.nodes[0]?.html.slice(0, 120)}`)).toEqual([]);
      await noHorizontalScroll(kid);
    }
    if (i < 3) await kid.getByRole('button', { name: 'Next question' }).click();
  }
  await kid.getByRole('button', { name: 'Stop' }).click();
  await expect(kid.getByText('16 of 20 questions left')).toBeVisible();
  await expect(kid.getByText('4 answers are waiting to be sent.')).toBeVisible();

  // nothing reached the server while offline
  const sid = studentId(username);
  const count = (): number => { const d = db(); const n = (d.prepare('SELECT COUNT(*) AS n FROM attempt WHERE student_id = ?').get(sid) as { n: number }).n; d.close(); return n; };
  expect(count()).toBe(0);

  // reload while still offline: the answers are still there
  await kid.reload();
  await expect(kid.getByText('4 answers are waiting to be sent.')).toBeVisible();

  // back online: the answers are sent and graded by the server
  await kid.context().setOffline(false);
  await expect(kid.getByText(/Sent! 3 of 4 were right and you earned \d+ XP\./)).toBeVisible({ timeout: 20_000 });
  await expect(kid.getByText('answers are waiting to be sent')).toHaveCount(0);
  expect(count()).toBe(4);
  const d = db();
  const right = (d.prepare('SELECT SUM(correct) AS c FROM attempt WHERE student_id = ?').get(sid) as { c: number }).c;
  d.close();
  expect(right).toBe(3);
  expect(pageProblems.get(kid) ?? []).toEqual([]);
});

test('an "Install the app" button appears when the browser can install the app, and tells iPhone users how', async ({ page, browser, baseURL }) => {
  // browsers that can prompt: the button uses the saved prompt, then goes away
  await page.goto('/app');
  await expect(page.getByRole('button', { name: 'Send sign-in link' })).toBeVisible();
  await openMenu(page);
  await expect(page.getByRole('button', { name: 'Install the app' })).toHaveCount(0);
  await page.evaluate(() => {
    const ev = new Event('beforeinstallprompt', { cancelable: true }) as Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
    ev.prompt = async () => { (window as unknown as { __prompted: number }).__prompted = ((window as unknown as { __prompted?: number }).__prompted ?? 0) + 1; };
    ev.userChoice = Promise.resolve({ outcome: 'accepted' });
    window.dispatchEvent(ev);
  });
  await openMenu(page);
  const install = page.getByRole('button', { name: 'Install the app' });
  await expect(install).toBeVisible();
  const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(scan.violations.map((v) => `${v.id}: ${v.nodes[0]?.html.slice(0, 120)}`)).toEqual([]);
  await install.click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __prompted?: number }).__prompted)).toBe(1);
  await expect(install).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Menu', exact: true })).toHaveAttribute('aria-expanded', 'false'); // choosing an item closes the sheet

  // iPhones cannot be prompted: the button explains the Share menu
  const ctx = await browser.newContext({ baseURL, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
  const phone = await ctx.newPage();
  await phone.goto('/app');
  await openMenu(phone);
  await phone.getByRole('button', { name: 'Install the app' }).click();
  await expect(phone.getByRole('dialog', { name: 'Install MathQuest on this device' })).toContainText('Add to Home Screen');
  const scan2 = await new AxeBuilder({ page: phone }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(scan2.violations.map((v) => `${v.id}: ${v.nodes[0]?.html.slice(0, 120)}`)).toEqual([]);
  await noHorizontalScroll(phone);
  await phone.getByRole('button', { name: 'Close' }).click();
  await expect(phone.getByRole('dialog')).toHaveCount(0);
  await ctx.close();
});
