import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { answerCurrent, currentItem, db, fillAnswer, noHorizontalScroll, pageProblems, parentPage, studentId, studentOnNewDevice, waitForNewItem } from './helpers';

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'];

async function setup(browser: import('@playwright/test').Browser, baseURL: string, _page: Page, info: import('@playwright/test').TestInfo, tag: string, init?: () => void) {
  const username = `${tag}_${info.project.name}_${Math.floor(Date.now() / 1000).toString(36)}`; // unique per run, so repeats do not share history
  const parent = await parentPage(browser, baseURL, `parent-${info.project.name}@e2e.test`);
  const kid = await studentOnNewDevice(browser, baseURL, parent, { username, grade: 5, addInit: init });
  return { kid, username, parent };
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

test('lesson to practice: a student reads a lesson, tries one with hints, then practices with feedback and a similar question', async ({ page, browser, baseURL }, info) => {
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
  await kid.goto('/app/learn/practice?grade=5&focus=G5.E1.4'); // one expectation with one micro-skill keeps the ladder predictable
  await expect(kid.locator('form.answer')).toBeVisible();
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

test('placement test starts practice at the right level, and a quick check can cover one topic', async ({ page, browser, baseURL }, info) => {
  const { kid, username } = await setup(browser, baseURL!, page, info, 'pl');
  /** Answers every probe right until the check says "All set!". Returns how many questions it took. */
  const runCheck = async (): Promise<number> => {
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
    await expect(kid.getByRole('heading', { name: 'All set!' })).toBeVisible();
    return questions;
  };

  await kid.getByRole('button', { name: /Quick check/ }).click();
  await expect(kid.getByText('There is no pass or fail.')).toBeVisible();
  expect(await runCheck()).toBeLessThanOrEqual(8);

  // One topic ticked: the quick check covers that topic, and practice then starts on it.
  await kid.goto('/app/learn');
  await expect(async () => {
    await kid.getByLabel(/^E\./).check();
    await expect(kid.getByLabel(/^E\./)).toBeChecked();
  }).toPass();
  await kid.getByRole('button', { name: /Quick check/ }).click();
  await expect(kid.getByText('There is no pass or fail.')).toBeVisible();
  const asked = new Set<string>();
  await expect.poll(() => { try { const s = currentItem(username).item.skill; asked.add(s); return s; } catch { return ''; } }, { timeout: 10_000 }).toMatch(/^MS\.G5\.E/);
  expect(await runCheck()).toBeLessThanOrEqual(8);
  await kid.getByRole('button', { name: 'Start practice' }).click();
  await expect.poll(() => { try { return currentItem(username).item.skill; } catch { return ''; } }, { timeout: 10_000 }).toMatch(/^MS\.G5\.E/);
});

test('skill map shows states, prerequisites that are recommended not required, and practice from a node', async ({ page, browser, baseURL }, info) => {
  const { kid } = await setup(browser, baseURL!, page, info, 'sm');
  await kid.getByLabel('Grade').selectOption('6');
  await kid.getByRole('button', { name: 'Skill map' }).click();
  await expect(kid.getByRole('heading', { name: /Skill map · Grade 6/ })).toBeVisible();
  await noHorizontalScroll(kid);
  await kid.getByRole('button', { name: /G6\.B2\.5\. Recommended first/ }).click();
  await expect(kid.getByText('Recommended first: G5.B2.5')).toBeVisible();
  await expect(kid.getByRole('button', { name: 'Practice this' })).toBeVisible();
  await kid.getByRole('button', { name: 'Practice this' }).click();
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
  // The home page resets its choices once when the course options finish loading, so tick E until it sticks.
  // (With nothing ticked, practice draws from every strand and the first question need not be a plotting one.)
  const strandE = kid.getByRole('checkbox', { name: /^E\./ });
  await expect(async () => {
    if (!(await strandE.isChecked())) {
      await strandE.focus();
      await kid.keyboard.press('Space');
    }
    await expect(strandE).toBeChecked({ timeout: 500 });
  }).toPass({ timeout: 10_000 });
  await kid.getByRole('button', { name: 'Start practice' }).focus();
  await kid.keyboard.press('Enter');
  await expect(kid.locator('form.answer')).toBeVisible();
  const { item } = await waitForNewItem(kid, username);
  if (item.format === 'choice') {
    await kid.locator('input[type=radio]').first().focus();
    for (let i = 0; i < (item.answer as { index: number }).index; i++) await kid.keyboard.press('ArrowDown');
    await kid.keyboard.press('Space');
  } else if (item.format === 'point') {
    await kid.locator('#px').fill(String((item.answer as { x: number }).x));
    await kid.locator('#py').fill(String((item.answer as { y: number }).y));
  } else {
    // strand E now has number questions too: type the answer with the keyboard
    expect(item.format).toBe('number');
    await kid.locator('#ans').focus();
    await kid.keyboard.type(String((item.answer as { value: number }).value));
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
  // A radio or checkbox sits inside its label, and the label is the tap target (checked through label.choice below).
  for (const el of await kid.locator('main button, main input:not([type=hidden]):not([type=radio]):not([type=checkbox]), main select, main label.choice').all()) {
    const b = await el.boundingBox();
    if (b && (b.height < 43.5 || b.width < 43.5)) small.push(`${await el.evaluate((e: Element) => e.outerHTML.slice(0, 60))} ${Math.round(b.width)}x${Math.round(b.height)}`);
  }
  expect(small).toEqual([]);
  await noHorizontalScroll(kid);
});

test('rewards, caregiver progress and goals, printable worksheets, and the new strands', async ({ page, browser, baseURL }, info) => {
  const { kid, username, parent } = await setup(browser, baseURL!, page, info, 'rp');
  const scanOf = async (p: Page, label: string) => {
    const r = await new AxeBuilder({ page: p }).withTags(AXE_TAGS).analyze();
    expect(r.violations.map((v) => `${label}: ${v.id} (${v.nodes.length}) ${v.help} :: ${v.nodes[0]?.html.slice(0, 160)}`), label).toEqual([]);
  };

  // a student reports a question that looks off
  await startPractice(kid, 'B');
  await kid.getByRole('button', { name: 'Report this question' }).click();
  await expect(kid.getByRole('group', { name: 'What looks off?' })).toBeVisible();
  await kid.getByRole('button', { name: 'I think the answer is wrong' }).click();
  await expect(kid.getByText('Thank you. A grown-up will take a look.')).toBeVisible();
  expect(db().prepare('SELECT reason FROM item_report WHERE student_id = ?').all(studentId(username))).toEqual([{ reason: 'answer' }]);

  // answering earns XP, shown right after the answer and in the header
  await answerCurrent(kid, username, true);
  await expect(kid.locator('.rewardnote')).toContainText(/\+\d+ XP/);
  await expect(kid.locator('.rewardnote')).toContainText('First steps');
  await expect(kid.locator('.rewardbar')).toContainText('Level 1');

  // the same student then practices one question in each of the algebra, data, measurement and money strands
  // (one student for all of this: approving many devices for one caregiver trips the approval rate limit)
  for (const code of ['G5.C2.3', 'G5.D1.5', 'G5.E2.5', 'G5.F1.2']) {
    await kid.goto(`/app/learn/practice?grade=5&focus=${code}`);
    await expect(kid.locator('form.answer')).toBeVisible();
    const item = await answerCurrent(kid, username, true);
    expect(item.skill.startsWith(`MS.${code}`)).toBe(true);
    await expect(kid.locator('.feedback.good')).toBeVisible();
  }

  // the rewards page: level, badges and cosmetics, with unlocks by level
  await kid.goto('/app/learn');
  await kid.getByRole('button', { name: 'My rewards' }).click();
  await expect(kid.getByRole('heading', { name: /My rewards/ })).toBeVisible();
  await expect(kid.getByRole('heading', { name: "This week's challenges" })).toBeVisible();
  await expect(kid.getByRole('progressbar', { name: /Thirty|Half|Sixty|One hour|Three days|Four days|Five days|Twenty|A new skill|Keep it fresh|Try three|Forty/ }).first()).toBeVisible();
  await expect(kid.getByRole('list').filter({ hasText: 'First steps' }).getByText('Earned').first()).toBeAttached();
  await expect(kid.getByRole('button', { name: /Dragon/ })).toBeDisabled();
  await scanOf(kid, 'rewards page');
  await kid.getByRole('button', { name: /Panda/ }).click();
  await expect(kid.getByRole('status').filter({ hasText: 'Saved.' })).toBeVisible();

  // with enough XP the colour palettes unlock, and each one stays readable (axe checks the contrast)
  const boost = (xp: number) => { const d = db(); d.prepare('UPDATE reward_state SET xp = xp + ? WHERE student_id = ?').run(xp, studentId(username)); d.close(); };
  boost(5000);
  await kid.goto('/app/learn/rewards');
  for (const name of ['Twilight', 'Candy', 'Forest']) {
    await kid.getByRole('button', { name: new RegExp(name) }).click();
    await expect(kid.locator('html')).toHaveAttribute('data-palette', `palette-${name.toLowerCase()}`);
    await scanOf(kid, `palette ${name}`);
  }
  await kid.getByRole('button', { name: /Classic/ }).click();
  await expect(kid.locator('html')).not.toHaveAttribute('data-palette', /.+/);
  expect(pageProblems.get(kid) ?? []).toEqual([]);

  // the caregiver reads progress, sets a goal, and marks it done once the student has earned it
  await parent.goto('/app');
  // a family goal for all of the caregiver's students together
  await expect(parent.getByRole('heading', { name: 'Family goals' })).toBeVisible();
  await parent.getByLabel('What is the reward?').fill('Pizza night');
  await parent.getByLabel('XP together').fill('500');
  await parent.getByRole('button', { name: 'Add family goal' }).click();
  await expect(parent.getByRole('progressbar', { name: 'Pizza night' })).toBeVisible();
  await noHorizontalScroll(parent);
  await scanOf(parent, 'caregiver home with a family goal');
  await parent.locator('li.row', { hasText: `@${username}` }).getByRole('link', { name: 'Progress and goals' }).click(); // the caregiver has one row per student made in earlier tests
  await expect(parent.getByRole('heading', { name: /progress/i, level: 1 })).toBeVisible();
  await expect(parent.getByText('questions this week', { exact: false })).toBeVisible();
  await expect(parent.getByRole('heading', { name: 'By topic' })).toBeVisible();
  await noHorizontalScroll(parent); // tables and charts must never push the page wider than a phone
  await parent.getByLabel('Goal', { exact: true }).fill('Movie night');
  await parent.getByLabel('XP to earn').fill('50');
  await parent.getByRole('button', { name: 'Add goal' }).click();
  await expect(parent.getByText('Goal added.')).toBeVisible();
  boost(80);
  await kid.goto('/app/learn/practice?grade=5&focus=G5.C2.3');
  await expect(kid.locator('form.answer')).toBeVisible();
  await answerCurrent(kid, username, true);
  await expect(kid.locator('.rewardnote')).toContainText('Goal reached: Movie night');
  await parent.reload();
  await expect(parent.getByText('Ready')).toBeVisible();
  await noHorizontalScroll(parent);
  await scanOf(parent, 'caregiver progress');
  await parent.getByRole('button', { name: 'Mark as done' }).click();
  await expect(parent.getByText('Done').first()).toBeVisible();

  // a printable worksheet with an answer key
  await parent.getByLabel('Topic', { exact: true }).selectOption('G5.C2.3');
  await parent.getByLabel('Number of questions').fill('10');
  try {
    await parent.getByRole('button', { name: 'Make worksheet' }).click({ timeout: 10_000 });
  } catch (e) {
    // say what is on top of the button, so a failure on a slow runner can be understood from the log alone
    const where = await parent.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find((x) => x.textContent === 'Make worksheet')!;
      const r = b.getBoundingClientRect();
      const stack = document.elementsFromPoint(r.x + r.width / 2, r.y + r.height / 2).map((el) => `${el.tagName}.${el.className}#${el.id}`);
      return JSON.stringify({ box: [r.x, r.y, r.width, r.height].map(Math.round), scroll: [scrollX, scrollY], viewport: [innerWidth, innerHeight, visualViewport?.scale, document.documentElement.scrollWidth], stack, disabled: b.disabled });
    });
    throw new Error(`"Make worksheet" could not be clicked: ${where}\n${(e as Error).message.slice(0, 300)}`);
  }
  await expect(parent.getByRole('heading', { name: 'Your worksheet is ready' })).toBeVisible();
  await expect(parent.locator('.sheet ol.qs > li')).toHaveCount(10);
  await expect(parent.getByRole('heading', { name: 'Answer key' })).toBeVisible();
  await scanOf(parent, 'worksheet');
  await parent.emulateMedia({ media: 'print' });
  await expect(parent.getByRole('button', { name: 'Print' })).toBeHidden();
  await expect(parent.getByRole('heading', { name: 'Answer key' })).toBeVisible();
  await parent.emulateMedia({ media: 'screen' });
  await parent.getByLabel('Include the answer key').uncheck();
  await expect(parent.getByRole('heading', { name: 'Answer key' })).toHaveCount(0);

  // a certificate for the goal the student reached, ready to print
  await parent.goto(`/app/progress?student=${studentId(username)}`);
  await expect(parent.getByRole('heading', { name: 'Certificates' })).toBeVisible();
  await parent.getByRole('button', { name: /Goal: Movie night/ }).click();
  await expect(parent.getByRole('heading', { name: 'Certificate of achievement' })).toBeVisible();
  await expect(parent.locator('.certificate')).toContainText('Movie night');
  await expect(parent.locator('.certificate')).toContainText('Robin');
  await scanOf(parent, 'certificate');
  await noHorizontalScroll(parent);
  await parent.emulateMedia({ media: 'print' });
  await expect(parent.getByRole('button', { name: 'Print certificate' })).toBeHidden();
  await expect(parent.locator('.certificate')).toBeVisible();
  await parent.emulateMedia({ media: 'screen' });
});

test('protractor lesson: a student draws an angle by moving the arm (slider or drag), and gets it checked', async ({ page, browser, baseURL }, info) => {
  const { kid } = await setup(browser, baseURL!, page, info, 'pr');
  await kid.goto('/app/learn/lesson?id=L.g5.protractor-use');
  await expect(kid.getByRole('heading', { name: /Using a protractor/ })).toBeVisible();
  await expect(kid.locator('svg.protractor').first()).toBeVisible();
  for (let i = 0; i < 3; i++) {
    await kid.getByRole('button', { name: 'Next', exact: true }).click(); // example i + 1
    await kid.getByRole('button', { name: 'Next step' }).click();
  }
  await kid.getByRole('button', { name: 'Try one with me' }).click();
  const prompt = await kid.locator('form.answer').locator('xpath=ancestor::*[1]').innerText();
  const angle = Number(/Draw an angle that measures\s*(\d+)/.exec(prompt.replace(/\n/g, ' '))?.[1]);
  expect(angle).toBeGreaterThan(0);

  // nothing is chosen yet, so Check is off; the arm is not drawn until the student moves it
  await expect(kid.getByRole('button', { name: 'Check' })).toBeDisabled();
  await expect(kid.locator('svg.protractor line.arm')).toHaveCount(0);
  const results = await new AxeBuilder({ page: kid }).withTags(AXE_TAGS).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);

  // a wrong place first: the other scale
  await kid.locator('#angle-range').fill(String(180 - angle === angle ? angle + 20 : 180 - angle));
  await expect(kid.locator('svg.protractor line.arm')).toHaveCount(1);
  await kid.getByRole('button', { name: 'Check' }).click();
  await expect(kid.getByText(/Not yet/)).toBeVisible();

  // then the right place, set by dragging the arm on the protractor
  const svg = kid.locator('svg.protractor');
  const box = (await svg.boundingBox())!;
  const rad = (angle * Math.PI) / 180;
  const flip = await kid.locator('svg.protractor line.axis.base').evaluate((el) => Number(el.getAttribute('x2')) < Number(el.getAttribute('x1')));
  const abs = flip ? Math.PI - rad : rad;
  const x = box.x + ((170 + 120 * Math.cos(abs)) / 340) * box.width;
  const y = box.y + ((165 - 120 * Math.sin(abs)) / 190) * box.height;
  await kid.mouse.move(x, y);
  await kid.mouse.down();
  await kid.mouse.move(x + 0.01, y);
  await kid.mouse.up();
  await expect(kid.locator('#angle-range')).toHaveValue(new RegExp(`^(${angle - 1}|${angle}|${angle + 1})$`));
  await kid.locator('#angle-range').fill(String(angle));
  await kid.getByRole('button', { name: 'Check' }).click();
  await expect(kid.getByText("That's right!")).toBeVisible();
});
