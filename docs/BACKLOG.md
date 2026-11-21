# Backlog

Items waiting for a phase or a slot. Newest first within each section. Move an item into the CHANGELOG when it ships.

## Release plan

Agreed 21 November 2026 (after 2.7.0 / 2.6.0 shipped). Sizes: S about a session, M two or three, L a multi-part build. Content releases go in grade order; the other tracks slot in between. Version numbers are targets and may shift.

### Content, in grade order

| Release | Scope | Size |
|---|---|---|
| 2.7.1 | Grade 8 algebra (C) and data (D): 11 skills, 3 lessons (shipped) | M |
| 2.7.2 | Grade 8 spatial sense (E) and financial literacy (F): 16 skills, 5 lessons (shipped) | M |
| 2.8.0 | Placement quick checks for strands C to F, Grades 5 to 8 (shipped) | S |
| 2.8.1 | Grade 6 gap fill: financial literacy complete, plus algebra (C1.1, C1.2, C1.4, C2.1), data (D1.1, D1.2, D1.3, D1.6) and combined transformations (E1.4): 13 skills, 4 lessons. Grade 6 C3, C4, D1.4, E1.2, E2.2 and E2.5 wait for the item tools below | M |
| 2.8.2 | Grade 5 gap fill: financial literacy complete, plus algebra (C1.1, C1.2, C2.1), data (D1.1, D1.2, D1.3, D1.6) and spatial sense (E1.5, E2.1, E2.3): 14 skills, 4 lessons. | M |
| 2.8.3 | Grade 5 completion: coding (C3.1, C3.2), infographics (D1.4), congruent shapes (E1.2), views (E1.3) and the protractor (E2.4), asked in words and numbers: 6 skills, 2 lessons. Grade 5 is now fully covered; the drawn and interactive versions still wait for 3.0.0 to 3.3.0 | S |
| 2.9.0 | Grade 9 (MTH1W) Number and Algebra: 19 skills, 5 lessons (in progress, PR open) | L |
| 2.9.1 | Grade 6 completion (priority 1, shipped): coding (C3, 2 skills), modelling (C4), infographics (D1.4), views (E1.2), protractor to 360 degrees (E2.2) and nets (E2.5), asked in words and numbers: 7 skills, 2 lessons. Every Grade 6 expectation now has practice | M |
| 2.12.0 | Grade 10 algebra, both courses (priority 2, part 1, shipped): MPM2D A3 (9 skills) and B1 (3), MFM2P B1 to B3 (6) and C1 (3); 21 skills, 7 lessons | L |
| 2.13.0 | Grade 10 part 2 (priority 2, shipped): MPM2D parabolas, projectiles, midpoint, distance, circles, similar triangles, trigonometry and the sine and cosine laws; MFM2P similar triangles, trigonometry, imperial units and parabola features: 22 skills, 5 lessons. Still open for Grade 10: B3 geometry proofs, MFM2P C3 graph reading, a Grade 10 quick check | L |
| 2.11.x | Grade 7 completion (priority 3): the unbuilt Number (B), algebra, data, spatial sense and financial expectations, plus the same words-and-numbers versions of coding, infographics, views and the protractor | M x 2 |
| 2.12.x | Grade 11 completion (priority 4): MCR3U, MCF3M, MBF3C and the other Grade 11 courses, every strand | L x 3 |
| Later | Grade 9 Data, Geometry and Financial plus C4.1 and coding; Grade 8 completion; Grade 12 | M to L |

### Richer item tools (each unlocks deferred expectations)

| Release | Scope | Unlocks |
|---|---|---|
| 3.0.0 | Protractor, sliders, draggable lines and curves | Angles, graphs, transformation parameters |
| 3.1.0 | Data items: tables, scatter plots, misleading graphs, infographics | Data strand D1, Grades 5 to 8 |
| 3.2.0 | Code snippets: predict the output, fix the bug | C3 coding, Grades 5 to 9 |
| 3.3.0 | Nets, 3-D and top/front/side views, compass constructions | E1.2, E2.4 and similar |

### Caregivers and motivation

| Release | Scope | Size |
|---|---|---|
| 2.10.0 | Weekly email day choice and test button, and this-week-against-last-week compare (shipped). Still open from the old row: worksheets with several topics and a worked-solution page | M |
| 2.8.5 | Caregiver notes and messages on goals | S |
| 2.11.0 | Weekly challenges, family goals, printable certificates and original SVG avatars (shipped). Caregiver notes and messages on goals remain below | M |
| Unscheduled | Dashboard progress export as a PDF | S |

### Platform

| Release | Scope | Size |
|---|---|---|
| 2.6.1 | Offline follow-ups: "expires soon" reminder, pack size and topic choice, caregiver view of unsent answers | S |
| 2.8.8 | "What is new" card after an upgrade, admin tour, Updates page cron schedule and "check again" | S |
| 2.11.1 | Faster on a phone: generators load one grade at a time (shipped). Still open: split the lessons' text by grade, per-skill bank-size summary on the admin page | S |
| 3.4.0 | Question writer for choice and fraction items; spaced review and lessons offline | M |

### Suggested order

Owner priority (set 21 November 2026): fill out Grades 6, 10, 7 and 11 completely, in that order. Grade 9 Number and Algebra (2.9.0) was already in progress and ships first.

2.7.1 and 2.7.2 finish Grade 8, then 2.8.0 so placement covers every strand, then 3.0.0 (it opens the most deferred content), then Grade 9. Caregiver items (2.8.4, 2.8.5) fit between content releases.

### For the owner (not releases)

- Run `scripts/pin-actions.sh` (needs internet access).
- Manual screen-reader pass (VoiceOver and NVDA).
- Dependabot: monthly, grouped minor and patch updates.
- Delete old remote branches.
- Check each new feature on the real server (install button, offline round trip, weekly email).

## Requested

## Noted earlier in this project (not yet scheduled)

- Pin GitHub Actions to commit SHAs (`scripts/pin-actions.sh`, needs internet access).
- Screen-reader pass (VoiceOver and NVDA) over lessons, the question player and the skill map (planned for Phase 5; automated axe scans are already in CI).
- Dependabot: switch to monthly with grouped minor and patch updates so it stops opening many PRs at once.
- Admin Updates page cannot see releases of a private repository from inside the container; resolved while the repository is public. If it goes private again, have the host agent write the latest-release info into `upgrade-status/`.
- Phase 3: content for Grades 5 and 6 first, then the next grades; the Claude-generated item pipeline and admin review queue; remaining item formats (sliders, draggable curves, protractor, simulators, code snippets).
- Create a `mathquest` skill (architecture, ports, release flow) and refresh `ontario-math-curriculum` once Grade 5-6 content is real.

## Phase 3 follow-ups (from 2.2.0)
- Grade 7 items that need richer tools: coding (C3), infographics and misleading graphs (D1.1, D1.4, D1.6), top, front, side and perspective views (E1.2), constructing circles (E2.4), reliable sources and decision factors (F1.2, F1.4).
- Grade 5-6 strand items that need richer tools: coding (C3), modelling (C4), data collection and infographics (D1), nets and 3-D views (E1.2, E2.5), transformations (E1.5), taxes and budgets (F1).
- Grades 7 to 12 content, in grade order. Grade 7 Number shipped in 2.5.0 and Grade 7 strands C to F in 2.5.1; Grade 8 shipped in 2.7.0 (Number), 2.7.1 (C and D) and 2.7.2 (E and F); next is Grade 9 (MTH1W).
- Admin usage view: add a per-skill bank-size summary (the "failed" label is now translated).
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
- Offline practice follow-ups: spaced-review items and lessons offline, pack size and refresh by topic, a clearer "expires soon" reminder, and a caregiver view of answers waiting on a device.
- Split the lesson try-it code from the lesson text so a lesson loads less than 585 kB.
- Walkthrough: a short "what is new" card after an upgrade; a tour for the admin pages.
- Updates page: show the agent's cron schedule and a "check again" button.
