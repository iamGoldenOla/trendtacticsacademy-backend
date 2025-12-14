-- Script to map your existing tables to the expected structure
-- Run these queries after you've identified your current column structure

-- First, let's create a users table for additional user data (if it doesn't exist)
-- This complements the auth.users table that Supabase Auth provides
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT,
  email TEXT,
  role TEXT CHECK (role IN ('student', 'instructor', 'admin')) DEFAULT 'student',
  avatar TEXT,
  phone TEXT,
  dashboard_preferences JSONB,
  social_links JSONB
);

-- If your modules table is equivalent to courses, let's add any missing columns
-- First check what columns exist in modules:
-- Run this separately: SELECT column_name FROM information_schema.columns WHERE table_name = 'modules' ORDER BY ordinal_position;

-- Add missing columns to modules table if needed
-- ALTER TABLE modules ADD COLUMN IF NOT EXISTS thumbnail TEXT;
-- ALTER TABLE modules ADD COLUMN IF NOT EXISTS price NUMERIC;
-- ALTER TABLE modules ADD COLUMN IF NOT EXISTS duration TEXT;
-- ALTER TABLE modules ADD COLUMN IF NOT EXISTS level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner';
-- ALTER TABLE modules ADD COLUMN IF NOT EXISTS category TEXT;
-- ALTER TABLE modules ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0;
-- ALTER TABLE modules ADD COLUMN IF NOT EXISTS topics TEXT[];

-- If your lessons table needs to be linked to modules, add the foreign key
-- ALTER TABLE lessons ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES modules(id);

-- Create progress table to track user progress (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.progress (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  -- If you're using modules as courses:
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  -- Or if you create a separate courses table:
  -- course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  completed_lessons UUID[],  -- Adjust based on your lessons structure
  progress_percentage NUMERIC DEFAULT 0,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)  -- Or course_id if using courses
);

-- Create enrollments table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  -- If you're using modules as courses:
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  -- Or if you create a separate courses table:
  -- course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE(user_id, module_id)  -- Or course_id if using courses
);

-- Create badges table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  criteria_type TEXT CHECK (criteria_type IN ('course_completion', 'quiz_score', 'streak', 'custom')) NOT NULL,
  criteria_value NUMERIC
);

-- Create user_badges table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_badges ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
-- Users table policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Progress table policies
DROP POLICY IF EXISTS "Users can view their own progress" ON public.progress;
CREATE POLICY "Users can view their own progress" ON public.progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own progress" ON public.progress;
CREATE POLICY "Users can update their own progress" ON public.progress
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own progress" ON public.progress;
CREATE POLICY "Users can insert their own progress" ON public.progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enrollments table policies
DROP POLICY IF EXISTS "Users can view their own enrollments" ON public.enrollments;
CREATE POLICY "Users can view their own enrollments" ON public.enrollments
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own enrollments" ON public.enrollments;
CREATE POLICY "Users can insert their own enrollments" ON public.enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Badges table policies
DROP POLICY IF EXISTS "Everyone can view badges" ON public.badges;
CREATE POLICY "Everyone can view badges" ON public.badges
  FOR SELECT USING (true);

-- User badges table policies
DROP POLICY IF EXISTS "Users can view their own badges" ON public.user_badges;
CREATE POLICY "Users can view their own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_progress_user ON public.progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_module ON public.progress(module_id);  -- Or course_id
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_module ON public.enrollments(module_id);  -- Or course_id
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON public.user_badges(badge_id);