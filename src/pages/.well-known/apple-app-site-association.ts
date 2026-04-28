// Apple App Site Association — served at the *exact* path
// `/.well-known/apple-app-site-association` (no .json extension).
//
// Critical correctness rules (Apple swcd is unforgiving here):
//   1. Content-Type must be `application/json` (NOT pkcs7-mime, NOT text/plain).
//   2. The response must be 200 OK directly — Apple's CDN does NOT follow
//      redirects, so any 301/302 from Cloudflare or Astro breaks discovery.
//   3. The path must NOT have a `.json` suffix.
//   4. The file is fetched by `swcd` once and cached server-side at Apple
//      for some hours; the daemon refetches periodically. Set a sensible
//      Cache-Control so we can iterate while testing without the cached
//      version pinning us to old contents indefinitely.
//
// Patterns explained:
//   `/deck/*` — deep link target. The matcher only opens the app for paths
//   that match this glob, so root, /blog/*, /apps/*, /about etc. stay
//   browser-routable. Adding more patterns here later is a one-line edit.
import type { APIRoute } from 'astro';

export const prerender = false;

const TEAM_ID = 'ZXX2L68F7J';
const BUNDLE_ID = 'com.pekmario.studySpark';

const AASA = {
  applinks: {
    details: [
      {
        appIDs: [`${TEAM_ID}.${BUNDLE_ID}`],
        components: [
          {
            '/': '/deck/*',
            comment: 'Universal Link → opens shared StudySession in ThinkBud',
          },
        ],
      },
    ],
  },
  webcredentials: {
    apps: [`${TEAM_ID}.${BUNDLE_ID}`],
  },
};

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(AASA), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // 1 hour while we're shaking out the integration. Bump to 24h once
      // stable. Never 0 — Apple deprioritizes domains that serve overly
      // short TTLs because it implies an unstable endpoint.
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
