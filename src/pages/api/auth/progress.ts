import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin(locals: any) {
  const runtime = (locals as any).runtime;
  const supabaseUrl =
    runtime?.env?.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    runtime?.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey);
}

function extractToken(cookies: string): string | null {
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
  if (tokenMatch) return decodeURIComponent(tokenMatch[1]);
  return null;
}

// GET: Fetch all completed lessons for the user
export const GET: APIRoute = async ({ request, locals }) => {
  const supabaseAdmin = getSupabaseAdmin(locals);
  if (!supabaseAdmin) {
    return new Response(JSON.stringify({ lessons: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const cookies = request.headers.get('cookie') || '';
  const token = extractToken(cookies);
  if (!token) {
    return new Response(JSON.stringify({ lessons: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) {
    return new Response(JSON.stringify({ lessons: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data } = await supabaseAdmin
    .from('lesson_progress')
    .select('lesson_slug, completed_at')
    .eq('user_id', user.id);

  return new Response(JSON.stringify({ lessons: data || [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

// POST: Mark a lesson as complete
export const POST: APIRoute = async ({ request, locals }) => {
  const supabaseAdmin = getSupabaseAdmin(locals);
  if (!supabaseAdmin) {
    return new Response(JSON.stringify({ error: 'Not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const cookies = request.headers.get('cookie') || '';
  const token = extractToken(cookies);
  if (!token) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();
  const { lessonSlug, courseSlug = 'ship-native' } = body;

  if (!lessonSlug) {
    return new Response(JSON.stringify({ error: 'lessonSlug is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { error } = await supabaseAdmin.from('lesson_progress').upsert(
    {
      user_id: user.id,
      lesson_slug: lessonSlug,
      course_slug: courseSlug,
    },
    { onConflict: 'user_id,lesson_slug' }
  );

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to save progress' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

// DELETE: Unmark a lesson
export const DELETE: APIRoute = async ({ request, locals }) => {
  const supabaseAdmin = getSupabaseAdmin(locals);
  if (!supabaseAdmin) {
    return new Response(JSON.stringify({ error: 'Not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const cookies = request.headers.get('cookie') || '';
  const token = extractToken(cookies);
  if (!token) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();
  const { lessonSlug } = body;

  if (!lessonSlug) {
    return new Response(JSON.stringify({ error: 'lessonSlug is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await supabaseAdmin
    .from('lesson_progress')
    .delete()
    .eq('user_id', user.id)
    .eq('lesson_slug', lessonSlug);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
