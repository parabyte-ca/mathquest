---
name: ontario-math-curriculum
description: Ontario Ministry of Education math curriculum reference for Grades 5-12 (elementary strands A-F for Grades 5-8, MTH1W de-streamed Grade 9, MPM2D/MFM2P Grade 10, MCR3U/MCF3M/MBF3C/MEL3E Grade 11, MHF4U/MCV4U/MDM4U/MCT4C/MAP4C/MEL4E Grade 12). Use this skill whenever generating math practice questions, lessons, worksheets, assessment items, progression or sequencing logic, or curriculum-aligned explanations for Ontario students in Grades 5 through 12, including for the MathQuest adaptive practice app (micro-skill ids like MS.G7.C2.3.a, what is already built, what is deferred). Also use it before building or reviewing any MathQuest content for the next grade or strand. Trigger on any mention of Ontario math curriculum, grade-level expectations, strand codes (e.g. B2.5, C4.2), any Ontario math course code, EQAO Grade 9 math, or building or tagging math content for a specific Ontario grade or course.
---

# Ontario Math Curriculum, Grades 5-12

Reference for generating curriculum-aligned math content: practice questions, lessons, worksheets, sequencing and item tagging for Ontario students in Grades 5-12. Built for MathQuest (the adaptive practice app) but applies to any Ontario math content task.

## Two schemas: pick the right one

Ontario uses different curriculum documents across these grades, so tag content differently by level:

- **Grades 5-9** (2020 elementary curriculum + 2021 de-streamed MTH1W): six strands, **A-F**, expectations coded like `G5.B2.6` or `MTH1W.C4.2`. Read `references/grade5.md` to `grade8.md`, and `grade9-mth1w.md`.
- **Grades 10-12** (2005 and 2007 curricula, still in force): **course code + topic strand**, coded like `MCR3U.C3.3` or `MHF4U.B3`. Read `references/grade10.md`, `grade11.md`, `grade12.md`.

Every generated item carries four tags: **grade/course**, **expectation code**, **achievement category** (KU/AP/TH/COM, see Assessment), and **prerequisite codes**. This lets an adaptive engine sequence content and keep a realistic KU/AP/TH mix (EQAO-style).

## Document map

| Grade | Course | Code | Strands |
|---|---|---|---|
| 5, 6, 7, 8 | Ontario Curriculum, Grades 1-8: Mathematics, 2020 | (none) | A SEL & Processes · B Number · C Algebra · D Data · E Spatial Sense · F Financial Literacy |
| 9 | Mathematics, Grade 9, De-streamed, 2021 | **MTH1W** | AA SEL · A Math Thinking & Connections · B Number · C Algebra · D Data · E Geometry & Measurement · F Financial Literacy |
| 10 | Principles of Mathematics, Academic | **MPM2D** | Quadratic Relations · Analytic Geometry · Trigonometry |
| 10 | Foundations of Mathematics, Applied | **MFM2P** | Measurement & Trigonometry · Modelling Linear Relations · Quadratic Relations |
| 11 | Functions, University | **MCR3U** | A Characteristics of Functions · B Exponential · C Discrete Functions · D Trigonometric |
| 11 | Functions and Applications, University/College | **MCF3M** | A Quadratic · B Exponential · C Trigonometric |
| 11 | Foundations for College Mathematics, College | **MBF3C** | A Mathematical Models · B Personal Finance · C Geometry & Trig · D Data Management |
| 11 | Mathematics for Work and Everyday Life, Workplace | **MEL3E** | A Earning and Purchasing · B Saving, Investing, Borrowing · C Transportation and Travel |
| 12 | Advanced Functions, University | **MHF4U** | A Exponential & Logarithmic · B Trigonometric · C Polynomial & Rational · D Characteristics of Functions |
| 12 | Calculus and Vectors, University | **MCV4U** | A Rate of Change · B Derivatives & Applications · C Geometry & Algebra of Vectors |
| 12 | Mathematics of Data Management, University | **MDM4U** | A Counting & Probability · B Probability Distributions · C Organization of Data · D Statistical Analysis · E Culminating Investigation |
| 12 | Mathematics for College Technology, College | **MCT4C** | A Exponential · B Polynomial · C Trigonometric · D Applications of Geometry |
| 12 | Foundations for College Mathematics, College | **MAP4C** | A Mathematical Models · B Personal Finance · C Geometry & Trig · D Data Management |
| 12 | Mathematics for Work and Everyday Life, Workplace | **MEL4E** | A Reasoning with Data · B Personal Finance · C Applications of Measurement |

## Pathways and prerequisites

- **Grade 11:** MCR3U requires MPM2D. MCF3M accepts MPM2D or MFM2P. MBF3C requires MFM2P. MEL3E requires Grade 9 math or a Grade 10 locally developed course.
- **Grade 12:** MHF4U requires MCR3U or MCT4C. MCV4U requires MHF4U (before or at the same time). MDM4U requires MCR3U or MCF3M. MCT4C requires MCF3M or MCR3U. MAP4C is designed for MBF3C students. MEL4E requires MEL3E.
- **First branch point is Grade 10.** A student who takes MFM2P can reach MCF3M but not MCR3U, and so not MHF4U/MCV4U without the MCT4C route.

**Default spine** when stream is unknown: Grade 5-8 → MTH1W → MPM2D → MCR3U → MHF4U → MCV4U, with MDM4U as an optional parallel Grade 12 track. Offer applied/college modes that switch off content the lighter course omits (quadratic formula, sine/cosine law, radicals, rational expressions; see per-grade files).

## Progression logic (cross-grade skill chains)

Use these chains to pick prerequisites and to step down when a student struggles. Full detail is in the per-grade files.

- **Fractions:** G5 equivalent fractions to twelfths, add/subtract like denominators, whole × unit fraction → G6 unlike denominators, whole × proper fraction → G7 fraction × fraction → G8 all four operations incl. mixed numbers → MTH1W B3.4 signed fractions in formulas → MCR3U/MHF4U rational expressions.
- **Decimals and percents:** G5 decimals to hundredths, fraction-decimal-percent links (B1.7) → G6 thousandths, percent mental math → G7 conversions, increase/decrease by a percent → G8 percents above 100% and below 1%.
- **Integers:** G6 represent/order → G7 add/subtract → G8 all four operations → MTH1W signs in rates and ratios.
- **Algebra:** G5 expressions and one-step equations to 100, inequalities to 50 → G6 add monomials, multi-term whole-number equations → G7 add/subtract monomials, whole-number inequalities → G8 add binomials, integer/decimal equations → MTH1W C1.4-C1.5 simplify, create and solve equations → MPM2D expand and factor → MHF4U polynomial division, factor theorem.
- **Patterns to functions:** G5 growing/shrinking patterns in tables and graphs → G6 identify linear patterns → G7 rate and initial value → G8 growing and shrinking with rational numbers → MTH1W slope, y-intercept, y = ax + b → Gr10 linear systems and quadratics → MCR3U function notation, transformations → MHF4U polynomial, rational, log functions; rates of change → MCV4U derivatives.
- **Exponents and logs:** G7 exponential notation → G8 scientific notation, square roots → MTH1W exponent laws incl. negative exponents → MPM2D zero/negative exponents → MCR3U rational exponents, exponential functions → MHF4U logarithms, solving exponential equations → MCV4U derivative of eˣ.
- **Geometry and trigonometry:** G5 triangle properties, protractor to 180°, area of parallelograms and triangles → G6 angles to 360°, four quadrants → G7 circles → G8 Pythagorean theorem → MTH1W composite shapes, volume relationships → Gr10 similar triangles, SOH-CAH-TOA, (MPM2D) sine/cosine law → MCR3U special angles, sinusoids, identities → MHF4U radians, trig equations, compound angles → MCV4U vectors, lines and planes.
- **Data and probability:** G5 sampling, relative frequency, mean/median/mode, fraction probability → G6-G8 graph choice, central tendency, scatter plots, compound events → MTH1W box plots, regression, modelling cycle → MDM4U counting, distributions, statistical analysis.
- **Finance:** G5 money transfer, sales tax, basic budgets, credit and debt, unit rates → G6 payment methods, interest concepts → G7 exchange rates, budgets → G8 simple vs. compound interest, credit cards → MTH1W appreciation/depreciation → MCR3U/MCF3M compound interest, annuities → MBF3C/MAP4C vehicles, credit, mortgages, housing → MEL3E/MEL4E pay, deductions, income tax returns.

## The seven mathematical processes

Problem Solving, Reasoning and Proving, Reflecting, Selecting Tools and Strategies, Connecting, Representing, Communicating. They apply across every strand and grade and are not taught as separate units. In Grades 5-9 they sit in Strand A (alongside SEL); in Grades 10-12 each course opens with the same seven.

**Map to app features:**
- Reasoning and proving → "justify" and "which is equivalent" items
- Reflecting → "check reasonableness" follow-ups
- Selecting tools → calculator on/off toggle
- Representing → convert between table, graph and equation
- Communicating → short written explanations (rubric or LLM-graded)

## Assessment

Every grade uses the four-category achievement chart: **Knowledge and Understanding (KU)**, **Thinking (TH)**, **Communication (COM)**, **Application (AP)**. Levels 1-4 map to 50-59% / 60-69% / 70-79% / 80-100%; Level 3 is the provincial standard. Since 2021-22 the elementary SEL expectations (Strand A) are not assessed or reported.

**Grades 9-12 weighting rules (2026-27):**
- Written final exam: 20% (Gr 9-10), 25% (Gr 11-12); workplace-preparation courses are exempt
- Attendance/participation: 15% (Gr 9-10), 10% (Gr 11-12)
- EQAO Grade 9 math: 20% of the MTH1W mark

**EQAO Grade 9 test** is a useful model for item design: online, multi-stage adaptive (Stage 1 performance routes to an easier or harder Stage 2), assesses strands B-F (not Communication or SEL), and tags every item KU/AP/TH. Released formats include multi-select, fill-in-the-blank selection and drag-and-drop expression matching.

## Item formats that grade automatically

- **Numeric entry** with tolerance; fraction entry; equivalence checks for expressions (a CAS such as math.js or SymPy)
- **Multi-select** (number-set membership, "which are linear")
- **Drag-and-drop** (order rationals, match expressions to factored forms, sequence the modelling cycle, label SOH-CAH-TOA)
- **Click-to-plot / draggable** points, lines, parabolas, sinusoids
- **Sliders** for transformation parameters (a, h, k; a, k, d, c)
- **Code snippets:** predict the output or fix the bug (C3 coding, Grades 5-9)
- **Budget spreadsheets** with editable cells (F strands, MAP4C, MEL3E/MEL4E)
- **TVM-style calculators** (compound interest, annuities, mortgages)
- **Protractor and coordinate-grid manipulatives** (E strands)
- **Probability simulators** comparing experimental and theoretical results
- **Vector and 3-D plane viewers** (MCV4U strand C)

Leave the SEL/processes strand (A / AA) and the MDM4U culminating investigation (E) unscored; support them as reflection prompts and guided projects.

## French

Ontario publishes an equivalent French-language curriculum (Le curriculum de l'Ontario) with the same structure and course codes. French Immersion students follow the English-language curriculum taught in French. For a French option, translate terminology using the French ministry glossary terms (e.g. "ordonnée à l'origine" for y-intercept, "taux de variation" for rate of change) rather than literal translation.

## Recent changes to be aware of (2024-2026)

Math content for Grades 5-12 has not been rewritten. What changed:
- Assessment weighting for Grades 9-12 (above), from 2026-27.
- A financial literacy graduation requirement (TVO modules, 70% to pass, two attempts, 5% of the course mark) in Grade 10 Career Studies (GLC2O) for students who started Grade 9 in 2025-26 or later. Paused for a year in June 2025 before taking effect in 2026-27.
- Small 2022 addenda to MPM2D (slopes of parallel and perpendicular lines, forms of a linear equation) and MFM2P.
- A provincial expert review of student learning was announced in December 2025. No revised Grade 10-12 math curriculum has been released; the 2005 and 2007 documents remain in force. Check dcp.edu.gov.on.ca before a large content build.

## Using this skill for MathQuest content

MathQuest breaks each expectation into **micro-skills**: `MS.G{grade}.{strand}{n}.{n}.{letter}`, for example `MS.G8.B2.5.a` is the first micro-skill of expectation `G8.B2.5` (Grade 8, Number, add and subtract fractions). One expectation can have several micro-skills (`.a`, `.b`, ...). Each micro-skill has three difficulty tiers, a seeded generator, and prerequisites that point at earlier micro-skills, usually from the previous grade; the chains above tell you which earlier skills to link.

Build in grade order, one strand group at a time, and read `references/mathquest-status.md` first: it says what already exists, which expectations are deliberately deferred because they need tools the question player does not have, and the data-quality notes found while building. When an expectation says "using digital tools" or asks for a product (an infographic, a program, a construction), build the numeric knowledge underneath it and leave the tool part on the backlog; do not invent a numeric stand-in for the whole expectation.

## Reference files

- `references/grade5.md`: full B-F expectations, vocabulary, sequencing notes
- `references/grade6.md`, `grade7.md`, `grade8.md`: full B-F expectations, vocabulary
- `references/grade9-mth1w.md`: MTH1W expectations, what changed from the streamed courses, EQAO detail
- `references/grade10.md`: MPM2D and MFM2P side by side, depth differences called out
- `references/grade11.md`: MCR3U, MCF3M, MBF3C, MEL3E, with what MCF3M omits vs. MCR3U
- `references/grade12.md`: MHF4U, MCV4U, MDM4U, MCT4C, MAP4C, MEL4E, prerequisites and routing notes
- `references/mathquest-status.md`: micro-skill id convention, what MathQuest has built (Grades 5 to 8), what is deferred and why, and data-quality notes. Refresh it with the repo's `scripts/content_status.py` after each release.

## Known gaps: verify before quoting verbatim

Grades 5-8 expectation wording comes from third-party mirrors (Chalkboard Publishing, IXL, eCampusOntario) rather than the ministry's JavaScript-rendered site. Grade 12 overall expectations come from school-board course outlines that reproduce the ministry text; specific-expectation detail is summarized. The MFM2P 2022 addendum and parts of MBF3C (strands C and D) and MEL3E were not independently verified. Confirm exact wording against dcp.edu.gov.on.ca or the 2005/2007 ministry PDFs before publishing anything as an official quotation.
