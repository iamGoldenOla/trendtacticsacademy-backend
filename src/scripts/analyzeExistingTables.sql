-- Script to check all columns in your existing tables
-- Run these queries one by one in your Supabase SQL editor

-- Check all columns in certificates table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'certificates' 
ORDER BY ordinal_position;

-- Check all columns in lessons table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'lessons' 
ORDER BY ordinal_position;

-- Check all columns in modules table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'modules' 
ORDER BY ordinal_position;

-- Check all columns in quiz_attempts table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'quiz_attempts' 
ORDER BY ordinal_position;

-- Check all columns in quiz_questions table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'quiz_questions' 
ORDER BY ordinal_position;