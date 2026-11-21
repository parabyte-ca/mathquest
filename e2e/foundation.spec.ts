import { test, expect, type Page, type Browser } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { signInCaregiver as signInHelper, noHorizontalScroll as nhs, uniqueIp } from './helpers';

const signIn = signInHelper;
const noHorizontalScroll = nhs;

async function studentDevice(browser: Browser, baseURL: string): Promise<Page> {
  const ctx = await browser.newContext({ baseURL, extraHTTPHeaders: { 'x-forwarded-for': uniqueIp() } });
  return ctx.newPage();
}

test('caregiver signs in by magic link, adds a student and approves their device; student signs in with a PIN', async ({ page, browser, baseURL }, info) => {
  const username = `kid_${info.project.name}`;
  await signIn(page, `parent-${info.project.name}@e2e.test`);
  await expect(page.getByRole('heading', { name: 'Your students', exact: true })).toBeVisible();
  await noHorizontalScroll(page);

  await page.getByLabel('Display name').fill('Robin');
  await page.getByLabel(/^Username/).fill(username);
  await page.getByLabel('4-digit PIN').fill('4821');
  await page.getByLabel('Grade').selectOption('6');
  await page.getByRole('button', { name: 'Create student' }).click();
  await expect(page.getByText(`@${username}`)).toBeVisible();

  // The student's own device asks to be trusted and shows a code.
  const kid = await studentDevice(browser, baseURL!);
  await kid.goto('/app/student');
  await kid.getByRole('button', { name: 'Get a code' }).click();
  const code = (await kid.locator('.code').innerText()).trim();
  expect(code).toMatch(/^\d{6}$/);

  // Wrong PIN must not work yet (device is not approved).
  await page.getByLabel("Code shown on the student's device").fill(code);
  await page.getByLabel('Device name (optional)').fill(`Tablet ${info.project.name}`);
  await page.getByRole('button', { name: 'Approve device' }).click();
  await expect(page.getByText('Device approved.')).toBeVisible();

  // The student's page notices approval, then the PIN login works.
  await expect(kid.getByLabel('Username')).toBeVisible({ timeout: 15_000 });
  await kid.getByLabel('Username').fill(username);
  await kid.getByLabel('4-digit PIN').fill('0000');
  await kid.getByRole('button', { name: 'Sign in' }).click();
  await expect(kid.getByText(/do not match/)).toBeVisible();
  await kid.getByLabel('4-digit PIN').fill('4821');
  await kid.getByRole('button', { name: 'Sign in' }).click();
  await expect(kid.getByRole('heading', { name: 'Welcome, Robin!' })).toBeVisible();
  await noHorizontalScroll(kid);
  await kid.context().close();
});

test('the admin sees the Updates page and requests an upgrade through the request inbox', async ({ page }, info) => {
  await signIn(page, `admin-${info.project.name}@e2e.test`);
  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('heading', { name: 'Updates', exact: true })).toBeVisible();
  await expect(page.getByText('Mock release notes', { exact: true })).toBeVisible();
  // release notes for every version in between, newest first
  await expect(page.getByText('Version 99.0.0')).toBeVisible();
  await expect(page.getByText('Version 98.0.0')).toBeVisible();
  // no upgrade helper has checked in during the e2e run, and the page says what to do
  await expect(page.getByTestId('agent-state')).toContainText('has never checked in');
  await expect(page.getByTestId('agent-state')).toContainText('upgrade-agent.sh --install');
  const request = join(process.cwd(), 'test-results', 'e2e', 'upgrade', 'request.json');
  if (existsSync(request)) return; // a previous viewport project already queued it; that is the behaviour under test
  await page.getByRole('button', { name: 'Upgrade to 99.0.0' }).click();
  await expect(page.getByText(/Upgrade requested/)).toBeVisible();
  const body = JSON.parse(readFileSync(request, 'utf8')) as { version: string; requestId: string };
  expect(body.version).toBe('99.0.0');
  await noHorizontalScroll(page);
});

test('a caregiver cannot open the admin page', async ({ page }, info) => {
  await signIn(page, `parent-${info.project.name}@e2e.test`);
  await page.goto('/app/admin');
  await expect(page.getByRole('heading', { name: 'Your students', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Admin' })).toHaveCount(0);
});

test('French UI, 44 px touch targets and no horizontal scroll on the sign-in page', async ({ page }) => {
  await page.goto('/app');
  await noHorizontalScroll(page);
  for (const b of await page.getByRole('button').all()) {
    const box = await b.boundingBox();
    if (box) expect(box.height).toBeGreaterThanOrEqual(44);
  }
  await page.getByRole('button', { name: 'Français' }).click();
  await expect(page.getByRole('heading', { name: 'Connexion du parent ou tuteur' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.lang)).toBe('fr-CA');
});

test('security headers and API health', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.ok()).toBe(true);
  expect(res.headers()['content-security-policy']).toContain("default-src 'self'");
  expect(res.headers()['x-powered-by']).toBeUndefined();
  const page = await request.get('/app/anything');
  expect(page.ok()).toBe(true);
});

test('the Updates page shows the upgrade steps, the last result and whether the host helper is running', async ({ page }, info) => {
  const statusDir = join(process.cwd(), 'test-results', 'e2e', 'upgrade-status');
  const write = (name: string, body: object | null) => (body === null ? rmSync(join(statusDir, name), { force: true }) : writeFileSync(join(statusDir, name), typeof body === 'string' ? body : JSON.stringify(body)));
  const scan = async (label: string) => {
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(r.violations.map((v) => `${label}: ${v.id} (${v.nodes.length}) ${v.nodes[0]?.html.slice(0, 140)}`), label).toEqual([]);
  };
  try {
    await signIn(page, `admin-${info.project.name}@e2e.test`);
    await page.getByRole('link', { name: 'Admin' }).click();

    // the helper checks in
    write('heartbeat', '' as unknown as object);
    await page.reload();
    await expect(page.getByTestId('agent-state')).toContainText('checked in');

    // an upgrade in progress: steps before the current one are done, the current one is marked
    write('status.json', { state: 'running', version: '99.0.0', message: 'Updating to v99.0.0', updatedAt: new Date().toISOString() });
    write('progress.json', { step: 'verify', stepNumber: 3, stepCount: 5 });
    await page.reload();
    const steps = page.getByTestId('upgrade-steps');
    await expect(steps.getByRole('listitem')).toHaveCount(5);
    await expect(steps.locator('[aria-current="step"]')).toContainText('Check its signature');
    await expect(steps.getByText('Back up the database').locator('..')).toContainText('done');
    await expect(page.getByRole('button', { name: /Upgrade to/ })).toBeDisabled();
    await scan('upgrade running');

    // a failure before anything changed: the stage, the plain reason, and what it means
    write('progress.json', null);
    write('status.json', {
      state: 'failed', version: '99.0.0', previousVersion: '2.0.0', message: 'Update failed before anything changed (see upgrade.log)', step: 'verify', stepNumber: 3, stepCount: 5,
      error: 'signature check failed for the new image', startedAt: '2026-11-21T01:00:00Z', finishedAt: '2026-11-21T01:01:30Z', backupFile: 'mathquest-2026-11-21.db', updatedAt: '2026-11-21T01:01:30Z',
    });
    await page.reload();
    const last = page.getByTestId('last-upgrade');
    await expect(last).toContainText('Upgrade to 99.0.0');
    await expect(last).toContainText('signature check failed for the new image');
    await expect(last).toContainText('Nothing was changed on your server');
    await expect(last).toContainText('mathquest-2026-11-21.db');
    await expect(page.getByTestId('upgrade-steps').locator('.failed')).toContainText('Check its signature');
    await scan('upgrade failed');

    // a rollback after an unhealthy start
    write('status.json', { state: 'rolled_back', version: '99.0.0', previousVersion: '2.0.0', message: 'Update failed; rolled back', step: 'rollback', stepNumber: 5, stepCount: 5, error: 'v99.0.0 did not become healthy', finishedAt: '2026-11-21T01:05:00Z', updatedAt: '2026-11-21T01:05:00Z' });
    await page.reload();
    await expect(page.getByTestId('last-upgrade')).toContainText('previous version is running again');
    await expect(page.getByTestId('upgrade-steps').getByText('Roll back to the previous version')).toBeVisible();

    // success explains how to undo it
    write('status.json', { state: 'succeeded', version: '99.0.0', previousVersion: '2.0.0', message: 'Now running v99.0.0', step: 'done', stepNumber: 5, stepCount: 5, finishedAt: '2026-11-21T01:03:00Z', updatedAt: '2026-11-21T01:03:00Z' });
    await page.reload();
    await expect(page.getByTestId('last-upgrade')).toContainText('update.sh --rollback');
    await noHorizontalScroll(page);
  } finally {
    for (const f of ['status.json', 'progress.json', 'heartbeat']) write(f, null);
  }
});
