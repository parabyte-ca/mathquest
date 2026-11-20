# MathQuest v2.0.0: Plan (for approval)

Status: DECISIONS RECEIVED 2026-11-20. Awaiting final go to start Phase 1.

## 1. Repo audit (what exists)

| Item | Finding |
|---|---|
| Code | **None.** `main` holds a one-line `README.md` ("# Repository") and `docs/wfx-audit.md` (a stub). 3 commits. |
| VERSION, CHANGELOG, Dockerfile, compose, setup.sh, update.sh, CI | Absent |
| Data model, auth, caregiver portal | Absent in this repo |
| Branches | `main`, `claude/new-session-pz23t0` (identical to main) |

**Conflict with the prompt:** it assumes a v1 in this repo. There is nothing to keep, replace or migrate here. v1 lives elsewhere (TrueNAS install, or another repo/branch). Therefore v2 is a greenfield build, and the migration is designed against an assumed v1 schema until I see real data.

**Port conflict:** the `dev-sop` registry marks **8085 as occupied by an unidentified service** (flagged 2026-10-17). It may be v1 MathQuest itself. Must run `sudo ss -tlnp | grep 8085` and `sudo docker ps` on TrueNAS. If it is v1, v2 reuses 8085 after v1 is stopped by the migration. If not, pick from 8086-8089. Registry updated either way.

## 2. Architecture

- **Stack:** Node 22 + Express + better-sqlite3 (kept). Frontend: **Vite + Preact + TypeScript** (justified: skill map, manipulatives, math keyboard, offline PWA and i18n are too stateful for hand-rolled DOM). Built to static assets served by Express. Needs your approval.
- **Single container**, port from §1, `/api/*` for all backend routes, SPA served from `/` with client routes under `/app/*` (no collision with `/api/health`).
- **Self-hosted assets:** KaTeX, fonts, icons bundled. CSP `default-src 'self'`; no CDNs.
- **Math:** math.js for CAS and equivalence checks, in the server and the client (shared package, so offline checking works).
- **Layout:** `server/` (routes, auth, engine, jobs), `web/` (SPA), `shared/` (generators, checker, math-to-speech, i18n keys), `content/` (curriculum JSON, lessons), `scripts/` (upgrade agent, backup), `tests/`.
- **Jobs:** in-process scheduler for nightly backup, spaced-review queue, weekly email, spend-cap rollup.

## 3. Data model (SQLite, WAL, migrations table)

users(id, role, email, created) · invites · magic_tokens(hash, expiry, used, ua_bind) · sessions · students(id, caregiver_id, display_name, username, pin_hash, grade, language, settings_json, allowed_courses) · devices(student_id, token_hash, approved_by, last_seen) · pin_attempts · curriculum_expectation / curriculum_microskill / prereq_edge (versioned seed) · item(id, microskill, tier, lang, source[gen|claude], status[pending|approved|retired], payload, answer_check, cost) · attempt(student, item, correct, hints, tries, ms) · mastery(student, microskill|expectation, p_known, last_seen, next_review) · session / placement · rewards (xp, level, badge, streak, freeze, cosmetic, caregiver_goal, redemption) · audit_log · claude_usage · schema_version.

Privacy: students hold only display name, username, grade, language, settings. Export and delete per student. Claude API prompts carry only skill ids, grade and tier, never student data.

## 4. Auth and security

- Magic links (Resend): 256-bit token, SHA-256 stored, single use, 15 min, bound to a browser nonce cookie, rate limits per email and per IP, tokens never logged. Invite-only: unknown emails get the same response and no mail (no enumeration).
- Student: username + 4-digit PIN only on approved devices; lockout after 5 misses with caregiver notice; PIN hashed with argon2id plus per-device throttling (4 digits is weak, so the device-trust gate is the real control).
- Cookies HttpOnly/Secure/SameSite=Lax; CSRF via double-submit token; strict CSP; zod validation on every endpoint; audit log.
- Resend DNS for `moot.es`: SPF, DKIM, DMARC records documented in README.

## 5. Adaptive engine (decision: Bayesian Knowledge Tracing)

BKT per micro-skill (p_L0, p_T, p_S, p_G), updated each attempt; hints, retries and slow time scale the slip/guess inputs. Why: explainable, four parameters, cheap, matches "mastered / in progress" states on the skill map. Expectation mastery = weighted aggregate of its micro-skills. Elo rejected: weaker at "mastered" semantics.

Flow: struggle detection (≥2 misses, heavy hints, repeated slow) → drop one tier → micro-skill single-step items → prerequisite micro-lesson → build back up (micro → combined → original tier). Never more than one tier per move. Placement: adaptive diagnostic over the prerequisite graph (binary-search style). Spaced review: intervals 1, 3, 7, 14, 30 days; a slip resets. Session mix about 70% target, 20% review, 10% stretch, with a KU/AP/TH mix per the skill.

## 6. Curriculum data

Generated from the skill's 8 reference files (697 lines) into `content/curriculum.json` (versioned). Pipeline script parses the references, a human review pass fixes gaps. The skill itself says Grades 5-8 wording comes from third-party mirrors; I will flag unverified items and the verify-against-ministry step. Tags: A-F codes for Gr 5-9, course+strand for Gr 10-12; 12 senior courses with recommended-not-blocking prerequisites.

## 7. Content generators

Seeded PRNG, one or more per micro-skill and tier, returning prompt, answer, checker, steps, hint ladder, wrong-answer→misconception map, EN and FR from one template. Claude-generated items pass deterministic recompute, then land in an admin review queue; cached; monthly cap. Default model `claude-sonnet-5-5` via `.env`.

## 8. Deployment and upgrade

setup.sh / update.sh / upgrade agent exactly per dev-sop (signed GHCR image, cosign, revision label, backup, rollback, `upgrade/` `upgrade-status/` `.state/`, `midclt` cron). Nightly backup, 14-day retention configurable. CI: lint, typecheck, tests, i18n key parity, shellcheck -x, Playwright, build, sign, release on merge when VERSION changes.

## 9. v1 migration

Cannot be written until I see v1's schema or a data copy. Design: read-only open of the v1 DB, backup, transform inside one transaction, row-count verification report, idempotent via a `migrated_from_v1` marker table. Caregivers get magic-link invites automatically (they log in by email, not the old password); students keep username, PIN is re-hashed if v1 stored it hashed, otherwise reset. Rollback: restore pre-migration backup and previous tag.

## 10. Test strategy

Vitest: every generator × many seeds × all tiers (valid, correct answer, equivalents accepted, mapped wrong answers rejected); engine; auth; migration against a v1 copy. Playwright at phone/tablet/desktop with mocked Resend. Docker walk-through on phone viewport at the end of each phase.

## 11. Phases (as in the prompt)

1 Foundation → 2 Learning experience → 3 Content (grade order TBD) → 4 Motivation and caregivers → 5 Polish. Version path: 2.0.0-rc.1 through phase 4, 2.0.0 at phase 5 completion (PATCH/MINOR tags per phase if you prefer).

## 12. Risks

- No v1 source or data in this repo (migration blind spot).
- Port 8085 ambiguity.
- Content volume is huge (Gr 5-12 plus micro-skills): grade-by-grade rollout is mandatory.
- Art: original blocky style only; asset licence ledger in `content/ASSETS.md`.
- Claude API cost and correctness: mitigated by recompute check, queue, cap.
- 4-digit PIN: mitigated by device approval and lockout.
- Curriculum wording drawn from mirrors: verify before quoting as official.
- Web Speech `fr-CA` voices vary by device; captions always shown.

## 13. Decisions (resolved)

1. No v1 was ever established; user holds a zip (contents unknown, to be inspected if provided). Greenfield build; migration deferred.
2. Port **8086** (8085 stays flagged unknown). Registry and homelab skill updated (copies in `docs/skill-updates/`).
3. Vite + Preact + TypeScript approved.
4. Content first: **Grades 5 and 6**.
5. Co-caregiver sharing: **yes**. Data model change: `student_caregivers(student_id, caregiver_id, role[owner|co], added_by)` replaces `students.caregiver_id`; either caregiver can manage and view, only the owner can delete the student or remove the co-caregiver; invite-by-email flow; audit-logged.
6. Daily goal and session limit: per caregiver (defaults), overridable per student.
7. Migrate nothing by default. If the zip is v1: never import sessions, tokens or logs; plaintext PINs are not imported (reset).
8. A tag per phase: v2.0.0-phase1 ... through v2.0.0 at Phase 5 (CI-driven SemVer; exact scheme to confirm at Phase 1 CI).

## 13b. Original questions (for reference)

1. Where is v1 (repo, branch, TrueNAS path)? Provide schema or a DB copy.
2. What owns port 8085 on TrueNAS?
3. Approve Vite + Preact + TypeScript?
4. Which grades or courses first?
5. Co-caregiver sharing of a student?
6. Daily goal and session limit: per caregiver (default) or per student?
7. Any v1 data not to migrate?
8. Version scheme: single 2.0.0 at the end, or tags per phase?
