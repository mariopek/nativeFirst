import type { APIRoute } from 'astro';
import { validateAasa } from '../../lib/aasa-validator';

export const prerender = false;

/**
 * POST /api/aasa-validate
 *
 * Body: { domain: string }
 * Response: ValidationResult JSON
 *
 * Acts as a server-side proxy for fetching AASA files. This is necessary
 * because AASA files are not required to send CORS headers — most don't —
 * so a browser-side fetch would be blocked. The fetch happens here,
 * server-side on Cloudflare Pages Functions, then we return JSON the
 * client can consume.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const domain = typeof body?.domain === 'string' ? body.domain : '';

    if (!domain) {
      return jsonResponse(
        { error: 'Domain is required.' },
        400
      );
    }

    if (domain.length > 253) {
      // Max DNS name length per RFC 1035
      return jsonResponse(
        { error: 'Domain is too long.' },
        400
      );
    }

    const result = await validateAasa(domain);
    return jsonResponse(result, 200);
  } catch (e) {
    return jsonResponse(
      {
        error: 'Internal error while validating.',
        details: e instanceof Error ? e.message : 'Unknown',
      },
      500
    );
  }
};

function jsonResponse(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
