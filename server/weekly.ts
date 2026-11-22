import type { Config } from './config.js';
import type { Ctx, StudentRow } from './context.js';
import type { DB } from './db.js';
import type { Mailer } from './mail.js';
import { dashboard } from './rewards/dashboard.js';
import { localDay } from './rewards/service.js';
import { renderEmail, type EmailSection } from './email.js';

type Lang = 'en' | 'fr';
interface UserLite { id: string; email: string; display_name: string }

/** The most recent date (YYYY-MM-DD, family time zone) on or before `ms` that falls on `weekday` (0 = Sunday ... 6 = Saturday). */
export function weekdayOnOrBefore(ms: number, tz: string, weekday: number): string {
  const day = localDay(ms, tz);
  const dow = new Date(`${day}T12:00:00Z`).getUTCDay(); // 0 = Sunday
  return localDay(Date.parse(`${day}T12:00:00Z`) - ((dow - weekday + 7) % 7) * 86_400_000, tz);
}

/** The Monday (YYYY-MM-DD, family time zone) that starts the week containing `ms`. */
export const mondayOf = (ms: number, tz: string): string => weekdayOnOrBefore(ms, tz, 1);

/** The day of the week a caregiver chose for the weekly email (0 = Sunday ... 6 = Saturday); Monday when they have not chosen. */
export function weeklyDayOf(defaultsJson: string): number {
  const d = (JSON.parse(defaultsJson) as { weeklyDay?: unknown }).weeklyDay;
  return typeof d === 'number' && Number.isInteger(d) && d >= 0 && d <= 6 ? d : 1;
}

const tr = (lang: Lang, en: string, fr: string): string => (lang === 'en' ? en : fr);

/** A plain-text weekly summary for one caregiver, or null when they have no students. */
export function composeWeekly(ctx: Ctx, user: UserLite): { subject: string; text: string; html: string } | null {
  const students = ctx.db
    .prepare('SELECT s.* FROM students s JOIN student_caregivers sc ON sc.student_id = s.id WHERE sc.caregiver_id = ? ORDER BY s.display_name')
    .all(user.id) as StudentRow[];
  if (students.length === 0) return null;
  const lang: Lang = students.filter((s) => s.language === 'fr').length > students.length / 2 ? 'fr' : 'en';
  const weekAgo = ctx.now() - 7 * 86_400_000;
  const lines: string[] = [tr(lang, `Hello${user.display_name ? ` ${user.display_name}` : ''},`, `Bonjour${user.display_name ? ` ${user.display_name}` : ''},`), '', tr(lang, 'Here is how practice went this week.', 'Voici comment la pratique s\'est déroulée cette semaine.'), ''];
  const sections: EmailSection[] = [];
  let cur: EmailSection = { lines: [] };
  const item = (line: string): void => { lines.push(`  ${line}`); cur.lines!.push(line); };
  for (const s of students) {
    const d = dashboard(ctx, s);
    const heading = `${s.display_name} (${tr(lang, 'Grade', 'année')} ${s.grade})`;
    cur = { heading, lines: [] };
    sections.push(cur);
    lines.push(heading);
    if (d.week.answered === 0) {
      item(`${tr(lang, 'No practice this week. A few minutes together can get things going again.', 'Aucune pratique cette semaine. Quelques minutes ensemble peuvent relancer le tout.')}`);
    } else {
      item(`${tr(lang, `${d.week.answered} questions in about ${d.week.minutes} minutes, ${d.week.accuracy}% right.`, `${d.week.answered} questions en environ ${d.week.minutes} minutes, ${d.week.accuracy} % de réussite.`)}`);
    }
    if (d.week.answered > 0 || d.prevWeek.answered > 0) {
      const dq = d.week.answered - d.prevWeek.answered;
      const sign = (n: number): string => (n > 0 ? `+${n}` : String(n));
      const acc = d.week.accuracy !== null && d.prevWeek.accuracy !== null ? d.week.accuracy - d.prevWeek.accuracy : null;
      item(`${tr(lang, `Compared with the week before: ${sign(dq)} question(s)${acc === null ? '' : `, accuracy ${sign(acc)} point(s)`}.`, `Par rapport à la semaine d'avant : ${sign(dq)} question(s)${acc === null ? '' : `, réussite ${sign(acc)} point(s)`}.`)}`);
    }
    item(`${tr(lang, `Level ${d.level}, streak ${d.streak} day(s), ${d.skillsMastered} skill(s) mastered so far.`, `Niveau ${d.level}, série de ${d.streak} jour(s), ${d.skillsMastered} habileté(s) maîtrisée(s) jusqu'ici.`)}`);
    const badges = d.recentBadges.filter((b) => b.at >= weekAgo).map((b) => ('name' in b && b.name ? (b.name as { en: string; fr: string })[lang] : b.id));
    if (badges.length) item(`${tr(lang, 'New badges:', 'Nouveaux insignes :')} ${badges.join(', ')}`);
    const reached = d.goals.filter((g) => g.reached && !g.redeemed);
    for (const g of reached) item(`${tr(lang, `Goal reached: "${g.title}". It is ready for you to mark as done.`, `Objectif atteint : « ${g.title} ». Tu peux maintenant le marquer comme accompli.`)}`);
    if (d.attention.length) item(`${tr(lang, 'Where a little help could count:', 'Où un peu d\'aide ferait la différence :')} ${d.attention.map((a) => a.name).join('; ')}`);
    if (d.dueReviews > 0) item(`${tr(lang, `${d.dueReviews} skill(s) are due for a quick review.`, `${d.dueReviews} habileté(s) sont à réviser rapidement.`)}`);
    lines.push('');
  }
  lines.push(tr(lang, `Open the dashboard: ${ctx.cfg.baseUrl}/app`, `Ouvrir le tableau de bord : ${ctx.cfg.baseUrl}/app`));
  const off = tr(lang, 'You can turn this email off in your settings.', 'Tu peux désactiver ce courriel dans tes paramètres.');
  lines.push(off);
  const subject = tr(lang, 'MathQuest: your week in practice', 'MathQuest : votre semaine de pratique');
  const html = renderEmail({
    lang, baseUrl: ctx.cfg.baseUrl, title: tr(lang, 'Your week in practice', 'Votre semaine de pratique'),
    preheader: students.map((s) => s.display_name).join(', '),
    intro: [lines[0]!, lines[2]!], sections,
    button: { label: tr(lang, 'Open the dashboard', 'Ouvrir le tableau de bord'), url: `${ctx.cfg.baseUrl}/app` }, outro: [off],
  });
  return { subject, text: lines.join('\n'), html };
}

/**
 * Sends the weekly summary to each opted-in caregiver once per week, on the day they chose (Monday unless they picked another),
 * from 07:30 (family time zone) on. A week missed because the server was down is sent at the next check. Returns how many were sent.
 */
export async function sendWeeklyEmails(db: DB, cfg: Config, mailer: Mailer, now = Date.now()): Promise<number> {
  const tz = cfg.timezone;
  const today = localDay(now, tz);
  const minutesNow = Number(new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(now).replace(':', ''));
  const ctx = { db, cfg, mailer, now: () => now } as unknown as Ctx; // dashboard and rewards read only db, cfg and now
  const users = db.prepare("SELECT id, email, display_name, defaults_json FROM users WHERE weekly_email = 1 AND status = 'active'").all() as (UserLite & { defaults_json: string })[];
  let sent = 0;
  for (const u of users) {
    const weekday = weeklyDayOf(u.defaults_json);
    const period = weekdayOnOrBefore(now, tz, weekday);
    if (today === period && minutesNow < 730) continue; // not before 07:30 on the chosen day itself
    const key = `weekly:${u.id}`;
    const last = db.prepare('SELECT value FROM kv WHERE key = ?').get(key) as { value: string } | undefined;
    if (last?.value === period) continue;
    const msg = composeWeekly(ctx, u);
    // mark first so a slow or failing provider never causes a second email in the same week
    db.prepare('INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, period);
    if (!msg) continue;
    if (await mailer.send({ to: u.email, ...msg })) sent++;
  }
  return sent;
}
