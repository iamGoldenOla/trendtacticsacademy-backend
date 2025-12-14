# Supabase Integration Guide

This document explains how to integrate Supabase into the Trendtactics Academy LMS backend.

## Prerequisites

1. A Supabase project (you already have this)
2. Your Supabase URL and API keys

## Setup Instructions

### 1. Environment Variables

Update your `.env` file with your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 2. Install Dependencies

The Supabase JavaScript client has already been installed:

```bash
npm install @supabase/supabase-js
```

### 3. Database Setup

Based on your existing tables (`certificates`, `lessons`, `modules`, `quiz_attempts`, `quiz_questions`, `enrollments`) and the relationships you've discovered, you have a hierarchical structure:

```
courses (referenced by modules.course_id)
└── modules (linked to lessons via module_id)
    └── lessons (linked to quiz_questions and quiz_attempts)
enrollments (tracks user enrollment in courses)
certificates (linked to courses and enrollments)
```

#### Step 1: Run the Final Alignment Script
Run the final alignment script `src/scripts/finalAlignment.sql` which will:
1. Create missing tables (`users`, `courses`, `lesson_progress`, `badges`, `user_badges`)
2. Add foreign key constraints where they don't exist
3. Set up proper Row Level Security policies
4. Create indexes for better performance

#### Step 2: Resolve Duplicate Tables (if needed)
If you have both `progress` and `lesson_progress` tables, run the cleanup script `src/scripts/resolveDuplicateTables.sql` to remove the redundant `progress` table.

#### Step 3: Verify Relationships
After running the scripts, verify that all foreign key relationships are properly established.

### 4. Authentication Setup

1. In your Supabase project, go to Authentication > Settings
2. Make sure "Enable email signup" is turned on
3. Configure any additional authentication providers you want to support

## Key Changes Made

### Authentication
- Replaced JWT-based authentication with Supabase Auth
- Updated auth middleware to verify Supabase tokens
- Modified controllers to work with Supabase Auth users

### Data Layer
- Replaced Mongoose models with Supabase table queries
- Created a new data access layer in `src/utils/supabaseModels.ts`
- Updated controllers to use Supabase instead of MongoDB

### Routes
- Updated route files to use new Supabase controllers
- Modified middleware imports to use Supabase auth middleware

## Migration Notes

### User Management
- Users are now managed through Supabase Auth
- Additional user data is stored in the `users` table
- Password hashing is handled by Supabase Auth

### Data Access
- All database operations now use Supabase instead of MongoDB
- Queries have been rewritten to work with PostgreSQL syntax
- Relationships are handled through foreign keys instead of references

## Testing the Integration

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. Test authentication:
   - Register a new user: `POST /api/auth/register`
   - Login: `POST /api/auth/login`
   - Get profile: `GET /api/auth/profile` (with Authorization header)

3. Test course operations:
   - Get courses: `GET /api/courses`
   - Create course: `POST /api/courses` (as instructor)
   - Enroll in course: `POST /api/courses/:id/enroll`

## Troubleshooting

### Common Issues

1. **Authentication errors**: Make sure your SUPABASE_URL and SUPABASE_ANON_KEY are correct
2. **Database connection errors**: Verify your Supabase project is active and accessible
3. **Permission errors**: Check that RLS policies are properly configured
4. **Foreign key constraint errors**: Run the final alignment script
5. **Missing table errors**: Run the final alignment script to create missing tables
6. **Duplicate table errors**: Run the resolve duplicate tables script

### Debugging Tips

1. Check the Supabase dashboard for error logs
2. Enable debug logging in your Supabase client
3. Verify table structures match the expected schema
4. Use the `detailedTableAnalysis.sql` script to understand your current structure
5. Use the `finalAlignment.sql` script to fix structural issues
6. Use the `resolveDuplicateTables.sql` script to clean up redundant tables

## Next Steps

1. Implement real-time features using Supabase Realtime
2. Add file storage using Supabase Storage
3. Set up Supabase Functions for serverless logic
4. Configure row-level security policies for fine-grained access control

## Support

For issues with the Supabase integration, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client Library](https://supabase.com/docs/reference/javascript/start)