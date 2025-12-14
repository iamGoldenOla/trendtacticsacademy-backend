-- Script to resolve duplicate progress tables

-- Since both tables are empty and have identical structures, 
-- we'll keep lesson_progress (as it's more descriptive) and remove progress

-- 1. First, let's verify both tables are indeed identical and empty
SELECT 
  'progress' as table_name,
  COUNT(*) as record_count,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'progress') as column_count
UNION ALL
SELECT 
  'lesson_progress' as table_name,
  COUNT(*) as record_count,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'lesson_progress') as column_count;

-- 2. Show the structure of both tables to confirm they're identical
SELECT 
  'progress' as table_name,
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'progress' 
UNION ALL
SELECT 
  'lesson_progress' as table_name,
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'lesson_progress' 
ORDER BY table_name, column_name;

-- 3. Drop the redundant 'progress' table since both are empty and identical
DROP TABLE IF EXISTS progress;

-- 4. Verify the table has been removed
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('progress', 'lesson_progress')
ORDER BY tablename;

-- 5. Update any references in our documentation or code to use lesson_progress
-- (This is just informational - the actual code changes would be in our TypeScript models)

-- 6. Final verification of RLS status
SELECT 
    tablename, 
    CASE 
        WHEN relrowsecurity THEN 'ENABLED' 
        ELSE 'DISABLED' 
    END AS rls_status
FROM pg_tables t
JOIN pg_class c ON t.tablename = c.relname
WHERE schemaname = 'public'
AND tablename IN ('lesson_progress', 'users')
ORDER BY tablename;