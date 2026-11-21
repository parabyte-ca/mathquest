# MathQuest content status

Snapshot at release 2.8.3 (21 November 2026). To refresh the table, run `python scripts/content_status.py` from the MathQuest repository root (the `mathquest` skill bundles it) and paste the result below. The repository's `docs/BACKLOG.md` is the live to-do list.

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
| Generator | `equations7` registered as `MS.G7.C2.3.a` | `shared/generators/index.ts` |
| Placement ladder | `7` (Number) or `7.C` (strand C): ordered list of micro-skills, easiest first | `content/placement.json` (Grades 5 to 8, strands B to F) |
| Prerequisite chains | `fractions: G5.B1.3 -> ... -> G7.B2.8 -> G8.B2.6` | `content/prereq-chains.json` |
| Lesson | `L.algebra7.equations-inequalities` lists the micro-skills it teaches | `shared/lessons/*.ts` |

Grades 5 to 9 use the `G{n}.{strand}` expectation codes (Grade 9 uses `MTH1W.`); Grades 10 to 12 use course codes.

## 2. What is built

Micro-skills, and expectations that have at least one, by grade and strand (strand A, social-emotional learning and processes, is never scored).

| Grade | B Number | C Algebra | D Data | E Spatial sense | F Financial literacy |
|---|---|---|---|---|---|
| 5 | 24 skills · 16 of 16 | 10 · 10 of 10 | 8 · 8 of 8 | 11 · 11 of 11 | 6 · 6 of 6 |
| 6 | 20 · 18 of 18 | 8 · 8 of 10 | 7 · 7 of 8 | 7 · 7 of 10 | 5 · 5 of 5 |
| 7 | 15 · 13 of 17 | 7 · 7 of 10 | 5 · 5 of 8 | 10 · 9 of 11 | 4 · 4 of 6 |
| 8 | 12 · 12 of 12 | 7 · 7 of 8 | 4 · 4 of 8 | 10 · 7 of 8 | 6 · 6 of 6 |
| 9 to 12 | not yet | | | | |

186 micro-skills in all. Placement ladders exist for Grades 5 to 8, one per strand (Number, algebra, data, spatial sense, financial literacy). Every micro-skill has a lesson (a test enforces it for Grades 5 to 8). Some expectations are covered inside a neighbour's micro-skill: Grade 7 C1.2 is practised through the C1.3 pattern-rule skill.

## 3. What is deliberately deferred

These need item types or tools the question player does not have yet. Build the underlying knowledge, not a fake.

- Coding (C3 in Grades 5 to 9), modelling (Grade 5 and 6 C4).
- Data collection, infographics, misleading graphs and "analysis" expectations (D1 in most grades).
- Nets, top/front/side/perspective views, tessellations, constructions with a compass (E1.2, E2.4 at Grade 7, E1.1 at Grade 8).
- Financial items about reliable sources, factors that influence a decision, or taxes and budgets as a project (F1.2, F1.4 at Grade 7 and similar).
- Grade 7 Number expectations with no numeric core of their own: B1.1 (large numbers and expanded form), B1.5 (numbers between two quantities), B1.6 (rounding) and B2.2 (recalling equivalents).

## 4. Data-quality notes

- In the repository's curriculum data, `G7.C3.1` and `G7.C3.2` have identical text ("write, read and alter efficient code with defined counts and sub-programs"). One of them is probably a transcription slip from the mirror the data came from; check the ministry document before quoting either.
- Grades 5 to 8 expectation wording comes from third-party mirrors (see "Known gaps" below). Treat the wording as a guide to scope, and the ministry site as the authority.
- Grade 8 B2.4 (add and subtract integers) and B2.5 (add and subtract fractions) repeat topics from Grade 7; the Grade 8 versions in MathQuest are harder variants (larger integers, three terms, mixed numbers) rather than copies.

## 5. Rules of thumb for the next grade

- Do the grade in strand order B, C, D, E, F, and release each group when its tests pass.
- Link each new micro-skill to the previous grade's micro-skill on the same chain, and to the same-grade skill it depends on.
- Prefer exact answers: choose numbers so results are whole or have at most six decimal places, and use 3.14 for pi when the prompt says so.
- Include at least one common misconception per item and word it kindly ("It looks like..."); a student must never be told they are careless.
- Next up: Grade 9 (MTH1W), then the richer-tools releases listed in the backlog.
