#!/usr/bin/env bash
# Shared helpers for setup.sh, update.sh and the upgrade agent. Source this file; do not run it.

# Repo root = parent of scripts/
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export ROOT_DIR

SEMVER_RE='^[0-9]+\.[0-9]+\.[0-9]+$'
COSIGN_IDENTITY_RE='^https://github\.com/parabyte-ca/mathquest/\.github/workflows/release\.yml@refs/heads/main$'
COSIGN_ISSUER='https://token.actions.githubusercontent.com'
IMAGE_REPO='ghcr.io/parabyte-ca/mathquest'

LOG_FILE="${LOG_FILE:-$ROOT_DIR/logs/update.log}"

log() {
  local line
  line="$(date -u +%Y-%m-%dT%H:%M:%SZ) $*"
  mkdir -p "$(dirname "$LOG_FILE")"
  echo "$line" >>"$LOG_FILE"
  echo "$*"
}

die() {
  log "ERROR: $*"
  exit 1
}

is_semver() { [[ "$1" =~ $SEMVER_RE ]]; }

# Reads KEY from .env (last assignment wins). Prints nothing if missing.
env_get() {
  local key="$1"
  [ -f "$ROOT_DIR/.env" ] || return 0
  grep -E "^${key}=" "$ROOT_DIR/.env" | tail -n1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//' || true
}

# Sets KEY=value in .env, keeping the file mode at 600.
env_set() {
  local key="$1" value="$2" tmp
  touch "$ROOT_DIR/.env"
  chmod 600 "$ROOT_DIR/.env"
  tmp="$(mktemp "$ROOT_DIR/.env.XXXXXX")"
  chmod 600 "$tmp"
  grep -vE "^${key}=" "$ROOT_DIR/.env" >"$tmp" || true
  printf '%s=%s\n' "$key" "$value" >>"$tmp"
  mv "$tmp" "$ROOT_DIR/.env"
}

# Newer-than comparison for semver strings: version_gt A B  => A > B
version_gt() { [ "$1" != "$2" ] && [ "$(printf '%s\n%s\n' "$1" "$2" | sort -V | tail -n1)" = "$1" ]; }

port_in_use() {
  local port="$1"
  if command -v ss >/dev/null 2>&1; then
    ss -tln 2>/dev/null | awk '{print $4}' | grep -qE "[:.]${port}$"
  elif command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
  else
    return 1
  fi
}

# Waits until /api/health answers on the host port. wait_healthy PORT [SECONDS]
wait_healthy() {
  local port="$1" secs="${2:-90}" i
  for ((i = 0; i < secs; i += 2)); do
    if curl -fsS "http://127.0.0.1:${port}/api/health" >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done
  return 1
}

# Prints the path of a usable cosign: one on PATH, else .state/bin/cosign. Installs it (checksum-verified,
# into the root-only .state/ folder) the first time it is needed, so updates need no manual setup.
ensure_cosign() {
  local local_bin="$ROOT_DIR/.state/bin/cosign"
  if command -v cosign >/dev/null 2>&1; then command -v cosign; return 0; fi
  if [ ! -x "$local_bin" ]; then
    log "cosign not found; installing it into .state/bin" >&2
    "$ROOT_DIR/scripts/install-cosign.sh" >&2 || return 1
  fi
  [ -x "$local_bin" ] && echo "$local_bin"
}

# Verifies the cosign signature and that the image was built from the commit the tag points at.
# verify_image VERSION   (set MATHQUEST_SKIP_VERIFY=1 only for local builds)
verify_image() {
  local version="$1" ref commit label
  ref="${IMAGE_REPO}:${version}"
  if [ "${MATHQUEST_SKIP_VERIFY:-0}" = "1" ]; then
    log "WARNING: signature verification skipped (MATHQUEST_SKIP_VERIFY=1)"
    return 0
  fi
  local cosign_bin out
  cosign_bin="$(ensure_cosign)" || die "cosign is not available and could not be installed (run scripts/install-cosign.sh, or set MATHQUEST_SKIP_VERIFY=1 for a local build)"
  out="$("$cosign_bin" verify "$ref" \
    --certificate-identity-regexp "$COSIGN_IDENTITY_RE" \
    --certificate-oidc-issuer "$COSIGN_ISSUER" 2>&1)" || die "signature check failed for $ref: $(printf '%s' "$out" | tail -n 3 | tr '\n' ' ')"
  commit="$(git -C "$ROOT_DIR" rev-list -n1 "v${version}" 2>/dev/null)" || die "tag v${version} not found (run git fetch --tags)"
  label="$(docker image inspect --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}' "$ref")"
  [ -n "$commit" ] && [ "$commit" = "$label" ] || die "image revision label ($label) does not match tag v${version} ($commit)"
  log "verified signature and revision for $ref"
}

# Fetches release tags without ever prompting (cron cannot answer a password prompt).
# For a private repository, put a read-only token in .state/github_token (root-only, never mounted into the container).
git_fetch_tags() {
  local token_file="$ROOT_DIR/.state/github_token" auth=() token
  if [ -s "$token_file" ]; then
    token="$(tr -d '[:space:]' <"$token_file")"
    auth=(-c "http.https://github.com/.extraheader=AUTHORIZATION: basic $(printf 'x-access-token:%s' "$token" | base64 -w0)")
  fi
  GIT_TERMINAL_PROMPT=0 git -C "$ROOT_DIR" "${auth[@]}" fetch --tags --quiet
}

# The app runs as MATHQUEST_UID:GID, so folders it writes into must belong to that user, not root.
ensure_app_dir() { # ensure_app_dir PATH
  local uid gid
  mkdir -p "$1"
  uid="$(env_get MATHQUEST_UID)"; gid="$(env_get MATHQUEST_GID)"
  chown "${uid:-568}:${gid:-568}" "$1" 2>/dev/null || log "WARNING: could not chown $1 to ${uid:-568}:${gid:-568}"
}

compose() { docker compose --project-directory "$ROOT_DIR" "$@"; }
