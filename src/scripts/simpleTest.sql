-- Simple test to verify database connectivity and structure

-- 1. Check what tables exist
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. Check if both progress tables still exist
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('progress', 'lesson_progress');

-- 3. If both exist, let's check their structures
-- Structure of progress table
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'progress' 
ORDER BY ordinal_position;

-- Structure of lesson_progress table
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'lesson_progress' 
ORDER BY ordinal_position;

-- 4. Count records in each (should be 0 for both)
SELECT 
  (SELECT COUNT(*) FROM progress) as progress_count,
  (SELECT COUNT(*) FROM lesson_progress) as lesson_progress_count;