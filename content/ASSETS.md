# Asset and licence record

Every asset shipped with MathQuest, where it came from and its licence. Add a row for anything new.

| Asset | Where | Source | Licence |
|---|---|---|---|
| Diagrams (fraction bars, area models, base-ten blocks, coordinate grids, number lines) | `web/src/visuals.tsx` | Drawn in code for MathQuest | Original, project licence |
| OpenDyslexic font (400, 700; woff and woff2) | bundled by Vite from the `@fontsource/opendyslexic` package | Abelardo Gonzalez, packaged by Fontsource | SIL Open Font License 1.1 |
| KaTeX (math rendering to MathML) | `katex` npm package, loaded on demand | KaTeX contributors | MIT |
| math.js (answer checking) | `mathjs` npm package | Jos de Jong and contributors | Apache-2.0 |
| Lessons, questions, hints and feedback text (English and French) | `shared/lessons`, `shared/generators`, `shared/feedback.ts` | Written for MathQuest | Original, project licence |
| Claude-written practice items (optional, admin-approved) | `bank_item` table, created at runtime | Drafted by Claude, verified by MathQuest, approved by an admin | Original, project licence |
| Avatar icons | Unicode emoji, drawn by the user's device fonts | Unicode Consortium (code points only); no font is shipped | Not applicable |
| Colour palettes | `shared/palettes.ts` | Written for MathQuest | Original, project licence |
| App icon (`web/public/favicon.svg` and the PNG icons) | `web/public/` | Written for MathQuest | Original, project licence |

No third-party game names, logos, characters, fonts, sounds or textures are used. The v1 prototype's game branding was not carried over.
Themed art and cosmetics arrive in Phase 4; each piece will be added here with its licence.
