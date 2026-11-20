import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { answerCurrent, currentItem, db, fillAnswer, noHorizontalScroll, pageProblems, parentPage, studentId, studentOnNewDevice, waitForNewItem } from './helpers';

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'];

async function setup(browser: import('@playwright/test').Browser, baseURL: string, _page: Page, info: import('@playwright/test').TestInfo, tag: string, init?: () => void) {
  const username = `${tag}_${info.project.name}_${Math.floor(Date.now() / 1000).toString(36)}`; // unique per run, so repeats do not share history
  const parent = await parentPage(browser, baseURL, `parent-${info.project.name}@e2e.test`);
  const kid = await studentOnNewDevice(browser, baseURL, parent, { username, grade: 5, addInit: init });
  return { kid, username };
}

async function startPractice(kid: Page, strand: string) {
  await kid.getByLabel('Mix it up').uncheck().catch(() => undefined);
  await kid.getByRole('checkbox', { name: new RegExp(`^${strand}\\.`) }).check();
  await kid.getByRole('button', { name: 'Start practice' }).click();
  await expect(kid.locator('form.answer')).toBeVisible();
}

const SPEECH_STUB = () => {
  const spoken: { text: string; lang: string }[] = [];
  (window as unknown as { __spoken: typeof spoken }).__spoken = spoken;
  class Utt { text: string; lang = ''; rate = 1; voice = null; onstart: (() => void) | null = null; onend: (() => void) | null = null; onerror: (() => void) | null = null; constructor(t: string) { this.text = t; } }
  (window as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance = Utt;
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { speak(u: Utt) { spoken.push({ text: u.text, lang: u.lang }); u.onstart?.(); setTimeout(() => u.onend?.(), 4000); }, cancel() {}, getVoices() { return []; } } });
};

test('lesson to practice: a student reads a lesson, tries one with hints, then practises with feedback and a similar question', async ({ page, browser, baseURL }, info) => {
  const { kid, username } = await setup(browser, baseURL!, page, info, 'lp');
  await noHorizontalScroll(kid);

  // the lesson ("Learn it first")
  await kid.goto('/app/learn/lesson?id=L.fractions.naming');
  await expect(kid.getByRole('heading', { name: /Fractions: naming/ })).toBeVisible();
  await expect(kid.getByText('Denominator').first()).toBeVisible();
  await expect(kid.locator('svg.vis').first()).toBeVisible(); // pictures
  await noHorizontalScroll(kid);
  await kid.getByRole('button', { name: 'Next', exact: true }).click(); // example 1
  await expect(kid.getByRole('heading', { name: /Example 1/ })).toBeVisible();
  await kid.getByRole('button', { name: 'Next step' }).click();
  await kid.getByRole('button', { name: 'Next', exact: true }).click(); // example 2
  await kid.getByRole('button', { name: 'Next step' }).click();
  await kid.getByRole('button', { name: 'Next', exact: true }).click(); // example 3
  await kid.getByRole('button', { name: 'Next step' }).click();
  await kid.getByRole('button', { name: 'Try one with me' }).click();
  await expect(kid.getByRole('heading', { name: 'Try one with me' })).toBeVisible();
  await kid.getByRole('button', { name: 'Hint' }).click();
  await expect(kid.getByText('Hint 1:')).toBeVisible();
  await kid.getByRole('button', { name: 'Math keyboard' }).click();
  await kid.getByRole('button', { name: '1', exact: true }).click();
  await kid.getByRole('button', { name: '4', exact: true }).click();
  await expect(kid.locator('#ans')).toHaveValue('14');
  await kid.getByRole('button', { name: 'Clear', exact: true }).click(); // the keyboard's own clear key
  await expect(kid.locator('#ans')).toHaveValue('');
  await expect(kid.getByRole('button', { name: 'Check' })).toBeDisabled(); // an empty answer cannot be submitted
  await kid.getByRole('button', { name: 'Finish lesson' }).click();
  await expect(kid.getByRole('heading', { name: 'Welcome, Robin!' })).toBeVisible();

  // practice: right answer, then a wrong one with a kind, specific explanation
  await startPractice(kid, 'B');
  const first = await answerCurrent(kid, username, true);
  await expect(kid.locator('.feedback.good')).toBeVisible();
  await expect(kid.locator('.feedback')).not.toContainText(/wrong|incorrect/i);
  expect(first.skill).toMatch(/^MS\./);
  await kid.getByRole('button', { name: 'Next question' }).click();
  await expect(kid.locator('form.answer')).toBeVisible();
  const { id: beforeId } = await waitForNewItem(kid, username);
  const second = await answerCurrent(kid, username, false);
  await expect(kid.locator('.feedback.tip')).toBeVisible();
  await expect(kid.locator('.feedback')).not.toContainText(/wrong|incorrect|failed/i);
  await expect(kid.locator('.feedback')).toContainText('The answer is:');
  await expect(kid.locator('.feedback')).toContainText(/Step \d is where it changed/);
  await kid.getByRole('button', { name: 'Try a similar one' }).click();
  await expect.poll(() => { try { return currentItem(username).id; } catch { return beforeId; } }).not.toBe(beforeId);
  await expect(kid.locator('form.answer')).toBeVisible();
  expect(currentItem(username).item.skill).toBe(second.skill);

  expect(pageProblems.get(kid)).toEqual([]); // no CSP violations or script errors anywhere in the flow

  // attempts and mastery were recorded server-side
  const d = db();
  const n = (d.prepare('SELECT COUNT(*) AS n FROM attempt WHERE student_id = ?').get(studentId(username)) as { n: number }).n;
  d.close();
  expect(n).toBe(2);
});

test('struggle and recover: a student who keeps missing gets an easier question, smaller steps and a lesson, then carries on', async ({ page, browser, baseURL }, info) => {
  const { kid, username } = await setup(browser, baseURL!, page, info, 'sr');
  const d = db();
  d.prepare('INSERT INTO mastery (student_id, skill_id, p_known, tier, attempts, correct) VALUES (?,?,?,?,?,?)').run(studentId(username), 'MS.G5.E1.4.a', 0.8, 3, 6, 6);
  d.close();
  await startPractice(kid, 'E');
  expect(currentItem(username).item.tier).toBe(3);

  let sawStepDown = false, sawMicro = false, sawLesson = false;
  const lessonHeading = kid.getByRole('heading', { name: 'Plotting points' });
  for (let i = 0; i < 10 && !sawLesson; i++) {
    await answerCurrent(kid, username, false);
    const text = await kid.locator('.feedback').innerText();
    if (/easier one first/.test(text)) sawStepDown = true;
    if (/smaller steps/.test(text)) sawMicro = true;
    await kid.getByRole('button', { name: 'Next question' }).click();
    // either the lesson page appears, or a question we have not answered yet
    const landed = await Promise.race([
      lessonHeading.waitFor({ timeout: 15_000 }).then(() => 'lesson' as const).catch(() => 'none' as const),
      waitForNewItem(kid, username).then(() => 'item' as const).catch(() => 'none' as const),
    ]);
    sawLesson = landed === 'lesson';
  }
  expect(sawStepDown).toBe(true);
  expect(sawMicro).toBe(true);
  expect(sawLesson).toBe(true);

  // the inserted lesson: read through it and go back to practice
  for (let i = 0; i < 10 && !(await kid.getByRole('button', { name: 'Back to practice' }).isVisible()); i++) {
    await kid.getByRole('button', { name: /^(Next step|Next|Try one with me)$/ }).click();
  }
  await kid.getByRole('button', { name: 'Back to practice' }).click();
  await expect(kid.locator('form.answer')).toBeVisible();
  await answerCurrent(kid, username, true); // back to answering correctly
  await expect(kid.locator('.feedback.good')).toBeVisible();
});

test('placement test starts practice at the right level', async ({ page, browser, baseURL }, info) => {
  const { kid, username } = await setup(browser, baseURL!, page, info, 'pl');
  await kid.getByRole('button', { name: /Quick check/ }).click();
  await expect(kid.getByText('There is no pass or fail.')).toBeVisible();
  let questions = 0;
  let last = '';
  for (; questions < 10; questions++) {
    await expect.poll(() => { try { return currentItem(username).id; } catch { return last; } }, { timeout: 10_000 }).not.toBe(last);
    const { id, item } = currentItem(username);
    await expect(kid.locator(`form.answer[data-item="${id}"]`)).toBeVisible();
    last = id;
    expect(await fillAnswer(kid, item, true)).toBe(true);
    await kid.getByRole('button', { name: 'Check' }).click();
    const finished = await Promise.race([
      kid.getByRole('heading', { name: 'All set!' }).waitFor({ timeout: 8000 }).then(() => true).catch(() => false),
      expect.poll(() => { try { return currentItem(username).id; } catch { return last; } }, { timeout: 8000 }).not.toBe(last).then(() => false).catch(() => false),
    ]);
    if (finished) { questions++; break; }
  }
  expect(questions).toBeLessThanOrEqual(8);
  await expect(kid.getByRole('heading', { name: 'All set!' })).toBeVisible();
});

test('skill map shows states, prerequisites that are recommended not required, and practice from a node', async ({ page, browser, baseURL }, info) => {
  const { kid } = await setup(browser, baseURL!, page, info, 'sm');
  await kid.getByLabel('Grade').selectOption('6');
  await kid.getByRole('button', { name: 'Skill map' }).click();
  await expect(kid.getByRole('heading', { name: /Skill map · Grade 6/ })).toBeVisible();
  await noHorizontalScroll(kid);
  await kid.getByRole('button', { name: /G6\.B2\.5\. Recommended first/ }).click();
  await expect(kid.getByText('Recommended first: G5.B2.5')).toBeVisible();
  await expect(kid.getByRole('button', { name: 'Practise this' })).toBeVisible();
  await kid.getByRole('button', { name: 'Practise this' }).click();
  await expect(kid.locator('form.answer')).toBeVisible(); // not blocked by the recommendation
});

test('voice reads lessons and questions naturally (math as words, in French too), with captions and settings', async ({ page, browser, baseURL }, info) => {
  const { kid, username } = await setup(browser, baseURL!, page, info, 'vo', SPEECH_STUB);
  await kid.getByRole('button', { name: 'Settings' }).click();
  await expect(kid.getByRole('checkbox', { name: /^Read aloud/ })).not.toBeChecked(); // off by default
  await kid.getByRole('checkbox', { name: /^Read aloud/ }).check();
  await kid.getByRole('checkbox', { name: /Read questions and feedback automatically/ }).check();
  await kid.getByRole('button', { name: 'Back' }).click();
  await startPractice(kid, 'B');
  await expect.poll(() => kid.evaluate(() => (window as unknown as { __spoken: unknown[] }).__spoken.length)).toBeGreaterThan(0);
  let spoken = await kid.evaluate(() => (window as unknown as { __spoken: { text: string; lang: string }[] }).__spoken);
  expect(spoken[0]!.lang).toBe('en-CA');
  for (const s of spoken) expect(s.text).not.toMatch(/[\\^{}$]|\bfrac\b|\bsqrt\b|\bcaret\b/);
  await expect(kid.locator('.caption')).toBeVisible(); // spoken words are also shown on screen

  // French
  await kid.getByRole('button', { name: 'Français' }).click();
  await kid.getByRole('button', { name: /Lire à voix haute/ }).first().click();
  spoken = await kid.evaluate(() => (window as unknown as { __spoken: { text: string; lang: string }[] }).__spoken);
  expect(spoken.at(-1)!.lang).toBe('fr-CA');
  expect(spoken.at(-1)!.text).not.toMatch(/[\\^{}$]|\bfrac\b/);
  void username;
});

test('accessibility: high contrast, dyslexia font and reduced motion apply; keyboard-only answering works', async ({ page, browser, baseURL }, info) => {
  const { kid, username } = await setup(browser, baseURL!, page, info, 'ax');
  await kid.getByRole('button', { name: 'Settings' }).click();
  await kid.getByLabel('High contrast').check();
  await kid.getByLabel('Dyslexia-friendly font').check();
  await kid.getByLabel('Reduce motion').check();
  await expect(kid.locator('html')).toHaveClass(/hc/);
  await expect(kid.locator('html')).toHaveClass(/dys/);
  await expect(kid.locator('html')).toHaveClass(/rm/);
  expect(await kid.evaluate(() => getComputedStyle(document.body).fontFamily)).toContain('OpenDyslexic');
  await kid.getByRole('button', { name: 'Back' }).click();

  // keyboard only: choose a strand and start with Space/Enter, answer a choice or fraction without a mouse
  await kid.getByRole('checkbox', { name: /^E\./ }).focus();
  await kid.keyboard.press('Space');
  await kid.getByRole('button', { name: 'Start practice' }).focus();
  await kid.keyboard.press('Enter');
  await expect(kid.locator('form.answer')).toBeVisible();
  const { item } = await waitForNewItem(kid, username);
  if (item.format === 'choice') {
    await kid.locator('input[type=radio]').first().focus();
    for (let i = 0; i < (item.answer as { index: number }).index; i++) await kid.keyboard.press('ArrowDown');
    await kid.keyboard.press('Space');
  } else {
    await expect(kid.locator('#px'), `expected a point question; got format=${item.format} skill=${item.skill} tier=${item.tier}; screen: ${(await kid.locator('form.answer').innerText()).replace(/\s+/g, ' ').slice(0, 200)}`).toBeVisible({ timeout: 5000 });
    await kid.locator('#px').fill(String((item.answer as { x: number }).x));
    await kid.locator('#py').fill(String((item.answer as { y: number }).y));
  }
  await kid.getByRole('button', { name: 'Check' }).focus();
  await kid.keyboard.press('Enter');
  await expect(kid.locator('.feedback.good')).toBeVisible();
});

test('WCAG 2.2 AA automated scan of the student pages', async ({ page, browser, baseURL }, info) => {
  const { kid, username } = await setup(browser, baseURL!, page, info, 'wc');
  const scan = async (label: string) => {
    const r = await new AxeBuilder({ page: kid }).withTags(AXE_TAGS).analyze();
    expect(r.violations.map((v) => `${label}: ${v.id} (${v.nodes.length}) ${v.help} :: ${v.nodes[0]?.html.slice(0, 160)} :: ${v.nodes[0]?.failureSummary?.replace(/\s+/g, ' ').slice(0, 220)}`), label).toEqual([]);
  };
  await scan('learn home');
  await kid.getByRole('button', { name: 'Settings' }).click();
  await scan('settings');
  await kid.getByRole('button', { name: 'Back' }).click();
  await kid.goto('/app/learn/lesson?id=L.fractions.add-like');
  await scan('lesson');
  await kid.goto('/app/learn');
  await startPractice(kid, 'B');
  await scan('question');
  await answerCurrent(kid, username, false);
  await scan('feedback');
  await kid.goto('/app/learn/map?grade=5');
  await expect(kid.getByRole('heading', { name: /Skill map/ })).toBeVisible();
  await scan('skill map');
  await noHorizontalScroll(kid);
  expect(pageProblems.get(kid)).toEqual([]);
});

test('touch targets are at least 44 px on the question page', async ({ page, browser, baseURL }, info) => {
  const { kid } = await setup(browser, baseURL!, page, info, 'tt');
  await startPractice(kid, 'E');
  const small: string[] = [];
  for (const el of await kid.locator('main button, main input:not([type=hidden]), main select, main label.choice').all()) {
    const b = await el.boundingBox();
    if (b && (b.height < 43.5 || b.width < 43.5)) small.push(`${await el.evaluate((e: Element) => e.outerHTML.slice(0, 60))} ${Math.round(b.width)}x${Math.round(b.height)}`);
  }
  expect(small).toEqual([]);
  await noHorizontalScroll(kid);
});

test('a student can report a question that looks off, once, and the admin queue sees it', async ({ page, browser, baseURL }, info) => {
  const { kid, username } = await setup(browser, baseURL!, page, info, 'rp');
  await startPractice(kid, 'B');
  await kid.getByRole('button', { name: 'Report this question' }).click();
  await expect(kid.getByRole('group', { name: 'What looks off?' })).toBeVisible();
  await kid.getByRole('button', { name: 'I think the answer is wrong' }).click();
  await expect(kid.getByText('Thank you. A grown-up will take a look.')).toBeVisible();
  const rows = db().prepare("SELECT reason FROM item_report WHERE student_id = ?").all(studentId(username));
  expect(rows).toEqual([{ reason: 'answer' }]);
  expect(pageProblems.get(kid) ?? []).toEqual([]);
});
