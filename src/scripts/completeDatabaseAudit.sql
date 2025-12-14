-- Complete database audit script

-- 1. List all tables
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. Show table structures with record counts
SELECT 
  'users' as table_name,
  COUNT(*) as record_count
FROM users
UNION ALL
SELECT 
  'courses' as table_name,
  COUNT(*) as record_count
FROM courses
UNION ALL
SELECT 
  'modules' as table_name,
  COUNT(*) as record_count
FROM modules
UNION ALL
SELECT 
  'lessons' as table_name,
  COUNT(*) as record_count
FROM lessons
UNION ALL
SELECT 
  'enrollments' as table_name,
  COUNT(*) as record_count
FROM enrollments
UNION ALL
SELECT 
  'lesson_progress' as table_name,
  COUNT(*) as record_count
FROM lesson_progress
UNION ALL
SELECT 
  'progress' as table_name,
  COUNT(*) as record_count
FROM progress
UNION ALL
SELECT 
  'certificates' as table_name,
  COUNT(*) as record_count
FROM certificates
UNION ALL
SELECT 
  'quiz_questions' as table_name,
  COUNT(*) as record_count
FROM quiz_questions
UNION ALL
SELECT 
  'quiz_attempts' as table_name,
  COUNT(*) as record_count
FROM quiz_attempts
UNION ALL
SELECT 
  'badges' as table_name,
  COUNT(*) as record_count
FROM badges
UNION ALL
SELECT 
  'user_badges' as table_name,
  COUNT(*) as record_count
FROM user_badges
ORDER BY table_name;

-- 3. Check for any tables that might be duplicates or redundant
-- Look for tables with similar names or structures

-- 4. Show all foreign key relationships
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
ORDER BY tc.table_name, kcu.column_name;

-- 5. Check RLS status for all tables
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

-- 6. Show sample data from key tables
-- Users
SELECT 'users' as table_name, COUNT(*) as count FROM users;
SELECT * FROM users LIMIT 3;

-- Courses
SELECT 'courses' as table_name, COUNT(*) as count FROM courses;
SELECT * FROM courses LIMIT 3;

-- Enrollments
SELECT 'enrollments' as table_name, COUNT(*) as count FROM enrollments;
SELECT * FROM enrollments LIMIT 3;

-- Lesson progress
SELECT 'lesson_progress' as table_name, COUNT(*) as count FROM lesson_progress;
SELECT * FROM lesson_progress LIMIT 3;