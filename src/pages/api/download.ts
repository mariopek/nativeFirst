import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const GET: APIRoute = async ({ request, locals }) => {
  const cookies = request.headers.get('cookie') || '';
  const accessToken = extractSupabaseToken(cookies);

  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const runtime = (locals as any).runtime;
  const supabaseUrl =
    runtime?.env?.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    runtime?.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (!user?.email) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data: purchase } = await supabaseAdmin
    .from('course_purchases')
    .select('id')
    .eq('email', user.email.toLowerCase())
    .eq('course_slug', 'ship-native')
    .single();

  if (!purchase) {
    return new Response(JSON.stringify({ error: 'Purchase required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const downloadUrl =
    runtime?.env?.COURSE_ZIP_URL || import.meta.env.COURSE_ZIP_URL;

  if (!downloadUrl) {
    return new Response(JSON.stringify({ error: 'Download not configured yet' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const fileResponse = await fetch(downloadUrl);
  if (!fileResponse.ok) {
    return new Response(JSON.stringify({ error: 'File not available' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(fileResponse.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="moodbit-source-code.zip"',
      'Cache-Control': 'no-store',
    },
  });
};

function extractSupabaseToken(cookies: string): string | null {
  const match = cookies.match(/sb-[^=]+-auth-token=([^;]+)/);
  if (match) {
    try {
      const decoded = decodeURIComponent(match[1]);
      const parsed = JSON.parse(decoded);
      return parsed?.access_token || null;
    } catch {
      return null;
    }
  }

  const tokenMatch = cookies.match(/sb-[^=]+-auth-token\.0=([^;]+)/);
  if (tokenMatch) {
    return decodeURIComponent(tokenMatch[1]);
  }

  return null;
}
