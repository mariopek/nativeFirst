#!/usr/bin/env bash
# Validate a blog post and the site build BEFORE committing.
# Usage: scripts/blog-preflight.sh <slug>
# Exits non-zero with a specific message on the first problem found.
#
# Every check here corresponds to a real failure that has cost a published day.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

SLUG="${1:?usage: blog-preflight.sh <slug>}"
F="src/content/blog/$SLUG.mdx"
FAIL=0
say() { printf '%s\n' "$*"; }
bad() { printf '  FAIL  %s\n' "$*"; FAIL=1; }
ok()  { printf '  ok    %s\n' "$*"; }

say "== frontmatter =="
[ -f "$F" ] || { bad "$F does not exist"; exit 1; }

for k in title description pubDate tags author coverImage coverImageAlt; do
  grep -q "^$k:" "$F" && ok "$k present" || bad "$k missing from frontmatter"
done

TODAY=$(date +%F)
PD=$(grep -m1 '^pubDate:' "$F" | sed 's/^pubDate: *//' | tr -d '"')
[ "$PD" = "$TODAY" ] && ok "pubDate is today ($TODAY)" || bad "pubDate is '$PD', expected today ($TODAY)"

grep -m1 '^author:' "$F" | grep -q 'NativeFirst Team' && ok "author correct" || bad "author must be \"NativeFirst Team\""

# A '/' inside a tag breaks /blog/tag/[tag] and fails the WHOLE build.
TAGS=$(grep -m1 '^tags:' "$F")
case "$TAGS" in
  *'/'*) bad "a tag contains '/' — breaks the tag route: $TAGS" ;;
  *)     ok "tags contain no '/'" ;;
esac

say "== cover image =="
COVER=$(grep -m1 '^coverImage:' "$F" | sed 's/^coverImage: *//' | tr -d '"')
case "$COVER" in
  *plus.unsplash.com*) bad "coverImage uses plus.unsplash.com (paid)" ;;
  https://images.unsplash.com/*) ok "coverImage is a remote Unsplash URL" ;;
  *) bad "coverImage should be an https://images.unsplash.com/... URL, got: $COVER" ;;
esac
CODE=$(curl -s -o /dev/null --max-time 20 -w '%{http_code} %{content_type}' "$COVER" 2>/dev/null)
case "$CODE" in
  "200 image/"*) ok "coverImage resolves ($CODE)" ;;
  *) bad "coverImage did not return an image: $CODE" ;;
esac

say "== internal links point at TRACKED files =="
for l in $(grep -oE '\(/blog/[a-z0-9-]+' "$F" | sed 's|(/blog/||' | sort -u); do
  if git ls-files --error-unmatch "src/content/blog/$l.mdx" >/dev/null 2>&1; then
    ok "/blog/$l tracked"
  else
    bad "/blog/$l is NOT tracked in git — would 404 live"
  fi
done
# A /learn/<slug> URL is served either by a course lesson MDX (via the
# [slug].astro SSR route) or by a dedicated landing page. Accept both.
for l in $(grep -oE '\(/learn/[a-z0-9-]+' "$F" | sed 's|(/learn/||' | sort -u); do
  if git ls-files --error-unmatch "src/content/course/$l.mdx" >/dev/null 2>&1; then
    ok "/learn/$l tracked (course lesson — SSR route, won't appear in dist/, expected)"
  elif git ls-files --error-unmatch "src/pages/learn/$l.astro" >/dev/null 2>&1; then
    ok "/learn/$l tracked (landing page)"
  else
    bad "/learn/$l is NOT tracked in git — neither a course lesson nor a page"
  fi
done

[ "$FAIL" -eq 0 ] || { say ""; say "PREFLIGHT FAILED — fix the above before building."; exit 1; }

say "== astro build =="
if ! npx astro build >/tmp/blog-build.log 2>&1; then
  bad "astro build failed — last 20 lines:"
  tail -20 /tmp/blog-build.log
  exit 1
fi
ok "build completed"

[ -f "dist/blog/$SLUG/index.html" ] && ok "dist/blog/$SLUG/index.html built" || { bad "page did not build"; exit 1; }
grep -q "$SLUG" dist/blog/index.html && ok "appears in blog index" || bad "missing from blog index"

say ""
say "PREFLIGHT PASSED for $SLUG"
