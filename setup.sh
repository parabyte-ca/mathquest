#!/usr/bin/env bash
# First-run setup for MathQuest. Idempotent: safe to run again.
# Usage: sudo ./setup.sh [--yes]   (--yes accepts defaults and never prompts; secrets must already be in .env)
set -euo pipefail

# shellcheck source=scripts/lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/scripts/lib.sh"
LOG_FILE="$ROOT_DIR/logs/setup.log"

ASSUME_YES=0
[ "${1:-}" = "--yes" ] && ASSUME_YES=1

VERSION="$(tr -d '[:space:]' <"$ROOT_DIR/VERSION")"
is_semver "$VERSION" || die "VERSION file is not X.Y.Z"
log "Setting up MathQuest v$VERSION"

command -v docker >/dev/null 2>&1 || die "Docker is required"
docker compose version >/dev/null 2>&1 || die "Docker Compose v2 is required"
command -v curl >/dev/null 2>&1 || die "curl is required"

# --- .env -------------------------------------------------------------------
if [ ! -f "$ROOT_DIR/.env" ]; then
  cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
  chmod 600 "$ROOT_DIR/.env"
  log "created .env from .env.example (mode 600)"
fi
chmod 600 "$ROOT_DIR/.env"
env_set MATHQUEST_VERSION "$VERSION"

prompt_secret() { # prompt_secret KEY "Label" [secret]
  local key="$1" label="$2" secret="${3:-}" current value
  current="$(env_get "$key")"
  if [ -n "$current" ] || [ "$ASSUME_YES" = "1" ]; then return 0; fi
  if [ "$secret" = "secret" ]; then
    read -r -s -p "$label: " value
    echo
  else
    read -r -p "$label: " value
  fi
  [ -n "$value" ] && env_set "$key" "$value"
  return 0
}
prompt_secret RESEND_API_KEY "Resend API key (re_...)" secret
prompt_secret MAIL_FROM "Sender address (e.g. MathQuest <mathquest@moot.es>)"
prompt_secret ANTHROPIC_API_KEY "Anthropic API key (optional, press Enter to skip)" secret
prompt_secret ADMIN_EMAIL "Admin email"

PORT="$(env_get MATHQUEST_PORT)"
PORT="${PORT:-8086}"
ADMIN_EMAIL="$(env_get ADMIN_EMAIL)"

# --- port check ---------------------------------------------------------------
if docker ps --format '{{.Names}}' | grep -qx mathquest; then
  log "container 'mathquest' is already running; port $PORT is ours"
elif port_in_use "$PORT"; then
  die "port $PORT is already in use. Check 'sudo ss -tlnp | grep $PORT', or pick another free port in .env (and update dev-sop/ports.md)."
fi

# --- folders ------------------------------------------------------------------
UID_="$(env_get MATHQUEST_UID)"; UID_="${UID_:-568}"
GID_="$(env_get MATHQUEST_GID)"; GID_="${GID_:-568}"
mkdir -p "$ROOT_DIR/data" "$ROOT_DIR/upgrade" "$ROOT_DIR/upgrade-status" "$ROOT_DIR/.state"
# The app writes data/ and drops requests into upgrade/. It only reads upgrade-status/ (root writes it).
chown -R "$UID_:$GID_" "$ROOT_DIR/data" "$ROOT_DIR/upgrade" 2>/dev/null || log "WARNING: could not chown data/ and upgrade/ to $UID_:$GID_ (run with sudo)"
chmod 750 "$ROOT_DIR/data" "$ROOT_DIR/upgrade"
chmod 755 "$ROOT_DIR/upgrade-status"
chmod 700 "$ROOT_DIR/.state"

# --- image: pull and verify, build locally only if the pull fails --------------
REF="${IMAGE_REPO}:${VERSION}"
if docker pull "$REF" >>"$LOG_FILE" 2>&1; then
  git -C "$ROOT_DIR" fetch --tags --quiet 2>/dev/null || true
  verify_image "$VERSION"
else
  log "could not pull $REF; building a local image instead (signature check skipped)"
  docker build --build-arg "GIT_SHA=$(git -C "$ROOT_DIR" rev-parse HEAD 2>/dev/null || echo local)" -t "$REF" "$ROOT_DIR" >>"$LOG_FILE" 2>&1 || die "local build failed (see $LOG_FILE)"
fi

# --- start --------------------------------------------------------------------
compose up -d >>"$LOG_FILE" 2>&1 || die "docker compose up failed (see $LOG_FILE)"
log "waiting for the health check on port $PORT ..."
wait_healthy "$PORT" 90 || { compose logs --tail 40 mathquest | tee -a "$LOG_FILE"; die "app did not become healthy"; }
log "MathQuest is healthy"

# --- first admin ----------------------------------------------------------------
if [ -n "$ADMIN_EMAIL" ]; then
  if compose exec -T mathquest node dist/server/cli.js create-admin "$ADMIN_EMAIL"; then
    log "admin account ready for $ADMIN_EMAIL; check that inbox for the sign-in link"
  else
    log "WARNING: could not create the admin. Check RESEND_API_KEY/MAIL_FROM, then run: sudo docker compose exec mathquest node dist/server/cli.js create-admin $ADMIN_EMAIL"
  fi
else
  log "ADMIN_EMAIL not set; create the admin later with: sudo docker compose exec mathquest node dist/server/cli.js create-admin you@example.com"
fi

# --- upgrade agent (TrueNAS cron through midclt) --------------------------------
if command -v midclt >/dev/null 2>&1; then
  "$ROOT_DIR/scripts/upgrade-agent.sh" --install || log "WARNING: could not install the upgrade agent cron job"
else
  log "midclt not found: the in-app Updates button needs the upgrade agent. Run scripts/upgrade-agent.sh --run every minute as root."
fi

cat <<EOF

Done. MathQuest v$VERSION is running on port $PORT.
Next steps:
  1. Cloudflare Tunnel public hostname: mathquest.moot.es -> http://localhost:$PORT
  2. Email DNS records for the sender domain: see README "Email DNS"
  3. Register the port in dev-sop/ports.md if it is not already there
EOF
