-- Blog Comments table
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- 1. Create the table
CREATE TABLE IF NOT EXISTS blog_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL,
  author_name text NOT NULL,
  comment text NOT NULL,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 2. Create index for fast lookups by slug
CREATE INDEX idx_blog_comments_slug ON blog_comments (slug, approved, created_at);

-- 3. Enable Row Level Security
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- 4. Anyone can read APPROVED comments only
CREATE POLICY "Anyone can read approved comments"
  ON blog_comments
  FOR SELECT
  USING (approved = true);

-- 5. Anyone can insert a comment (it starts as unapproved)
CREATE POLICY "Anyone can insert comments"
  ON blog_comments
  FOR INSERT
  WITH CHECK (
    approved = false
    AND char_length(author_name) BETWEEN 2 AND 50
    AND char_length(comment) BETWEEN 3 AND 1000
  );

-- 6. Seed the existing "featured" comments as already approved
INSERT INTO blog_comments (slug, author_name, comment, approved, created_at) VALUES
  ('hello-world', 'David Kim', 'Great intro! Love the focus on native development. Looking forward to seeing what you build.', true, '2025-02-08T10:30:00Z'),
  ('hello-world', 'Sophie Laurent', 'Finally a company that puts native first. The web wrapper trend needs to stop.', true, '2025-02-10T14:15:00Z'),
  ('vibe-coding-ios-comprehensive-analysis', 'Alex Rivera', 'This is exactly how I feel about SwiftUI + AI. The combo is incredible for productivity.', true, '2025-02-18T09:00:00Z'),
  ('vibe-coding-ios-comprehensive-analysis', 'Marcus Webb', 'Tried vibe coding last week after reading this. Game changer for prototyping.', true, '2025-02-20T16:45:00Z'),
  ('vibe-coding-ios-comprehensive-analysis', 'Tara Singh', 'Would love to see a follow-up on specific AI tools you recommend for SwiftUI development.', true, '2025-02-22T11:20:00Z'),
  ('building-native-apps', 'Nathan Brooks', 'The performance argument alone is worth the read. Native apps just feel different.', true, '2025-02-26T08:30:00Z'),
  ('building-native-apps', 'Olivia Park', 'Shared this with my team. We are finally reconsidering our cross-platform approach.', true, '2025-02-28T13:00:00Z'),
  ('abnetworking-modern-ios-networking', 'Chris Lawson', 'ABNetworking has saved me hours of boilerplate. The async/await integration is really clean.', true, '2025-03-05T10:00:00Z'),
  ('abnetworking-modern-ios-networking', 'Priya Mehta', 'Great walkthrough James. Already using this in production.', true, '2025-03-07T15:30:00Z'),
  ('absecurescreen-ios-security-sdk', 'Tyler Morrison', 'Every banking app needs this. The screenshot protection alone is worth integrating.', true, '2025-03-12T09:15:00Z'),
  ('absecurescreen-ios-security-sdk', 'Lisa Wang', 'Implemented ABSecureScreen in our fintech app last week. Works flawlessly.', true, '2025-03-14T17:00:00Z'),
  ('how-ats-systems-work-applyiq', 'Jordan Ellis', 'I had no idea ATS systems rejected 75% of applications automatically. This explains so much about my job search.', true, '2026-02-16T11:00:00Z'),
  ('how-ats-systems-work-applyiq', 'Amanda Foster', 'The 3-tier approach is brilliant. Most tools just blast keywords everywhere.', true, '2026-02-17T14:30:00Z'),
  ('how-ats-systems-work-applyiq', 'Ryan Cooper', 'Sent this to three friends who are job hunting right now. Eye-opening.', true, '2026-02-18T09:45:00Z'),
  ('why-we-built-invoize', 'Emma Richardson', 'As a freelancer, this is exactly what I needed. Simple, no subscription, native Mac app.', true, '2026-02-15T12:00:00Z'),
  ('why-we-built-invoize', 'Michael Torres', 'Payment reminders will be a game changer. Any ETA on that feature?', true, '2026-02-17T16:20:00Z'),
  ('gambling-addiction-tech-responsibility', 'Daniel Hayes', 'This is incredibly important. The stats about suicide rates are heartbreaking. Thank you for bringing attention to this.', true, '2026-02-20T08:00:00Z'),
  ('gambling-addiction-tech-responsibility', 'Sarah Mitchell', 'As someone in recovery, I can confirm the existing apps are terrible. Would love to see what NativeFirst builds.', true, '2026-02-20T19:30:00Z'),
  ('gambling-addiction-tech-responsibility', 'Kevin Patel', 'The fact that this would be free shows real integrity. Most companies would monetize addiction recovery immediately.', true, '2026-02-21T10:15:00Z'),
  ('gambling-addiction-tech-responsibility', 'Laura Bennett', 'Shared this with my counseling practice. The research here is solid and the message is powerful.', true, '2026-02-21T14:45:00Z');
