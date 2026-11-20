# Backlog

Items waiting for a phase or a slot. Newest first within each section. Move an item into the CHANGELOG when it ships.

## Requested

### Admin: more informative update screens
Added 2026-11-20.

The admin Updates page shows the installed version, the latest release, a status word and a raw log tail. Make it say more:
- Show what the upgrade is doing as steps (backup, download, signature check, deploy, health check) with the current one marked, not just "Updating".
- On failure or rollback, say which step failed and why in plain words, and show the exact rollback command.
- Show the previous version, when the last upgrade ran and its result, and where the pre-update backup is.
- Show release notes for every version between the installed one and the latest, not only the latest.
- Explain when no upgrade can be requested (agent not installed or not running, repository or image not reachable, release check failing) instead of a blank state.
- Needs the upgrade agent to write richer status (`step`, `stepNumber`, `stepCount`, `error`) into `upgrade-status/status.json`; the app must keep treating that file as untrusted input (strict shape and length limits).

### Notes to send with caregiver invitations
Added 2026-11-20.

When an admin invites a caregiver (and when a caregiver shares a student with a co-caregiver), allow an optional personal note that is included in the invitation email.
- Optional short plain-text field on the invite forms (suggested limit 500 characters; English and French UI).
- Included in the email body only; never placed in the sign-in link. Escape it as text (the email is plain text today); never allow links or HTML to be injected into the surrounding template.
- Record in the audit log that a note was attached (not its content).
- Decide whether to keep the note after sending (default: do not store it).
- Tests: the note appears in the message, is length-limited, and cannot change the link or subject.

## Noted earlier in this project (not yet scheduled)

- Pin GitHub Actions to commit SHAs (`scripts/pin-actions.sh`, needs internet access).
- Screen-reader pass (VoiceOver and NVDA) over lessons, the question player and the skill map (planned for Phase 5; automated axe scans are already in CI).
- Dependabot: switch to monthly with grouped minor and patch updates so it stops opening many PRs at once.
- Admin Updates page cannot see releases of a private repository from inside the container; resolved while the repository is public. If it goes private again, have the host agent write the latest-release info into `upgrade-status/`.
- Phase 3: content for Grades 5 and 6 first, then the next grades; the Claude-generated item pipeline and admin review queue; remaining item formats (sliders, draggable curves, protractor, simulators, code snippets).
- Phase 4: rewards, themes, caregiver dashboard, weekly email, printable worksheets.
- Phase 5: French review, PWA and offline practice, performance (lazy-load lesson and generator code).
- Create a `mathquest` skill (architecture, ports, release flow) and refresh `ontario-math-curriculum` once Grade 5-6 content is real.
