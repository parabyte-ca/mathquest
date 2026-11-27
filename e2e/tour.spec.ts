import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { noHorizontalScroll, openMenu, pageProblems, signInCaregiver, studentOnNewDevice } from './helpers';

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'];
const scan = async (page: Page, label: string) => {
  const r = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
  expect(r.violations.map((v) => `${label}: ${v.id} (${v.nodes.length}) ${v.help} :: ${v.nodes[0]?.html.slice(0, 140)}`), label).toEqual([]);
};

test('the caregiver tour appears once, can be stepped through, skipped and replayed', async ({ page }, info) => {
  await signInCaregiver(page, `tour-${info.project.name}@e2e.test`);
  const tour = page.getByRole('region', { name: 'Quick tour' });
  await expect(tour).toBeVisible();
  await expect(tour.locator('.eyebrow')).toContainText('Step 1 of 7');
  await scan(page, 'caregiver tour, first step');

  // step through: each step has its own title; steps with a target highlight it
  await tour.getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('#tour-title')).toHaveText('Add a student');
  await expect(page.locator('[data-tour="add-student"].tour-target')).toBeVisible();
  await tour.getByRole('button', { name: 'Back' }).click();
  await expect(page.locator('#tour-title')).toHaveText('Welcome to MathQuest');
  await tour.getByRole('button', { name: 'Next' }).click();
  await tour.getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('#tour-title')).toHaveText('Approve their device');
  await expect(page.locator('[data-tour="devices"].tour-target')).toBeVisible();
  await noHorizontalScroll(page);
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('#tour-title')).toHaveText('Your data');
  await page.getByRole('button', { name: 'Done' }).click();
  await expect(page.locator('.tour')).toHaveCount(0);
  await expect(page.locator('.tour-target')).toHaveCount(0);

  // finished once: it does not come back by itself, even after a reload or on another page load
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Your students', exact: true })).toBeVisible();
  await expect(page.locator('.tour')).toHaveCount(0);

  // replay from Help: focus moves to the tour, Escape closes it
  await openMenu(page);
  await page.getByRole('button', { name: 'Help' }).click();
  await expect(page.locator('#tour-title')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('.tour')).toHaveCount(0);
});

test('the student tour appears on the first visit, is skippable, and is remembered', async ({ page, browser, baseURL }, info) => {
  await signInCaregiver(page, `tour-${info.project.name}@e2e.test`);
  const kid = await studentOnNewDevice(browser, baseURL!, page, { username: `tour_${info.project.name}_${Math.floor(Date.now() / 1000).toString(36)}`, grade: 5, tour: true });
  const tour = kid.getByRole('region', { name: 'Quick tour' });
  await expect(tour).toBeVisible();
  await expect(tour.locator('.eyebrow')).toContainText('Step 1 of 8');
  await scan(kid, 'student tour, first step');
  await tour.getByRole('button', { name: 'Next' }).click();
  await expect(kid.locator('#tour-title')).toHaveText('Pick what to practice');
  await expect(kid.locator('[data-tour="topics"].tour-target')).toBeVisible();
  await noHorizontalScroll(kid);
  await kid.getByRole('button', { name: 'Skip the tour' }).click();
  await expect(kid.locator('.tour')).toHaveCount(0);

  // remembered on the server: still gone after a reload, and Help brings it back
  await kid.reload();
  await expect(kid.getByRole('heading', { name: /Welcome, Robin/ })).toBeVisible();
  await expect(kid.locator('.tour')).toHaveCount(0);
  await openMenu(kid);
  await kid.getByRole('button', { name: 'Help' }).click();
  await expect(kid.locator('#tour-title')).toBeFocused();
  for (let i = 0; i < 7; i++) await kid.getByRole('button', { name: 'Next' }).click();
  await expect(kid.locator('#tour-title')).toHaveText('Earn XP');
  await expect(kid.locator('[data-tour="rewards"].tour-target')).toBeVisible();
  await kid.getByRole('button', { name: 'Done' }).click();
  expect(pageProblems.get(kid) ?? []).toEqual([]);

  // the French tour is complete too
  await openMenu(kid);
  await kid.getByRole('button', { name: 'Aide' }).or(kid.getByRole('button', { name: 'Help' })).click();
  await openMenu(kid);
  await kid.getByRole('button', { name: 'Français' }).click();
  await expect(kid.locator('#tour-title')).toHaveText('Bienvenue !');
  await expect(kid.locator('.tour .eyebrow')).toContainText('Étape 1 sur 8');
});
