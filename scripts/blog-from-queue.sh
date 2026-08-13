#!/usr/bin/env bash
# LAST-RESORT GUARANTEE: publish the oldest ready-made post from content-queue/.
#
# Use this when research, writing, or anything else failed and the day would
# otherwise end with no post. Queue entries are complete .mdx files with
# `pubDate: PUBDATE_PLACEHOLDER`; this stamps today's date, moves the file into
# src/content/blog/, and runs the normal publish pipeline.
#
# Usage: scripts/blog-from-queue.sh          # takes the oldest queued post
#        scripts/blog-from-queue.sh <slug>   # takes a specific one
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

if [ "${1:-}" != "" ]; then
  SRC="content-queue/$1.mdx"
else
  SRC=$(ls -1tr content-queue/*.mdx 2>/dev/null | head -1)
fi

if [ -z "${SRC:-}" ] || [ ! -f "$SRC" ]; then
  echo "QUEUE EMPTY — nothing to fall back on."
  echo "Write a post normally, and top the queue back up (see content-queue/README.md)."
  exit 1
fi

SLUG=$(basename "$SRC" .mdx)
DEST="src/content/blog/$SLUG.mdx"

if [ -e "$DEST" ]; then
  echo "$DEST already exists — refusing to overwrite. Publish it directly."
  exit 1
fi

echo "== taking '$SLUG' from the queue =="
mv "$SRC" "$DEST" || exit 1
# Stamp today's date (BSD sed on macOS needs the empty -i argument)
sed -i '' "s/^pubDate: .*/pubDate: $(date +%F)/" "$DEST"
echo "stamped pubDate: $(date +%F)"

bash scripts/blog-publish.sh "$SLUG" "Blog: $(grep -m1 '^title:' "$DEST" | sed 's/^title: *//' | tr -d '"')"
RC=$?

if [ $RC -ne 0 ]; then
  echo "publish failed — putting '$SLUG' back in the queue so it isn't lost"
  git rm --cached "$DEST" >/dev/null 2>&1
  mv "$DEST" "$SRC" 2>/dev/null
  sed -i '' 's/^pubDate: .*/pubDate: PUBDATE_PLACEHOLDER/' "$SRC" 2>/dev/null
fi
exit $RC
