import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { signInCaregiver, uniqueIp } from './helpers';

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'];

test('a caregiver who was invited sees a one-time welcome that names who shared what, and it replaces the first-run tour', async ({ page, browser, baseURL }, info) => {
  const vp = info.project.name;
  await signInCaregiver(page, `inviter-${vp}@e2e.test`);
  await page.getByLabel('Display name').fill('Robin');
  await page.getByLabel(/^Username/).fill(`welcomekid_${vp}`);
  await page.getByLabel('4-digit PIN').fill('4821');
  await page.getByRole('button', { name: 'Create student' }).click();
  await expect(page.getByText(`@welcomekid_${vp}`)).toBeVisible();
  await page.getByLabel('Share with another caregiver').fill(`guest-${vp}@e2e.test`);
  await page.getByRole('combobox', { name: 'Role' }).first().selectOption('co');
  await page.getByRole('button', { name: 'Share', exact: true }).click();
  await expect(page.getByText('Shared.')).toBeVisible();

  const ctx = await browser.newContext({ baseURL, extraHTTPHeaders: { 'x-forwarded-for': uniqueIp() } });
  const guest: Page = await ctx.newPage();
  await signInCaregiver(guest, `guest-${vp}@e2e.test`);
  const card = guest.getByRole('region', { name: 'Welcome to MathQuest' });
  await expect(card).toBeVisible();
  await expect(card).toContainText(`inviter-${vp}@e2e.test shared 1 student(s) with you`);
  await expect(card).toContainText('Robin');
  await expect(card).toContainText('As a helper');
  await expect(guest.getByRole('region', { name: 'Quick tour' })).toHaveCount(0); // the walkthrough waits for them to ask
  const r = await new AxeBuilder({ page: guest }).withTags(AXE_TAGS).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);

  await card.getByRole('button', { name: 'Got it' }).click();
  await expect(card).toHaveCount(0);
  await guest.reload();
  await expect(guest.getByRole('heading', { name: 'Your students', exact: true })).toBeVisible();
  await expect(guest.getByRole('region', { name: 'Welcome to MathQuest' })).toHaveCount(0); // once, not again
  await expect(guest.getByRole('region', { name: 'Quick tour' })).toHaveCount(0); // and no walkthrough on top of it
  await ctx.close();
});
