/**
 * AASA / Universal Links Validator
 *
 * Validates an apple-app-site-association file against Apple's published
 * requirements (https://developer.apple.com/documentation/xcode/supporting-associated-domains).
 *
 * Pure logic — fetches the file, runs all checks, returns a structured
 * result. Used by the /api/aasa-validate endpoint.
 */

export type CheckStatus = 'pass' | 'fail' | 'warn' | 'info';
export type CheckCategory =
  | 'network'
  | 'json'
  | 'applinks'
  | 'webcredentials'
  | 'appclips';

export interface CheckResult {
  category: CheckCategory;
  name: string;
  status: CheckStatus;
  details?: string;
  fix?: string;
}

export interface ValidationSummary {
  detailsCount: number;
  totalAppIDs: number;
  totalPaths: number;
  totalComponents: number;
  hasApplinks: boolean;
  hasWebcredentials: boolean;
  hasAppclips: boolean;
}

export interface ValidationResult {
  /** The domain the user typed (normalized). */
  domain: string;
  /** Full URL we attempted to fetch. */
  url: string;
  /** Whether the fetch succeeded at the network layer. */
  fetchSucceeded: boolean;
  /** Whether overall validation passed (no `fail` checks). */
  passed: boolean;
  /** Pretty-printed JSON, only present if file was successfully parsed. */
  prettyJson?: string;
  /** Raw file contents as fetched (truncated to 16KB for safety). */
  rawContent?: string;
  /** All checks run, in display order. */
  checks: CheckResult[];
  /** Quick stats for the summary bar. */
  summary: ValidationSummary;
}

const APPLE_AASA_PATH = '/.well-known/apple-app-site-association';
const FETCH_TIMEOUT_MS = 6000;
const MAX_FILE_BYTES = 256 * 1024; // 2x Apple's 128KB limit, for safety
const APPLE_LIMIT_BYTES = 128 * 1024;

/**
 * Normalize what the user typed into a clean domain string.
 *   "https://linear.app/foo"  →  "linear.app"
 *   "Linear.app/"             →  "linear.app"
 *   "linear.app"              →  "linear.app"
 */
export function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, ''); // strip port if any
}

/**
 * Apple's appID format: 10-char Team ID + dot + bundle ID.
 *   "ABCD123456.com.example.myapp"  →  valid
 *   "com.example.myapp"             →  invalid (no Team ID)
 */
export function isValidAppID(id: string): boolean {
  if (typeof id !== 'string') return false;
  return /^[A-Z0-9]{10}\.[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(id);
}

/**
 * Main validation entry point.
 */
export async function validateAasa(
  rawDomain: string
): Promise<ValidationResult> {
  const domain = normalizeDomain(rawDomain);
  const url = `https://${domain}${APPLE_AASA_PATH}`;

  const baseSummary: ValidationSummary = {
    detailsCount: 0,
    totalAppIDs: 0,
    totalPaths: 0,
    totalComponents: 0,
    hasApplinks: false,
    hasWebcredentials: false,
    hasAppclips: false,
  };

  // Validate the input itself
  if (!domain || !/^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
    return {
      domain,
      url,
      fetchSucceeded: false,
      passed: false,
      checks: [
        {
          category: 'network',
          name: 'Domain format',
          status: 'fail',
          details: `"${rawDomain}" doesn't look like a valid domain.`,
          fix: 'Enter a domain like "example.com" or "subdomain.example.com" — no protocol, no path.',
        },
      ],
      summary: baseSummary,
    };
  }

  // Fetch — follow up to 3 redirects, but track them so we can warn the user.
  // Apple's docs say "no redirects" but swcd does follow 1-2 in practice (apex
  // → www is the most common case). We follow + warn rather than fail outright.
  const checks: CheckResult[] = [];
  let response: Response;
  let finalUrl = url;
  const redirectChain: { from: string; to: string; status: number }[] = [];

  try {
    let currentUrl = url;
    let hops = 0;
    const MAX_HOPS = 3;

    while (true) {
      const r = await fetch(currentUrl, {
        redirect: 'manual',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: {
          'User-Agent':
            'NativeFirst-AASA-Validator/1.0 (+https://nativefirstapp.com/tools/aasa-validator)',
          Accept: 'application/json, application/octet-stream, */*',
        },
      });

      if (r.status >= 300 && r.status < 400) {
        const location = r.headers.get('location');
        if (!location) {
          response = r;
          break;
        }
        const nextUrl = new URL(location, currentUrl).toString();
        redirectChain.push({ from: currentUrl, to: nextUrl, status: r.status });
        hops += 1;
        if (hops > MAX_HOPS) {
          response = r;
          finalUrl = currentUrl;
          break;
        }
        currentUrl = nextUrl;
        continue;
      }

      response = r;
      finalUrl = currentUrl;
      break;
    }
  } catch (e) {
    const message =
      e instanceof Error
        ? e.name === 'TimeoutError' || e.name === 'AbortError'
          ? `Request timed out after ${FETCH_TIMEOUT_MS / 1000}s.`
          : e.message
        : 'Network error.';
    checks.push({
      category: 'network',
      name: 'Fetch AASA file',
      status: 'fail',
      details: message,
      fix: `Check that ${url} is reachable. Common causes: file doesn't exist, DNS failure, server slow/down, firewall blocking the request.`,
    });
    return {
      domain,
      url,
      fetchSucceeded: false,
      passed: false,
      checks,
      summary: baseSummary,
    };
  }

  // ── HTTPS ────────────────────────────────────────────────────────
  // Surface any insecure step in the redirect chain too.
  const httpsViolations = redirectChain.filter((r) => r.to.startsWith('http://'));
  if (httpsViolations.length === 0) {
    checks.push({
      category: 'network',
      name: 'Served over HTTPS',
      status: 'pass',
      details: 'Apple requires HTTPS. HTTP is rejected outright.',
    });
  } else {
    checks.push({
      category: 'network',
      name: 'Served over HTTPS',
      status: 'fail',
      details: `Redirect chain includes an HTTP step: ${httpsViolations[0].to}`,
      fix: 'Every link in the chain (and the final destination) must use HTTPS.',
    });
  }

  // ── Redirect chain (warn if any) ─────────────────────────────────
  if (redirectChain.length > 0) {
    const chainText = redirectChain
      .map((r, i) => `${i + 1}. ${r.from} → ${r.to} (${r.status})`)
      .join('\n');
    checks.push({
      category: 'network',
      name: redirectChain.length === 1 ? 'Single redirect followed' : `${redirectChain.length} redirects followed`,
      status: 'warn',
      details: chainText,
      fix:
        "Apple's docs say AASA files should not redirect. In practice swcd follows 1–2 hops (apex → www is the most common), but the safest setup is hosting the file directly at the original URL with status 200. Move the file (or copy it) to skip the redirect.",
    });
  }

  // ── HTTP status ──────────────────────────────────────────────────
  if (response.status === 200) {
    checks.push({
      category: 'network',
      name: 'HTTP 200 OK',
      status: 'pass',
      details:
        redirectChain.length === 0
          ? 'Status 200 — file served directly.'
          : `Status 200 — file served at the final redirect target.`,
    });
  } else if (response.status >= 300 && response.status < 400) {
    checks.push({
      category: 'network',
      name: 'HTTP 200 OK',
      status: 'fail',
      details: `Hit redirect limit (${redirectChain.length} hops) — last status was ${response.status}.`,
      fix: 'Too many redirects. Apple gives up after a couple of hops. Reduce the redirect chain.',
    });
    return {
      domain,
      url: finalUrl,
      fetchSucceeded: true,
      passed: false,
      checks,
      summary: baseSummary,
    };
  } else if (response.status === 404) {
    checks.push({
      category: 'network',
      name: 'HTTP 200 OK',
      status: 'fail',
      details: '404 Not Found.',
      fix: `Place the file at exactly ${APPLE_AASA_PATH} on your domain. The full URL must be ${url}.`,
    });
    return {
      domain,
      url,
      fetchSucceeded: true,
      passed: false,
      checks,
      summary: baseSummary,
    };
  } else {
    checks.push({
      category: 'network',
      name: 'HTTP 200 OK',
      status: 'fail',
      details: `Got ${response.status} ${response.statusText}.`,
      fix: 'The file must return HTTP 200. Common: 403 (wrong file permissions), 5xx (server error), 401 (file behind auth).',
    });
    return {
      domain,
      url,
      fetchSucceeded: true,
      passed: false,
      checks,
      summary: baseSummary,
    };
  }

  // ── Content-Type ─────────────────────────────────────────────────
  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  if (
    contentType.includes('application/json') ||
    contentType.includes('application/pkcs7-mime')
  ) {
    checks.push({
      category: 'network',
      name: 'Content-Type header',
      status: 'pass',
      details: contentType,
    });
  } else if (contentType.includes('application/octet-stream')) {
    checks.push({
      category: 'network',
      name: 'Content-Type header',
      status: 'warn',
      details: `${contentType} — works, but Apple recommends application/json.`,
      fix: 'Configure your server to set Content-Type: application/json for the AASA file.',
    });
  } else if (contentType.includes('text/html')) {
    checks.push({
      category: 'network',
      name: 'Content-Type header',
      status: 'fail',
      details: `Got "${contentType}" — your server is returning an HTML page. Likely a 404 or homepage rendered with status 200.`,
      fix: 'Place the AASA file at /.well-known/apple-app-site-association and serve it with Content-Type: application/json. On Cloudflare Pages, add a _headers rule.',
    });
  } else {
    checks.push({
      category: 'network',
      name: 'Content-Type header',
      status: 'warn',
      details: `Got "${contentType || '(missing)'}". Apple recommends application/json.`,
      fix: 'Set Content-Type: application/json for the AASA file.',
    });
  }

  // ── Read body (with size cap) ────────────────────────────────────
  let body: string;
  try {
    body = await response.text();
  } catch (e) {
    checks.push({
      category: 'network',
      name: 'Read response body',
      status: 'fail',
      details: e instanceof Error ? e.message : 'Failed to read response.',
    });
    return {
      domain,
      url,
      fetchSucceeded: true,
      passed: false,
      checks,
      summary: baseSummary,
    };
  }

  const sizeBytes = new TextEncoder().encode(body).length;
  if (sizeBytes > MAX_FILE_BYTES) {
    body = body.slice(0, MAX_FILE_BYTES);
  }

  if (sizeBytes > APPLE_LIMIT_BYTES) {
    checks.push({
      category: 'network',
      name: `File size under ${APPLE_LIMIT_BYTES / 1024}KB`,
      status: 'fail',
      details: `${(sizeBytes / 1024).toFixed(1)} KB — exceeds Apple's ${APPLE_LIMIT_BYTES / 1024}KB limit.`,
      fix: 'Reduce file size by removing unused entries or simplifying path patterns. Apple stops processing files over 128KB.',
    });
  } else {
    checks.push({
      category: 'network',
      name: `File size under ${APPLE_LIMIT_BYTES / 1024}KB`,
      status: 'pass',
      details: `${(sizeBytes / 1024).toFixed(1)} KB`,
    });
  }

  // ── Parse JSON ───────────────────────────────────────────────────
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
    checks.push({
      category: 'json',
      name: 'Valid JSON syntax',
      status: 'pass',
    });
  } catch (e) {
    checks.push({
      category: 'json',
      name: 'Valid JSON syntax',
      status: 'fail',
      details: e instanceof Error ? e.message : 'Parse error.',
      fix: 'AASA must be strict JSON. Common mistakes: trailing commas, single quotes instead of double, unquoted keys, JS-style comments. Run your file through jsonlint.com.',
    });
    return {
      domain,
      url,
      fetchSucceeded: true,
      passed: false,
      rawContent: body,
      checks,
      summary: baseSummary,
    };
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    checks.push({
      category: 'json',
      name: 'Root is JSON object',
      status: 'fail',
      details: 'Root value must be a JSON object {}.',
      fix: 'Wrap your content in an object: { "applinks": { ... } }.',
    });
    return {
      domain,
      url,
      fetchSucceeded: true,
      passed: false,
      rawContent: body,
      checks,
      summary: baseSummary,
    };
  }

  const root = parsed as Record<string, unknown>;
  const summary: ValidationSummary = { ...baseSummary };

  // ── applinks ─────────────────────────────────────────────────────
  if (root.applinks && typeof root.applinks === 'object') {
    summary.hasApplinks = true;
    const applinks = root.applinks as Record<string, unknown>;
    checks.push({
      category: 'applinks',
      name: 'applinks key present',
      status: 'pass',
      details: 'Universal Links configured.',
    });

    // Legacy `apps` field — should be empty array
    if ('apps' in applinks) {
      const isEmptyArray =
        Array.isArray(applinks.apps) && (applinks.apps as unknown[]).length === 0;
      checks.push({
        category: 'applinks',
        name: 'applinks.apps is empty array',
        status: isEmptyArray ? 'pass' : 'warn',
        details: isEmptyArray
          ? 'Required by Apple — apps go in details[].appIDs.'
          : `Got ${JSON.stringify(applinks.apps)}.`,
        fix: isEmptyArray
          ? undefined
          : 'Set "apps": [] (empty array). All app IDs belong in applinks.details[].appIDs.',
      });
    }

    // details
    if (Array.isArray(applinks.details)) {
      const details = applinks.details as Array<Record<string, unknown>>;
      summary.detailsCount = details.length;
      if (details.length === 0) {
        checks.push({
          category: 'applinks',
          name: 'applinks.details has entries',
          status: 'fail',
          details: 'Empty details array — no apps configured for Universal Links.',
          fix: 'Add at least one entry to applinks.details with appIDs and components/paths.',
        });
      } else {
        checks.push({
          category: 'applinks',
          name: 'applinks.details has entries',
          status: 'pass',
          details: `${details.length} app config(s).`,
        });
      }

      details.forEach((detail, i) => {
        const label = `Detail #${i + 1}`;
        validateDetail(detail, label, checks, summary);
      });
    } else {
      checks.push({
        category: 'applinks',
        name: 'applinks.details is array',
        status: 'fail',
        details: '"details" key missing or not an array.',
        fix: 'Add "details": [ { "appIDs": ["TEAMID.bundle.id"], "components": [{"/": "*"}] } ] to applinks.',
      });
    }
  } else {
    checks.push({
      category: 'applinks',
      name: 'applinks key present',
      status: 'info',
      details: 'No applinks defined — Universal Links won\'t work for this domain.',
      fix: 'Add an "applinks" object if you want Universal Links. (You may not need it if you only use webcredentials or appclips.)',
    });
  }

  // ── webcredentials (optional) ────────────────────────────────────
  if (root.webcredentials && typeof root.webcredentials === 'object') {
    const wc = root.webcredentials as Record<string, unknown>;
    summary.hasWebcredentials = true;
    if (Array.isArray(wc.apps)) {
      const valid = (wc.apps as unknown[]).filter(
        (a): a is string => typeof a === 'string' && isValidAppID(a)
      );
      const invalid = (wc.apps as unknown[]).filter(
        (a) => typeof a !== 'string' || !isValidAppID(a as string)
      );
      checks.push({
        category: 'webcredentials',
        name: 'webcredentials.apps format',
        status: invalid.length === 0 ? 'pass' : 'fail',
        details: `${valid.length} valid, ${invalid.length} invalid.`,
        fix:
          invalid.length === 0
            ? undefined
            : 'Each entry must be a valid TEAMID.bundle.id string.',
      });
    } else {
      checks.push({
        category: 'webcredentials',
        name: 'webcredentials.apps is array',
        status: 'fail',
        details: 'Missing or not an array.',
        fix: 'Set "webcredentials": { "apps": ["TEAMID.bundle.id"] }.',
      });
    }
  }

  // ── appclips (optional) ──────────────────────────────────────────
  if (root.appclips && typeof root.appclips === 'object') {
    const ac = root.appclips as Record<string, unknown>;
    summary.hasAppclips = true;
    if (Array.isArray(ac.apps)) {
      const valid = (ac.apps as unknown[]).filter(
        (a): a is string => typeof a === 'string' && isValidAppID(a)
      );
      const invalid = (ac.apps as unknown[]).filter(
        (a) => typeof a !== 'string' || !isValidAppID(a as string)
      );
      checks.push({
        category: 'appclips',
        name: 'appclips.apps format',
        status: invalid.length === 0 ? 'pass' : 'fail',
        details: `${valid.length} valid, ${invalid.length} invalid.`,
        fix:
          invalid.length === 0
            ? undefined
            : 'Each entry must be a valid TEAMID.bundle.id string.',
      });
    }
  }

  // ── Final verdict ────────────────────────────────────────────────
  const hasFailures = checks.some((c) => c.status === 'fail');

  return {
    domain,
    url,
    fetchSucceeded: true,
    passed: !hasFailures,
    prettyJson: JSON.stringify(parsed, null, 2),
    rawContent: body,
    checks,
    summary,
  };
}

function validateDetail(
  detail: Record<string, unknown>,
  label: string,
  checks: CheckResult[],
  summary: ValidationSummary
): void {
  // ── appID / appIDs ────────────────────────────────────────────────
  if (Array.isArray(detail.appIDs)) {
    const appIDs = detail.appIDs as unknown[];
    const invalid = appIDs.filter(
      (id) => typeof id !== 'string' || !isValidAppID(id as string)
    );
    summary.totalAppIDs += appIDs.length;
    if (invalid.length === 0) {
      checks.push({
        category: 'applinks',
        name: `${label} — appIDs format`,
        status: 'pass',
        details: appIDs.join(', '),
      });
    } else {
      checks.push({
        category: 'applinks',
        name: `${label} — appIDs format`,
        status: 'fail',
        details: `Invalid: ${invalid.join(', ')}.`,
        fix: 'Each appID must be 10-char TEAM_ID + "." + bundle ID. Find your Team ID in Apple Developer Portal → Membership.',
      });
    }
  } else if (typeof detail.appID === 'string') {
    const appID = detail.appID as string;
    summary.totalAppIDs += 1;
    if (isValidAppID(appID)) {
      checks.push({
        category: 'applinks',
        name: `${label} — appID (legacy field)`,
        status: 'warn',
        details: `${appID} — works, but consider migrating to "appIDs" array (iOS 13+).`,
        fix: 'Modern AASA uses "appIDs" (an array). Both work, but appIDs supports listing multiple apps in one detail.',
      });
    } else {
      checks.push({
        category: 'applinks',
        name: `${label} — appID format`,
        status: 'fail',
        details: `Invalid format: ${appID}.`,
        fix: 'appID must be TEAMID.bundle.id format (10-char Team ID + dot + bundle ID).',
      });
    }
  } else {
    checks.push({
      category: 'applinks',
      name: `${label} — appID/appIDs missing`,
      status: 'fail',
      details: 'Neither "appID" nor "appIDs" present in this detail.',
      fix: 'Add "appIDs": ["TEAMID.your.bundle.id"] to the detail.',
    });
  }

  // ── paths / components ───────────────────────────────────────────
  if (Array.isArray(detail.components)) {
    const components = detail.components as unknown[];
    summary.totalComponents += components.length;
    const invalidComponents = components.filter(
      (c) => typeof c !== 'object' || c === null || Array.isArray(c)
    );
    if (invalidComponents.length === 0) {
      checks.push({
        category: 'applinks',
        name: `${label} — components (modern, iOS 13+)`,
        status: 'pass',
        details: `${components.length} pattern(s).`,
      });
    } else {
      checks.push({
        category: 'applinks',
        name: `${label} — components shape`,
        status: 'fail',
        details: `${invalidComponents.length} entries are not objects.`,
        fix: 'Each component is an object like {"/": "/path/*", "?": {...}, "#": "...", "exclude": false, "comment": "..."}.',
      });
    }
  } else if (Array.isArray(detail.paths)) {
    const paths = detail.paths as unknown[];
    summary.totalPaths += paths.length;
    const allStrings = paths.every((p) => typeof p === 'string');
    if (allStrings) {
      checks.push({
        category: 'applinks',
        name: `${label} — paths (legacy, deprecated)`,
        status: 'warn',
        details: `${paths.length} pattern(s) — consider migrating to "components" for finer control.`,
        fix: 'iOS 13+ supports "components" which gives finer control (query string matching, fragment, exclude, comments). Legacy "paths" still works.',
      });
    } else {
      checks.push({
        category: 'applinks',
        name: `${label} — paths shape`,
        status: 'fail',
        details: 'Not all entries are strings.',
        fix: 'Each entry in "paths" must be a string pattern like "/products/*" or "NOT /admin/*".',
      });
    }
  } else {
    checks.push({
      category: 'applinks',
      name: `${label} — paths/components missing`,
      status: 'fail',
      details: 'No "paths" or "components" defined.',
      fix: 'Add "components": [{"/": "*"}] to match all paths, or define specific patterns.',
    });
  }
}
