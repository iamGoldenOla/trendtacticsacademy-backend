-- Final integration test to verify Supabase setup

-- 1. List all tables to confirm clean structure
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. Check key table structures
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

-- Enrollments table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'enrollments' 
ORDER BY ordinal_position;

-- Lesson progress table (our cleaned up table)
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'lesson_progress' 
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

-- 4. Check RLS status
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

-- 5. Test sample queries that the application will use
-- Get sample courses
SELECT id, title, description FROM courses LIMIT 3;

-- Get sample modules for a course (will return empty if no data)
SELECT id, title, description FROM modules LIMIT 3;

-- Get sample lessons (will return empty if no data)
SELECT id, title, description FROM lessons LIMIT 3;

-- Get sample enrollments (will return empty if no data)
SELECT id, user_id, course_id, progress FROM enrollments LIMIT 3;

-- Get sample lesson progress (will return empty if no data)
SELECT id, user_id, lesson_id, completed FROM lesson_progress LIMIT 3;