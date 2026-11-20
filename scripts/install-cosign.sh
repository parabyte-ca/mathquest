#!/usr/bin/env bash
# Installs cosign (used to verify signed images) into .state/bin/, which is root-only and never mounted.
# TrueNAS keeps /usr read-only, so this does not touch the system. Safe to re-run.
# Usage: scripts/install-cosign.sh [VERSION]    e.g. v2.4.1 (default: the latest release)
set -euo pipefail

# shellcheck source=scripts/lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

DEST="$ROOT_DIR/.state/bin"
BASE="https://github.com/sigstore/cosign/releases/download"

command -v curl >/dev/null 2>&1 || die "curl is required"
command -v sha256sum >/dev/null 2>&1 || die "sha256sum is required"

case "$(uname -m)" in
  x86_64 | amd64) ASSET="cosign-linux-amd64" ;;
  aarch64 | arm64) ASSET="cosign-linux-arm64" ;;
  *) die "unsupported CPU architecture: $(uname -m)" ;;
esac

VERSION="${1:-}"
if [ -z "$VERSION" ]; then
  VERSION="$(curl -fsSL https://api.github.com/repos/sigstore/cosign/releases/latest | grep -m1 '"tag_name"' | sed -E 's/.*"(v[0-9][^"]*)".*/\1/')"
fi
[[ "$VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]] || die "could not work out a cosign version (got '${VERSION}')"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

log "downloading cosign $VERSION ($ASSET)"
curl -fsSL -o "$tmp/$ASSET" "$BASE/$VERSION/$ASSET" || die "download failed"
curl -fsSL -o "$tmp/checksums.txt" "$BASE/$VERSION/cosign_checksums.txt" || die "checksum file download failed"

expected="$(grep -E "[[:space:]]${ASSET}\$" "$tmp/checksums.txt" | awk '{print $1}')"
[ -n "$expected" ] || die "no checksum listed for $ASSET"
actual="$(sha256sum "$tmp/$ASSET" | awk '{print $1}')"
[ "$expected" = "$actual" ] || die "checksum mismatch for $ASSET (expected $expected, got $actual)"

mkdir -p "$DEST"
install -m 0755 "$tmp/$ASSET" "$DEST/cosign"
log "installed $("$DEST/cosign" version 2>/dev/null | grep -m1 -i GitVersion || echo "cosign $VERSION") at $DEST/cosign"
