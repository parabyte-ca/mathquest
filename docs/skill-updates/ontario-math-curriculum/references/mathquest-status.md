# MathQuest content status

Snapshot at release 2.9.1 (21 November 2026). To refresh the table, run `python scripts/content_status.py` from the MathQuest repository root (the `mathquest` skill bundles it) and paste the result below. The repository's `docs/BACKLOG.md` is the live to-do list.

## Contents
1. How ids and files line up
2. What is built
3. What is deliberately deferred
4. Data-quality notes
5. Rules of thumb for the next grade

## 1. How ids and files line up

| Thing | Example | Where |
|---|---|---|
| Expectation | `G7.C2.3` (Grade 7, Algebra, 2.3) | `content/curriculum.json` (built from `content/source/ontario` by `npm run curriculum:build`) |
| Micro-skill | `MS.G7.C2.3.a` | `content/microskills.json` (name, expectation, tiers, prerequisites) |
| Generator | `equations7` registered as `MS.G7.C2.3.a` | `shared/generators/grade7.ts` (one registry file per grade; `index.ts` gathers them) |
| Placement ladder | `7` (Number) or `7.C` (strand C): ordered list of micro-skills, easiest first | `content/placement.json` (Grades 5 to 8, strands B to F) |
| Prerequisite chains | `fractions: G5.B1.3 -> ... -> G7.B2.8 -> G8.B2.6` | `content/prereq-chains.json` |
| Lesson | `L.algebra7.equations-inequalities` lists the micro-skills it teaches | `shared/lessons/*.ts` |

Grades 5 to 9 use the `G{n}.{strand}` expectation codes (Grade 9 uses `MTH1W.`); Grades 10 to 12 use course codes.

## 2. What is built

Micro-skills, and expectations that have at least one, by grade and strand (strand A, social-emotional learning and processes, is never scored).

| Grade | B Number | C Algebra | D Data | E Spatial sense | F Financial literacy |
|---|---|---|---|---|---|
| 5 | 24 skills · 16 of 16 | 10 · 10 of 10 | 8 · 8 of 8 | 11 · 11 of 11 | 6 · 6 of 6 |
| 6 | 20 · 18 of 18 | 11 · 10 of 10 | 8 · 8 of 8 | 10 · 10 of 10 | 5 · 5 of 5 |
| 7 | 19 · 17 of 17 | 10 · 10 of 10 | 8 · 8 of 8 | 12 · 11 of 11 | 6 · 6 of 6 |
| 8 | 12 · 12 of 12 | 8 · 8 of 8 | 8 · 8 of 8 | 11 · 8 of 8 | 6 · 6 of 6 |
| 9 (MTH1W) | 9 · 9 of 10 | 14 · 14 of 15 | 8 · 8 of 8 | 5 · 5 of 6 | 4 · 4 of 4 |
| 10 (MPM2D, MFM2P) | MPM2D B (analytic geometry) · 6 skills, 2 of 3; MFM2P B (linear) · 7 skills, 3 of 3 | MPM2D A (quadratic) · 17 skills, 4 of 4; MFM2P C (quadratic) · 5 skills, 2 of 3 | | MPM2D C (trigonometry) · 8 skills, 3 of 3; MFM2P A (measurement) · 5 skills, 3 of 3 | |
| 11 (MCR3U) | | MCR3U A, B, C · 18 skills, 12 of 19 expectations (functions, exponentials, discrete functions) | | | MCR3U D (trigonometry) · 6 skills, 5 of 5 |
| 11 (MCF3M) | | MCF3M A, B · 13 skills, 6 of 7 (quadratics, exponentials and finance) | | | MCF3M C (trigonometry) · 4 skills, 2 of 2 |
| 11 (other courses) | not yet | | | | |
| 12 (MHF4U) | | MHF4U A, C, D · 13 skills, 10 of 10 expectations (logarithms, polynomial and rational functions, rates of change; D3 in part) | | | MHF4U B (trigonometry) · 4 skills, 3 of 3 |
| 12 (MCV4U) | | MCV4U A, B · 8 skills, 5 of 5 expectations (limits, derivative rules, curves, optimization) | | | MCV4U C (vectors) · 6 skills, 4 of 4 |
| 12 (MDM4U) | | MDM4U A, B, C, D · 16 skills, 9 of 11 expectations (counting, probability, distributions, sampling, statistics; E culminating investigation is a project) | | | |
| 12 (other courses) | not yet | | | | |

388 micro-skills in all. Placement ladders exist for Grades 5 to 8, one per strand, and for every Grade 9 strand. Every micro-skill has a lesson (a test enforces it for Grades 5 to 8). Some expectations are covered inside a neighbour's micro-skill: Grade 7 C1.2 is practiced through the C1.3 pattern-rule skill.

## 3. What is deliberately deferred

These need item types or tools the question player does not have yet. Build the underlying knowledge, not a fake.

- Coding (C3 in Grades 5 to 9), modelling (Grade 5 and 6 C4).
- Data collection, infographics, misleading graphs and "analysis" expectations (D1 in most grades).
- Nets, top/front/side/perspective views, tessellations, constructions with a compass (Grade 7 E1.2 and E2.4 are covered in words and numbers; E1.1 at Grade 8 is not).
- Financial items about taxes and budgets as a project (similar items at other grades). Grade 7 F1.2 and F1.4 are covered as choice and number questions.

## 4. Data-quality notes

- In the repository's curriculum data, `G7.C3.1` and `G7.C3.2` have identical text ("write, read and alter efficient code with defined counts and sub-programs"). One of them is probably a transcription slip from the mirror the data came from; check the ministry document before quoting either.
- Grades 5 to 8 expectation wording comes from third-party mirrors (see "Known gaps" below). Treat the wording as a guide to scope, and the ministry site as the authority.
- Grade 8 B2.4 (add and subtract integers) and B2.5 (add and subtract fractions) repeat topics from Grade 7; the Grade 8 versions in MathQuest are harder variants (larger integers, three terms, mixed numbers) rather than copies.

## 5. Rules of thumb for the next grade

- Do the grade in strand order B, C, D, E, F, and release each group when its tests pass.
- Link each new micro-skill to the previous grade's micro-skill on the same chain, and to the same-grade skill it depends on.
- Prefer exact answers: choose numbers so results are whole or have at most six decimal places, and use 3.14 for pi when the prompt says so.
- Include at least one common misconception per item and word it kindly ("It looks like..."); a student must never be told they are careless.
- Next up: the college and workplace courses (Grade 11 MBF3C and MEL3E, Grade 12 MCT4C, MAP4C and MEL4E), then a Grade 10 and 11 quick check and the Grade 10 gaps (B3 proofs, MFM2P C3 graph reading), then the richer-tools releases listed in the backlog.
