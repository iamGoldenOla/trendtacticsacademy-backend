-- Script to align your existing tables with the expected structure
-- Please run the analysis script first to understand your current structure
-- Then selectively run the appropriate sections below based on your needs

-- If you want to create missing tables that are expected by the application:

-- Create users table (if it doesn't exist in your public schema)
-- Note: Supabase Auth already provides auth.users, but you might need a public.users table for additional data
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT CHECK (role IN ('student', 'instructor', 'admin')) DEFAULT 'student',
  avatar TEXT,
  phone TEXT,
  dashboard_preferences JSONB,
  social_links JSONB
);

-- Create courses table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  thumbnail TEXT NOT NULL,
  price NUMERIC NOT NULL,
  duration TEXT NOT NULL,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  category TEXT NOT NULL,
  rating NUMERIC DEFAULT 0,
  topics TEXT[]
);

-- Create progress table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.progress (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  completed_lessons UUID[],  -- You might want to adjust this based on your lessons structure
  progress_percentage NUMERIC DEFAULT 0,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
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

-- Create enrollments table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(user_id, course_id)
);

-- If you want to rename or modify existing tables to match expected names:

-- Example: Rename modules to courses (UNCOMMENT ONLY IF YOU WANT TO DO THIS)
-- ALTER TABLE modules RENAME TO courses;

-- Example: Add missing columns to existing tables
-- ALTER TABLE lessons ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id);
-- ALTER TABLE lessons ADD COLUMN IF NOT EXISTS "order" INTEGER;

-- Enable RLS on new tables
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.enrollments ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
-- Users table policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Courses table policies
DROP POLICY IF EXISTS "Everyone can view courses" ON public.courses;
CREATE POLICY "Everyone can view courses" ON public.courses
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Instructors can create courses" ON public.courses;
CREATE POLICY "Instructors can create courses" ON public.courses
  FOR INSERT WITH CHECK (auth.uid() = instructor_id);

DROP POLICY IF EXISTS "Instructors can update their own courses" ON public.courses;
CREATE POLICY "Instructors can update their own courses" ON public.courses
  FOR UPDATE USING (auth.uid() = instructor_id);

DROP POLICY IF EXISTS "Instructors can delete their own courses" ON public.courses;
CREATE POLICY "Instructors can delete their own courses" ON public.courses
  FOR DELETE USING (auth.uid() = instructor_id);

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
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_level ON public.courses(level);
CREATE INDEX IF NOT EXISTS idx_progress_user ON public.progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_course ON public.progress(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON public.user_badges(badge_id);