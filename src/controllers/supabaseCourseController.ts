import { Request, Response } from 'express';
import { Course, Enrollment, Progress } from '../utils/supabaseModels';

/**
 * @desc    Get all courses
 * @route   GET /api/courses
 * @access  Public
 */
export const getCourses = async (req: Request, res: Response) => {
  try {
    const { category, level, search } = req.query;
    
    // Build filters
    const filters: any = {};
    
    if (category) {
      filters.category = category as string;
    }
    
    if (level) {
      filters.level = level as string;
    }
    
    if (search) {
      filters.search = search as string;
    }
    
    const courses = await Course.findAll(filters);
    
    res.json(courses);
  } catch (error: any) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error fetching courses' });
  }
};

/**
 * @desc    Get single course by ID
 * @route   GET /api/courses/:id
 * @access  Public
 */
export const getCourseById = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course);
  } catch (error: any) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error fetching course' });
  }
};

/**
 * @desc    Create a new course
 * @route   POST /api/courses
 * @access  Private/Instructor
 */
export const createCourse = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      thumbnail,
      price,
      duration,
      level,
      category,
      topics
    } = req.body;
    
    // Create course with current user as instructor
    const course = await Course.create({
      title,
      description,
      instructor_id: (req as any).user.id,
      thumbnail,
      price,
      duration,
      level,
      category,
      topics: topics || [],
      rating: 0
    });
    
    res.status(201).json(course);
  } catch (error: any) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error creating course' });
  }
};

/**
 * @desc    Update a course
 * @route   PUT /api/courses/:id
 * @access  Private/Instructor
 */
export const updateCourse = async (req: Request, res: Response) => {
  try {
    // Check if user is the course instructor
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.instructor_id !== (req as any).user.id) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }
    
    // Update course
    const updatedCourse = await Course.update(req.params.id, req.body);
    
    res.json(updatedCourse);
  } catch (error: any) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error updating course' });
  }
};

/**
 * @desc    Delete a course
 * @route   DELETE /api/courses/:id
 * @access  Private/Instructor
 */
export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is the course instructor or admin
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    
    if (course.instructor_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }
    
    // Delete course
    await Course.delete(req.params.id);
    
    // Also delete all progress records for this course
    // Note: You'll need to implement this in your Supabase models
    
    res.json({ message: 'Course removed' });
  } catch (error: any) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error deleting course' });
  }
};

/**
 * @desc    Enroll in a course
 * @route   POST /api/courses/:id/enroll
 * @access  Private/Student
 */
export const enrollCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const userId = (req as any).user.id;
    
    // Check if user is already enrolled
    const isEnrolled = await Enrollment.isEnrolled(userId, req.params.id);
    
    if (isEnrolled) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }
    
    // Enroll user in course
    await Enrollment.enroll({
      user_id: userId,
      course_id: req.params.id
    });
    
    // Create progress record
    await Progress.upsert({
      user_id: userId,
      course_id: req.params.id,
      completed_lessons: [],
      progress_percentage: 0,
      last_accessed: new Date().toISOString()
    });
    
    res.json({ message: 'Successfully enrolled in course' });
  } catch (error: any) {
    console.error('Enroll course error:', error);
    res.status(500).json({ message: 'Server error enrolling in course' });
  }
};

/**
 * @desc    Get instructor courses
 * @route   GET /api/courses/instructor
 * @access  Private/Instructor
 */
export const getInstructorCourses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const courses = await Course.findByInstructor(userId);
    
    res.json(courses);
  } catch (error: any) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({ message: 'Server error fetching instructor courses' });
  }
};

/**
 * @desc    Get enrolled courses for current user
 * @route   GET /api/courses/enrolled
 * @access  Private
 */
export const getEnrolledCourses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const enrollments = await Enrollment.findByUser(userId);
    
    res.json(enrollments);
  } catch (error: any) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ message: 'Server error fetching enrolled courses' });
  }
};