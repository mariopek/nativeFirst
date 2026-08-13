#!/usr/bin/env bash
# Gather trending-topic candidates for the daily blog post.
#
# WHY THIS EXISTS: the WebSearch/WebFetch tools intermittently hang for ~16
# minutes per call (observed every day 2026-08-10..13, which cost four posts).
# curl with --max-time cannot hang. Every source is bounded and optional — if a
# source is down we note it and keep going. This script never blocks and always
# finishes; a partial report is still a usable report.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

T=20
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

fetch() { curl -s --max-time "$T" -H 'User-Agent: nativefirst-blog-research/1.0' "$1" -o "$2" 2>/dev/null; }

SINCE=$(python3 -c 'import time;print(int(time.time())-172800)')

# --- fetch everything (each bounded, failures are fine) ----------------------
fetch "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=50" "$TMP/hn_front.json"
for kw in swift ios apple xcode swiftui claude cursor; do
  fetch "https://hn.algolia.com/api/v1/search?query=$kw&tags=story&numericFilters=created_at_i>$SINCE,points>25&hitsPerPage=6" "$TMP/hn_$kw.json"
done
# Reddit's JSON API 403s all non-browser traffic now; the RSS feed still works.
for sub in swift iOSProgramming; do
  fetch "https://www.reddit.com/r/$sub/top.rss?t=week" "$TMP/rd_$sub.rss"
done
# Discourse category endpoint is /c/<slug>/<id>.json — 18 is "evolution".
fetch "https://forums.swift.org/c/evolution/18.json" "$TMP/swift_forums.json"

# --- render the report -------------------------------------------------------
python3 - "$TMP" <<'PY'
import json, os, sys, glob

tmp = sys.argv[1]

def load(name):
    p = os.path.join(tmp, name)
    try:
        with open(p) as f:
            return json.load(f)
    except Exception:
        return None

def hn_rows(d, prefix=''):
    out = []
    for h in (d or {}).get('hits', []):
        url = h.get('url') or ('https://news.ycombinator.com/item?id=' + str(h.get('objectID')))
        title = h.get('title') or ''
        if not title:
            continue
        out.append('%s%5dpts %4dc  %s\n        %s' % (
            prefix, h.get('points') or 0, h.get('num_comments') or 0, title, url))
    return out

print('=== HACKER NEWS FRONT PAGE ===')
rows = hn_rows(load('hn_front.json'))
print('\n'.join(rows) if rows else '  (unavailable)')

print('\n=== HN LAST 48H — OUR KEYWORDS ===')
any_kw = False
for kw in ['swift', 'ios', 'apple', 'xcode', 'swiftui', 'claude', 'cursor']:
    rows = hn_rows(load('hn_%s.json' % kw), prefix='  [%s] ' % kw)
    if rows:
        any_kw = True
        print('\n'.join(rows))
if not any_kw:
    print('  (unavailable)')

print('\n=== REDDIT r/swift + r/iOSProgramming (top, week) ===')
any_rd = False
for sub in ['swift', 'iOSProgramming']:
    p = os.path.join(tmp, 'rd_%s.rss' % sub)
    try:
        with open(p, encoding='utf-8', errors='replace') as f:
            raw = f.read()
    except Exception:
        continue
    # Atom feed: <entry><title>..</title><link href=".."/>
    import re, html as _html
    for m in re.finditer(r'<entry>(.*?)</entry>', raw, re.S):
        blob = m.group(1)
        tm = re.search(r'<title[^>]*>(.*?)</title>', blob, re.S)
        lm = re.search(r'<link[^>]*href="([^"]+)"', blob)
        if not tm:
            continue
        title = _html.unescape(re.sub(r'<[^>]+>', '', tm.group(1))).strip()
        if not title:
            continue
        any_rd = True
        print('  [r/%s] %s' % (sub, title))
        if lm:
            print('        %s' % lm.group(1))
if not any_rd:
    print('  (unavailable)')

print('\n=== SWIFT FORUMS — evolution announcements ===')
d = load('swift_forums.json')
topics = (d or {}).get('topic_list', {}).get('topics', [])[:12]
if topics:
    for t in topics:
        print('  %s  %s\n        https://forums.swift.org/t/%s/%s' % (
            (t.get('created_at') or '')[:10], t.get('title') or '',
            t.get('slug') or '', t.get('id') or ''))
else:
    print('  (unavailable)')
PY

echo ""
echo "=== ALREADY-PUBLISHED TITLES (last 60 — avoid duplicates) ==="
grep -h '^title:' src/content/blog/*.mdx 2>/dev/null | sed 's/^title: //' | tail -60

echo ""
echo "=== QUEUE (ready-to-publish fallbacks) ==="
ls -1 content-queue/*.mdx 2>/dev/null | sed 's|.*/||' || echo "  (queue empty)"

echo ""
echo "=== DONE — research finished, nothing hung ==="
