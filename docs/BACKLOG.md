# Backlog

Items waiting for a phase or a slot. Newest first within each section. Move an item into the CHANGELOG when it ships.

## Release plan

Agreed 21 November 2026 (after 2.7.0 / 2.6.0 shipped). Sizes: S about a session, M two or three, L a multi-part build. Content releases go in grade order; the other tracks slot in between. Version numbers are targets and may shift.

### Priorities (set 22 November 2026)

The owner wants another parent to help test the app, so household and family accounts come first, then the brand refresh, then the quick checks. Version numbers are targets.

| Order | Release | Scope | Size |
|---|---|---|---|
| 1 | 3.14.0 (shipped) | Household and family accounts, part 1: a co-owner role so two parents are equals (both can delete, share and change a PIN, and neither can remove the other), ownership transfer, a caregiver can leave a shared child, caregiver account deletion with a full data export first, and a clear "invite a parent" path with a first-sign-in welcome. | L |
| 2 | 3.15.0 (shipped) | Household activity log: caregivers see who viewed or changed their children's data and when (the admin still sees account events only). Passkeys as a second way to sign in are planned after this. | M |
| 3 | 3.16.0 | Brand refresh, part 1: the colour tokens (blue, orange, yellow, neutrals), the logo (the shield with the rocket and compass; check with the owner before adopting any refinement), Inter and Fira Code bundled, student side playful and caregiver side calmer, the palettes recolouring the accents (see the brand entry under Requested). | L |
| 4 | 3.17.0 | Brand refresh, part 2: the brand icons redrawn as SVG (line icons for navigation, filled icons for topics and rewards) and avatar frames as a new reward. | L |
| 5 | later | Quick checks (placement ladders) for Grades 10 to 12; the shared-device "who is practising?" picker and a sibling comparison on the caregiver dashboard. | M |

Another parent can already test today without any of this: the admin invites their email from the Admin page, they sign in and add their own children, and the household isolation in 3.12.0 keeps their family apart from every other.

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
| 2.14.0 | Grade 7 completion (priority 3, shipped): 14 skills, 5 lessons, quick-check ladders updated. The original scope row follows. | M |
| 2.11.x (done as 2.14.0) | Grade 7 completion (priority 3): the unbuilt Number (B), algebra, data, spatial sense and financial expectations, plus the same words-and-numbers versions of coding, infographics, views and the protractor | M x 2 |
| 2.16.0 | Grade 11, part 2 (priority 4, shipped): MCR3U trigonometry and all of MCF3M: 23 skills, 4 lessons. | L |
| 2.15.0 | Grade 11, part 1 (priority 4, shipped): MCR3U functions, exponentials, sequences and finance: 18 skills, 5 lessons. | L |
| 2.12.x (in progress as 2.15.0 onward) | Grade 11 completion (priority 4): MCR3U, MCF3M, MBF3C and the other Grade 11 courses, every strand | L x 3 |
| 2.17.0 | Grade 9 completion (shipped): coding, linear against non-linear, data and modelling, geometry and measurement, financial literacy: 21 skills, 4 lessons, quick checks | L |
| 3.1.0 | Grade 8 completion (shipped): rational patterns, two-variable data, scatter plots, infographics, analysis, models from views: 6 skills, 3 lessons | M |
| 3.2.0 | Grade 12 MHF4U (shipped): logarithms, radians and trigonometric equations, polynomial and rational functions, rates of change and combining functions: 17 skills, 4 lessons | L |
| 3.3.0 | Grade 12 MCV4U (shipped): limits, derivatives and their rules, curves and optimization, vectors, lines and planes: 14 skills, 3 lessons | L |
| 3.4.0 | Grade 12 MDM4U (shipped): probability rules and counting, distributions, sampling and bias, statistical analysis: 16 skills, 3 lessons | L |
| 3.5.0 | Grade 11 MBF3C (shipped): quadratics, exponents, financial applications, design and trigonometry, data: 16 skills, 5 lessons | L |
| 3.6.0 | Grade 11 MEL3E (shipped): pay and deductions, sale prices and unit prices, savings, loans, vehicle costs and leasing, map scales and trips: 10 skills, 3 lessons | M |
| 3.7.0 | Grade 12 MCT4C (shipped): exponential and polynomial functions, formulas, trigonometry, forces, circle properties, arcs and sectors: 17 skills, 4 lessons | L |
| 3.8.0 | Grade 12 MAP4C (shipped): exponents and models, annuities and mortgages, owning against renting, budgets, optimal dimensions, trigonometry, two-variable data and bias: 16 skills, 4 lessons | L |
| 3.15.0 | Household activity log (shipped): per-student recent activity for the student's caregivers, 180-day retention, deleted with the student | M |
| 3.14.0 | Household and family accounts, part 1 (shipped): co-owner role, ownership transfer, leave a shared student, invite a co-parent to every student, account export and deletion with a 14-day wait | L |
| 3.13.0 | Grade 10 completion (shipped): MPM2D B3 verifying figures (midsegments, medians and the centroid, diagonals of a quadrilateral) and MFM2P C3 reading graphs, with a new read-only graph picture: 5 skills, 2 lessons. Every Grade 10 expectation now has practice | M |
| 3.12.0 | Household isolation (shipped): admin sees accounts only, usernames unique per household, owner-only delete, share and PIN, family goals stay in one household, same answer when sharing whether or not an address has an account; cross-household tests on every route | M |
| 3.11.0 | Rich HTML emails in the look of the app: sign-in, invitation, lockout and weekly summary, with a labelled button instead of the bare link (shipped) | S |
| 3.10.0 | Worksheet topic picker lists the Grade 10 to 12 course topics (shipped); the keyboard-only e2e test handles protractor questions | S |
| 3.9.0 | Grade 12 MEL4E (shipped): mean and median, chance and expected value, housing, budgets and income tax, units, scale and proportional reasoning: 11 skills, 3 lessons. Every Ontario course is now built | M |

### Richer item tools (each unlocks deferred expectations)

| Release | Scope | Unlocks |
|---|---|---|
| 3.0.0 | Protractor and sliders (shipped); draggable lines and curves still to come | Angles, graphs, transformation parameters |
| 3.1.0 | Data items: tables, scatter plots, misleading graphs, infographics | Data strand D1, Grades 5 to 8 |
| 3.2.0 | Code snippets: predict the output, fix the bug | C3 coding, Grades 5 to 9 |
| 3.3.0 | Nets, 3-D and top/front/side views, compass constructions | E1.2, E2.4 and similar |

### Caregivers and motivation

| Release | Scope | Size |
|---|---|---|
| 2.10.0 | Weekly email day choice and test button, and this-week-against-last-week compare (shipped). Still open from the old row: worksheets with several topics and a worked-solution page | M |
| 2.18.0 | Caregiver notes and messages on goals (shipped) | S |
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

- Household and family accounts (priority 1, notes from 22 November 2026). Today each child has one owner plus optional co-caregivers, and there is no household entity. Wanted:
  - A **co-owner** role so two parents are equals. Owners can delete, share, change a PIN and add other owners; nobody can remove the last owner; an owner can step down.
  - **Ownership transfer** to another caregiver who already shares the child, with a confirmation email to both.
  - **Leave a shared child** for a co-caregiver, without the owner having to unshare.
  - **Account deletion** for a caregiver, after a full export (their students, progress, goals, messages) they can download. Define what happens to children they own when other owners exist (they stay) and when none do (they are deleted after a clear warning and a waiting period).
  - **Invite a parent** from the caregiver page (today only the admin can invite someone with no child to share), with a welcome on first sign-in that explains devices and PINs.
  - **Activity log** per child, readable by that child's caregivers (priority 2): who viewed or changed what and when. Student sign-ins, goals, messages, worksheets and exports are already recorded in the audit log; the caregiver view and a retention rule are what is missing.
  - **Passkeys** as a second way to sign in, so a mailbox is not the only key to a household (after the activity log).
  - Keep the 3.12.0 rules: the admin sees accounts only, usernames are unique per household, a refused share reveals nothing about other families. Extend `tests/household-isolation.test.ts` for every new route (co-owners, transfer, leave, delete and export).

- Brand refresh (decisions made 22 November 2026, nothing built yet). Logo: the shield with the rocket and compass (version 2). If it is refined, check with the owner before adopting. Student side playful (gems, flames, filled topic and reward icons), caregiver side calmer. Line icons for navigation, filled icons for topics and rewards. Palette: blue #1565C0, orange #F57C00, yellow #FBC02D; navy text on orange and a deeper green for text so contrast passes. Redraw the icons as SVG (the sheet icons are raster and some labels have typos), bundle Inter and Fira Code with the app, and keep a high-contrast mode. The mockup is a private artifact; swap the colour tokens first, then icons and logo. Size: M to L.
  - Customization rewards (a student unlocks 10 avatars and 6 colour palettes by level or badge; `shared/rewards.ts`, `shared/palettes.ts`, `web/src/avatars.tsx`, `web/src/rewards.tsx`). What the brand changes:
    - **Classic is the base.** Classic applies no overrides, so it becomes the brand look the moment the base tokens change, for every student who equipped it. Keep the ids (`palette-classic` and the rest) so equipped choices and unlock levels carry over; only the values change.
    - **Decided (22 November 2026): unlockable palettes recolour the accents too, and avatar frames are a new reward.** The points below are written with those two decisions in mind.
    - **The new colours need a home in every palette.** The five unlockable palettes (Sunrise, Forest, Ocean, Twilight, Candy) override `--brand` and friends only. Orange (the next action), yellow (reward) and their soft tints are new variables; a palette that does not define them would show brand orange and yellow inside a green or pink page. Each palette needs its own orange, yellow and text-on-orange. Decided: every palette defines its own orange, yellow and soft tints (Sunrise's accent must stay distinguishable from its brand colour, and Candy's pink page gets its own warm accents), so each palette reads as one whole look. The brand palette (Classic) keeps #F57C00 and #FBC02D.
    - **Contrast tests grow.** `tests/palettes.test.ts` checks each palette pair for 4.5:1. Add navy-on-orange, text on the soft tints and the dark Twilight orange. Navy on #F57C00 is 5.6, white on it only 2.7.
    - **Icons do not recolour.** The brand topic and reward icons carry their own blue, orange and yellow. Keep them on light tiles (as in the mockup) so a palette changes the page and the buttons but never repaints an icon, or redraw the SVGs so only the blue part follows `--brand`.
    - **Avatars.** The 10 avatars stay, restyled in the brand's filled style. `avatar-rocket` (unlocked by a 7 day streak) now echoes the logo's rocket, so keep it special: for example give it the shield frame. New cosmetic kind, **frame** (decided: yes), drawn around the avatar in the brand's shield shape: for example a blue shield from level 1, then silver, gold and a rocket-trail frame earned by level or badge, so students have something new to earn without touching the existing unlocks. Needs: a `frame` kind in `shared/rewards.ts` COSMETICS with unlocks, a `frame` column on `reward_state` (migration), the picker on the rewards page, the frame drawn in `web/src/avatars.tsx`, French names, and tests for unlock rules and for every frame being known to the renderer.
    - **Themes.** The student themes `playful`, `hud` and `pro` become: playful = the brand student look, pro = the calmer look (also the caregiver default), hud unchanged. Palettes only apply on the student side, so caregivers always get the brand blue.
    - **High contrast** still wins over any palette and drops orange and yellow for black, white and one bright accent. Dark mode: only Twilight is dark today, so a light palette on a dark device needs a decision (keep it light, or add dark values).
    - **Not affected:** XP, levels, badges' rules, the unlock levels, and the saved choices in `reward_state`.


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
- Admin usage view: per-skill bank-size summary (shipped in 2.19.0). Next: fix the thin skills it flags.
- Let the question writer produce non-numeric formats (choice, fraction) once the verifier can re-compute them.
- Refresh the `ontario-math-curriculum` skill and create a `mathquest` skill.

## Phase 4 follow-ups (from 2.3.0)
- Theme art beyond emoji avatars and colour palettes (original SVG avatars and backgrounds).
- Reward ideas: weekly challenges, a team goal for siblings, a printable certificate.
- Caregiver notes on a goal, and a message from the caregiver that the student sees.
- Weekly email: a "send me a test email" button and a choice of day.
- Dashboard: compare against the previous week, and export progress as a PDF.
- Worksheets: several topics and a worked-solutions page (shipped in 2.19.0).

## Phase 5 follow-ups (from 2.4.0)
- Offline practice follow-ups: spaced-review items and lessons offline, pack size and refresh by topic, a clearer "expires soon" reminder, and a caregiver view of answers waiting on a device.
- Lesson text now loads by grade group (shipped in 2.19.0).
- Walkthrough: a short "what is new" card after an upgrade; a tour for the admin pages.
- Updates page: show the agent's cron schedule and a "check again" button.
