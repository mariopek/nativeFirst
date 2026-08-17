#!/usr/bin/env bash
# Guarantee that a post exists for today — promoting one from content-queue/ if
# nothing has shipped yet. Does NOT research or write; it only ensures the floor.
#
# Deliberately PORTABLE (macOS + Linux/CI): no BSD-only `sed -i ''`, no GNU-only
# flags. Date stamping goes through python3, which behaves the same on both.
#
# Usage:
#   scripts/blog-ensure-today.sh            # promote from queue if needed
#   scripts/blog-ensure-today.sh --build    # also run astro build as validation
#   scripts/blog-ensure-today.sh --commit   # also git commit the promoted post
#
# Exit codes:
#   0  today already has a post, OR one was successfully promoted
#   1  nothing shipped and the queue is EMPTY  (loud failure — needs a human)
#   2  a post was promoted but validation failed (it is put back in the queue)
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

DO_BUILD=0
DO_COMMIT=0
for a in "$@"; do
  case "$a" in
    --build)  DO_BUILD=1 ;;
    --commit) DO_COMMIT=1 ;;
  esac
done

# The site's dates are the author's local dates, not UTC — pin the zone so a
# run at 22:00 CEST doesn't stamp tomorrow (or a 01:00 UTC run yesterday).
export TZ="${BLOG_TZ:-Europe/Belgrade}"
TODAY=$(date +%F)
echo "today (=$TZ): $TODAY"

# --- already done? ------------------------------------------------------------
EXISTING=$(grep -l "^pubDate: $TODAY\$" src/content/blog/*.mdx 2>/dev/null | head -1)
if [ -n "$EXISTING" ]; then
  echo "ALREADY DONE: $(basename "$EXISTING") is dated today. Nothing to do."
  exit 0
fi

# --- pick the oldest queued post ----------------------------------------------
SRC=$(ls -1tr content-queue/*.mdx 2>/dev/null | head -1)
if [ -z "${SRC:-}" ] || [ ! -f "$SRC" ]; then
  echo "::error::QUEUE IS EMPTY and no post is dated $TODAY. Today will have no post."
  echo "Write posts into content-queue/ (see content-queue/README.md)."
  exit 1
fi

SLUG=$(basename "$SRC" .mdx)
DEST="src/content/blog/$SLUG.mdx"
if [ -e "$DEST" ]; then
  echo "::error::$DEST already exists — refusing to overwrite."
  exit 1
fi

echo "promoting '$SLUG' from the queue"
mv "$SRC" "$DEST" || exit 1

restore() {
  echo "restoring '$SLUG' to the queue"
  git rm --cached "$DEST" >/dev/null 2>&1
  mv "$DEST" "$SRC" 2>/dev/null
  python3 - "$SRC" <<'PY'
import re, sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
s = re.sub(r'(?m)^pubDate:.*$', 'pubDate: PUBDATE_PLACEHOLDER', s, count=1)
open(p, 'w', encoding='utf-8').write(s)
PY
}

# --- stamp today's date (portable) --------------------------------------------
python3 - "$DEST" "$TODAY" <<'PY'
import re, sys
path, today = sys.argv[1], sys.argv[2]
s = open(path, encoding='utf-8').read()
s, n = re.subn(r'(?m)^pubDate:.*$', 'pubDate: %s' % today, s, count=1)
if n != 1:
    sys.exit('could not find a pubDate line to stamp')
open(path, 'w', encoding='utf-8').write(s)
print('stamped pubDate: %s' % today)
PY
[ $? -eq 0 ] || { restore; exit 2; }

# A '/' inside a tag breaks /blog/tag/[tag] and fails the entire build.
if grep -m1 '^tags:' "$DEST" | grep -q '/'; then
  echo "::error::a tag in $SLUG contains '/' — would fail the build"
  restore
  exit 2
fi

# --- optional build validation -------------------------------------------------
if [ "$DO_BUILD" -eq 1 ]; then
  echo "validating with astro build"
  if ! npx --no-install astro build >/tmp/ensure-build.log 2>&1; then
    echo "::error::astro build failed with '$SLUG' — last 25 lines:"
    tail -25 /tmp/ensure-build.log
    restore
    exit 2
  fi
  if [ ! -f "dist/blog/$SLUG/index.html" ]; then
    echo "::error::$SLUG did not produce a page"
    restore
    exit 2
  fi
  echo "build ok, page produced"
fi

# --- optional commit ------------------------------------------------------------
if [ "$DO_COMMIT" -eq 1 ]; then
  TITLE=$(grep -m1 '^title:' "$DEST" | sed 's/^title: *//' | sed 's/^"//; s/"$//')
  # Stage the queue removal too. If only $DEST is staged, git keeps tracking a
  # phantom copy in content-queue/ and CI (which sees only committed files)
  # miscounts what's actually left in the queue.
  git add -A content-queue "$DEST" || { restore; exit 2; }
  git commit -q -F - <<EOF || { restore; exit 2; }
Blog: $TITLE

Published from content-queue by the daily guarantee.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
  echo "committed $(git rev-parse --short HEAD)"
fi

REMAINING=$(ls -1 content-queue/*.mdx 2>/dev/null | wc -l | tr -d ' ')
echo "PROMOTED: $SLUG (queue now holds $REMAINING post(s))"
if [ "$REMAINING" -lt 2 ]; then
  echo "::warning::queue is down to $REMAINING post(s) — top it up to 3+ or the guarantee runs out"
fi
exit 0
