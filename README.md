# MathQuest

> Adaptive Ontario math practice and rewards for Grades 5-12, self-hosted and invite-only.

![Version](https://img.shields.io/badge/version-2.0.0-blue)

## Overview

MathQuest is a self-hosted practice app for Ontario students in Grades 5-12. Caregivers are invited by email, add their own students, and approve the devices students use. An explainable adaptive engine tracks mastery per skill and steps a student down to smaller skills when they struggle. It runs on TrueNAS and is published at `mathquest.moot.es` through a Cloudflare Tunnel.

This is the v2 rewrite, delivered in phases (see `docs/v2-plan.md`). **Phase 1 (Foundation) is released as 2.0.0**: accounts, curriculum model, engine core and deployment. Lessons, the question player, content, rewards and the caregiver dashboard arrive in the next phases.

## Features

- Invite-only accounts: admin, caregiver and student roles; caregivers see only their own students and can share a student with a co-caregiver
- Caregiver sign-in by email magic link (Resend): single use, 15 minute expiry, hashed at rest, browser-bound, rate limited
- Student sign-in with username and 4-digit PIN, only on devices a caregiver approved with a pairing code; lockout after 5 wrong PINs with an email to the caregiver
- Minimal student data (display name, username, grade, language, settings); export or delete any student's data
- CSRF protection, strict Content Security Policy, input validation on every endpoint, audit log
- Ontario curriculum model for Grades 5-12 (365 expectations, both tagging schemas, prerequisite graph, micro-skills for Grade 5-6 number and fractions)
- Adaptive engine core: Bayesian Knowledge Tracing, struggle detection, one-tier-at-a-time step-down and build-up, spaced review, session mix, adaptive placement
- English and French interface (CI fails on a missing key)
- Signed container releases, `setup.sh`, `update.sh` with backup and rollback, in-app upgrades through a host upgrade agent
- Nightly SQLite backups (14 days by default)

## Requirements

- Docker with Compose v2, `curl`, and `cosign` (to verify signed images)
- On TrueNAS: `midclt` (present by default) for the upgrade agent's cron job, and `jq`
- A Resend account with a verified sender domain
- Node.js 22 only for development

## Setup

See `setup.sh`, run once on first deployment.

```bash
git clone https://github.com/parabyte-ca/mathquest.git && cd mathquest
sudo ./setup.sh
```

It checks the port is free, creates `.env` (mode 600) and prompts for the Resend key, sender, Anthropic key and admin email, pulls and verifies the signed image, starts the container, waits for the health check, creates the first admin and emails a sign-in link. Re-running it is safe.

Then add the Cloudflare Tunnel public hostname `mathquest.moot.es` -> `http://localhost:8086`.

### Email DNS (sender on `moot.es`)

Resend shows the exact values when you add the domain; publish them in Cloudflare DNS (set the records to "DNS only"):

| Type | Name | Purpose |
|---|---|---|
| TXT | `send.moot.es` (SPF, from Resend) | Authorises Resend to send for the domain |
| MX | `send.moot.es` (from Resend) | Bounce handling for the SPF subdomain |
| TXT | `resend._domainkey.moot.es` (DKIM, from Resend) | Signs outgoing mail |
| TXT | `_dmarc.moot.es` | Start with `v=DMARC1; p=none; rua=mailto:<your address>`, tighten to `quarantine` once reports look clean |

Keep any existing SPF record on the root domain unchanged; Resend uses its own subdomain for the return path.

## Update

See `update.sh`, run to deploy a release.

```bash
sudo ./update.sh                    # latest release tag
sudo ./update.sh --version 2.1.0    # a specific release
sudo ./update.sh --rollback         # previous tag + the database as it was before the last update
```

It backs up the database first, verifies the cosign signature and that the image's revision label matches the tag's commit, waits for the health check, records the previous tag in `.state/`, and rolls back automatically if the new version is not healthy. Logs go to `logs/update.log`; the rollback command is printed at the end.

**In-app:** the admin **Updates** page shows the installed version, the latest release with its notes, and an **Upgrade** button. The container only writes a request into `upgrade/`. The root agent (`scripts/upgrade-agent.sh`, a TrueNAS cron job it installs itself with `midclt`) validates the request (strict JSON, version pattern, no symlinks, upgrades only), runs `update.sh`, and writes status to `upgrade-status/` (mounted read-only). Its own state lives in `.state/` and is never mounted.

```bash
sudo scripts/upgrade-agent.sh --install    # (setup.sh does this on TrueNAS)
sudo scripts/upgrade-agent.sh --status
```

## Configuration

Set in `.env` (see `.env.example`).

| Variable | Default | Notes |
|---|---|---|
| `MATHQUEST_PORT` | `8086` | Host port (registered in `dev-sop/ports.md`) |
| `MATHQUEST_VERSION` | from `VERSION` | Image tag to run; managed by `setup.sh` and `update.sh` |
| `BASE_URL` | `https://mathquest.moot.es` | Used in sign-in links |
| `COOKIE_SECURE` | `true` | Keep `true` behind the Cloudflare Tunnel |
| `RESEND_API_KEY`, `MAIL_FROM`, `ADMIN_EMAIL` | empty | Email delivery and the first admin |
| `MAGIC_LINK_TTL_MINUTES` | `15` | Link lifetime |
| `MAGIC_LINK_BIND` | `strict` | `strict` requires opening the link in the browser that asked; `off` disables the check |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | empty, `claude-sonnet-5-5` | Used from Phase 3 |
| `BACKUP_RETENTION_DAYS` | `14` | Nightly backup retention |
| `MATHQUEST_UID`, `MATHQUEST_GID` | `568` | Container user (the TrueNAS apps user) |

Folders next to the checkout: `data/` (database and `backups/`), `upgrade/` (request inbox), `upgrade-status/` (agent replies, read-only in the container), `.state/` (root only, never mounted). Keep all of them when migrating the host.

Admin tasks inside the container:

```bash
sudo docker compose exec mathquest node dist/server/cli.js create-admin you@example.com
sudo docker compose exec mathquest node dist/server/cli.js backup
```

## Development

```bash
npm ci
npm run dev            # API on :8086 (tsx watch); `npx vite --config web/vite.config.ts` for the UI on :5173
npm run typecheck && npm run i18n:check && npm test
npm run build && npm run e2e     # set PW_CHROMIUM_PATH to use a pre-installed Chromium
npm run curriculum:build         # regenerate content/curriculum.json from content/source/ontario
scripts/pin-actions.sh           # pin GitHub Actions to commit SHAs (needs internet)
```

All API routes live under `/api/` (health check: `/api/health`); the UI lives under `/app/*`, so the two never collide. Every front-end asset is self-hosted; there are no CDNs or trackers.

## Changelog

See `CHANGELOG.md`.

## License

Private family and personal use. Not for redistribution.
