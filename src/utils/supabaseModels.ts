import { supabaseAdmin } from './supabase';
import { TablesInsert, TablesUpdate } from '../types/supabase';

// User operations
export const User = {
  // Find user by ID
  findById: async (id: string) => {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Find user by email
  findByEmail: async (email: string) => {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Create a new user
  create: async (userData: TablesInsert<'users'>) => {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Update user
  update: async (id: string, userData: TablesUpdate<'users'>) => {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Delete user
  delete: async (id: string) => {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  },

  // Find all users with pagination
  findAll: async (page = 1, limit = 10) => {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .range((page - 1) * limit, page * limit - 1);
    
    if (error) throw new Error(error.message);
    return data;
  }
};

// Course operations (based on your actual structure)
export const Course = {
  // Find course by ID
  findById: async (id: string) => {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .select(`
        *,
        modules (
          id,
          title,
          description,
          order_index,
          is_published,
          lessons (
            id,
            title,
            description
          )
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Create a new course
  create: async (courseData: TablesInsert<'courses'>) => {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .insert(courseData)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Update course
  update: async (id: string, courseData: TablesUpdate<'courses'>) => {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .update(courseData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Delete course
  delete: async (id: string) => {
    const { error } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  },

  // Find all courses with filters
  findAll: async (filters: {
    category?: string;
    level?: string;
    search?: string;
  } = {}, page = 1, limit = 10) => {
    let query = supabaseAdmin
      .from('courses')
      .select(`
        *,
        modules (
          id,
          title,
          description,
          order_index,
          is_published
        )
      `)
      .range((page - 1) * limit, page * limit - 1);

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.level) {
      query = query.eq('level', filters.level);
    }

    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    const { data, error } = await query;
    
    if (error) throw new Error(error.message);
    return data;
  }
};

// Module operations (your actual modules table)
export const Module = {
  // Find module by ID
  findById: async (id: string) => {
    const { data, error } = await supabaseAdmin
      .from('modules')
      .select(`
        *,
        lessons (
          id,
          title,
          description,
          order_index
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Create a new module
  create: async (moduleData: TablesInsert<'modules'>) => {
    const { data, error } = await supabaseAdmin
      .from('modules')
      .insert(moduleData)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Update module
  update: async (id: string, moduleData: TablesUpdate<'modules'>) => {
    const { data, error } = await supabaseAdmin
      .from('modules')
      .update(moduleData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Get modules by course
  findByCourse: async (courseId: string) => {
    const { data, error } = await supabaseAdmin
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });
    
    if (error) throw new Error(error.message);
    return data;
  }
};

// Lesson operations
export const Lesson = {
  // Find lesson by ID
  findById: async (id: string) => {
    const { data, error } = await supabaseAdmin
      .from('lessons')
      .select(`
        *,
        quiz_questions (*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Create a new lesson
  create: async (lessonData: TablesInsert<'lessons'>) => {
    const { data, error } = await supabaseAdmin
      .from('lessons')
      .insert(lessonData)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Update lesson
  update: async (id: string, lessonData: TablesUpdate<'lessons'>) => {
    const { data, error } = await supabaseAdmin
      .from('lessons')
      .update(lessonData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Delete lesson
  delete: async (id: string) => {
    const { error } = await supabaseAdmin
      .from('lessons')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  },

  // Get lessons by module
  findByModule: async (moduleId: string) => {
    const { data, error } = await supabaseAdmin
      .from('lessons')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_index', { ascending: true });
    
    if (error) throw new Error(error.message);
    return data;
  }
};

// Lesson Progress operations
export const LessonProgress = {
  // Find progress by user and lesson
  findByUserAndLesson: async (userId: string, lessonId: string) => {
    const { data, error } = await supabaseAdmin
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Create or update progress
  upsert: async (progressData: TablesInsert<'lesson_progress'>) => {
    const { data, error } = await supabaseAdmin
      .from('lesson_progress')
      .upsert(progressData, { onConflict: 'user_id, lesson_id' })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Update progress
  update: async (id: string, progressData: TablesUpdate<'lesson_progress'>) => {
    const { data, error } = await supabaseAdmin
      .from('lesson_progress')
      .update(progressData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Get user progress for all lessons
  findByUser: async (userId: string) => {
    const { data, error } = await supabaseAdmin
      .from('lesson_progress')
      .select(`
        *,
        lesson:lessons (id, title)
      `)
      .eq('user_id', userId);
    
    if (error) throw new Error(error.message);
    return data;
  }
};

// Badge operations
export const Badge = {
  // Find badge by ID
  findById: async (id: string) => {
    const { data, error } = await supabaseAdmin
      .from('badges')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Create a new badge
  create: async (badgeData: TablesInsert<'badges'>) => {
    const { data, error } = await supabaseAdmin
      .from('badges')
      .insert(badgeData)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Find all badges
  findAll: async () => {
    const { data, error } = await supabaseAdmin
      .from('badges')
      .select('*');
    
    if (error) throw new Error(error.message);
    return data;
  }
};

// UserBadge operations
export const UserBadge = {
  // Award a badge to a user
  award: async (userBadgeData: TablesInsert<'user_badges'>) => {
    const { data, error } = await supabaseAdmin
      .from('user_badges')
      .insert(userBadgeData)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Get user's badges
  findByUser: async (userId: string) => {
    const { data, error } = await supabaseAdmin
      .from('user_badges')
      .select(`
        *,
        badge:badges (id, name, description, icon)
      `)
      .eq('user_id', userId);
    
    if (error) throw new Error(error.message);
    return data;
  }
};

// Certificate operations
export const Certificate = {
  // Find certificate by ID
  findById: async (id: string) => {
    const { data, error } = await supabaseAdmin
      .from('certificates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Create a new certificate
  create: async (certificateData: TablesInsert<'certificates'>) => {
    const { data, error } = await supabaseAdmin
      .from('certificates')
      .insert(certificateData)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Get user's certificates
  findByUser: async (userId: string) => {
    const { data, error } = await supabaseAdmin
      .from('certificates')
      .select(`
        *,
        course:courses (id, title)
      `)
      .eq('user_id', userId);
    
    if (error) throw new Error(error.message);
    return data;
  }
};

// Enrollment operations
export const Enrollment = {
  // Find enrollment by user and course
  findByUserAndCourse: async (userId: string, courseId: string) => {
    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Create a new enrollment
  create: async (enrollmentData: TablesInsert<'enrollments'>) => {
    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .insert(enrollmentData)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Get user's enrollments
  findByUser: async (userId: string) => {
    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .select(`
        *,
        course:courses (id, title, thumbnail)
      `)
      .eq('user_id', userId);
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Get course's enrollments
  findByCourse: async (courseId: string) => {
    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .select(`
        *,
        user:users (id, name, email, avatar)
      `)
      .eq('course_id', courseId);
    
    if (error) throw new Error(error.message);
    return data;
  }
};

// Quiz operations
export const Quiz = {
  // Get quiz questions by lesson
  findQuestionsByLesson: async (lessonId: string) => {
    const { data, error } = await supabaseAdmin
      .from('quiz_questions')
      .select('*')
      .eq('lesson_id', lessonId);
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Record quiz attempt
  recordAttempt: async (attemptData: TablesInsert<'quiz_attempts'>) => {
    const { data, error } = await supabaseAdmin
      .from('quiz_attempts')
      .insert(attemptData)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Get user's quiz attempts
  findAttemptsByUser: async (userId: string) => {
    const { data, error } = await supabaseAdmin
      .from('quiz_attempts')
      .select(`
        *,
        lesson:lessons (id, title)
      `)
      .eq('user_id', userId);
    
    if (error) throw new Error(error.message);
    return data;
  }
};

// User Course Progress operations
export const UserCourseProgress = {
  findByUserAndCourse: async (userId: string, courseId: string) => {
    const { data, error } = await supabaseAdmin
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },

  upsert: async (progressData: any) => {
    const { data, error } = await supabaseAdmin
      .from('user_course_progress')
      .upsert(progressData, { onConflict: 'user_id, course_id' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  update: async (id: string, progressData: any) => {
    const { data, error } = await supabaseAdmin
      .from('user_course_progress')
      .update(progressData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  findByUser: async (userId: string) => {
    const { data, error } = await supabaseAdmin
      .from('user_course_progress')
      .select(`
        *,
        course:courses (id, title, thumbnail)
      `)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    return data;
  }
};