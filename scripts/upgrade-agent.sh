#!/usr/bin/env bash
# Host Upgrade Agent. Runs as root on the host (TrueNAS cron, every minute).
#
# Trust model: the container can write ONLY upgrade/ (a request inbox). It is untrusted input.
#   upgrade/          request inbox, written by the container, strictly validated here
#   upgrade-status/   written by this agent, mounted READ-ONLY into the container
#   .state/           root-only agent state, never mounted
#
# Usage: upgrade-agent.sh --run | --install | --uninstall | --status
set -euo pipefail

# shellcheck source=scripts/lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

INBOX="$ROOT_DIR/upgrade"
STATUS_DIR="$ROOT_DIR/upgrade-status"
STATE_DIR="$ROOT_DIR/.state"
REQUEST="$INBOX/request.json"
CRON_DESC="MathQuest upgrade agent"
UUID_RE='^[0-9a-fA-F-]{36}$'
LOG_FILE="$STATUS_DIR/upgrade.log"
export LOG_FILE

mkdir -p "$STATUS_DIR" "$STATE_DIR"
chmod 700 "$STATE_DIR"

write_status() { # write_status STATE MESSAGE [VERSION] [REQUEST_ID]   (STEP_KEY, STEP_N, STEP_COUNT and ERR may be set first)
  local state="$1" message="$2" version="${3:-}" rid="${4:-}" prev tmp started backup finished=""
  prev="$(cat "$STATE_DIR/previous_version" 2>/dev/null || true)"
  started="$(cat "$STATE_DIR/started_at" 2>/dev/null || true)"
  backup="$(basename "$(cat "$STATE_DIR/last_backup" 2>/dev/null || true)" 2>/dev/null || true)"
  case "$state" in succeeded | failed | rolled_back) finished="$(date -u +%Y-%m-%dT%H:%M:%SZ)" ;; esac
  tmp="$(mktemp "$STATUS_DIR/.status.XXXXXX")"
  jq -n --arg state "$state" --arg message "$message" --arg version "$version" --arg rid "$rid" --arg prev "$prev" \
    --arg step "${STEP_KEY:-}" --argjson stepn "${STEP_N:-null}" --argjson stepc "${STEP_COUNT:-null}" --arg err "${ERR:-}" \
    --arg started "$started" --arg finished "$finished" --arg backup "$backup" \
    '{state:$state, message:$message, version:(if $version=="" then null else $version end),
      requestId:(if $rid=="" then null else $rid end),
      previousVersion:(if $prev=="" then null else $prev end),
      step:(if $step=="" then null else $step end), stepNumber:$stepn, stepCount:$stepc,
      error:(if $err=="" then null else $err end),
      startedAt:(if $started=="" or $rid=="" then null else $started end),
      finishedAt:(if $finished=="" then null else $finished end),
      backupFile:(if $backup=="" or $backup=="." then null else $backup end),
      updatedAt:(now|todate)}' >"$tmp"
  chmod 644 "$tmp"
  mv "$tmp" "$STATUS_DIR/status.json"
}

reject() { # reject REASON  (never echo request content into status: it is attacker-controlled)
  log "request rejected: $1"
  write_status failed "Request rejected: $1"
  rm -f "$REQUEST"
}

run_agent() {
  touch "$STATUS_DIR/heartbeat" # lets the admin page tell the agent is running (it runs every minute)
  exec 8>"$STATE_DIR/agent.lock"
  flock -n 8 || exit 0 # an upgrade is already running

  # Nothing to do?
  [ -e "$REQUEST" ] || [ -L "$REQUEST" ] || exit 0
  rm -f "$STATE_DIR/started_at" "$STATUS_DIR/progress.json"

  # 1. Validate the file itself: a plain, small, regular file. Never follow symlinks.
  if [ -L "$REQUEST" ] || [ ! -f "$REQUEST" ]; then reject "not a regular file"; exit 0; fi
  local size
  size="$(stat -c %s "$REQUEST")"
  if [ "$size" -gt 2048 ]; then reject "file too large"; exit 0; fi

  # 2. Read once into a variable, then remove the original so it cannot change under us.
  local raw
  raw="$(head -c 2048 "$REQUEST")"
  rm -f "$REQUEST"

  # 3. Strict JSON: exactly the expected keys, each matching a pattern. Nothing is executed or sourced.
  local version rid
  if ! echo "$raw" | jq -e 'type=="object" and (keys - ["requestId","version","requestedAt","from"] | length == 0)' >/dev/null 2>&1; then
    write_status failed "Request rejected: unexpected content"; log "request rejected: bad shape"; exit 0
  fi
  version="$(echo "$raw" | jq -r '.version // empty' 2>/dev/null || true)"
  rid="$(echo "$raw" | jq -r '.requestId // empty' 2>/dev/null || true)"
  [[ "$version" =~ $SEMVER_RE ]] || { write_status failed "Request rejected: invalid version"; log "request rejected: invalid version"; exit 0; }
  [[ "$rid" =~ $UUID_RE ]] || { write_status failed "Request rejected: invalid request id"; log "request rejected: invalid request id"; exit 0; }

  # 4. Policy: upgrades only. A request for an older version is a downgrade (replay) and is refused.
  local current
  current="$(env_get MATHQUEST_VERSION)"
  if [ -n "$current" ] && ! version_gt "$version" "$current"; then
    write_status failed "Version $version is not newer than $current" "$version" "$rid"
    log "refused non-upgrade request for $version (current $current)"
    exit 0
  fi

  date -u +%Y-%m-%dT%H:%M:%SZ >"$STATE_DIR/started_at"
  write_status validating "Checking release v$version" "$version" "$rid"
  log "request $rid: upgrade to v$version"
  write_status running "Updating to v$version (backup, verify, deploy)" "$version" "$rid"

  local rc=0 pj="$STATUS_DIR/progress.json" log_from
  log_from="$(wc -l <"$LOG_FILE" 2>/dev/null || echo 0)"; [[ "$log_from" =~ ^[0-9]+$ ]] || log_from=0
  "$ROOT_DIR/update.sh" --version "$version" >>"$LOG_FILE" 2>&1 || rc=$?
  if [ -f "$pj" ]; then # the stage update.sh reached last: when it failed, this is where
    STEP_KEY="$(jq -r '.step // empty' "$pj" 2>/dev/null || true)"
    STEP_N="$(jq -r '.stepNumber // empty' "$pj" 2>/dev/null || true)"
    STEP_COUNT="$(jq -r '.stepCount // empty' "$pj" 2>/dev/null || true)"
    [[ "$STEP_N" =~ ^[0-9]+$ ]] || STEP_N=""
    [[ "$STEP_COUNT" =~ ^[0-9]+$ ]] || STEP_COUNT=""
    [ -n "$STEP_N" ] || STEP_N=null
    [ -n "$STEP_COUNT" ] || STEP_COUNT=null
  fi
  # the host script's own reason, in plain words (its ERROR: lines go to the same log)
  ERR="$(tail -n +"$((log_from + 1))" "$LOG_FILE" 2>/dev/null | grep -a 'ERROR:' | tail -n1 | sed 's/^.*ERROR: //' | cut -c1-280 || true)"
  case "$rc" in
    0) STEP_KEY="done"; STEP_N=5; STEP_COUNT=5; ERR=""; write_status succeeded "Now running v$version" "$version" "$rid" ;;
    20) write_status rolled_back "Update failed; rolled back to the previous version" "$version" "$rid" ;;
    21) write_status failed "Update failed and the rollback failed. Run update.sh --rollback on the host." "$version" "$rid" ;;
    *) write_status failed "Update failed before anything changed (see upgrade.log)" "$version" "$rid" ;;
  esac
  exit 0
}

cron_query() { midclt call cronjob.query "[[\"description\",\"=\",\"$CRON_DESC\"]]"; }

install_cron() {
  command -v midclt >/dev/null 2>&1 || die "midclt not found (not TrueNAS). Run '$0 --run' every minute as root instead."
  local cmd payload existing id
  cmd="$ROOT_DIR/scripts/upgrade-agent.sh --run"
  payload="$(jq -nc --arg cmd "$cmd" --arg desc "$CRON_DESC" \
    '{command:$cmd, user:"root", description:$desc, enabled:true, stdout:false, stderr:false,
      schedule:{minute:"*", hour:"*", dom:"*", month:"*", dow:"*"}}')"
  existing="$(cron_query)"
  id="$(echo "$existing" | jq -r '.[0].id // empty')"
  if [ -z "$id" ]; then
    midclt call cronjob.create "$payload" >/dev/null
    log "installed TrueNAS cron job: $CRON_DESC"
  elif [ "$(echo "$existing" | jq -r '.[0].command')" != "$cmd" ]; then
    midclt call cronjob.update "$id" "$payload" >/dev/null
    log "updated TrueNAS cron job path: $CRON_DESC"
  else
    log "TrueNAS cron job already installed"
  fi
}

uninstall_cron() {
  command -v midclt >/dev/null 2>&1 || die "midclt not found"
  local id
  id="$(cron_query | jq -r '.[0].id // empty')"
  if [ -n "$id" ]; then midclt call cronjob.delete "$id" >/dev/null && log "removed cron job"; else log "no cron job to remove"; fi
}

case "${1:-}" in
  --run) run_agent ;;
  --install) install_cron ;;
  --uninstall) uninstall_cron ;;
  --status) cat "$STATUS_DIR/status.json" 2>/dev/null || echo '{"state":"idle"}' ;;
  *) echo "usage: $0 --run | --install | --uninstall | --status" >&2; exit 2 ;;
esac
