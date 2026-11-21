---
name: mathquest
description: Project skill for MathQuest v2 (parabyte-ca/mathquest), the self-hosted, invite-only adaptive Ontario math practice and rewards app for Grades 5-12, running on TrueNAS at mathquest.moot.es (port 8086). Use this skill whenever the user mentions MathQuest, mathquest.moot.es, adding or fixing questions, generators, micro-skills, lessons, placement, rewards, the caregiver portal, offline practice, a MathQuest release, update.sh for MathQuest, or the next grade or strand to build, even if they only say "next" or "what's in the backlog" while working in that repo. Covers architecture, the content pipeline (generators, micro-skills, lessons, tests), the release flow, local checks, and the mistakes already made so they are not repeated. Pair it with dev-sop (build and docs standards) and ontario-math-curriculum (what each grade must cover).
---

# MathQuest

Adaptive Ontario math practice (Grades 5-12) for a family's own students. Caregivers sign in by email link, add students, and approve each student's device. Students practice with an explainable adaptive engine, earn XP and badges, and can practice offline. Self-hosted on TrueNAS behind a Cloudflare Tunnel.

Read `dev-sop` for README, versioning, Docker and CI conventions and `ontario-math-curriculum` for what a grade must cover. This skill holds what is specific to this repo.

## Where things are

| Thing | Value |
|---|---|
| Repo, branch rule | `parabyte-ca/mathquest`; develop on the branch the session names, one PR per release, PR as draft |
| Stack | Node 22, Express, better-sqlite3, Preact + Vite + TypeScript, vitest, Playwright (+ axe) |
| Port, domain | 8086 (see `dev-sop/ports.md`), `https://mathquest.moot.es` |
| Server path | `/mnt/shared_vol/websites/mathquest`; update with `sudo ./update.sh` |
| Image | GHCR, signed with cosign, tags are plain `X.Y.Z` |
| Layout | `server/` API, jobs, engine glue · `shared/` code both sides use (generators, checker, feedback, rewards, lessons, math speech) · `web/` the app · `content/` curriculum, micro-skills, placement, chains · `tests/` unit · `e2e/` browser · `scripts/` upgrade agent and tools · `docs/` plan, demos, `BACKLOG.md` |

More detail on modules, tables and design decisions is in `references/architecture.md`. Read it before changing the engine, auth, rewards, the AI pipeline or the offline sync.

## Principles that shape every change

- **The server grades.** Answers are never sent to the client before they are graded on the server. Offline practice is the one exception by design: the device builds questions from seeds, but the server rebuilds and grades every answer when it is sent, so the device is never trusted.
- **Items are `(skill, tier, seed) -> Item`.** Generators are pure and deterministic, so any item can be rebuilt and re-checked. Never use `Math.random` in a generator.
- **Kind feedback.** Every mapped wrong answer says what likely went wrong ("It looks like...") and never blames. Hints are a three-step ladder: nudge, first step, full worked example.
- **Bilingual from the start.** Every learner-facing string exists in English and Canadian French. Numbers go inside TeX so both languages read them identically.
- **Privacy.** Students hold only display name, username, grade, language and settings. Claude API prompts carry skill ids, grade and tier, never student data.
- **No CDNs, no trackers.** Strict CSP; everything is self-hosted.

## Adding content (the loop for every grade)

Do the grades in order, one strand group per release, and look up what the grade requires in `ontario-math-curriculum`. For each expectation that can be asked as a number, fraction or choice:

1. **Generator** in `shared/generators/` (registered in that grade's `gradeN.ts` map; `index.ts` gathers the maps and the web app loads one grade at a time) using the DSL in `dsl.ts` (`numGen`, `choiceGen`, `bi`, `mc`, `r6`, `money`) or `build()` from `kit.ts` for fraction answers. Three tiers, steps (worked example), a nudge, and `wrong` entries for common misconceptions. Register it in `shared/generators/index.ts` under `MS.G{grade}.{strand}{n}.{n}.{letter}`. Senior-course skills (Grade 10 and up) carry the course in the id, `MS.G10.{COURSE}.{strand}{n}.{n}.{letter}`, because courses reuse strand letters; their `expectation` is the course code (for example `MPM2D.A3`).
2. **Micro-skill** entry in `content/microskills.json` with `expectation`, `name`, `tiers: 3` and `prereqs` (earlier micro-skill ids; the graph must have no cycles).
3. **Placement**: add the skill to its ladder in `content/placement.json`, ordered easiest to hardest and never before one of its own prerequisites. Number uses the plain grade as its key (`7`); strands C to F use `grade.strand` (`7.C`) and hold that strand's earlier-grade skills too. A test fails if a strand skill is missing from its ladder.
4. **Lessons** in `shared/lessons/` (definitions, two or three worked examples, a `tryIt`), registered in `shared/lessons/index.ts`. Every micro-skill needs a lesson that lists it. EN and FR must differ for any string with words.
5. **Independent arithmetic test** in `tests/`: parse the English prompt, recompute the answer by a different method (brute force, exact fractions, `Function` evaluation), compare. Then mutate one generator answer to prove the test fails. The generic `tests/generators.test.ts` already checks structure, determinism, bilingual text and wrong-answer rules for every registered skill.
6. **Update tests that assume content is missing** (`tests/learn.test.ts` checks which strands show as available).
7. Update `CHANGELOG.md`, `README.md`, `docs/BACKLOG.md`, bump the version everywhere it lives (`VERSION`, `package.json`, `package-lock.json` twice, the README badge and `--version` line, `.env.example`), run every check, open a draft PR.

Items that need richer tools (coding, infographics, nets and 3-D views, constructions, reading sources) are listed in `docs/BACKLOG.md`; do not fake them with numeric stand-ins.

Run `python scripts/content_status.py` from the repo root for a live table of what exists per grade and strand.

## Release flow

Merging a PR that changes `VERSION` triggers the Release workflow, which builds, signs and publishes `ghcr.io/parabyte-ca/mathquest:X.Y.Z` and a GitHub release whose notes are the CHANGELOG entry. Only the user merges.

Version bump touches: `VERSION`, `package.json`, `package-lock.json` (two places), `.env.example`, the README badge and its `update.sh --version` line, and a new top `CHANGELOG.md` entry. Edit the README sentence first, then bump the number. A blanket replace of the old version also rewrites prose that names it, which has happened twice.

New content on an existing grade is a minor or patch bump by the size of the change (Grade 7 Number was 2.5.0, the rest of Grade 7 was 2.5.1). New features and migrations are minor.

After a merge, tell the user to run `sudo ./update.sh`. When the PR they merged is the first for a new branch name, expect the remote branch to be gone: merge `origin/main` into the branch before continuing.

## Checks before every push

```bash
npm run typecheck && npm run i18n:check && npx vitest run
npm run build && PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run e2e     # about four minutes; includes axe scans
```

CI runs shellcheck, checks, the Docker image build and e2e at phone, tablet and desktop sizes. If CI is red, find the cause; never skip a test.

## Mistakes already made (do not repeat)

- Category codes are `KU`, `AP`, `TH` (not `TI`). `numTex` rounds to six decimals, so a prompt number with more decimals loses digits.
- A wrong answer must differ from the right one: when a distractor is derived from the answer, test that it can still be equal (for example half of 4) or guard it. `build()` drops duplicates, but `numGen` tuples must still hold finite numbers.
- Tests that jump the fake clock must refresh `sessions.expires_at` or the student is signed out.
- e2e: each caregiver may approve only ten devices in ten minutes, so new student journeys use their own seeded caregiver in `e2e/start-app.ts`. Use `PW_CHROMIUM_PATH` locally. The service worker only registers in the production build.
- Docker build stage must copy `VERSION` (the web build reads it).
- The home page resets strand choices once when options load; tests must wait for the tick to stick.
- The shell classifier can refuse very large heredocs; write big files with the editor tools instead.
- Do not pre-announce a release as published until the Release workflow has finished.
- Credentials are server-side only (`docs/SECURITY.md`). Before a release run `npm run build && npm run audit:secrets -- --require-client`. Browser env variables must start with `MQ_PUBLIC_`; never name one KEY, SECRET, TOKEN or PASSWORD. New API routes must not return config values, and `tests/security-exposure.test.ts` lists the read-only routes it checks, so add new GET routes there.

## Working style for this user

Brief answers in Canadian English, polite, no commentary. Automate what can be automated, check twice before acting, and suggest skill or doc updates when something has gone stale. When the user says "next", continue the "Release plan" at the top of `docs/BACKLOG.md` (it lists the next release in order) without asking again.
