# Backlog

Items waiting for a phase or a slot. Newest first within each section. Move an item into the CHANGELOG when it ships.

## Requested

## Noted earlier in this project (not yet scheduled)

- Pin GitHub Actions to commit SHAs (`scripts/pin-actions.sh`, needs internet access).
- Screen-reader pass (VoiceOver and NVDA) over lessons, the question player and the skill map (planned for Phase 5; automated axe scans are already in CI).
- Dependabot: switch to monthly with grouped minor and patch updates so it stops opening many PRs at once.
- Admin Updates page cannot see releases of a private repository from inside the container; resolved while the repository is public. If it goes private again, have the host agent write the latest-release info into `upgrade-status/`.
- Phase 3: content for Grades 5 and 6 first, then the next grades; the Claude-generated item pipeline and admin review queue; remaining item formats (sliders, draggable curves, protractor, simulators, code snippets).
- Offline practice: answer questions without a connection and sync later (needs client-side generators, a signed queue the server can replay and verify, and a decision on showing answers offline).
- Create a `mathquest` skill (architecture, ports, release flow) and refresh `ontario-math-curriculum` once Grade 5-6 content is real.

## Phase 3 follow-ups (from 2.2.0)
- Grade 5-6 strand items that need richer tools: coding (C3), modelling (C4), data collection and infographics (D1), nets and 3-D views (E1.2, E2.5), transformations (E1.5), taxes and budgets (F1).
- Placement quick checks for strands C to F (the ladders cover Number only).
- Grades 7 to 12 content, in grade order. Grade 7 Number shipped in 2.5.0; next are Grade 7 strands C (algebra), D (data), E (spatial sense), F (financial literacy), then Grade 8.
- Admin usage view: translate the "failed" label; add a per-skill bank-size summary.
- Let the question writer produce non-numeric formats (choice, fraction) once the verifier can re-compute them.
- Refresh the `ontario-math-curriculum` skill and create a `mathquest` skill.

## Phase 4 follow-ups (from 2.3.0)
- Theme art beyond emoji avatars and colour palettes (original SVG avatars and backgrounds).
- Reward ideas: weekly challenges, a team goal for siblings, a printable certificate.
- Caregiver notes on a goal, and a message from the caregiver that the student sees.
- Weekly email: a "send me a test email" button and a choice of day.
- Dashboard: compare against the previous week, and export progress as a PDF.
- Worksheets: choose several topics on one sheet; add a solution page with the worked steps.

## Phase 5 follow-ups (from 2.4.0)
- Offline practice (see above), and an "Install the app" button inside the app.
- Split the lesson try-it code from the lesson text so a lesson loads less than 585 kB.
- Walkthrough: a short "what is new" card after an upgrade; a tour for the admin pages.
- Updates page: show the agent's cron schedule and a "check again" button.
