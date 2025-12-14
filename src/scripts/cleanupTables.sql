-- Cleanup script to fix duplicate entries and redundant tables

-- 1. Check if there are duplicate 'users' entries in RLS status
-- This is just for information - the duplicate in the output is likely just a display issue

-- 2. Check if both 'progress' and 'lesson_progress' tables exist
-- We want to keep 'lesson_progress' and remove 'progress' if it's redundant

-- First, let's see what's in the progress table
SELECT COUNT(*) as progress_count FROM progress;
SELECT * FROM progress LIMIT 5;

-- And what's in the lesson_progress table
SELECT COUNT(*) as lesson_progress_count FROM lesson_progress;
SELECT * FROM lesson_progress LIMIT 5;

-- 3. If the 'progress' table is redundant, we can drop it
-- But first, let's check its structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'progress' 
ORDER BY ordinal_position;

-- 4. Compare with lesson_progress structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'lesson_progress' 
ORDER BY ordinal_position;

-- 5. If progress table is indeed redundant, we can drop it with:
-- DROP TABLE IF EXISTS progress;

-- 6. Clean up any duplicate RLS policies on users table
-- First, check existing policies
SELECT * FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users';

-- 7. Recreate clean RLS policies for users table
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;

-- Create fresh policies
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 8. Verify the final state
SELECT 
    tablename, 
    CASE 
        WHEN relrowsecurity THEN 'ENABLED' 
        ELSE 'DISABLED' 
    END AS rls_status
FROM pg_tables t
JOIN pg_class c ON t.tablename = c.relname
WHERE schemaname = 'public'
AND tablename IN ('users', 'progress', 'lesson_progress')
ORDER BY tablename;