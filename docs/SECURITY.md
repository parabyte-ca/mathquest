# Security: secrets and the browser

MathQuest keeps every credential on the server. The browser receives only the built app (HTML, JavaScript, CSS, icons) and API responses
for the person who is signed in. This page says where each secret lives, how it is kept out of the browser, and how that is checked.

## Where the secrets are

| Secret | Lives in | Used by | Reaches the browser? |
|---|---|---|---|
| `RESEND_API_KEY` | `.env` on the host (mode 600), passed to the container as an environment variable | `server/mail.ts`, when it sends a sign-in link or the weekly email | No. The API only says whether email is configured. |
| `ANTHROPIC_API_KEY` | `.env` | `server/ai/anthropic.ts`, when an admin asks for question drafts | No. `GET /api/admin/ai/status` returns `configured: true or false`, never the key. |
| Sessions, device trust, sign-in links | SQLite (`data/`), stored as hashes where they are secrets | `server/session.ts` and the auth routes | Only the person's own session cookie (`HttpOnly`, `SameSite=Lax`, `Secure` behind the tunnel). |
| Cosign signing identity for releases | GitHub Actions (OIDC), nothing stored | `release.yml` | No. |

There are no database connection strings (SQLite is a local file), no private keys, and no third-party API called from the browser
(`connect-src 'self'` in the Content Security Policy means the browser cannot send data to any other site).

Every sensitive operation is a server endpoint that checks who is asking: sending email, calling Claude, approving drafts, creating
students, exporting data, starting an update.

## How it is kept out of the browser

- **Nothing reads the environment in browser code.** The Vite build only exposes variables that start with `MQ_PUBLIC_` (`envPrefix` in
  `web/vite.config.ts`), and the build refuses to run if such a variable has a name like `KEY`, `SECRET`, `TOKEN` or `PASSWORD`.
  There are no `MQ_PUBLIC_` variables today.
- **No source maps** are produced for the browser (`build.sourcemap: false`) or the server (`sourceMap: false` in `tsconfig.build.json`),
  so the original source is not published with the app.
- **The image copies only what it names** (`Dockerfile`), and `.dockerignore` keeps `.env`, `.git`, `data/` and key files out of the
  build context as a second lock.
- **API responses are never cached** (`Cache-Control: no-store`), because they carry session and CSRF material and personal data.
- **Sign-in links:** the one-time token is removed from the address bar and history as soon as the page reads it.
- **Logs never print message bodies**, sign-in links or keys.

## How it is checked

- `npm run audit:secrets` scans the tracked source, **the whole git history**, the browser bundle (`dist/web`) and the server build
  (`dist/server`). It looks for credential shapes (Anthropic, Resend, GitHub, AWS, Google, Slack, Stripe, JWTs, private keys,
  connection strings, URLs with passwords), hard-coded password assignments, **the actual values of this machine's secret-like
  environment variables**, source maps, `process.env`, server-only packages, service URLs and build paths inside the browser bundle,
  and file types that should never be served. Add `secret-scan:allow` to a line to accept a reviewed false positive.
- CI runs it after every build, and again on the **built Docker image** (it copies `/app/dist` out of the image and also fails if the
  image holds an `.env`, a source map, a key or a database file).
- `tests/secret-scan.test.ts` proves the scanner finds each kind of secret it claims to find.
- `tests/security-exposure.test.ts` configures fake keys, then tries to make the running app reveal them: every read-only API route
  as an admin, a caregiver, a student and a visitor, error paths (including a provider that echoes the key back), mail failures, path
  traversal and requests for `.env`, `package.json` and the server build, and the security headers.

Run it yourself before a deploy:

```bash
npm run build
npm run audit:secrets -- --require-client
```

## Households (many families on one install)

MathQuest can serve several families. The rule is that a person reaches only themselves, their own students and the caregivers they share a student with. `tests/household-isolation.test.ts` checks it on every route with three households and an admin.

- A caregiver reaches a student only through a link in `student_caregivers`, as `owner` or `co`. An unknown id and another family's student both answer 404, so ids cannot be probed.
- A student can have several owners (up to six caregivers in all). Owners are equals: neither can remove or demote the other, an owner can only step down themselves, and the last owner can neither step down nor leave. Handing a student over and promoting a helper are owner-only and email the people concerned.
- Account deletion waits 14 days, needs the account's own email typed as confirmation, and is cancelled by signing in. Students only that person owns are deleted; shared ones stay with the remaining owner, and the log keeps no id that leads back to the person. Account export holds only what the person can reach. The admin account uses neither.
- A co-caregiver can view, set goals, message, make worksheets, approve devices and export. Only the owner deletes a student, shares or unshares, and changes a PIN.
- The install admin manages accounts (invite, disable, upgrades, question review). The admin has no way into a family's students, progress, goals, messages or worksheets, and the audit log shown to the admin lists account-level events only.
- Usernames only have to be unique inside a household. A student signs in on a device a caregiver approved, and the name is looked up only among that caregiver's students. A name clash is refused when you create a student or share one, and says nothing about other families.
- Sharing is deliberate: "Invite a co-parent" shares only the students you name (none are pre-selected), a student that is not yours refuses the whole request and creates no account, the address is shown back for confirmation, the role defaults to helper, and every other owner of the student is emailed the address that was added. A helper cannot share, and the admin sees only how many students an account owns and helps with.
- Sharing answers the same whether or not the address has an account, and an existing caregiver gets a short notice by email.
- A student's activity log (who looked, changed or shared what, and when) is read only by the caregivers on that student, through the same gate as every student route. It holds no goal titles or message text, is kept 180 days, and is deleted with the student. The admin's audit view lists account events only.
- Family goals count only the students their creator owns and are shown only to those students.
- Shared on purpose: the question bank and the curriculum. They hold no student data.

## If a secret is ever exposed

1. Revoke it at the provider first (Resend: API Keys; Anthropic: Console, API keys), then create a new one.
2. Put the new value in `.env` on the host and run `sudo docker compose up -d` so the container restarts with it.
3. Find out how it leaked. If it was committed, rewriting history does not make it safe again: the old key is already public, so
   step 1 is the fix.
4. Check the Resend and Anthropic usage pages for activity you do not recognise.

## Known limits and recommendations

- GitHub Actions in the workflows are referenced by version tag (`# pin`). Pin them to commit SHAs with `scripts/pin-actions.sh`
  when you next update them, so a moved tag cannot change what CI runs.
- `npm audit --omit=dev --audit-level=high` runs in CI. Review its output when it fails; do not lower the level to get green.
- Offline practice works because the question generators ship in the browser bundle: a pack lists which questions to build (skill,
  level and seed) and the app builds and checks them on the device. That means a determined student could work out answers from
  the bundle. It is practice content, not a credential, and the server does not rely on the browser for anything that matters (it
  rebuilds and re-checks every answer that is sent back).
