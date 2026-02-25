import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const formData = await request.formData();

    const sellerId = formData.get('seller_id') as string;
    const email = formData.get('email') as string;
    const saleId = formData.get('sale_id') as string;
    const productId = formData.get('product_id') as string;

    // Validate webhook origin using seller_id
    const runtime = (locals as any).runtime;
    const expectedSellerId =
      runtime?.env?.GUMROAD_SELLER_ID || import.meta.env.GUMROAD_SELLER_ID;

    if (!expectedSellerId || sellerId !== expectedSellerId) {
      return new Response(JSON.stringify({ error: 'Invalid seller_id' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!email || !saleId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Use service role key for admin access (bypasses RLS)
    const supabaseUrl =
      runtime?.env?.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
    const serviceRoleKey =
      runtime?.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Supabase credentials not configured for webhook handler');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Upsert purchase record
    const { error } = await supabaseAdmin.from('course_purchases').upsert(
      {
        email: email.toLowerCase().trim(),
        course_slug: 'ship-native',
        gumroad_sale_id: saleId,
        gumroad_product_id: productId || null,
      },
      { onConflict: 'email,course_slug' }
    );

    if (error) {
      console.error('Failed to store purchase:', error);
      return new Response(JSON.stringify({ error: 'Failed to store purchase' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Gumroad webhook error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
