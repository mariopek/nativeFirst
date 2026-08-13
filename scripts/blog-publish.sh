#!/usr/bin/env bash
# Preflight -> commit (scoped) -> push -> verify live, with the manual
# Cloudflare deploy fallback baked in.
# Usage: scripts/blog-publish.sh <slug> ["commit subject"]
#
# Idempotent: if the slug is already committed and live, it says so and exits 0.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

SLUG="${1:?usage: blog-publish.sh <slug> [subject]}"
SUBJECT="${2:-Blog: $SLUG}"
F="src/content/blog/$SLUG.mdx"
URL="https://nativefirstapp.com/blog/$SLUG/"

# --- already live? then we're done -------------------------------------------
if git ls-files --error-unmatch "$F" >/dev/null 2>&1; then
  if [ "$(curl -sL -o /dev/null --max-time 20 -w '%{http_code}' "$URL")" = "200" ]; then
    echo "ALREADY PUBLISHED AND LIVE: $URL"; exit 0
  fi
  echo "note: already committed but not live yet — will verify/deploy below"
else
  bash scripts/blog-preflight.sh "$SLUG" || { echo "ABORT: preflight failed"; exit 1; }

  echo "== commit (scoped to the post only) =="
  git add "$F" || exit 1
  git commit -q -F - <<EOF || { echo "ABORT: commit failed"; exit 1; }
$SUBJECT

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
  echo "committed: $(git rev-parse --short HEAD)"
fi

SHA=$(git rev-parse --short HEAD)

echo "== push =="
# Someone else may have pushed while we worked; rebase onto them and retry.
for attempt in 1 2 3; do
  if git push origin main 2>/dev/null; then echo "pushed (attempt $attempt)"; break; fi
  echo "push rejected — pulling --rebase and retrying"
  git pull --rebase --autostash origin main >/dev/null 2>&1
  [ "$attempt" = 3 ] && { echo "ABORT: could not push after 3 attempts"; exit 1; }
done

echo "== wait for Cloudflare (git integration) =="
DEPLOYED=0
for i in $(seq 1 8); do
  sleep 30
  CODE=$(curl -sL -o /dev/null --max-time 20 -w '%{http_code}' "$URL")
  echo "  check $i: HTTP $CODE"
  [ "$CODE" = "200" ] && { DEPLOYED=1; break; }
done

# The git webhook sometimes simply never fires (observed 2026-07-31: zero
# check-runs, no deployment row). Don't keep waiting on it — deploy directly.
if [ "$DEPLOYED" -ne 1 ]; then
  echo "== not live after ~4 min — manual deploy (bypasses CI) =="
  rm -rf dist
  npx astro build >/tmp/blog-build.log 2>&1 || { echo "ABORT: build failed"; tail -20 /tmp/blog-build.log; exit 1; }
  npx wrangler pages deploy dist --project-name nativefirst --branch main 2>&1 | tail -5
  for i in $(seq 1 6); do
    sleep 20
    CODE=$(curl -sL -o /dev/null --max-time 20 -w '%{http_code}' "$URL")
    echo "  post-deploy check $i: HTTP $CODE"
    [ "$CODE" = "200" ] && { DEPLOYED=1; break; }
  done
fi

if [ "$DEPLOYED" -eq 1 ]; then
  echo ""
  echo "PUBLISHED AND LIVE: $URL  (commit $SHA)"
  exit 0
fi
echo ""
echo "FAILED: pushed as $SHA but $URL is still not 200. Investigate Cloudflare."
exit 1
