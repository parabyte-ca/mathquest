# Changelog

## [2.2.1] - 2026-11-21
### Fixed
- The Grade 5-6 placement quick check and the prerequisite map now include the 29 Number micro-skills added in 2.2.0, so the struggle ladder can fall back to the right earlier skill and placement starts at a better level.
- On the learning home, a strand ticked just as the page appeared could be cleared when the course options finished loading; choices now reset only when the grade or course is changed.

### Changed
- New tests check that every placement ladder entry has a generator, that no skill comes before its own prerequisite, and that prerequisites have no cycle.

## [2.2.0] - 2026-11-20
### Added
- Phase 3 (Content) of the MathQuest v2 rewrite.
- Grade 5-6 Number strand (B): 29 new seeded generators (place value, rounding and estimating, add and subtract, multiply and divide, properties and multi-step problems, fractions of a quantity, ratios and rates, percents, integers, decimals to thousandths, divisibility, primes and factor trees), each in English and Canadian French with three tiers, a three-rung hint ladder and a misconception map. Answers are independently re-computed in the tests.
- 10 new lessons for those skills, with definitions, three worked examples and a guided try-it.
- Claude question writer (Admin > Question writer): asks Claude for drafts for any micro-skill and tier, then re-computes every answer with math.js, rejects banned wording, links and broken maths markup, and drops duplicates. Nothing is served to a student until an admin approves it.
- Admin review queue (approve, reject, retire), a student report list, and a usage view with a hard monthly spend cap (`AI_MONTHLY_CAP_USD`) and configurable price assumptions. No student data is ever sent to Claude.
- Students can report a question that looks off ("Report this question"); two different students retire an AI-written item automatically. Approved items make up about one practice question in four.

### Notes
- Off by default: leave `ANTHROPIC_API_KEY` empty to keep the question writer disabled.
- The placement quick check and prerequisite map do not yet include the new micro-skills (tracked in `docs/BACKLOG.md`).

## [2.1.0] - 2026-11-20
### Added
- Phase 2 (Learning experience) of the MathQuest v2 rewrite.
- Student learning home: choose a grade, a course where relevant, then topics or "Mix it up"; caregiver-allowed grades are respected.
- Lessons ("Learn it first"): definitions, three worked examples that build, and a guided "try one with me", with animated SVG diagrams. "Show me how" opens the lesson from any question.
- Question player with number, fraction, mixed-number and expression entry, multiple choice, multi-select, ordering, matching and tap-to-plot points; an on-screen math keyboard (44 px keys), KaTeX (MathML) rendering and a scratchpad.
- 16 seeded question generators (Grade 5-6 fractions, decimals, percents and coordinates) in English and French, each with three tiers, a three-rung hint ladder and a misconception map; answers are checked by math.js so equivalent forms are accepted.
- Encouraging, specific feedback (misconception, the step where it changed, the correct answer, a similar question) and varied praise by grade band.
- Learning engine in use: mastery per micro-skill (BKT) updated from correctness, hints and time; the struggle ladder (one tier at a time); spaced review at 1, 3, 7, 14, 30 and 60 days; adaptive placement (at most eight questions); a skill map with mastered, in progress, needs review, not started, recommended-first and coming-soon states.
- Optional read-aloud with a math-to-speech converter (English and Canadian French), captions and speed control; high contrast, dyslexia-friendly font (OpenDyslexic, SIL OFL) and reduced motion.
- `content/ASSETS.md` records the licence of every shipped asset.

### Changed
- Student accounts now land on the learning home instead of a placeholder.
- Playwright tests run at phone, tablet and desktop sizes and include an axe WCAG 2.2 AA scan and a Content Security Policy check.

### Notes
- Content covers the Grade 5-6 number, fractions, decimals and coordinates seed set only. Other grades arrive in Phase 3.
- Not yet built: sliders, draggable parabolas and sinusoids, protractor, probability simulators and code-snippet items (later phases).

## [2.0.3] - 2026-11-20
### Fixed
- `update.sh` stopped with "cosign is not installed" on hosts without it (TrueNAS has a read-only `/usr`). The scripts now install cosign themselves into the root-only `.state/bin/` (checksum-verified, `scripts/install-cosign.sh`) the first time they need it.
- A failed signature check now prints cosign's reason instead of a bare error.

## [2.0.2] - 2026-11-20
### Fixed
- `update.sh` failed with "unable to open database file": it created `data/backups` as root, so the app (running as user 568) could not write the pre-update backup. The folder is now created with the app's ownership, and a failed backup prints the real reason.
- `update.sh`, `setup.sh` and the upgrade agent no longer prompt for GitHub credentials. For a private repository, put a read-only token in `.state/github_token` (see README "Private repository").

## [2.0.1] - 2026-11-20
### Fixed
- Sign-in emails were sent from `mathquest@moot.es`, a domain that is not verified in Resend, so delivery failed with a 403. The default sender is now `mathquest@mathquest.moot.es`.
- Email failures are now visible: the log shows Resend's error and a hint, and `create-admin` says plainly when the email was not delivered.

### Changed
- README "Email DNS" now documents the `mathquest.moot.es` subdomain records and a troubleshooting table.

## [2.0.0] - 2026-11-20
### Added
- Phase 1 (Foundation) of the MathQuest v2 rewrite: invite-only accounts, curriculum model, adaptive engine core and deployment tooling.
- Caregiver sign-in by email magic link (Resend): single use, 15 minute expiry, hashed at rest, bound to the requesting browser, rate limited per email and per IP.
- Student sign-in by username and 4-digit PIN on devices a caregiver approved with a pairing code; lockout after 5 wrong PINs with an email to the caregiver.
- Roles (admin, caregiver, student), co-caregiver sharing, student export and delete, audit log, CSRF protection, strict CSP.
- Curriculum seed data for Grades 5-12 (365 expectations, both tagging schemas), prerequisite graph and seed micro-skills for Grade 5-6 number and fractions.
- Adaptive engine core: Bayesian Knowledge Tracing, struggle detection, step-down and build-up ladder, spaced review, session mix and adaptive placement.
- English and French interface with a CI key-parity check.
- `setup.sh`, `update.sh` (backup, signature check, health check, rollback), Host Upgrade Agent and admin Updates page.
- GitHub Actions: CI (typecheck, tests, e2e at phone/tablet/desktop sizes, shellcheck, container smoke test) and signed release builds.

### Changed
- BREAKING: new data model and authentication. v1 (0.1.0) was a never-deployed prototype with name-only players and no data worth migrating; v2 starts fresh.
- Port is now 8086 (8085 is held by an unidentified service in the port registry).
- Questions no longer use third-party game names or branding.
