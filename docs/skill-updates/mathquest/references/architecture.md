# MathQuest architecture notes

Contents: modules · data tables · the answer path · rewards · caregivers and auth · the AI question writer · offline practice · upgrades · front end.

## Modules

| Area | Files |
|---|---|
| App wiring, config, context | `server/app.ts`, `config.ts`, `context.ts` (`Ctx` carries db, config, clock `now`, optional seeded `rand` for tests), `index.ts`, `cli.ts` (`create-admin`, `backup`) |
| Auth and sessions | `routes/auth.ts`, `session.ts`, `crypto.ts`, `ratelimit.ts`, `mail.ts` (Resend; `MemoryMailer` in tests), `routes/devices.ts` (pairing codes, approval) |
| Students, caregivers | `routes/students.ts`, `student_caregivers` table, `note.ts` (optional invitation note) |
| Learning loop | `learn/service.ts` (sessions, `issue`, `next`, `answer`, hints, placement, skill map, offline packs), `routes/learn.ts`, `shared/engine/*` (BKT, struggle ladder, review, placement, session mix) |
| Content | `shared/generators/*` (topic files per grade and strand group, registered in `grade5.ts` to `grade9.ts`; `index.ts` gathers those into the registry, and the web app loads them one grade at a time), `shared/lessons/*`, `content/*.json`, `curriculum.ts` loads JSON into SQLite |
| Checking and feedback | `shared/check.ts` (number, fraction, mixed, expression via math.js, choice, multi, order, match, point), `shared/feedback.ts`, `shared/mathspeech.ts` |
| Rewards | `shared/rewards.ts` (pure XP, levels `50*L*(L-1)`, streaks, badges, cosmetics), `server/rewards/service.ts` and `dashboard.ts`, `shared/palettes.ts`, `weekly.ts`, `worksheet.ts` |
| AI question writer | `server/ai/anthropic.ts` (spend-capped client), `verify.ts` (re-computes answers with math.js, banned-term filter), `pipeline.ts`; admin review queue in `routes/ai.ts`; about one practice item in four comes from the approved bank |
| Jobs | `jobs.ts`: nightly backup, weekly email (Mondays from 07:30 local, once a week, catch-up), spend-cap roll-up |
| Upgrades | `routes/updates.ts` (admin page), `scripts/upgrade-agent.sh` (host cron helper), `update.sh`, folders `upgrade/` (requests), `upgrade-status/` (agent replies, read as untrusted input), `.state/` |
| Front end | `web/src/main.tsx` (router), `pages/*` (lazy loaded except the home pages), `ItemInput.tsx`, `MathText.tsx` (KaTeX), `rewards.tsx`, `tour.tsx`, `pwa.tsx` (service worker registration, install button, offline banner), `offline.ts` and `offlineStore.ts` (IndexedDB), `locales/en.json` and `fr.json` (`npm run i18n:check` fails on a missing key or placeholder) |

## Data (SQLite, WAL, numbered migrations in `server/db.ts`)

Migrations: 1 foundation (users, sessions, magic tokens, students, devices, audit, curriculum, kv) · 2 learning (microskill, mastery, attempt, pending_item, practice_session, ladder_state, placement) · 3 AI bank (bank_item, ai_usage, item_report) · 4 rewards (reward_state, reward_event, badge_earned, goal) · 5 tours · 6 offline packs. Add a migration instead of editing an old one.

Time zone for streak days and the weekly email is `MATHQUEST_TZ` (default `America/Toronto`).

## The answer path

`issue()` builds an item from `(skill, tier, seed)` (or an approved bank item), stores the full item in `pending_item` and sends the client only `toPublic(item)` (no answer, no hints text beyond what is asked for). `answer()` loads the pending item, checks the response with `shared/check.ts`, updates BKT mastery, the attempt log, spaced review and (for practice) the struggle ladder, then calls `onAnswered` in the rewards service and returns kind feedback. The struggle ladder drops one tier at a time, then single-step micro-skills, then a lesson on the weakest prerequisite, then builds back up.

## Offline practice

`offlinePack()` chooses up to 20 `(skill, tier, seed, target)` items, stores them in `offline_pack` and returns the list. The device builds each question with the same shared generators, grades locally for instant feedback, and keeps answers in IndexedDB. `offlineSync()` rebuilds every question from its seed, inserts a `pending_item`, runs the normal `answer()` path and marks the index done, so each question counts once. Packs expire after 7 days (answers accepted 7 more); at most five packs per student; another student's pack returns 404. The service worker never touches `/api/`.

## Auth in one paragraph

Caregivers are invited by email (admin invites, or a caregiver shares a student). Magic links are single-use, 15-minute, bound to the browser that asked. Students use a username and 4-digit PIN only on a device a caregiver approved with a pairing code; five misses lock the account and notify the caregiver. Cookies are HttpOnly, Secure, SameSite=Lax with double-submit CSRF; every endpoint validates with zod.

Households: `access()` in `routes/students.ts` is the one gate to a student (owner or co link, never admin; 404 otherwise). Owners alone delete, share, unshare and change a PIN. The admin sees accounts and account-level audit entries only. Usernames are unique per household, not per install (migration 10; sign-in looks the name up among the approving caregiver's students). Family goals count and show owned students only. `tests/household-isolation.test.ts` is the regression net: add any new student-scoped route to its `ROUTES` table.

## Testing map

`tests/generators.test.ts` (every registered skill: determinism, own answer accepted, wrong answers never accepted, bilingual text, format shape, variety) · per-set independent arithmetic tests (`number-generators`, `strands-cdef-generators`, `number7-generators`, `strands7-generators`, `number8-generators`, `strands8-generators`, `spatial-finance8-generators`) · `lessons.test.ts` · `content-links.test.ts` (placement ladders and prerequisites) · `learn.test.ts` and `offline.test.ts` (API) · `rewards`, `weekly`, `worksheet`, `palettes`, `tours`, `pwa`, `i18n`, `upgrade-*`, `updates`, `invite-note`, `ai-pipeline` · e2e specs `foundation`, `learning`, `tour`, `offline` at phone, tablet and desktop sizes with axe WCAG 2.2 AA scans and CSP/page-error tracking.
