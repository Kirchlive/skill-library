#!/usr/bin/env bash
# Re-sync bundled Good Docs Project templates from gitlab.com/tgdp/templates.
# Run from anywhere; resolves paths relative to the script.
#
# Usage:
#   bash skills/good-docs-writer/tools/sync-templates.sh [branch-or-tag]
#
# Defaults to `main`. To pin a release: `bash sync-templates.sh v1.5.0`

set -euo pipefail

REF="${1:-main}"
BASE="https://gitlab.com/tgdp/templates/-/raw/${REF}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REFS_DIR="$SCRIPT_DIR/../references"
TEMPLATES_DIR="$REFS_DIR/templates"

KEYS=(concept tutorial how-to quickstart troubleshooting reference glossary release-notes installation-guide api-getting-started)

echo "Syncing from $BASE → $TEMPLATES_DIR"

pids=()

for key in "${KEYS[@]}"; do
  mkdir -p "$TEMPLATES_DIR/$key"
  curl -fsSL "$BASE/$key/template_$key.md" -o "$TEMPLATES_DIR/$key/template.md" & pids+=($!)
  curl -fsSL "$BASE/$key/guide_$key.md"    -o "$TEMPLATES_DIR/$key/guide.md"    & pids+=($!)
done

curl -fsSL "$BASE/STYLE-GUIDE.md"  -o "$REFS_DIR/style-guide.md"  & pids+=($!)
curl -fsSL "$BASE/writing-tips.md" -o "$REFS_DIR/writing-tips.md" & pids+=($!)
curl -fsSL "$BASE/LICENSE"         -o "$TEMPLATES_DIR/LICENSE"    & pids+=($!)

# `wait` with no args always returns 0, so check every job individually —
# otherwise a failed download silently leaves a stale/partial snapshot.
failed=0
for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
if [[ $failed -ne 0 ]]; then
  echo "ERROR: one or more downloads failed — snapshot is incomplete." >&2
  exit 1
fi

# Stamp the README with today's date so provenance stays honest.
DATE="$(date +%Y-%m-%d)"
sed -i.bak -E "s/on \*\*[0-9]{4}-[0-9]{2}-[0-9]{2}\*\*/on **$DATE**/" "$TEMPLATES_DIR/README.md" && rm "$TEMPLATES_DIR/README.md.bak"

echo "Synced. Bump metadata.version in skills/good-docs-writer/SKILL.md before publishing."
