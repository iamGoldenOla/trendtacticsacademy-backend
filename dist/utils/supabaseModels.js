"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCourseProgress = exports.Quiz = exports.Enrollment = exports.Certificate = exports.UserBadge = exports.Badge = exports.LessonProgress = exports.Lesson = exports.Module = exports.Course = exports.User = void 0;
const supabase_1 = require("./supabase");
// User operations
exports.User = {
    // Find user by ID
    findById: async (id) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Find user by email
    findByEmail: async (email) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Create a new user
    create: async (userData) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('users')
            .insert(userData)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Update user
    update: async (id, userData) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('users')
            .update(userData)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Delete user
    delete: async (id) => {
        const { error } = await supabase_1.supabaseAdmin
            .from('users')
            .delete()
            .eq('id', id);
        if (error)
            throw new Error(error.message);
        return true;
    },
    // Find all users with pagination
    findAll: async (page = 1, limit = 10) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('users')
            .select('*')
            .range((page - 1) * limit, page * limit - 1);
        if (error)
            throw new Error(error.message);
        return data;
    }
};
// Course operations (based on your actual structure)
exports.Course = {
    // Find course by ID
    findById: async (id) => {
        const { data, error } = await supabase_1.supabaseAdmin
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
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Create a new course
    create: async (courseData) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('courses')
            .insert(courseData)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Update course
    update: async (id, courseData) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('courses')
            .update(courseData)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Delete course
    delete: async (id) => {
        const { error } = await supabase_1.supabaseAdmin
            .from('courses')
            .delete()
            .eq('id', id);
        if (error)
            throw new Error(error.message);
        return true;
    },
    // Find all courses with filters
    findAll: async (filters = {}, page = 1, limit = 10) => {
        let query = supabase_1.supabaseAdmin
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
        if (error)
            throw new Error(error.message);
        return data;
    }
};
// Module operations (your actual modules table)
exports.Module = {
    // Find module by ID
    findById: async (id) => {
        const { data, error } = await supabase_1.supabaseAdmin
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
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Create a new module
    create: async (moduleData) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('modules')
            .insert(moduleData)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Update module
    update: async (id, moduleData) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('modules')
            .update(moduleData)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Get modules by course
    findByCourse: async (courseId) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('modules')
            .select('*')
            .eq('course_id', courseId)
            .order('order_index', { ascending: true });
        if (error)
            throw new Error(error.message);
        return data;
    }
};
// Lesson operations
exports.Lesson = {
    // Find lesson by ID
    findById: async (id) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('lessons')
            .select(`
        *,
        quiz_questions (*)
      `)
            .eq('id', id)
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Create a new lesson
    create: async (lessonData) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('lessons')
            .insert(lessonData)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Update lesson
    update: async (id, lessonData) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('lessons')
            .update(lessonData)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Delete lesson
    delete: async (id) => {
        const { error } = await supabase_1.supabaseAdmin
            .from('lessons')
            .delete()
            .eq('id', id);
        if (error)
            throw new Error(error.message);
        return true;
    },
    // Get lessons by module
    findByModule: async (moduleId) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('lessons')
            .select('*')
            .eq('module_id', moduleId)
            .order('order_index', { ascending: true });
        if (error)
            throw new Error(error.message);
        return data;
    }
};
// Lesson Progress operations
exports.LessonProgress = {
    // Find progress by user and lesson
    findByUserAndLesson: async (userId, lessonId) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('lesson_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('lesson_id', lessonId)
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Create or update progress
    upsert: async (progressData) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('lesson_progress')
            .upsert(progressData, { onConflict: 'user_id, lesson_id' })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Update progress
    update: async (id, progressData) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('lesson_progress')
            .update(progressData)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Get user progress for all lessons
    findByUser: async (userId) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('lesson_progress')
            .select(`
        *,
        lesson:lessons (id, title)
      `)
            .eq('user_id', userId);
        if (error)
            throw new Error(error.message);
        return data;
    }
};
// Badge operations
exports.Badge = {
    // Find badge by ID
    findById: async (id) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('badges')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Create a new badge
    create: async (badgeData) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('badges')
            .insert(badgeData)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Find all badges
    findAll: async () => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('badges')
            .select('*');
        if (error)
            throw new Error(error.message);
        return data;
    }
};
// UserBadge operations
exports.UserBadge = {
    // Award a badge to a user
    award: async (userBadgeData) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('user_badges')
            .insert(userBadgeData)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Get user's badges
    findByUser: async (userId) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('user_badges')
            .select(`
        *,
        badge:badges (id, name, description, icon)
      `)
            .eq('user_id', userId);
        if (error)
            throw new Error(error.message);
        return data;
    }
};
// Certificate operations
exports.Certificate = {
    // Find certificate by ID
    findById: async (id) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('certificates')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Create a new certificate
    create: async (certificateData) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('certificates')
            .insert(certificateData)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Get user's certificates
    findByUser: async (userId) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('certificates')
            .select(`
        *,
        course:courses (id, title)
      `)
            .eq('user_id', userId);
        if (error)
            throw new Error(error.message);
        return data;
    }
};
// Enrollment operations
exports.Enrollment = {
    // Find enrollment by user and course
    findByUserAndCourse: async (userId, courseId) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('enrollments')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Create a new enrollment
    create: async (enrollmentData) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('enrollments')
            .insert(enrollmentData)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Get user's enrollments
    findByUser: async (userId) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('enrollments')
            .select(`
        *,
        course:courses (id, title, thumbnail)
      `)
            .eq('user_id', userId);
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Get course's enrollments
    findByCourse: async (courseId) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('enrollments')
            .select(`
        *,
        user:users (id, name, email, avatar)
      `)
            .eq('course_id', courseId);
        if (error)
            throw new Error(error.message);
        return data;
    }
};
// Quiz operations
exports.Quiz = {
    // Get quiz questions by lesson
    findQuestionsByLesson: async (lessonId) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('quiz_questions')
            .select('*')
            .eq('lesson_id', lessonId);
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Record quiz attempt
    recordAttempt: async (attemptData) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('quiz_attempts')
            .insert(attemptData)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    // Get user's quiz attempts
    findAttemptsByUser: async (userId) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('quiz_attempts')
            .select(`
        *,
        lesson:lessons (id, title)
      `)
            .eq('user_id', userId);
        if (error)
            throw new Error(error.message);
        return data;
    }
};
// User Course Progress operations
exports.UserCourseProgress = {
    findByUserAndCourse: async (userId, courseId) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('user_course_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .maybeSingle();
        if (error)
            throw new Error(error.message);
        return data;
    },
    upsert: async (progressData) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('user_course_progress')
            .upsert(progressData, { onConflict: 'user_id, course_id' })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    update: async (id, progressData) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('user_course_progress')
            .update(progressData)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    findByUser: async (userId) => {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('user_course_progress')
            .select(`
        *,
        course:courses (id, title, thumbnail)
      `)
            .eq('user_id', userId);
        if (error)
            throw new Error(error.message);
        return data;
    }
};
