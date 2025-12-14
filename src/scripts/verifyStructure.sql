-- Verification script to check your current table structure and relationships

-- 1. Check all tables that exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Check the structure of each table
-- Users table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Courses table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;

-- Modules table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'modules' 
ORDER BY ordinal_position;

-- Lessons table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'lessons' 
ORDER BY ordinal_position;

-- Lesson progress table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'lesson_progress' 
ORDER BY ordinal_position;

-- Enrollments table (your existing table)
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'enrollments' 
ORDER BY ordinal_position;

-- Certificates table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'certificates' 
ORDER BY ordinal_position;

-- Quiz questions table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'quiz_questions' 
ORDER BY ordinal_position;

-- Quiz attempts table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'quiz_attempts' 
ORDER BY ordinal_position;

-- Badges table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'badges' 
ORDER BY ordinal_position;

-- User badges table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_badges' 
ORDER BY ordinal_position;

-- 3. Check foreign key relationships
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 4. Check if RLS is enabled on tables
SELECT 
    tablename, 
    CASE 
        WHEN relrowsecurity THEN 'ENABLED' 
        ELSE 'DISABLED' 
    END AS rls_status
FROM pg_tables t
JOIN pg_class c ON t.tablename = c.relname
WHERE schemaname = 'public'
ORDER BY tablename;