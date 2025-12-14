# Database Cleanup Instructions

## Issue Identified

You have two identical tables in your database:
1. `progress` 
2. `lesson_progress`

Both tables have:
- Identical structures
- Same foreign key relationships
- No data (both empty)
- Enabled Row Level Security

We recommend keeping `lesson_progress` as it's more descriptive and removing the redundant `progress` table.

## How to Clean Up Duplicate Tables

### Step 1: Verify Current State

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the following query:

```sql
-- Check if both progress tables exist
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('progress', 'lesson_progress');
```

4. Run the query to see if both tables exist

### Step 2: Remove Redundant Table

If both tables exist, run this query to remove the redundant one:

```sql
-- Drop the redundant 'progress' table
DROP TABLE IF EXISTS progress;
```

### Step 3: Verify Cleanup

Run this query to confirm the cleanup:

```sql
-- Verify only lesson_progress remains
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('progress', 'lesson_progress');
```

You should only see `lesson_progress` in the results.

## Testing the Integration

After cleaning up the tables, test your integration:

1. Start your backend server:
   ```bash
   cd lms-backend
   npm run dev
   ```

2. Test API endpoints to ensure everything works correctly

## Troubleshooting

If you encounter any issues:

1. Check that all foreign key relationships are still intact
2. Verify Row Level Security policies are still enabled
3. Ensure your environment variables are correctly configured

For further assistance, refer to the SUPABASE_INTEGRATION.md file in your project.