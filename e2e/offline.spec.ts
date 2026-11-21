import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { noHorizontalScroll } from './helpers';

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
