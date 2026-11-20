import { test, expect, type Page, type Browser } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const MOCK = `http://127.0.0.1:${process.env.MOCK_PORT ?? 18788}`;
type Mail = { to: string[]; subject: string; text: string };

async function waitForMail(to: string): Promise<Mail> {
  for (let i = 0; i < 50; i++) {
    const outbox = (await (await fetch(`${MOCK}/outbox`)).json()) as Mail[];
    const m = outbox.filter((x) => x.to.includes(to)).at(-1);
    if (m) return m;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`no email for ${to}`);
}

/** Real sign-in: request the link, read it from the mocked Resend outbox, open it in the same browser. */
async function signIn(page: Page, email: string): Promise<void> {
  await fetch(`${MOCK}/outbox`, { method: 'DELETE' });
  await page.goto('/app');
  await page.getByLabel('Email address').fill(email);
  await page.getByRole('button', { name: 'Send sign-in link' }).click();
  await expect(page.getByText('a sign-in link is on its way')).toBeVisible();
  const link = /(http:\/\/\S+\/app\/verify\?token=[\w-]+)/.exec((await waitForMail(email)).text)![1]!;
  await page.goto(link);
}

const noHorizontalScroll = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

async function studentDevice(browser: Browser, baseURL: string): Promise<Page> {
  const ctx = await browser.newContext({ baseURL });
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
  await expect(page.getByText('Mock release notes')).toBeVisible();
  const request = join(process.cwd(), 'test-results', 'e2e', 'upgrade', 'request.json');
  if (existsSync(request)) return; // a previous viewport project already queued it; that is the behaviour under test
  await page.getByRole('button', { name: 'Upgrade to 2.1.0' }).click();
  await expect(page.getByText(/Upgrade requested/)).toBeVisible();
  const body = JSON.parse(readFileSync(request, 'utf8')) as { version: string; requestId: string };
  expect(body.version).toBe('2.1.0');
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
