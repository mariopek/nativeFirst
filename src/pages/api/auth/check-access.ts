import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { email, courseSlug = 'ship-native' } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ hasAccess: false, error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const runtime = (locals as any).runtime;
    const supabaseUrl =
      runtime?.env?.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
    const serviceRoleKey =
      runtime?.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ hasAccess: false, error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabaseAdmin
      .from('course_purchases')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .eq('course_slug', courseSlug)
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({ hasAccess: false }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ hasAccess: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Access check error:', error);
    return new Response(
      JSON.stringify({ hasAccess: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
