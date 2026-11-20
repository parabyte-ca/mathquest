# Changelog

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
