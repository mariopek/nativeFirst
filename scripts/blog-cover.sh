#!/usr/bin/env bash
# Find a verified, free Unsplash cover image. GUARANTEED to print a working
# https://images.unsplash.com/... URL on stdout, or exit 1 only if even the
# hardcoded fallbacks are unreachable (i.e. the machine has no internet).
#
# Usage:  scripts/blog-cover.sh "search terms" ["alternate terms" ...]
# Example: scripts/blog-cover.sh "old filing cabinet" "archive boxes" "server room"
#
# WHY: a run must never die because it couldn't find a picture. Image selection
# used to depend on WebSearch + WebFetch (both of which hang); this uses curl
# with hard timeouts and walks a fallback chain until something returns 200.
set -uo pipefail

T=20
PARAMS="?w=1600&q=85&auto=format&fit=crop"

# Known-good, free, generic tech/desk/abstract photos — the last-resort chain.
# Verified 200 as of 2026-08-13. Kept deliberately neutral so they fit almost
# any post rather than fighting the topic.
FALLBACKS=(
  "photo-1518770660439-4636190af475"  # circuit board macro
  "photo-1461749280684-dccba630e2f6"  # code on a monitor
  "photo-1516116216624-53e697fedbea"  # notebook + pen on desk
  "photo-1498050108023-c5249f4df085"  # laptop with code, warm light
  "photo-1555949963-aa79dcee981c"     # terminal window closeup
)

verify() {  # verify <photo-id> -> prints full URL if it's a real 200 image
  local id="$1" url="https://images.unsplash.com/$1$PARAMS"
  local out
  out=$(curl -s -o /dev/null --max-time "$T" -w "%{http_code} %{content_type}" "$url" 2>/dev/null)
  case "$out" in
    "200 image/"*) printf '%s\n' "$url"; return 0 ;;
  esac
  return 1
}

# 1) Try each search term against Unsplash's search page, scrape photo ids.
for term in "$@"; do
  slug=$(printf '%s' "$term" | tr '[:upper:] ' '[:lower:]-' | tr -cd 'a-z0-9-')
  [ -z "$slug" ] && continue
  ids=$(curl -s --max-time "$T" -H 'User-Agent: nativefirst-blog/1.0' \
        "https://unsplash.com/s/photos/$slug" 2>/dev/null \
        | grep -oE 'images\.unsplash\.com/photo-[0-9a-f-]+' \
        | sed 's|images\.unsplash\.com/||' | sort -u | head -8)
  for id in $ids; do
    # plus.unsplash.com is paid — the scrape above only matches images., but be explicit
    case "$id" in *plus*) continue ;; esac
    if verify "$id"; then
      >&2 echo "cover: matched search term '$term'"
      exit 0
    fi
  done
done

# 2) Fallback chain — never let a missing picture block a post.
>&2 echo "cover: no search result verified, using neutral fallback"
for id in "${FALLBACKS[@]}"; do
  if verify "$id"; then exit 0; fi
done

>&2 echo "cover: FATAL — even fallbacks unreachable (no internet?)"
exit 1
