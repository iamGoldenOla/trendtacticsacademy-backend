-- Detailed analysis of your existing tables
-- Run each query separately to understand your current structure

-- 1. Check all columns in certificates table
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'certificates' 
ORDER BY ordinal_position;

-- 2. Check all columns in lessons table
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'lessons' 
ORDER BY ordinal_position;

-- 3. Check all columns in modules table
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'modules' 
ORDER BY ordinal_position;

-- 4. Check all columns in quiz_attempts table
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'quiz_attempts' 
ORDER BY ordinal_position;

-- 5. Check all columns in quiz_questions table
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'quiz_questions' 
ORDER BY ordinal_position;

-- 6. Check the auth.users table structure (Supabase Auth)
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'auth'
ORDER BY ordinal_position;

-- 7. Check sample data from each table to understand relationships
-- Certificates sample (limit 5 rows)
SELECT * FROM certificates LIMIT 5;

-- Lessons sample (limit 5 rows)
SELECT * FROM lessons LIMIT 5;

-- Modules sample (limit 5 rows)
SELECT * FROM modules LIMIT 5;

-- Quiz attempts sample (limit 5 rows)
SELECT * FROM quiz_attempts LIMIT 5;

-- Quiz questions sample (limit 5 rows)
SELECT * FROM quiz_questions LIMIT 5;

-- 8. Check if there are any foreign key relationships already defined
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
AND tc.table_name IN ('certificates', 'lessons', 'modules', 'quiz_attempts', 'quiz_questions')
ORDER BY tc.table_name;