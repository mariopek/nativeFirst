-- Course Purchases table
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- 1. Create the table
CREATE TABLE IF NOT EXISTS course_purchases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  course_slug text NOT NULL DEFAULT 'ship-native',
  gumroad_sale_id text UNIQUE,
  gumroad_product_id text,
  purchased_at timestamptz DEFAULT now(),
  UNIQUE(email, course_slug)
);

-- 2. Create index for fast lookups by email
CREATE INDEX idx_course_purchases_email ON course_purchases (email, course_slug);

-- 3. Enable Row Level Security
ALTER TABLE course_purchases ENABLE ROW LEVEL SECURITY;

-- 4. Authenticated users can read their own purchases
CREATE POLICY "Users can read own purchases"
  ON course_purchases
  FOR SELECT
  USING (auth.jwt() ->> 'email' = email);

-- 5. Service role can insert purchases (via webhook)
-- Note: The service role key bypasses RLS, so no INSERT policy is needed
-- for the webhook handler. This keeps the table secure.
