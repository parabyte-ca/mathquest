#!/usr/bin/env bash
# Pins every "uses: owner/repo@vN # pin" in .github/workflows to a full commit SHA (dev-sop CI standard).
# Run once from a machine with internet access, review the diff, commit. Dependabot keeps the SHAs current.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
command -v git >/dev/null 2>&1 || { echo "git is required" >&2; exit 1; }

for file in .github/workflows/*.yml; do
  while IFS= read -r ref; do
    action="${ref%@*}"
    tag="${ref#*@}"
    # Annotated tags need the peeled ^{} line; fall back to the plain ref for lightweight tags.
    sha="$(git ls-remote "https://github.com/${action}" "refs/tags/${tag}^{}" | cut -f1)"
    [ -n "$sha" ] || sha="$(git ls-remote "https://github.com/${action}" "refs/tags/${tag}" | cut -f1)"
    [ -n "$sha" ] || { echo "could not resolve ${ref}" >&2; exit 1; }
    sed -i "s|uses: ${action}@${tag} # pin|uses: ${action}@${sha} # ${tag}|" "$file"
    echo "pinned ${action}@${tag} -> ${sha}"
  done < <(grep -oE 'uses: [^ ]+@v[0-9][^ ]* # pin' "$file" | sed -E 's/^uses: //; s/ # pin$//' | sort -u)
done
