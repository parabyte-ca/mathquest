# MathQuest

> Adaptive Ontario math practice and rewards for Grades 5-12, self-hosted and invite-only.

![Version](https://img.shields.io/badge/version-3.20.0-blue)

## Overview

MathQuest is a self-hosted practice app for Ontario students in Grades 5-12. Caregivers are invited by email, add their own students, and approve the devices students use. An explainable adaptive engine tracks mastery per skill and steps a student down to smaller skills when they struggle. It runs on TrueNAS and is published at `mathquest.moot.es` through a Cloudflare Tunnel.

This is the v2 rewrite, delivered in phases (see `docs/v2-plan.md`). **Phase 1 (Foundation)** shipped as 2.0.0: accounts, curriculum model, engine core and deployment. **Phase 2 (Learning experience)** shipped as 2.1.0: lessons with visuals and optional voice, the question player, hints and feedback, skill map and placement, on a Grade 5-6 number, fractions, decimals and coordinates seed set. **Phase 3 (Content)** is 2.2.0: the Grade 5-6 Number strand (45 micro-skills in all, 10 new lessons), Grade 5-6 strands C to F (algebra, data, spatial sense, financial literacy: 28 more skills and 10 more lessons, 2.2.2) and the Claude question-writer with an admin review queue and student reports. **Phase 4 (Motivation and caregivers)** is 2.3.0: XP, levels, streaks with freezes, badges, unlockable avatars and colour palettes, caregiver-set real-world goals, a caregiver progress dashboard, a weekly email and printable worksheets with answer keys. **Phase 5 (Polish)** is 2.4.0: first-run walkthroughs, an installable app that opens offline, a more informative admin Updates page, invitation notes and faster loading. **Phase 6 (Grades 7 to 12)** has begun: 2.5.0 added Grade 7 Number (15 micro-skills, 4 lessons) and 2.5.1 added the rest of Grade 7 (algebra, data, spatial sense, financial literacy: 26 more micro-skills, 8 more lessons), and 2.7.1 adds practice without internet (download a pack, answer offline, the server grades the answers when they are sent) and an "Install the app" button, 2.7.0 added Grade 8 Number (12 micro-skills, 4 lessons), 2.7.1 added Grade 8 algebra and data (11 micro-skills, 3 lessons), 2.7.2 added Grade 8 spatial sense and financial literacy (16 micro-skills, 5 lessons), which completed Grade 8, and 2.8.0 adds a quick check (placement) for each strand, Number to Financial Literacy, in Grades 5 to 8. Grade 9 is next.

## Features

- Invite-only accounts: admin, caregiver and student roles; caregivers see only their own students and can share a student with a co-caregiver
- Caregiver sign-in by email magic link (Resend): single use, 15 minute expiry, hashed at rest, browser-bound, rate limited
- Student sign-in with username and 4-digit PIN, only on devices a caregiver approved with a pairing code; lockout after 5 wrong PINs with an email to the caregiver
- Minimal student data (display name, username, grade, language, settings); export or delete any student's data
- CSRF protection, strict Content Security Policy, input validation on every endpoint, audit log
- Every credential stays on the server; `npm run audit:secrets` (also run in CI, on the built image too) proves none is in the source, the history, the browser bundle or any API response. See `docs/SECURITY.md`
- Ontario curriculum model for Grades 5-12 (365 expectations, both tagging schemas, prerequisite graph, 463 micro-skills across Grades 5 to 12)
- Adaptive engine core: Bayesian Knowledge Tracing, struggle detection, one-tier-at-a-time step-down and build-up, spaced review, session mix, adaptive placement
- English and French interface (CI fails on a missing key)
- Signed container releases, `setup.sh`, `update.sh` with backup and rollback, in-app upgrades through a host upgrade agent
- Learn it first: short lessons with definitions, three worked examples that build, and a guided "try one with me", with animated SVG diagrams (fraction bars, area models, base-ten blocks, coordinate grids)
- Question player: number, fraction, mixed-number and expression entry, multiple choice, multi-select, ordering, matching and tap-to-plot points; on-screen math keyboard, KaTeX rendering and a scratchpad
- Seeded question generators in English and French, each with a three-rung hint ladder and a map from likely wrong answers to the misconception behind them
- Encouraging feedback that names the misconception, shows the step where it changed, and offers a similar question
- Adaptive practice: mastery per micro-skill, a struggle ladder (one tier down, then micro-skills, then a lesson on the weakest prerequisite, then back up), spaced review, an adaptive placement check and a skill map
- Optional read-aloud (browser speech, off by default) with a math-to-speech converter, fr-CA voices and on-screen captions; high contrast, dyslexia-friendly font and reduced motion
- Nightly SQLite backups (14 days by default)

## Requirements

- Docker with Compose v2 and `curl`. `cosign` (to verify signed images) is installed automatically into `.state/bin/` the first time it is needed (`scripts/install-cosign.sh`, checksum-verified; TrueNAS's read-only `/usr` is not touched)
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

### Email DNS (sender on `mathquest.moot.es`)

MathQuest sends from a **subdomain**, `mathquest.moot.es`, so `MAIL_FROM` must be `MathQuest <mathquest@mathquest.moot.es>` (an address on `moot.es` itself is not verified and Resend answers 403). Add the domain `mathquest.moot.es` in Resend; it shows the exact records. Publish them in Cloudflare DNS as **DNS only** (grey cloud):

| Type | Name | Content (from Resend) |
|---|---|---|
| TXT | `resend._domainkey.mathquest` | DKIM public key (`p=MIGf...`) |
| CNAME | `send.mathquest` | `send.<region>.rmta.net` (SPF / return path) |
| CNAME | `rsend.mathquest` | `rsend.<region>.rmta.net` |
| TXT | `_dmarc.moot.es` | `v=DMARC1; p=none; rua=mailto:<your address>`; subdomains inherit it. Tighten to `quarantine` once reports look clean |

Then create an API key in Resend with **Sending access** limited to the domain `mathquest.moot.es`, and put it in `.env` as `RESEND_API_KEY`.

Troubleshooting a sign-in email that never arrives: the app answers every sign-in request the same way on purpose, so check the logs.

```bash
sudo docker logs mathquest 2>&1 | grep '\[mail\]'
```

| Log line | Meaning |
|---|---|
| `Resend responded 403 ... not authorized to send emails from ...` | `MAIL_FROM` is on a domain the key or account does not cover; use the verified domain |
| `Resend responded 401` | Wrong or revoked `RESEND_API_KEY` |
| `Resend responded 422` | Malformed `MAIL_FROM` (use `Name <address@domain>`) |
| `RESEND_API_KEY not set` | Add it to `.env`, then `sudo docker compose up -d` |

After editing `.env`, recreate the container (`sudo docker compose up -d`); `docker compose restart` does not re-read it. Also check the spam folder, and that the address is an invited user.

## Update

See `update.sh`, run to deploy a release.

```bash
sudo ./update.sh                    # latest release tag
sudo ./update.sh --version 3.20.0    # a specific release
sudo ./update.sh --rollback         # previous tag + the database as it was before the last update
```

It backs up the database first, verifies the cosign signature and that the image's revision label matches the tag's commit, waits for the health check, records the previous tag in `.state/`, and rolls back automatically if the new version is not healthy. Logs go to `logs/update.log`; the rollback command is printed at the end.

**In-app:** the admin **Updates** page shows the installed version, the latest release with its notes, and an **Upgrade** button. The container only writes a request into `upgrade/`. The root agent (`scripts/upgrade-agent.sh`, a TrueNAS cron job it installs itself with `midclt`) validates the request (strict JSON, version pattern, no symlinks, upgrades only), runs `update.sh`, and writes status to `upgrade-status/` (mounted read-only). Its own state lives in `.state/` and is never mounted.

```bash
sudo scripts/upgrade-agent.sh --install    # (setup.sh does this on TrueNAS)
sudo scripts/upgrade-agent.sh --status
```

### Private repository

If `git fetch` asks for a username and password, or the in-app upgrade says the tag is not found, the repository is private and the host cannot read it unattended. Give the host a read-only credential that never enters the container:

```bash
# 1. GitHub -> Settings -> Developer settings -> Fine-grained token: this repository only, "Contents: Read-only"
sudo sh -c 'umask 077; printf %s "<token>" > .state/github_token'   # root-only, never mounted
# 2. If the image is private too, one-time:  sudo docker login ghcr.io -u <user>   (token with read:packages)
```

`update.sh` and the upgrade agent use that file for `git fetch` and never prompt. The admin Updates page checks the GitHub releases API from inside the container, so for a private repository it will show "could not check for new releases"; either make the repository public or run `sudo ./update.sh` from the host.

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
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | empty, `claude-sonnet-5-5` | Turns on the admin question writer (Admin > Question writer). Leave the key empty to keep it off |
| `MATHQUEST_TZ` | `America/Toronto` | Time zone for streak days, the daily goal and the weekly email |
| `AI_MONTHLY_CAP_USD` | `5` | Hard monthly spend cap; generation stops before a call that could pass it |
| `AI_PRICE_IN_PER_MTOK`, `AI_PRICE_OUT_PER_MTOK` | `3`, `15` | Price assumptions (USD per million tokens) used to estimate spend; set them to your model's current rates |
| `ANTHROPIC_API_BASE` | `https://api.anthropic.com` | Only change for testing |
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
npm run build && npm run e2e     # set PW_CHROMIUM_PATH to use a pre-installed Chromium (includes an axe WCAG 2.2 AA scan)
npm run curriculum:build         # regenerate content/curriculum.json from content/source/ontario
scripts/pin-actions.sh           # pin GitHub Actions to commit SHAs (needs internet)
```

All API routes live under `/api/` (health check: `/api/health`); the UI lives under `/app/*`, so the two never collide. Every front-end asset is self-hosted; there are no CDNs or trackers.

## Changelog

See `CHANGELOG.md`.

## License

Private family and personal use. Not for redistribution.
