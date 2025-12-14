-- Supabase Table Setup Script (Updated for Existing Tables)
-- Run these SQL commands in your Supabase SQL editor

-- Create users table (if not exists)
create table if not exists users (
  id uuid references auth.users on delete cascade not null primary key,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  name text not null,
  email text not null unique,
  password text not null,
  role text check (role in ('student', 'instructor', 'admin')) default 'student',
  avatar text,
  phone text,
  dashboard_preferences jsonb,
  social_links jsonb
);

-- Create courses table (if not exists)
create table if not exists courses (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  title text not null,
  description text not null,
  instructor_id uuid references users(id) on delete cascade not null,
  thumbnail text not null,
  price numeric not null,
  duration text not null,
  level text check (level in ('beginner', 'intermediate', 'advanced')) default 'beginner',
  category text not null,
  rating numeric default 0,
  topics text[]
);

-- Create lessons table (if not exists)
create table if not exists lessons (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  title text not null,
  content text not null,
  video_url text,
  course_id uuid references courses(id) on delete cascade not null,
  "order" integer not null
);

-- Create progress table (if not exists)
create table if not exists progress (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  user_id uuid references users(id) on delete cascade not null,
  course_id uuid references courses(id) on delete cascade not null,
  completed_lessons uuid[],
  progress_percentage numeric default 0,
  last_accessed timestamp with time zone default now(),
  unique(user_id, course_id)
);

-- Create badges table (if not exists)
create table if not exists badges (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  name text not null,
  description text not null,
  icon text not null,
  criteria_type text check (criteria_type in ('course_completion', 'quiz_score', 'streak', 'custom')) not null,
  criteria_value numeric
);

-- Create user_badges table (if not exists)
create table if not exists user_badges (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  user_id uuid references users(id) on delete cascade not null,
  badge_id uuid references badges(id) on delete cascade not null,
  awarded_at timestamp with time zone default now()
);

-- Create enrollments table (if not exists)
create table if not exists enrollments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  user_id uuid references users(id) on delete cascade not null,
  course_id uuid references courses(id) on delete cascade not null,
  unique(user_id, course_id)
);

-- Enable RLS (Row Level Security) on all tables
alter table if exists users enable row level security;
alter table if exists courses enable row level security;
alter table if exists lessons enable row level security;
alter table if exists progress enable row level security;
alter table if exists badges enable row level security;
alter table if exists user_badges enable row level security;
alter table if exists enrollments enable row level security;

-- Create policies for users table
drop policy if exists "Users can view their own data" on users;
create policy "Users can view their own data" on users
  for select using (auth.uid() = id);

drop policy if exists "Users can update their own data" on users;
create policy "Users can update their own data" on users
  for update using (auth.uid() = id);

-- Create policies for courses table
drop policy if exists "Everyone can view courses" on courses;
create policy "Everyone can view courses" on courses
  for select using (true);

drop policy if exists "Instructors can create courses" on courses;
create policy "Instructors can create courses" on courses
  for insert with check (auth.uid() = instructor_id);

drop policy if exists "Instructors can update their own courses" on courses;
create policy "Instructors can update their own courses" on courses
  for update using (auth.uid() = instructor_id);

drop policy if exists "Instructors can delete their own courses" on courses;
create policy "Instructors can delete their own courses" on courses
  for delete using (auth.uid() = instructor_id);

-- Create policies for lessons table
drop policy if exists "Authenticated users can view lessons" on lessons;
create policy "Authenticated users can view lessons" on lessons
  for select using (exists (
    select 1 from courses where courses.id = lessons.course_id
  ));

drop policy if exists "Instructors can manage lessons" on lessons;
create policy "Instructors can manage lessons" on lessons
  for all using (exists (
    select 1 from courses where courses.id = lessons.course_id and courses.instructor_id = auth.uid()
  ));

-- Create policies for progress table
drop policy if exists "Users can view their own progress" on progress;
create policy "Users can view their own progress" on progress
  for select using (auth.uid() = user_id);

drop policy if exists "Users can update their own progress" on progress;
create policy "Users can update their own progress" on progress
  for update using (auth.uid() = user_id);

drop policy if exists "Users can insert their own progress" on progress;
create policy "Users can insert their own progress" on progress
  for insert with check (auth.uid() = user_id);

-- Create policies for enrollments table
drop policy if exists "Users can view their own enrollments" on enrollments;
create policy "Users can view their own enrollments" on enrollments
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own enrollments" on enrollments;
create policy "Users can insert their own enrollments" on enrollments
  for insert with check (auth.uid() = user_id);

-- Create policies for badges table
drop policy if exists "Everyone can view badges" on badges;
create policy "Everyone can view badges" on badges
  for select using (true);

-- Create policies for user_badges table
drop policy if exists "Users can view their own badges" on user_badges;
create policy "Users can view their own badges" on user_badges
  for select using (auth.uid() = user_id);

-- Create indexes for better performance (will be skipped if they exist)
create index if not exists idx_courses_instructor on courses(instructor_id);
create index if not exists idx_courses_category on courses(category);
create index if not exists idx_courses_level on courses(level);
create index if not exists idx_lessons_course on lessons(course_id);
create index if not exists idx_progress_user on progress(user_id);
create index if not exists idx_progress_course on progress(course_id);
create index if not exists idx_enrollments_user on enrollments(user_id);
create index if not exists idx_enrollments_course on enrollments(course_id);
create index if not exists idx_user_badges_user on user_badges(user_id);
create index if not exists idx_user_badges_badge on user_badges(badge_id);