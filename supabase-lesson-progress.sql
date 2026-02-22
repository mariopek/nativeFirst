-- Lesson progress tracking table
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_slug TEXT NOT NULL,
  course_slug TEXT NOT NULL DEFAULT 'ship-native',
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_slug)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id, course_slug);

-- Enable RLS
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Users can read their own progress
CREATE POLICY "Users can read own progress"
  ON lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own progress"
  ON lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own progress (unmark)
CREATE POLICY "Users can delete own progress"
  ON lesson_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can do everything (for API endpoints)
CREATE POLICY "Service role full access"
  ON lesson_progress FOR ALL
  USING (auth.role() = 'service_role');
