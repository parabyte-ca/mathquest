#!/usr/bin/env bash
# Deploys a specific release tag. Backs up first, verifies the image, waits for health, and rolls back on failure.
# Usage: sudo ./update.sh [--version X.Y.Z] | --rollback
# Exit codes: 0 ok | 1 failed before changing anything | 20 failed and rolled back | 21 failed and rollback failed
set -euo pipefail

# shellcheck source=scripts/lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/scripts/lib.sh"

STATE_DIR="$ROOT_DIR/.state"
mkdir -p "$STATE_DIR"
chmod 700 "$STATE_DIR"
ensure_app_dir "$ROOT_DIR/data/backups"

TARGET=""
ROLLBACK=0
while [ $# -gt 0 ]; do
  case "$1" in
    --version) TARGET="${2:-}"; shift 2 ;;
    --rollback) ROLLBACK=1; shift ;;
    -h | --help) sed -n '2,5p' "$0"; exit 0 ;;
    *) die "unknown argument: $1" ;;
  esac
done

exec 9>"$STATE_DIR/update.lock"
flock -n 9 || die "another update is already running"

PORT="$(env_get MATHQUEST_PORT)"; PORT="${PORT:-8086}"
CURRENT="$(env_get MATHQUEST_VERSION)"

backup_db() { # prints the backup path
  local out
  if compose ps --status running --services 2>/dev/null | grep -qx mathquest; then
    local raw
    raw="$(compose exec -T mathquest node dist/server/cli.js backup 2>&1)" || { log "backup command failed: $raw"; return 1; }
    out="$(printf '%s\n' "$raw" | tail -n1)"
    # CLI prints the in-container path; map /data -> ./data
    echo "$ROOT_DIR/data/${out#/data/}"
  else
    out="$ROOT_DIR/data/backups/mathquest-cold-$(date -u +%Y%m%dT%H%M%SZ).db"
    if [ -f "$ROOT_DIR/data/mathquest.db" ]; then
      cp "$ROOT_DIR/data/mathquest.db" "$out" || return 1
      chown "$(env_get MATHQUEST_UID):$(env_get MATHQUEST_GID)" "$out" 2>/dev/null || true
    fi
    echo "$out"
  fi
}

restore_db() { # restore_db BACKUP_PATH
  local backup="$1" uid gid
  [ -f "$backup" ] || return 1
  compose stop mathquest >/dev/null 2>&1 || true
  rm -f "$ROOT_DIR/data/mathquest.db-wal" "$ROOT_DIR/data/mathquest.db-shm"
  cp "$backup" "$ROOT_DIR/data/mathquest.db"
  uid="$(env_get MATHQUEST_UID)"; gid="$(env_get MATHQUEST_GID)"
  chown "${uid:-568}:${gid:-568}" "$ROOT_DIR/data/mathquest.db" 2>/dev/null || true
}

start_version() { # start_version VERSION
  env_set MATHQUEST_VERSION "$1"
  compose up -d >>"$LOG_FILE" 2>&1
  wait_healthy "$PORT" 90
}

do_rollback() {
  local prev backup
  prev="$(cat "$STATE_DIR/previous_version" 2>/dev/null || true)"
  backup="$(cat "$STATE_DIR/last_backup" 2>/dev/null || true)"
  is_semver "$prev" || die "no previous version recorded; nothing to roll back to"
  log "rolling back to v$prev (restoring $backup)"
  restore_db "$backup" || log "WARNING: no database backup to restore; keeping current data"
  git -C "$ROOT_DIR" checkout --quiet "v$prev" 2>/dev/null || log "WARNING: could not check out tag v$prev (image will still be v$prev)"
  start_version "$prev" || return 1
  log "rolled back to v$prev"
}

if [ "$ROLLBACK" = "1" ]; then
  do_rollback || { log "rollback failed; see $LOG_FILE"; exit 21; }
  exit 0
fi

# --- choose the release to deploy ------------------------------------------------
git_fetch_tags 2>/dev/null || log "WARNING: could not fetch tags (offline, or the repository is private: see README \"Private repository\")"
if [ -z "$TARGET" ]; then
  TARGET="$(git -C "$ROOT_DIR" tag --list 'v*' | sed 's/^v//' | grep -E "$SEMVER_RE" | sort -V | tail -n1)"
fi
is_semver "$TARGET" || die "no valid release version (use --version X.Y.Z)"
[ "$TARGET" != "$CURRENT" ] || { log "already on v$TARGET"; exit 0; }
log "updating v${CURRENT:-none} -> v$TARGET"

# --- 1. back up before changing anything ------------------------------------------
BACKUP="$(backup_db)" || die "database backup failed; nothing changed"
[ -n "$BACKUP" ] && [ -f "$BACKUP" ] || log "WARNING: no existing database to back up (first deploy?)"
echo "$BACKUP" >"$STATE_DIR/last_backup"
echo "${CURRENT:-$TARGET}" >"$STATE_DIR/previous_version"
log "backup: $BACKUP"

# --- 2. fetch and verify the image BEFORE touching the checkout ---------------------
docker pull "${IMAGE_REPO}:${TARGET}" >>"$LOG_FILE" 2>&1 || die "could not pull ${IMAGE_REPO}:${TARGET}"
verify_image "$TARGET"

# --- 3. deploy ------------------------------------------------------------------------
git -C "$ROOT_DIR" checkout --quiet "v$TARGET" || die "could not check out v$TARGET"
if ! start_version "$TARGET"; then
  log "v$TARGET did not become healthy; rolling back"
  if do_rollback; then
    log "ROLLED BACK to v${CURRENT}. Logs: $LOG_FILE"
    exit 20
  fi
  log "ROLLBACK FAILED. Manual fix needed: sudo $ROOT_DIR/update.sh --rollback"
  exit 21
fi

log "update complete: now on v$TARGET"
log "to undo: sudo $ROOT_DIR/update.sh --rollback"
