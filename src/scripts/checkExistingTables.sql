-- Check existing tables in your Supabase database
-- Run this query in your Supabase SQL editor to see what tables already exist

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check the structure of existing tables
-- Uncomment the following lines to check specific tables:

-- DESCRIBE users;
-- DESCRIBE courses;
-- DESCRIBE lessons;
-- DESCRIBE progress;
-- DESCRIBE badges;
-- DESCRIBE user_badges;
-- DESCRIBE enrollments;

-- Alternative way to check table structure:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'courses' 
-- ORDER BY ordinal_position;