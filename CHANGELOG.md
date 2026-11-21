# Changelog

## [2.8.1] - 2026-11-21
### Added
- Grade 6 gap fill: 13 new micro-skills for the Grade 6 expectations that were not built yet, each with generated questions in English and French, three difficulty tiers, a three-step hint ladder and a reason for every common wrong answer. Grade 6 financial literacy is now complete (5 of 5), algebra is 8 of 10, data 7 of 8 and spatial sense 7 of 10.
  - Financial literacy (F): payment methods (change from cash, debit balance, a credit card percent fee against a flat transfer fee), financial goals (weeks to save, with savings already made and two sources of weekly money), factors that help or interfere (net weekly saving, weeks sooner with extra income, weeks later with a new expense), and trading, lending, borrowing and donating (percent donation, what is still owed, fair card trade).
  - Algebra (C): repeating, shrinking and linear growing patterns, translating among tables and rules, patterns with decimals, and adding monomials of degree 1.
  - Data (D): discrete and continuous data, organizing data with intervals (counting, the number of intervals, percent of values), choosing a graph (bar, circle, histogram, broken-line) and analysing misleading graphs (an axis that does not start at zero, shown in words and numbers).
  - Spatial sense (E): combinations of translations, reflections and rotations (up to 360 degrees) on a point.
- Four Grade 6 lessons ("Show me how"), and the new skills added to the quick-check ladders for Grades 6 to 8.
- Independent arithmetic tests for every new generator (week counts, brute-force walks through patterns and moves, mutation-checked on two).

### Notes
- Still deferred in Grade 6 because they need drawn or interactive items: coding (C3), modelling (C4), infographics (D1.4), 3-D views (E1.2), the protractor (E2.2) and nets (E2.5). See `docs/BACKLOG.md`.

## [2.8.0] - 2026-11-21
### Added
- Quick checks (placement) for every strand in Grades 5 to 8, not only Number. Tick one topic on the student home page and "Quick check (placement)" now checks that topic: a short adaptive check of at most eight questions along an easiest-to-hardest ladder of that topic's skills (including the same topic's earlier-grade skills), then practice on that topic starts at the right level. With no topic or several ticked, the check is the Number check, as before. Nothing is lowered; the check only raises what a student plainly knows.
- Placement ladders for strands C (algebra), D (data), E (spatial sense) and F (financial literacy) in Grades 5 to 8 (`content/placement.json`, keys like `7.C`). A test makes sure every skill of those strands is on its ladder and that no ladder puts a skill before its own prerequisite.
- `POST /api/learn/placement/start` accepts an optional `strand` (B to F).
- Migration 7: placement results are kept per grade and strand. Existing Number results are kept as strand B.
- Tests: server tests for every grade and strand (finish within eight questions, only that strand's skills, strong and weak students, strands kept apart, bad requests) and an end-to-end test that runs the Number check and then a Spatial Sense check and starts practice on it.

## [2.7.2] - 2026-11-21
### Added
- Grade 8 spatial sense (strand E, 10 skills) and financial literacy (strand F, 6 skills), which completes Grade 8: 16 new micro-skills with generated questions in English and French, three difficulty tiers each, a three-step hint ladder and a reason for every common wrong answer.
  - Spatial sense: tessellations (angles around a vertex, filling gaps with triangles), scale drawings (to real length, to drawing length, and finding the scale), all four transformations including dilations, mega/giga/tera and micro/nano/pico units in powers of ten, angles of intersecting and parallel lines and of triangles, angle sums and exterior angles of polygons, area of composite shapes (L shapes, a semicircle on a rectangle, a triangle on a rectangle), volume and surface area of composite solids, and the Pythagorean theorem (hypotenuse and leg, ladders, diagonals and distance on a grid). Circle work says "use 3.14 for pi".
  - Financial literacy: paying across currencies with a card fee, a long-term plan with income tax, balanced budgets (missing amounts, missing percent, and the cut needed to balance), simple versus compound growth, sales with HST, loyalty points and two-store offers, and credit card interest, minimum payments and phone contracts.
- Five Grade 8 lessons ("Show me how"), so every Grade 8 micro-skill has a lesson.
- Independent arithmetic tests for every new generator (one was mutation-checked).

### Changed
- Grade 8 now shows every strand as available; Grade 9 is next.

## [2.7.1] - 2026-11-21
### Added
- Grade 8 algebra (strand C, 7 skills) and data (strand D, 4 skills): 11 new micro-skills with generated questions in English and French, three difficulty tiers each, a three-step hint ladder and a reason for every common wrong answer.
  - Algebra: comparing growing and shrinking patterns, pattern rules and unknown terms with negatives and decimals, patterns among rational numbers (including halving), adding monomials and binomials, evaluating with rational numbers, multi-term equations with integers and decimals (including letters on both sides), and inequalities with integers where a negative coefficient reverses the sign.
  - Data: two-variable tables of values, describing correlation in a scatter plot (strong, weak, none, positive, negative, and ignoring an outlier), Venn diagrams (at least one, both, and probability as a percent), and several independent or dependent events with exact fractions (three spins, three marbles, exactly one of two).
- Three Grade 8 lessons ("Show me how"), so every Grade 8 micro-skill so far has a lesson.
- Independent arithmetic tests for every new generator (substitution, brute force, exact fractions and Pearson's r; one was mutation-checked).

### Notes
- Grade 8 spatial sense and financial literacy are next (2.7.2). Items that need richer tools (infographics, analysis of graphs, coding) are still on the backlog.

## [2.7.0] - 2026-11-21
### Added
- Grade 8 Number (strand B): 12 new micro-skills with generated questions in English and French, three difficulty tiers each, a three-step hint ladder and a reason for every common wrong answer. Topics: scientific notation (big and small numbers), rational and irrational numbers, estimating and calculating square roots, percents above 100% and below 1%, order of operations with rational numbers, common squares and roots, multiplying and dividing by powers of ten, adding and subtracting integers, adding and subtracting fractions (unlike denominators, mixed numbers, three terms), multiplying and dividing fractions with whole and mixed numbers, multiplying and dividing integers, and comparing proportional situations.
- Four Grade 8 lessons ("Show me how"), so every Grade 8 micro-skill has a lesson, and a Grade 8 placement ladder that revisits Grades 6 and 7 first.
- Independent arithmetic tests for every new generator (each recomputes the answer from the prompt by a different method; one was mutation-checked).

### Changed
- Grade 8 now shows Number as available; its other strands still say "coming soon".

## [2.6.0] - 2026-11-21
### Added
- Practise without internet. While online, a student downloads a pack of 20 questions for the topics they chose. The app can then be opened and the questions answered with no connection at all (hints and feedback included); the answers wait on the device and are sent automatically when the student is back online and signed in, or with a "Send my answers" button. The server rebuilds every question from its skill, tier and seed, grades it itself and updates mastery, the struggle ladder, XP and badges exactly as for online practice, so what the device says about correctness is never trusted. A pack lists only skill, tier and seed (never an answer key); each question counts once; packs are good for 7 days and answers are accepted for 7 days after that; a student holds at most five packs, and one student cannot use another's pack. XP and badges appear after the answers are sent.
- An "Install the app" button in the header. Browsers that can install the app (Chrome, Edge and others) get a one-tap prompt; iPhones and iPads get a short note on using Share, then "Add to Home Screen". It hides once the app is installed.
- Migration 6 (`offline_pack`); two student endpoints, `POST /api/learn/offline/pack` and `POST /api/learn/offline/sync`.
- Tests: server tests for packs and sync (grading, replay, other students, expiry, caps), and end-to-end tests that download a pack, go offline, practise, reload, go back online and check the server's records, and that check the install button, all with axe scans.

### Notes
- Offline practice keeps the list of questions and the student's answers in the browser's own storage (IndexedDB) on that device, and a copy of their name and settings so the app can open offline. Signing out removes the copy of their name and settings; answers not yet sent stay until they are. The service worker still never stores any API data.
- Because the questions are built on the device, a student could work out an answer outside the app; this is practice, and every answer still goes through the server's grading.

## [2.5.1] - 2026-11-21
### Added
- Grade 7 strands C to F: 26 new micro-skills with generated questions in English and French, three difficulty tiers each, a three-step hint ladder and a reason for every common wrong answer.
  - Algebra (7): comparing growing patterns, pattern rules and unknown terms, integer patterns, like terms, evaluating with decimals, multi-term equations (including letters on both sides) and inequalities.
  - Data (5): percentages in data, circle graphs, how adding or removing data changes the mean, independent and dependent events (exact fractions), theoretical and experimental probability.
  - Spatial sense (10): faces, vertices and edges, dilations and similar shapes, transformations on the plane, volume and capacity, area and volume unit conversions, circumference, area of a circle, cylinder surface area, and volume of prisms and cylinders. Circle work says "use 3.14 for pi".
  - Financial literacy (4): exchange rates, budgets, simple and compound interest, comparing accounts and loans.
- Eight Grade 7 lessons ("Show me how"), so every Grade 7 micro-skill has a lesson to fall back on.
- Independent arithmetic tests for every new generator (each recomputes the answer from the prompt by a different method; one was mutation-checked).

### Notes
- Grade 7 items that need richer tools (coding, infographics, misleading graphs, top, front and side views, constructing circles, reliable sources and factors that influence decisions) are still to come; see `docs/BACKLOG.md`.
- Placement quick checks for the new strands are not part of this release.

## [2.5.0] - 2026-11-21
### Added
- Grade 7 Number (strand B), the first Grade 7 content: 15 new micro-skills with generated questions in English and French, three difficulty tiers each, a three-step hint ladder and a reason for every common wrong answer. Topics: perfect squares and square roots, comparing negative fractions and decimals, simplest form, converting to percents, order of operations with brackets and exponents, mental percent change (1%, 5%, 10%, 25%, 50%, 100%), adding and subtracting integers, adding and subtracting fractions and mixed numbers, greatest common factor, least common multiple of two and three numbers, powers (including negative bases), multiplying and dividing fractions, multiplying and dividing decimals by decimals, and proportional reasoning with unit rates.
- Four Grade 7 lessons ("Show me how"), and a Grade 7 placement ladder that revisits Grade 6 skills first.
- Independent arithmetic tests for every new generator (each recomputes the answer from the prompt by a different method).

### Changed
- Grade 7 now shows Number as available; its other strands still say "coming soon".

## [2.4.1] - 2026-11-21
### Fixed
- On a phone, the caregiver Progress page could be wider than the screen: the 14-day and by-topic tables did not shrink, so the page scrolled sideways and taps landed slightly off target. The tables now scroll inside their card and wrap long words, and the end-to-end tests check that this page never scrolls sideways.

## [2.4.0] - 2026-11-21
### Added
- Phase 5 (Polish) of the MathQuest v2 rewrite.
- First-run walkthroughs for caregivers (7 steps: add a student, approve a device, goals and limits, progress, sharing, your data) and students (8 steps: topics, lessons, hints, scratchpad and keyboard, skill map, read aloud, XP). Skippable, replayable from the Help link, English and French, keyboard and screen-reader friendly (focus moves only when you ask for the tour, Escape closes it, it respects reduced motion), and remembered per person on the server so it follows them across devices.
- Installable app (PWA): a manifest, icons (including a maskable one), and a service worker that keeps the app shell and every built script offline. When the connection drops the app still opens, says so politely, and the plain offline page covers everything else. The service worker never intercepts or stores API data.
- More informative admin Updates page: the upgrade as steps (back up, download, check signature, start, health check) with the current one marked, the stage and plain reason when it fails, the previous version, when it started and finished, the backup file name, a rollback hint, release notes for every version between yours and the latest, and a clear explanation when upgrades cannot be requested (the host helper has not checked in, or the release check is failing).
- Optional personal note on invitations: admins inviting a caregiver, and caregivers sharing a student with a new person, can add a short plain-text note (500 characters, no links). It is quoted in the email, cannot change the link or the subject, is not stored, and the audit log only records that one was attached.
- Automated French-quality checks for the locale files (same keys, same placeholders, no untranslated strings).

### Changed
- The first screen now loads 97 kB of script instead of 728 kB: pages (practice, lessons, skill map, admin, progress, worksheets) load when first opened. Lessons and their try-it code load only when a lesson is opened.
- The upgrade helper writes richer status (`step`, `stepNumber`, `stepCount`, `error`, times, backup file name) and a heartbeat; `update.sh` reports each stage. The app treats all of it as untrusted input.

### Notes
- Offline practice (answering questions without a connection and syncing later) is not part of this release; see `docs/BACKLOG.md`.
- A manual screen-reader pass (VoiceOver and NVDA) is still to be done by a person; automated axe scans cover every page.

## [2.3.0] - 2026-11-21
### Added
- Phase 4 (Motivation and caregivers) of the MathQuest v2 rewrite.
- Rewards: XP for every answer (more for harder questions, a little less per hint, a small "good try" reward for a miss, bonuses for first practice of the day, the daily goal, mastering a skill or topic, and bouncing back from a tricky skill); levels; a day streak with streak freezes (one earned every seventh day, up to two held, one missed day covered); 16 badges.
- Unlockable cosmetics: 10 avatars and 5 colour palettes, unlocked by level or badge. Palettes are original, and every colour pair is tested against WCAG 2.2 AA.
- A rewards strip on every student page and a "My rewards" page; after each answer the student sees what they earned.
- Caregiver goals: set a real-world reward (for example "Movie night") for a number of XP earned from now on; the student sees progress; the caregiver marks it done once given.
- Caregiver progress page for each student: time and questions per day, accuracy, progress by topic, where a little help could count, reviews due, recent badges, goals.
- Printable worksheets with an answer key on its own page, for any topic with practice content, in either language; the same seed reprints the same sheet.
- Weekly email summary (Mondays from 07:30 family time, once a week, catching up if the server was down), in English or French, for caregivers who opt in.
- The caregiver's daily goal and session limit now work: a session pauses with a friendly break message after the limit, and a new one waits 20 minutes.
- Rewards are included in the data export and are deleted with the student.
- New setting `MATHQUEST_TZ` (default `America/Toronto`) for streak days, the daily goal and the weekly email.

### Notes
- Rewards never take XP away, and placement answers earn nothing.
- Next: Grades 7 to 12 content, and Phase 5 (PWA, offline practice and polish).

## [2.2.2] - 2026-11-21
### Added
- Grade 5-6 strands C to F (Algebra, Data, Spatial Sense, Financial Literacy): 28 new seeded generators in English and Canadian French, each with three tiers, a three-rung hint ladder and a misconception map. Topics: growing and linear patterns, decimal patterns, evaluating expressions, equations and inequalities; mean, median, mode, range, probability as fractions, decimals and percents, experimental and independent events; triangle and quadrilateral angles, complementary, supplementary and exterior angles, four-quadrant coordinates with reflections and translations; metric conversions, areas of parallelograms, triangles, trapezoids, rhombuses and composite shapes, perimeter, surface area; sales tax, best value and simple interest.
- 10 new lessons for those skills (patterns; expressions and equations; inequalities; mean, median and mode; probability; metric conversions; area, perimeter and surface area; angles; four quadrants; money).
- The skill map's "Practise this" now practises that one expectation instead of its whole strand (sessions accept an optional `focus` such as `G5.C2.3`).
- New tests recompute every answer independently from the prompt, and an end-to-end test practises one question in each new strand.

### Notes
- Not yet covered in these strands: coding, mathematical modelling, data collection and infographics, nets, 3-D views, transformations, taxes and budgeting (they need drawing, writing or open-ended tools that arrive in later phases).
- Grade 5-6 content is now present in every strand; Grades 7 to 12 are still to come.

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
