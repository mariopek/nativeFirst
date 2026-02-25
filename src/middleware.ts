import { defineMiddleware } from 'astro:middleware';
import { createClient } from '@supabase/supabase-js';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);

  // www redirect
  if (url.hostname.startsWith('www.')) {
    url.hostname = url.hostname.replace('www.', '');
    return Response.redirect(url.toString(), 301);
  }

  // Premium course access control for /learn/sn-* pages
  if (url.pathname.startsWith('/learn/sn-')) {
    const runtime = (context.locals as any).runtime;
    const supabaseUrl =
      runtime?.env?.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
    const serviceRoleKey =
      runtime?.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

    // If Supabase isn't configured, allow through (dev mode)
    if (!supabaseUrl || !serviceRoleKey) {
      (context.locals as any).premiumAccess = true;
      return next();
    }

    // Check for auth cookie (Supabase stores session in cookies)
    const cookies = context.request.headers.get('cookie') || '';
    const accessToken = extractSupabaseToken(cookies);

    if (accessToken) {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

      // Verify the user's JWT and get their email
      const { data: { user } } = await supabaseAdmin.auth.getUser(accessToken);

      if (user?.email) {
        // Check if user has purchased this course
        const { data: purchase } = await supabaseAdmin
          .from('course_purchases')
          .select('id')
          .eq('email', user.email.toLowerCase())
          .eq('course_slug', 'ship-native')
          .single();

        if (purchase) {
          (context.locals as any).premiumAccess = true;
          return next();
        }
      }
    }

    // No access — set flag for the page to render locked state
    (context.locals as any).premiumAccess = false;
  }

  return next();
});

function extractSupabaseToken(cookies: string): string | null {
  // Supabase stores the access token in cookies
  // The cookie name pattern is: sb-<project-ref>-auth-token
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

  // Alternative: check for chunked token format
  const tokenMatch = cookies.match(/sb-[^=]+-auth-token\.0=([^;]+)/);
  if (tokenMatch) {
    return decodeURIComponent(tokenMatch[1]);
  }

  return null;
}
