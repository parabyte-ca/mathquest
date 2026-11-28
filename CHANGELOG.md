# Changelog

## [3.27.0] - 2026-11-28
### Added
- "Who is practising?" for a device shared by brothers and sisters. On an approved device the sign-in page now shows a tile for each of the caregiver's children, with their avatar and first name. A child taps their tile and types their PIN: no username to type. A "Type a username instead" link is still there.
- The child who signed in last on the device comes first, marked "Last time".
- "Switch student" in the menu (shown where the caregiver has more than one child) signs the child out and goes straight back to the tiles. Signing out as a student now returns to the tiles instead of the caregiver's sign-in page, and so does a sign-in that has ended.
- On a device shared by brothers and sisters (a caregiver with more than one child), a child's sign-in ends after 20 minutes without use, so the next child lands on the tiles. Time spent reading or watching counts as use. The page returns to the tiles with a short note, and the server enforces it too, so a closed or sleeping tab cannot stay signed in. A caregiver with one child is not affected and stays signed in for 30 days as in 3.25.1.

### Privacy
- The tiles are told only to a device a caregiver has approved, and show only first name and avatar: no username, PIN, grade or email. A device that is removed, or a browser that was never approved, gets nothing. Tapping a tile uses the same PIN check, wrong-PIN count and 15 minute lock as typing a username, and only children of the caregiver who approved the device can be chosen.

### Notes
- Migration 16 adds a per-sign-in idle limit.
- Tests check the list (names and avatars only, approved devices only, only that caregiver's children, rate limit), signing in from a tile, the shared lock count, other families' children being refused, the 20 minute idle sign-out and that use keeps it going, signing back in without a new code, and that a one-child household and a caregiver's own sign-in are untouched. An end-to-end test checks the tiles, "Last time", a wrong PIN, switching student and returning on phone, tablet and desktop.

## [3.26.0] - 2026-11-28
### Added
- Photo reading of worksheets. On a worksheet a caregiver can take or choose a photo of the finished sheet. Claude reads the handwriting and fills in each numbered answer. The caregiver then checks every answer against the photo (shown beside the answers, with unsure or missing ones flagged), fixes anything wrong, and only then marks the sheet. Points, the finishing bonus and "each sheet counts once" are exactly as for answers typed in (3.25.0).
- The reader only copies. It is never told the correct answers and never marks, corrects or solves anything: the app marks every answer by the same exact rules as practice. A misread answer is therefore simply wrong until a caregiver fixes it, and nothing in a photo, including writing that looks like an instruction, can change a mark.
- Off unless switched on: set `PHOTO_GRADING=true` (it also needs `ANTHROPIC_API_KEY`). It has its own monthly spend cap (`PHOTO_MONTHLY_CAP_USD`, default 2) inside the overall AI cap, checked against the worst case before each call, and each caregiver can send 10 photos an hour. The Admin page shows whether it is on and what it has spent.

### Fixed
- From the Admin page there was no clear way back to the caregiver screen. Admin now has a "Back to my students" button at the top, and the menu lists "My students" and "Admin" together, with the one you are on marked as the current page.

### Privacy
- The photo goes only to the one request that reads it, and MathQuest keeps no copy: it is not saved to disk or the database, and only token counts and cost are recorded. The page shrinks and redraws the picture first, which also drops hidden details such as where it was taken. The request carries no name, username, email or grade, and never the answers. The caregiver is told this beside the button.
- Only the student's own caregivers can use it; the install admin cannot, and a student cannot. The activity log records that a photo was read (how many questions and how many answers were read), never the photo or the answers.

### Notes
- Tests check how each kind of answer is read from text (fractions, mixed numbers, letters, orderings, matches, points), that the reader is sent the photo and the kind of answer wanted but never the answers or anything about the student, that no copy of the photo is recorded, both spend caps, the hourly limit, bad images, unreadable replies, access, and that a sheet already marked is refused. An end-to-end test reads a photo with a stand-in reader and checks nothing is marked until the caregiver confirms.

## [3.25.1] - 2026-11-28
### Fixed
- A student's device that a caregiver had already approved was asked for a new 6-digit code every time the student came back, and every code made another entry in the caregiver's device list. The sign-in page now recognises an approved device, so a returning student is asked only for their username and PIN.

### Changed
- A student now stays signed in on an approved device for 30 days of use (it was 12 hours). Each visit renews it, and the student can still sign out.
- An approved device stays trusted for a year from its last use, and each use renews it, so a device that is used regularly never needs approving again. A device left unused for a year is asked to be approved again.
- Removing a device in the caregiver's device list now also signs the student out of that device straight away. Their other devices are not affected.

### Notes
- Migration 15 records which approved device each student sign-in was made on.
- Tests check that an approved device is recognised again and again without a second device being made, that a new browser, a made-up cookie and a removed device are not trusted, the 30-day sign-in, and that removing a device signs out only that device. An end-to-end test comes back to an approved device and checks no code is asked for.

## [3.25.0] - 2026-11-27
### Added
- A worksheet can now be answered on screen and marked. On a worksheet, a caregiver chooses "Enter answers", types or picks the answers from the paper sheet one question at a time (every question type works the same way as in practice), checks the list, and chooses "Mark the sheet". The app checks each answer by the same exact rules as practice and shows what was right and what the answer was.
- Marking earns points: every answer pays the same XP as the matching practice question, and finishing the whole sheet (every question answered) adds a 15 XP bonus, shown as "Finished a worksheet". Marked answers also update the student's skill progress, review schedule and weekly challenges, exactly as practice does.
- Each sheet counts once. A sheet is its topics, difficulty, length and seed, so printing it again or marking it a second time pays nothing more; the sheet says it has been marked, with the score.
- Marking is recorded in the family's activity log and in the student's data export, and is deleted with the student.

### Fixed
- Since 3.22.0 the printable worksheet floated over the page on screen (it shared a style name with the new menu, so it was positioned like a pop-up). The menu now has its own style name, and a test checks the worksheet sits in the page.

### Notes
- Marking works with no AI and no connection beyond the app itself. Photo grading (3.26.0) will build on it: a photo only supplies the entered answers, and the same marking and points apply.
- Marking is for the student's own caregivers. The install admin cannot mark a family's worksheets or see them, and a student cannot reach the answers.
- The server rebuilds the sheet from its seed and checks every answer itself, so a changed browser cannot award points. A repeated or out-of-range question number is ignored.
- Migration 14 adds the `worksheet_marked` table.

## [3.24.0] - 2026-11-27
### Changed
- Amounts of money now use the dollar sign everywhere, the Canadian way: "$45.50" in English and "45,50 $" in French, in practice, lessons, worksheets and answer keys. About 460 questions and answer steps (budgets, e-transfers, fuel, cars, mortgages, interest, taxes, pay) no longer write "45.50 dollars". Whole amounts have no cents ("$45") and amounts with cents always show two ("$12.50", "$1.00").
- Phrases with no amount keep the word ("How many dollars are left?", "in dollars"), and so do named currencies ("US dollars", "Canadian dollars", "dollars canadiens"), where the sign alone would not say which dollar.
- A question that mixes a formula with the unit, such as a taxi charge C = 3n + 52, still ends "dollars".
- Amounts are read aloud as dollars and cents ("twelve dollars and fifty cents", "douze dollars et cinquante cents") by the voice reader.

### Notes
- The dollar sign is written in questions as a small TeX macro (`\dollar`, defined in `shared/tex.ts`) instead of a literal "$", because a literal "$" starts and ends maths in the question text. Authors write `f.D(amount)`; `f.D(amount, true)` always shows cents. Before the maths library has loaded, a plain dollar sign shows.
- Tests check the formatting in both languages, that no question, step or option in the whole bank still ends an amount with the word "dollars", that every amount draws without a maths error, that the English and French questions show the same amounts, and the spoken form.

## [3.23.0] - 2026-11-27
### Added
- A tiled background for every colour palette, drawn to match its name and shown behind the student pages: Classic has maths symbols, Sunrise a sun, gulls and clouds, Forest pine trees and a toadstool, Ocean waves, fish and bubbles, Twilight stars and a crescent moon, and Candy lollipops, wrapped sweets and sprinkles. Equipping a palette brings its background with it, with the same unlock levels as before.
- Each tile is a small original drawing in the palette's colours, drawn faint so text, which always sits on solid cards, keeps the contrast the palette tests check. Nothing is fetched from another site and they work offline.
- A "Plain background" switch in the student's display settings turns the pattern off. High contrast always removes it, and it is never printed.

### Changed
- The rewards pill no longer wraps onto a second line on a phone; the XP meter shrinks to fit.

### Notes
- Caregiver pages never show a pattern. Tests check that every palette has one tile, that each is faint (every shape at 45% opacity or less), well formed and free of scripts, links and images, that each draws what its name says, and that the plain setting and high contrast remove it; the end-to-end suite checks every palette and both switches in a browser.

## [3.22.0] - 2026-11-27
### Changed
- A softer, more cohesive look across the app. Surfaces are separated by gentle shadows and tints instead of thin outlines and hard divider lines; cards, buttons, inputs and choices are rounder, and the page has a faint blue-to-white gradient. The student side is the roundest (pill buttons, 24 px cards) and the caregiver side is calmer (tighter corners, lighter shadows).
- The level, XP and streak strip is now a floating pill inside the page, as wide as the card below it, instead of a square band wedged against it.
- Help, Language, Sign out, Install and (for the admin) Admin move behind one round menu button in the header, so the header is a single slim row. The menu opens a soft sheet with an icon beside each item; Escape or a tap outside closes it and returns focus to the button, and choosing an item closes it. It works by keyboard and with a screen reader (the button says whether it is open).
- Topic choices are rounded tiles that highlight when ticked, "Practice without internet", "Quick check" and the other secondary buttons are soft tonal buttons, and the colour palettes carry through every new surface. High contrast keeps hard edges and turns the shadows and gradients off.

### Notes
- Tests check the new tonal button colours (brand text on the soft tint) in light, dark and every unlockable palette, and the end-to-end suite opens the menu, scans it for accessibility problems, and checks Escape and a tap outside.
- Reward backgrounds (a tiled background for each palette), the dollar sign, worksheet marking and photo grading are planned next; see the backlog.

## [3.21.0] - 2026-11-22
### Security
- "Invite a co-parent" no longer shares everything you own. You tick the students (none are ticked to begin with), and the server shares exactly those. A request with no list, an empty list, or a student that is not yours is refused and shares nothing and creates no account; one wrong id refuses the whole request. The role now defaults to Helper rather than Owner.
- Before anything is sent, sharing asks "Share Sam with name@example.com as Helper?", showing the address back, for one student and for several.
- When an owner shares a student, every other owner of that student gets an email with the address that was added and the students concerned (one email per owner), so a mistyped address or an unwanted share is noticed straight away. The recent activity list already shows it too.
- Tests check that an invited caregiver reaches only the named students on every route, that a helper cannot pass on a student, and that a share to an unknown address leaves no trace.

### Added
- The Admin page shows, for each caregiver account, how many students they own and how many they help with ("owns 2, helps with 1"). It never shows which students, or anything about them: the admin still cannot see any family's data.

### Notes
- The API for "Invite a co-parent" now requires `studentIds`.

## [3.20.0] - 2026-11-22
### Added
- A first-sign-in welcome for a parent who was invited to students. The first time they sign in, the top of the caregiver page says who shared how many students with them, lists each student with their role, explains what that role can do (an owner can change a PIN, share and delete; a helper can see progress, set goals, message, make worksheets and approve devices, and can leave), shows how a student signs in on a new device (get a code, approve it, then username and 4-digit PIN) and says who can see what. It is in English and French, and it appears once.
- The welcome stands in for the first-run walkthrough, so an invited parent is not shown both. "Take the quick tour" starts the walkthrough from the welcome, and the Help link always does.
- It works for both ways of inviting: sharing one student, and "Invite a co-parent" for every student. Someone invited by two people sees both names.

### Notes
- It only ever describes the signed-in person's own invitations; a signed-out visitor and the admin get nothing, and it is deleted with the account. Caregivers who only have their own students see the normal first-run walkthrough as before.
- No migration: it uses the existing "seen" markers.

## [3.19.0] - 2026-11-22
### Changed
- The brand refresh is finished. The install icons (home screen, app launcher, iPhone) and the browser tab icon now show the logo, and so do the sign-in emails, which use the same image. The logo is the supplied image, unchanged; it is a small picture, so the largest icon is a little soft.
- Line icons on the navigation (Help, Language, Sign out, Install) and on the learning page buttons (Start, Practice without internet, Quick check, Skill map, My rewards, Settings). The words are still there, so nothing changes for screen readers.
- Filled icons in the brand's colours replace the emoji for topics (Number, Algebra, Data, Spatial Sense, Financial Literacy), streaks, streak freezes, goals, stars, gifts, ticks, the family goal, weekly challenges and certificates.
- The student side is playful (rounder cards and buttons, a blue-to-yellow progress meter, bolder headings) and the caregiver side is calmer (flatter, tighter, no gradients). Colours, type and icons are the same on both. High contrast turns the extras off.
- "Start practice" is now the orange next-action button. The browser theme colour matches the brand blue.

### Notes
- Tests check that every icon a page asks for is drawn, that every challenge emoji has a drawing, that the install icons are the sizes the manifest promises, and that there are no scripts or links inside the icons.

## [3.18.0] - 2026-11-22
### Added
- Quick checks for Grades 10 to 12. The "quick check" on the learning page now works for every Grade 10, 11 and 12 course (it used to answer "no content" there). Each check covers the whole course (12 courses in all, 10 to 30 skills each), takes at most eight questions, and starts practice at the right level: skills the student plainly knows are raised, nothing is ever lowered, and other courses are left alone.
- Each course's skills are ordered from easiest to hardest by how many prerequisites sit below each one, and a test checks that every course ladder holds exactly that course's skills and never puts a skill before its own prerequisite.

### Notes
- The course is stored in the existing placement table, so there is no migration. The older checks by strand for Grades 5 to 9 are unchanged.

## [3.17.0] - 2026-11-22
### Added
- Avatar frames, a new reward. A student can draw the brand's shield around their avatar: Blue shield (level 2), Silver shield (level 5), Gold shield (level 9) and Rocket trail (earned with the month-streak badge). "No frame" is the starting choice, so nothing changes for anyone until they pick one. The frame shows in the header and on the rewards page, with a "Frames" picker, in English and French. Frames are part of a student's export.
- The 16 badges are now filled SVG icons on round medals in the brand's blue, orange and yellow, drawn for this app so they look the same on every device; a locked badge is a grey medal with a padlock. The old emoji remain as a fallback.

### Notes
- Migration 13 adds `reward_state.frame`. Existing students keep "no frame".
- The avatars were already SVG. A vector logo, the install icons and line icons for the navigation are still to do; any change to the logo will be checked with the owner first.

## [3.16.0] - 2026-11-22
### Changed
- The app has the new brand colours: a deeper blue (#1565C0) for the app, links and buttons, orange (#F57C00) for the next action (Check, Next, Continue) with navy text because white on orange fails contrast, and yellow for rewards. Light and dark modes both pass the contrast checks, and high contrast still wins, using one bright accent.
- Inter is now the app's font and Fira Code is used for answers and typed maths. Both ship with the app (Latin letters only, including French accents) and are saved for offline use, so nothing is fetched from another site.
- The logo (the shield with the rocket and compass, as supplied) now shows in the top bar.
- The five unlockable colour palettes (Sunrise, Forest, Ocean, Twilight, Candy) each have their own orange, yellow and tints, so every palette reads as one whole look instead of showing brand orange inside a green or pink page. Classic is the brand look. The unlock levels and saved choices are unchanged.
- Magic-link emails, the offline page, the app icon colour and the browser theme colour use the new blue.

### Notes
- The logo is the supplied raster image, not a redrawn version; the PWA icons and favicon keep their old shape for now. The SVG icon set, a vector logo and avatar frames are 3.17.0, and any change to the logo itself will be checked with the owner first.

## [3.15.0] - 2026-11-22
### Added
- Recent activity for each student, on the caregiver page: who looked at the progress, changed the profile, set a goal, sent a message, made a worksheet, shared, handed over, exported or left, and when a student signed in on a device or was locked out. Every caregiver on a student can read it, with names; a caregiver who has since left shows as "A former caregiver".
- The log records what happened, never what was written: goal titles and message text stay in goals and messages.
- Opening a student's progress is recorded at most once every 30 minutes per person. Inviting a co-parent now shows on every student it shared.
- Activity is kept for 180 days, and is deleted with the student or the account.

### Security
- The log is read through the same single gate as every student route: another household, the admin and signed-out visitors get "not found" and see nothing. The admin's own audit log still lists account events only. Migration 12 adds `audit_log.student_id` (deleted with the student) and fills it in for existing entries.

### Notes
- Passkeys as a second way to sign in are next in the household work.

## [3.14.0] - 2026-11-22
### Added
- Two parents as equals. A student can have several owners: any owner can change the PIN, share and delete, and owners cannot remove or demote each other. An owner can promote a helper, and can step down to helper, but a student always keeps at least one owner. Up to six caregivers per student.
- Hand a student over to another caregiver already on them: they become an owner, you become a helper, and both of you get an email.
- A helper can leave a shared student without asking the owner. An owner can leave when another owner remains.
- "Who is on this student" on the caregiver page, with the actions each role may take.
- "Invite a co-parent" on the caregiver page shares every student you own in one step, as owner or helper, with a single sign-in email. It answers the same whether or not the address has an account; a student whose username clashes with one the person already has is skipped quietly.
- "Download my data": one file with your account, the students you can reach with your role on each, family goals and the messages you sent.
- Delete your account. You see what happens to each student, type your email to confirm, and the account is deleted after 14 days; signing in and choosing Cancel stops it. Students only you own are deleted with the account; students with another owner stay with them. If someone is made a helper on one of your students during the wait, the deletion is cancelled and you are emailed rather than losing their data. The admin account is not deleted this way.

### Security
- The new routes sit behind the same single gate as every student route, are rate limited, and are in the cross-household test table. The admin audit log lists the new account events without any student detail. 

### Notes
- Activity log and passkeys are next (3.15.0). A dedicated first-sign-in welcome for invited parents is still on the backlog; they see the existing caregiver tour.

## [3.13.0] - 2026-11-22
### Added
- Grade 10 is now complete: 5 new micro-skills (463 in all) and 2 lessons.
  - MPM2D B3, verifying properties of figures with coordinates: the midsegment of a triangle (half the third side), medians and the centroid, and the diagonals of a quadrilateral (name a parallelogram, rectangle, rhombus or square from whether its diagonals bisect each other, are equal or are perpendicular). Each figure is drawn on a grid with its labelled vertices.
  - MFM2P C3, interpreting graphs of a quadratic relation: the greatest height, when it is reached, the starting height, a height at a time, when it lands, and how long it stays above a height, all read from a graph of a ball, a jet of water or a model rocket.
- A new read-only graph picture: a smooth curve on a grid with labelled ticks and axis names, drawn from the same numbers as the question. For screen readers it comes with a text equivalent that lists the values at each whole number, and it appears in worksheets and lessons too.
- Every new answer is recomputed from the picture's own points by an independent, mutation-tested check, so a picture that disagrees with its question is caught. An end-to-end test opens both lessons, checks the axis names, the text equivalent and the accessibility scan.

### Notes
- Dragging a point or a curve (to draw a line or a parabola) is still on the backlog.

## [3.12.0] - 2026-11-22
### Security
- Each household is now kept apart from every other. A caregiver reaches only themselves, their own students and the caregivers they share a student with.
- The install admin manages accounts only (invite, disable, upgrades, question review) and can no longer open any student's progress, goals, messages, worksheets or export. The audit log shown to the admin lists account-level events only. Students the admin has no link to answer "not found", as for any other outsider.
- Sharing a student answers the same whether or not the address already has an account, and an address that belongs to an admin is never linked. An existing caregiver now gets a short email saying a student was shared with them.
- Family goals count only the students their creator owns, and a student sees only their owner's goals, so one household's progress no longer feeds another's.

### Changed
- Student usernames only have to be unique inside a household, so two families can both have "sam". A student signs in on a device a caregiver approved, and the name is looked up only among that caregiver's students. Creating a student, or sharing one with a caregiver who already has a different student of that name, is refused when the names clash, without saying anything about other families. The students table is rebuilt to allow this (migration 10), and all data is kept.
- An additional (co) caregiver can view, set goals, message, make worksheets, approve devices and export, but cannot delete a student, share or unshare, or change a PIN.

### Added
- `tests/household-isolation.test.ts`: three households and an admin, every student route checked for who gets in and who gets "not found", the upgrade checked with data in place, and eleven protections each broken on purpose to confirm a test notices.

## [3.11.0] - 2026-11-22
### Added
- Emails now come as rich HTML in the look of the app (the app's blue, the MathQuest wordmark and logo, a card layout) with a labelled button, such as "Sign in to MathQuest" or "Accept the invitation", instead of the bare link. This covers the sign-in link, caregiver invitations (with the personal note shown as a quotation), the lockout notice and the weekly summary, which now lists each student in its own section.
- A dark version for mail clients that support it, a hidden preview line, and a width that fits a phone.

### Changed
- Every email still carries a plain-text copy with the full link, for clients that block HTML or links. The weekly summary text is unchanged.

### Security
- Everything a person types (names, notes, goal titles) is escaped in the HTML, and a button only ever links to an http or https address. Tests cover both.

## [3.10.0] - 2026-11-22
### Added
- The worksheet topic picker now lists the Grade 10 to 12 course topics (MPM2D, MFM2P, MCR3U, MCF3M, MBF3C, MEL3E, MHF4U, MCV4U, MDM4U, MCT4C, MAP4C, MEL4E), grouped by grade and course after the grade-level topics. Up to six topics, course or grade-level, can still be mixed on one sheet.

### Fixed
- The keyboard-only accessibility test failed about one run in thirty when Grade 5 strand E drew the protractor question. It now sets slider and protractor questions with the keyboard.

### Notes
- A test now checks that every topic the picker lists makes a sheet, so the picker cannot offer a dead choice.

## [3.9.0] - 2026-11-22
### Added
- Grade 12 MEL4E (Mathematics for Work and Everyday Life): 11 new micro-skills (458 in all) and 3 lessons, choosable by course with its three strands. Every Ontario Grade 11 and 12 course now has practice content.
  - Reasoning with data: mean, median and the mark needed for a target average, quartiles and spread, rules of probability, and chance in games, raffles and insurance (expected value).
  - Personal finance: owning against renting, household budgets, and filing an income tax return (taxable income, refund or amount owing, and a two-bracket tax).
  - Applications of measurement: converting units within and between imperial and metric, scale drawings and a household improvement cost, and direct and inverse proportional reasoning.
- Every new answer is recomputed by an independent, mutation-tested check.

### Notes
- Collecting data and the research parts of the courses stay in the lessons; there is nothing to auto-check.
## [3.8.0] - 2026-11-22
### Added
- Grade 12 MAP4C (Data Management and Applications for College): 16 new micro-skills (447 in all) and 4 lessons, choosable by course with its four strands.
  - Mathematical models: rational exponents, exponent rules, exponential equations, comparing linear models (including the break-even point), and rearranging formulas.
  - Personal finance: annuities, mortgages (interest paid, balance after a payment, the split of a payment), owning against renting, and budgets.
  - Geometry and trigonometry: measurement problems, optimal dimensions of rectangles, right-triangle trigonometry and the sine and cosine laws with obtuse angles.
  - Data management: the line of best fit, quartiles and outliers, and bias in data from the media and advertising.
- Every new answer is recomputed by an independent, mutation-tested check; the optimal dimensions are checked by trying every whole-number rectangle.

### Notes
- Technology-based solving (TVM solver, amortization tables) and graph-reading tasks stay in the lessons; there is nothing to auto-check.
- MEL4E still shows "coming soon".

## [3.7.0] - 2026-11-22
### Added
- Grade 12 MCT4C (College Technology): 17 new micro-skills (431 in all) and 4 lessons, choosable by course with its four strands.
  - Exponential functions: growth and decay problems, solving exponential equations with common bases and logarithms, and evaluating logarithms.
  - Polynomial functions: evaluating, key features of the graphs, solving by factoring, and rearranging technology formulas (Ohm's law, power, motion).
  - Trigonometry: right-triangle applications, the sine and cosine laws, features of sine functions and sinusoidal models.
  - Applications of geometry: forces and navigation with vectors, design problems with composite shapes, circle properties (inscribed angles, chords, tangents), and arcs and sectors.
- Every new answer is recomputed by an independent, mutation-tested check.

### Notes
- Graphing exponential equations and connecting representations of polynomials stay in the lessons; there is nothing to auto-check.
- MAP4C and MEL4E still show "coming soon".

## [3.6.0] - 2026-11-22
### Added
- Grade 11 MEL3E (Mathematics for Work and Everyday Life): 10 new micro-skills (414 in all) and 3 lessons, choosable by course with its three strands.
  - Pay and purchases: hourly pay, overtime and commission, gross pay, deductions and net pay, sale prices, tax and change, unit price and the best buy.
  - Saving and borrowing: simple interest on savings, simple against compound interest, and the cost of loans and credit.
  - Vehicles and travel: fuel and operating costs, buying against leasing, map scales, trip costs and driving against the bus.
- Every new answer is recomputed by an independent, mutation-tested check.

### Notes
- Credit ratings and financial-institution services are described in lessons only; there is nothing to auto-check.
- The Grade 12 college and workplace courses (MCT4C, MAP4C, MEL4E) still show "coming soon".

## [3.5.0] - 2026-11-22
### Added
- Grade 11 MBF3C (Foundations for College Mathematics): 16 new micro-skills (404 in all) and 5 lessons, choosable by course with its four strands.
  - Mathematical models: expanding and factoring, solving by factoring, vertex and standard form, zero and negative exponents, exponent rules, and growth and decay.
  - Personal finance: simple and compound interest, the cost of borrowing, and the costs of owning and operating a vehicle (fuel, yearly cost, cost per kilometre).
  - Geometry and trigonometry: design measurements with composite shapes, and the sine and cosine laws in acute triangles.
  - Data and probability: quartiles and spread, and the rules of probability.
- Every new answer is recomputed by an independent, mutation-tested check.

### Notes
- MBF3C B2 covers the cost of credit; C1 covers 2-D design measurements. 3-D design drawings stay "coming soon".
- MEL3E and the Grade 12 college and workplace courses (MCT4C, MAP4C, MEL4E) still show "coming soon".

## [3.4.0] - 2026-11-22
### Added
- Grade 12 MDM4U (Data Management): 16 new micro-skills (388 in all) and 3 lessons, choosable by course with its four strands.
  - Counting and probability: the rules of probability, conditional probability and drawing without replacement, permutations and combinations (including repeated letters), and Pascal's triangle.
  - Probability distributions: expected value and fair games, binomial and hypergeometric distributions, z-scores and the 68-95-99.7 rule, and the normal approximation to the binomial with the continuity correction.
  - Organization of data: sources of bias and sampling techniques (simple random, systematic, stratified, cluster, multi-stage, convenience).
  - Statistical analysis: variance and standard deviation, quartiles and outliers, the least-squares line, r squared, residuals, and margin of error.
- Every new answer is recomputed by an independent, mutation-tested check; counting answers are checked by listing every outcome, arrangement or subset.

### Fixed
- The letter-arrangement question counted the repeated letters of LEVEL and SEEDS wrongly; the independent check caught it before release.

### Notes
- MDM4U E (the culminating investigation) is a project with nothing to auto-check, so it stays "coming soon", as do the research parts of other courses.
- The college and workplace Grade 12 courses (MCT4C, MAP4C, MEL4E) still show "coming soon".

## [3.3.0] - 2026-11-22
### Added
- Grade 12 MCV4U (Calculus and Vectors): 14 new micro-skills (372 in all) and 3 lessons, choosable by course with its three strands.
  - Rate of change: limits, the derivative from first principles, derivatives of sine, cosine and the exponential, and the power, product, quotient and chain rules.
  - Derivatives and their applications: critical points and points of inflection, and optimization (areas and revenue).
  - Vectors: magnitude, sums and scalar multiples, the dot and cross products, work, projections and perpendicular vectors, how lines and planes meet, equations of planes and lines, distance to a plane, and where a line meets a plane.
- Every new answer is recomputed by an independent, mutation-tested check: derivatives are checked numerically from the question text, and vector, line and plane answers by substitution.
- A new test checks that every question shows the same numbers in English and in French.

### Notes
- MCV4U B2 covers optimization with areas and revenue only; related-rates problems are not built yet.
- The other Grade 12 courses (MDM4U, MCT4C, MAP4C, MEL4E) still show "coming soon".

## [3.2.0] - 2026-11-22
### Added
- Grade 12 begins with MHF4U (Advanced Functions): 17 new micro-skills (358 in all) and 4 lessons, choosable by course with its four strands.
  - Exponential and logarithmic functions: evaluating logarithms, the laws of logarithms, graphs of logarithmic functions, and solving exponential and logarithmic equations (rejecting extraneous roots).
  - Trigonometric functions: radian measure and arc length, exact values in radians, features of sinusoidal functions, and solving trigonometric equations.
  - Polynomial and rational functions: end behaviour and turning points, asymptotes and holes, the remainder and factor theorems, solving polynomial equations, and polynomial and rational inequalities.
  - Characteristics of functions: average and instantaneous rates of change, sums, products and compositions of functions, and even and odd functions.
- Every new answer is recomputed by an independent, mutation-tested check (equations are checked by substituting the answer; inequalities and trigonometric equations by brute force).

### Notes
- MHF4U D3 (comparing function families and modelling) is covered only in part, through even and odd functions.
- The other Grade 12 courses (MCV4U, MDM4U, MCT4C, MAP4C, MEL4E) still show "coming soon".
- Rounded answers from solving with logarithms are accepted within half a percent.

## [3.1.0] - 2026-11-22
### Added
- Grade 8 is now complete for everything the question player can handle: 6 new micro-skills and 3 lessons (341 micro-skills in all).
  - Algebra: patterns with rational numbers, fractions and decimals, positive and negative (C1.2).
  - Data: one-variable and two-variable data (D1.1), scatter plots, including plotting a point on the grid (D1.3), infographics about a trend (D1.4), and analysis of misleading graphs and cause against trend (D1.6).
  - Spatial sense: build models from their views, with the fewest and the most cubes that fit (E1.2).
- The Grade 8 quick checks for Algebra, Data and Spatial sense (and the Grade 9 ones) now include the new skills.
- Every new answer is recomputed by an independent, mutation-tested check; the cube counts are checked by trying every arrangement.

## [3.0.0] - 2026-11-22
### Added
- Interactive questions. Two new ways to answer, both graded, explained and available offline like typed answers:
  - Protractor: read the measure of an angle shown on a protractor (including a base arm on the left), or draw an angle by dragging the arm, or by using the slider below it, which also works with a keyboard.
  - Slider: move a marker to a value, on a number line or a percent scale.
- Four new micro-skills (335 in all): read an angle on a protractor and draw one (Grade 5), place integers on a number line with a slider (Grade 6), and show a fraction or decimal as a percent with a slider (Grade 7), with a new lesson on using a protractor.
- Angle answers accept a small number of degrees either way (2 or 3, by difficulty).

### Notes
- Worksheets leave out slider and protractor skills, since those cannot be answered on paper.
- More interactive skills (graphs, transformations, slopes) can now be added as ordinary generators.

## [2.19.0] - 2026-11-22
### Added
- Worksheets can mix up to six topics on one sheet: add topics one at a time, and the questions take the topics in turn.
- Worked solutions: a new option prints every question again with its worked steps and answer, on its own page after the answer key.
- Admin: "Bank sizes by skill" shows how many different questions each skill can give at each difficulty (out of 40 tries) and what the Claude bank holds for it, and flags thin skills (fewer than 12 different questions at some difficulty).

### Changed
- Lessons now load one group of grades at a time (Grades 5 and 6, 7, 8, 9, 10, 11), so opening a lesson fetches about 90 kB at most instead of about 250 kB. `npm run gen:lessons` refreshes the lesson index after a lesson is added; a test fails if it is out of date.

## [2.18.0] - 2026-11-21
### Added
- Caregiver notes on goals: add a short note when you set a goal ("Pizza from Mario's on Friday"), or edit it later. The student sees it under the goal.
- Messages from a caregiver: send a short message (up to 200 characters) from the Progress page. It shows on the student's home page until they dismiss it, and you can see which messages were read. Up to five a day per student.
- Text from a caregiver is always shown as plain text.

### Notes
- Database migration 9 adds the goal note and the message table; existing data is untouched.

## [2.17.0] - 2026-11-21
### Added
- Grade 9 is now complete for everything the question player can handle: 21 new micro-skills, 4 lessons and a quick check for each new strand (Algebra, Data and Modelling, Geometry and Measurement, Financial Literacy).
  - Algebra: code with variables, parameters, equations and inequalities (C2.1), breaking a situation into steps (C2.2), reading and altering code (C2.3), and linear against non-linear relations (C4.1).
  - Data and Modelling: the implications of large data sets (D1.1), quartiles, the interquartile range and outliers (D1.2), scatter plots, lines of best fit and residuals (D1.3), and the five parts of the modelling cycle (D2.1 to D2.5): the question of interest, the plan and assumptions, the analysis, how well the model fits, and reporting limitations.
  - Geometry and Measurement: designs with circle and triangle properties (E1.2), unit conversions including area and volume (E1.3), how scaling changes perimeter, area and volume (E1.4), the Pythagorean relationship in composite shapes and boxes (E1.5), and the volume relationships of prisms, pyramids, cylinders and cones (E1.6).
  - Financial Literacy: past and present situations (F1.1), appreciation and depreciation (F1.2), the cost of borrowing (F1.3), and modifying a budget (F1.4).
- Quick checks (placement) for Grade 9 Data, Geometry and Financial Literacy, and the Algebra check now includes the new skills.
- Every new answer is recomputed by an independent, mutation-tested check. Money answers use rates chosen so results are exact; rounded answers are accepted within the stated tolerance.

### Notes
- The three "cultural history" research expectations (B1.1, C1.1, E1.1) are research tasks with nothing to auto-check, so they show as "coming soon".
- Still to come: Grade 8 completion and Grade 12.

## [2.16.1] - 2026-11-21
### Security
- A full audit of the source, the git history, the build, the production bundles and the running server found **no credentials, keys, tokens or connection strings in any browser code, bundle, source map or API response**. The two secrets the app uses (the Resend and Anthropic keys) were already only in the server's environment, used only for calls the server makes, and never sent to the browser. This release keeps it that way automatically.
- New `npm run audit:secrets`: scans the tracked source, the whole git history, the browser bundle and the server build for credential shapes, hard-coded passwords, the real values of this machine's secret-like environment variables, source maps, `process.env`, server-only packages and build paths in browser code, and files that should never ship. CI runs it after every build and again on the built Docker image.
- The browser build can only see variables that start with `MQ_PUBLIC_` (never the default `VITE_`), and refuses to build if such a variable is named like a key, secret, token or password. Source maps are explicitly off for the browser and the server.
- API responses now carry `Cache-Control: no-store`, so no browser, proxy or CDN keeps session or personal data.
- The one-time sign-in token is removed from the address bar and history as soon as the sign-in page reads it.
- New `.dockerignore` keeps `.env`, `.git`, `data/`, key files and source maps out of the image build context.
- New tests configure fake keys and try to make the running app reveal them (every read-only API route for an admin, a caregiver, a student and a visitor; error paths including a provider that echoes the key; mail failures; path traversal; the security headers), and prove the scanner catches each kind of secret.
- New `docs/SECURITY.md` explains where each secret lives, how it is kept out of the browser, how to check, and what to do if a key is ever exposed.

### Notes
- Pinning the GitHub Actions to commit SHAs is still open (`scripts/pin-actions.sh`); it needs network access to resolve the SHAs.

## [2.16.0] - 2026-11-21
### Added
- Grade 11, continued: MCR3U trigonometry and the whole MCF3M course. 23 new micro-skills and 4 lessons.
  - MCR3U Trigonometric Functions: exact values at special angles up to 360 degrees, reciprocal ratios, identities, the ambiguous case of the sine law, the sine and cosine laws with obtuse angles, and sinusoidal functions (amplitude, period, shifts and a Ferris wheel model).
  - MCF3M Quadratic Functions: factoring (including perfect squares and a leading coefficient other than 1), the quadratic formula and discriminant, function notation, domain and range, and vertex form against standard form.
  - MCF3M Exponential Functions: rational exponents, exponent rules on numbers, compound interest, annuities, and simple against compound interest.
  - MCF3M Trigonometric Functions: problems with two right triangles, the sine and cosine laws in acute triangles, and the sine function with a sin x, sin x + c and sin(x − d).
- Several MCF3M skills reuse the question generators written for MPM2D and MCR3U, so the same well-tested items serve both courses.
- Every new answer is recomputed by an independent, mutation-tested check. Trigonometry answers are rounded to one decimal and accepted within 0.05.

### Notes
- Still to come for Grade 11: the other Grade 11 courses (MBF3C, MEL3E, MAP4C bridge items and so on) where they have content the player can handle, MCR3U B2 and B4 (graphs and transformations of exponentials) and C2 gaps, MCF3M curve of best fit (needs technology), and a Grade 11 quick check.

## [2.15.0] - 2026-11-21
### Added
- Grade 11 begins with MCR3U (Functions, university preparation): 18 new micro-skills and 5 lessons, practised by choosing the course.
  - Characteristics of Functions: function notation, domain restrictions, inverses, transformations of a point, where a line meets a parabola, maximum and minimum values, the discriminant and the number of zeros, simplifying radicals, and simplifying rational expressions with restrictions.
  - Exponential Functions: rational exponents (including negative ones), telling linear, quadratic and exponential relations apart from a table, and growth and decay models.
  - Discrete Functions: Pascal's triangle and binomial expansion, recursive sequences, arithmetic and geometric sequences and series, compound interest, and ordinary simple annuities (future value, payment and present value).
- Every new answer is recomputed by an independent, mutation-tested check. Money answers use rates chosen so results are exact, and present values are accepted to within a cent.
- Grade 11 generators load as their own chunk on the web (`shared/generators/grade11.ts`); skill ids carry the course (`MS.G11.MCR3U.A1.1.a`).

### Notes
- This release also carries 2.14.0 (Grade 7 completion).
- Still to come for Grade 11: MCR3U trigonometry (exact values, reciprocal ratios, identities, the ambiguous case, sinusoidal functions), MCF3M, MBF3C and the other Grade 11 courses, and a Grade 11 quick check.

## [2.14.0] - 2026-11-21
### Added
- Grade 7 is now complete for everything the question player can handle: 14 new micro-skills and 5 lessons, asked in words and numbers.
  - Number: numbers up to one billion and expanded form (B1.1), fractions and decimals between two quantities (B1.5), rounding (B1.6), and fraction, decimal and percent equivalents (B2.2).
  - Algebra: patterns with decimals, rules and equations (C1.2), code with counts and sub-programs (C3.1), and reading and altering code (C3.2).
  - Data: why percentages describe large data sets (D1.1), infographics (D1.4), and misleading graphs and statistics (D1.6).
  - Spatial sense: top, front and side views to scale (E1.2) and constructing circles (E2.4).
  - Financial literacy: reliable sources (F1.2) and factors that influence a decision (F1.4).
- The Grade 7 quick checks now include the new skills (Number, Algebra, Data, Spatial sense and Financial literacy).
- Independent checks recompute every new answer a second way, and were mutation-tested. Rounding uses exact whole-number arithmetic so ties always round up.

### Notes
- This release also carries 2.12.0 and 2.13.0 (Grade 10) and the one spelling of "practice", because they were merged together.

## [2.13.0] - 2026-11-21
### Added
- The rest of Grade 10 for both courses (22 new micro-skills, 5 lessons), so every strand of MPM2D and MFM2P that the question player can handle now has practice.
  - MPM2D Quadratic Relations: constant second differences, the vertex from vertex form, direction and width, the equation from a vertex and a point, maximum and minimum values, and projectile problems.
  - MPM2D Analytic Geometry: midpoint, distance, and circles centred at the origin.
  - MPM2D Measurement and Trigonometry: similar triangles, sine, cosine and tangent for sides and angles, angles of elevation and depression, the sine law and the cosine law.
  - MFM2P Measurement and Trigonometry: similar triangles, the primary trigonometric ratios for sides and angles, feet, inches and yards, and imperial to metric conversion.
  - MFM2P Quadratic Relations: zeros and the axis of symmetry from factored form, and the y-intercept from each of the three forms.
- Trigonometry answers are rounded to one decimal and accepted within 0.05; checks recompute every answer a second way, and were mutation-tested.

### Notes
- This release also carries the 2.12.0 changes below, because they were merged together.
- Still to come for Grade 10: geometry proofs (MPM2D B3), reading technology-generated graphs (MFM2P C3), completing the square and solving by graphing in more depth, a Grade 10 quick check, and the Grade 10 pathway links between the two courses.

## [2.12.0] - 2026-11-21
### Added
- Grade 10 algebra, for both courses (21 new micro-skills, 7 lessons). Each course has its own skills, practiced by choosing the course.
  - MPM2D Quadratic Relations (A3): expanding binomials, taking out a common factor, factoring x² + bx + c and trinomials with a leading coefficient other than 1, differences of squares, solving by factoring, the quadratic formula, the discriminant and the number of real roots, and completing the square.
  - MPM2D Analytic Geometry (B1): systems of equations by substitution and by elimination, and word problems that give a system.
  - MFM2P Linear Relations (B1 to B3): equations with fractions, rearranging formulas, slope, what the slope and y-intercept mean, equations of lines from two points (including horizontal and vertical lines), and the point where two lines meet.
  - MFM2P Quadratic Relations (C1): expanding, common factors, and factoring x² + bx + c and x² − a².
- Each skill has three levels, mapped wrong answers with kind explanations, and answers written in words and numbers. Checks recompute every answer a second way (evaluating at many points, scanning for roots, Cramer's rule) and were mutation-tested.

### Changed
- "Practice" is now spelled the same everywhere in the app and its documents, as both noun and verb (it was "practise" in some places and "practice" in others). Internal names follow: `practisedToday` is now `practicedToday`.

### Notes
- Grade 10 skill ids carry the course (`MS.G10.MPM2D.A3.1.a`), because the two courses reuse strand letters.
- Still to come for Grade 10: MPM2D parabolas and projectile problems (A1, A2, A4), distance and midpoint, circles and proofs (B2, B3), similar triangles and trigonometry (C), and MFM2P similar triangles, trigonometry, the imperial system and parabola graphs. There is no quick check for Grade 10 yet.

## [2.11.1] - 2026-11-21
### Changed
- Faster on a phone: the question generators (most of the app's code, about 1 MB) are now loaded one grade at a time, and only when they are needed: by a lesson's "try one with me", or by an offline pack. Opening a lesson used to fetch about 1.2 MB of code (about 330 kB compressed); it now fetches about 0.7 MB for a Grade 6 lesson (about 215 kB compressed). Practice, the home page and the caregiver pages never needed the generators, so the first screen is unchanged (about 127 kB of code, 41 kB compressed). A lesson shows "Loading" for a moment while its grade loads, and a clear message if the connection drops.
- The offline worker saves the app's code in the background three files at a time and at low priority, so the first visit on a slow connection is not held up by it. Offline use is unchanged: everything is still saved on the first visit.
- The generator registry is now one small file per grade (`shared/generators/grade5.ts` to `grade9.ts`); `index.ts` gathers them for the server, so nothing changes there.

### Fixed
- The admin page's AI usage list showed "failed" in English only; it is now translated.

### Notes
- Still on the list: splitting the lessons' text by grade (about 171 kB, 55 kB compressed) and a per-skill bank-size summary for the admin page.

## [2.11.0] - 2026-11-21
### Added
- Weekly challenges: every Monday, three challenges open for every student, one of each kind (effort, showing up on different days, and growing, such as mastering a skill or answering review questions). Each pays bonus XP once when it is done during the week (Monday to Sunday, family time zone), shows on the rewards page with a progress bar, and is announced right after the answer that completes it. The set changes every week and every challenge comes round in turn.
- Family goals: a caregiver can set one real-world reward for all of their students together (for example "pizza night after 1 000 XP"). Everyone's XP counts toward it, each student sees it and its progress on their rewards page, the sibling whose answer completes it is told to tell their grown-up, and the caregiver marks it done when the reward has been given. Up to three can be open at a time.
- Printable certificates: from a student's progress page a caregiver can print a certificate for a level, a badge or a reached goal, and from the family goals for a reached family goal. A certificate is only available for something the student has really earned, is written in the student's language, and prints cleanly (the page controls are hidden).
- Original avatars: the ten avatars (fox, panda, owl, octopus, butterfly, dolphin, unicorn, dragon, rocket and trophy) are now drawings made for MathQuest (simple flat SVG shapes, the same on every device, no emoji fonts), and each colour palette shows a small swatch of its own colours instead of an emoji.

### Notes
- Challenges and family goals add two small tables (migration 8). Nothing existing changes, and students who have not practiced this week simply see all three challenges at zero.

## [2.10.0] - 2026-11-21
### Added
- Weekly email: a caregiver can now choose the day it arrives (it still comes at about 7:30 a.m., and Monday is the default), and can send themselves a test email from the caregiver page to see what it looks like. A test email never counts as the week's email, and can be sent once a minute.
- This week against last week: the progress page shows how many more or fewer questions and how many points of accuracy this week has compared with the week before, with last week's totals under the chart, and the weekly email says the same in one line.

### Notes
- The day is stored with the caregiver's other settings, so nothing needs migrating. Caregivers who never choose a day keep getting the email on Monday.

## [2.9.1] - 2026-11-21
### Added
- Grade 6 is now fully covered: every Grade 6 expectation in strands B to F has practice (7 new micro-skills, 212 in all), asked in words and numbers like Grade 5. Each has generated questions in English and French, three difficulty tiers, a three-step hint ladder and a reason for every common wrong answer.
  - Coding (C3, two skills): running programs with variables that change inside a loop, a test inside a loop and a "while" loop (counting how many times it runs); reading and changing programs, such as a new amount, a new test, or how many repeats reach a goal.
  - Modelling (C4): the modelling process on everyday questions: calculate and round sensibly (pizzas for a class, a tank with a leak) and see how the answer changes when an assumption changes.
  - Infographics (D1.4): which part is missing (title, labelled axes with units, source), the percent for a headline number from a table, and choosing an accurate headline.
  - Spatial sense (E): building from top, front and side views of block structures (total cubes, front view, side view), the protractor up to 360 degrees (readings, reflex angles, drawing a large angle) and nets (faces of prisms and pyramids, area of a net).
- Two Grade 6 lessons ("Show me how"), the infographic ideas added to the Grade 6 data lesson, and the new skills added to the quick-check ladders for Grades 6 to 9.
- Independent arithmetic tests for every new generator (programs, loops and models are run by simulation; one test was mutation-checked).

### Notes
- The drawn and interactive versions of these topics (a code editor, a draggable protractor, building and rotating 3-D shapes, folding nets) still wait for the 3.x releases in `docs/BACKLOG.md`.

## [2.9.0] - 2026-11-21
### Added
- Grade 9 (MTH1W) Number and Algebra: 19 new micro-skills, so Grade 9 now shows the Number and Algebra strands as available (Data, Geometry and Financial Literacy follow in 2.9.1). Each skill has generated questions in English and French, three difficulty tiers, a three-step hint ladder and a reason for every common wrong answer.
  - Number (9 skills): subsets of the number system, density and limits, negative exponents and scientific notation, exponent laws, integers for location and change, unit fractions and measuring tools, signs in rates and decimals, positive and negative fractions and mixed numbers (exact fraction answers), and rates, percentages and proportions.
  - Algebra (10 skills): creating expressions that generalize a relationship, equivalent expressions, simplifying, creating and solving equations (including letters on both sides), linear and non-linear relations, rate of change and initial value, comparing two lines, the lines x = k, y = k and ax + by = k, translating, reflecting and rotating y = ax, and equations of lines from tables and points.
- Five Grade 9 lessons ("Show me how"), quick-check ladders for Grade 9 Number and Algebra (they include the earlier-grade skills of each strand).
- Independent arithmetic tests for every new generator (patterns, tables and lines are checked by recomputing them; one test caught an exponent question that could have a negative answer before release).

### Fixed
- Servers kept showing "coming soon" for strands that had practice (for example Grade 6 algebra, data, spatial sense and financial literacy), because the skill list was only reloaded when a version label in `content/microskills.json` changed, and that label had stayed the same since 2.2.1 while hundreds of skills were added. The skill list is now reloaded whenever any of the content files change (a fingerprint of their contents is stored with the version), so every release that changes the content takes effect on the next start. A test changes a file without touching its label and checks that the list reloads.

### Notes
- Not yet in Grade 9: cultural-history research (not scored), the coding strand, characteristics of linear and non-linear relations (C4.1), and the Data, Geometry and Financial strands.

## [2.8.3] - 2026-11-21
### Added
- Grade 5 is now fully covered: every Grade 5 expectation in strands B to F has practice. Six new micro-skills, each with generated questions in English and French, three difficulty tiers, a three-step hint ladder and a reason for every common wrong answer.
  - Coding (C3): running short programs with loops and conditionals (including a loop with a test inside), and reading and changing programs to see how the result changes. The programs are written in plain steps, so every item is an ordinary number question.
  - Infographics (D1.4): which part of an infographic is missing (title, axis labels, source), the percent for a headline number, and choosing an accurate headline.
  - Spatial sense (E): congruent triangles, rectangles and parallelograms (matching sides and angles), top and front views of block structures (including taller stacks hiding shorter ones), and reading and drawing angles with a protractor and benchmark angles.
- Two Grade 5 lessons ("Show me how"), the infographic ideas added to the Grade 5 data lesson, and the new skills added to the quick-check ladders for Grades 5 to 8.
- Independent arithmetic tests for every new generator (programs are run by simulation).

### Notes
- The drawn and interactive versions of these topics (a code editor, dragging a protractor, building and rotating 3-D shapes, designing an infographic) still wait for the 3.x releases in `docs/BACKLOG.md`.

## [2.8.2] - 2026-11-21
### Added
- Grade 5 gap fill: 14 new micro-skills for the Grade 5 expectations that were not built yet, each with generated questions in English and French, three difficulty tiers, a three-step hint ladder and a reason for every common wrong answer. Grade 5 financial literacy is now complete (6 of 6), algebra is 8 of 10, data 7 of 8 and spatial sense 8 of 11.
  - Financial literacy (F): transferring money with fees, basic budgets, credit and debt (payments, purchases and interest), and the taxes each level of government collects and the services they pay for (including Ontario's HST split).
  - Algebra (C): repeating, growing and shrinking patterns, tables of values, and words and algebraic expressions (including equivalent expressions).
  - Data (D): why the sampling technique matters, relative-frequency tables, choosing graphs (including stacked-bar graphs) and analysing stacked-bar and misleading graphs.
  - Spatial sense (E): translations, reflections and 180 degree rotations on a grid, metric units for estimating and measuring, and comparing angles with non-standard units.
- Four Grade 5 lessons ("Show me how"), and the new skills added to the quick-check ladders for Grades 5 to 8.
- Independent arithmetic tests for every new generator (week and month counts by walking through them; one was mutation-checked). They caught three generator bugs before release (a budget that could save a negative amount, a weekly saving that could be negative, and a percent of students that was not a whole number).

### Notes
- Still deferred in Grade 5 because they need drawn or interactive items: coding (C3), infographics (D1.4), congruent shapes (E1.2), top, front and side views (E1.3) and the protractor (E2.4). See `docs/BACKLOG.md`.

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
- Practice without internet. While online, a student downloads a pack of 20 questions for the topics they chose. The app can then be opened and the questions answered with no connection at all (hints and feedback included); the answers wait on the device and are sent automatically when the student is back online and signed in, or with a "Send my answers" button. The server rebuilds every question from its skill, tier and seed, grades it itself and updates mastery, the struggle ladder, XP and badges exactly as for online practice, so what the device says about correctness is never trusted. A pack lists only skill, tier and seed (never an answer key); each question counts once; packs are good for 7 days and answers are accepted for 7 days after that; a student holds at most five packs, and one student cannot use another's pack. XP and badges appear after the answers are sent.
- An "Install the app" button in the header. Browsers that can install the app (Chrome, Edge and others) get a one-tap prompt; iPhones and iPads get a short note on using Share, then "Add to Home Screen". It hides once the app is installed.
- Migration 6 (`offline_pack`); two student endpoints, `POST /api/learn/offline/pack` and `POST /api/learn/offline/sync`.
- Tests: server tests for packs and sync (grading, replay, other students, expiry, caps), and end-to-end tests that download a pack, go offline, practice, reload, go back online and check the server's records, and that check the install button, all with axe scans.

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
- The skill map's "Practice this" now practices that one expectation instead of its whole strand (sessions accept an optional `focus` such as `G5.C2.3`).
- New tests recompute every answer independently from the prompt, and an end-to-end test practices one question in each new strand.

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
