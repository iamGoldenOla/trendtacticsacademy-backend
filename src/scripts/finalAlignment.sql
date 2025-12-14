-- Final alignment script based on your actual table structure
-- Run these queries in your Supabase SQL editor

-- First, let's check the structure of your enrollments table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'enrollments' 
ORDER BY ordinal_position;

-- Create a users table for additional user data (if it doesn't exist)
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

-- Create courses table if it doesn't exist (referenced by modules.course_id)
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  price NUMERIC,
  duration TEXT,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  category TEXT,
  rating NUMERIC DEFAULT 0,
  topics TEXT[]
);

-- Create progress table to track user progress (if it doesn't exist)
-- This will track progress at the lesson level
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  score NUMERIC,  -- For quiz scores
  last_accessed TIMESTAMPTZ DEFAULT NOW()
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

-- Add foreign key constraints if they don't exist
-- Add course_id foreign key to modules table if courses table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
    -- Check if constraint already exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'modules' 
      AND constraint_name = 'fk_modules_course_id'
    ) THEN
      ALTER TABLE modules ADD CONSTRAINT fk_modules_course_id 
      FOREIGN KEY (course_id) REFERENCES courses(id);
    END IF;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    -- Constraint already exists, do nothing
    NULL;
END $$;

-- Add module_id foreign key to lessons table
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'modules') THEN
    -- Check if constraint already exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'lessons' 
      AND constraint_name = 'fk_lessons_module_id'
    ) THEN
      ALTER TABLE lessons ADD CONSTRAINT fk_lessons_module_id 
      FOREIGN KEY (module_id) REFERENCES modules(id);
    END IF;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    -- Constraint already exists, do nothing
    NULL;
END $$;

-- Add lesson_id foreign key to quiz_questions table
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
    -- Check if constraint already exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'quiz_questions' 
      AND constraint_name = 'fk_quiz_questions_lesson_id'
    ) THEN
      ALTER TABLE quiz_questions ADD CONSTRAINT fk_quiz_questions_lesson_id 
      FOREIGN KEY (lesson_id) REFERENCES lessons(id);
    END IF;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    -- Constraint already exists, do nothing
    NULL;
END $$;

-- Add lesson_id foreign key to quiz_attempts table
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
    -- Check if constraint already exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'quiz_attempts' 
      AND constraint_name = 'fk_quiz_attempts_lesson_id'
    ) THEN
      ALTER TABLE quiz_attempts ADD CONSTRAINT fk_quiz_attempts_lesson_id 
      FOREIGN KEY (lesson_id) REFERENCES lessons(id);
    END IF;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    -- Constraint already exists, do nothing
    NULL;
END $$;

-- Add foreign keys for certificates table
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
    -- Check if constraint already exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'certificates' 
      AND constraint_name = 'fk_certificates_course_id'
    ) THEN
      ALTER TABLE certificates ADD CONSTRAINT fk_certificates_course_id 
      FOREIGN KEY (course_id) REFERENCES courses(id);
    END IF;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    -- Constraint already exists, do nothing
    NULL;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'enrollments') THEN
    -- Check if constraint already exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'certificates' 
      AND constraint_name = 'fk_certificates_enrollment_id'
    ) THEN
      ALTER TABLE certificates ADD CONSTRAINT fk_certificates_enrollment_id 
      FOREIGN KEY (enrollment_id) REFERENCES enrollments(id);
    END IF;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    -- Constraint already exists, do nothing
    NULL;
END $$;

-- Enable RLS on new tables
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lesson_progress ENABLE ROW LEVEL SECURITY;
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

-- Courses table policies
DROP POLICY IF EXISTS "Everyone can view courses" ON public.courses;
CREATE POLICY "Everyone can view courses" ON public.courses
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Instructors can create courses" ON public.courses;
CREATE POLICY "Instructors can create courses" ON public.courses
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('instructor', 'admin')
  ));

DROP POLICY IF EXISTS "Instructors can update their own courses" ON public.courses;
CREATE POLICY "Instructors can update their own courses" ON public.courses
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.users u 
    JOIN modules m ON m.course_id = courses.id
    WHERE u.id = auth.uid() AND u.role IN ('instructor', 'admin')
  ));

-- Lesson progress table policies
DROP POLICY IF EXISTS "Users can view their own progress" ON public.lesson_progress;
CREATE POLICY "Users can view their own progress" ON public.lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own progress" ON public.lesson_progress;
CREATE POLICY "Users can update their own progress" ON public.lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own progress" ON public.lesson_progress;
CREATE POLICY "Users can insert their own progress" ON public.lesson_progress
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
CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_lesson ON quiz_questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_lesson ON quiz_attempts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_enrollment ON certificates(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON public.user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);