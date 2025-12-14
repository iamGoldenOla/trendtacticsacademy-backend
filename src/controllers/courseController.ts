import { Request, Response } from 'express';
import Course from '../models/Course';
import User from '../models/User';
import Progress from '../models/Progress';

/**
 * @desc    Get all courses
 * @route   GET /api/courses
 * @access  Public
 */
export const getCourses = async (req: Request, res: Response) => {
  try {
    const { category, level, search } = req.query;
    
    // Build filter object
    const filter: any = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (level) {
      filter.level = level;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const courses = await Course.find(filter)
      .populate('instructor', 'name email avatar')
      .select('-lessons.content');
      
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
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email avatar')
      .populate('enrolledStudents', 'name email avatar');
      
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
      topics,
      lessons,
      moduleQuiz
    } = req.body;
    
    // Create course with current user as instructor
    const course = await Course.create({
      title,
      description,
      instructor: req.user?._id,
      thumbnail,
      price,
      duration,
      level,
      category,
      topics,
      lessons: lessons || [],
      moduleQuiz: moduleQuiz || [],
      enrolledStudents: [],
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
    let course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is the course instructor
    if (req.user && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }
    
    // Update course
    course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.json(course);
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
    
    // Check if user is the course instructor
    if (req.user && course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }
    
    await course.deleteOne();
    
    // Also delete all progress records for this course
    await Progress.deleteMany({ course: req.params.id });
    
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
    
    // Check if user is already enrolled
    const alreadyEnrolled = req.user && course.enrolledStudents.some(
      (student) => student.toString() === req.user._id.toString()
    );
    
    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }
    
    // Add user to enrolled students
    if (req.user) {
      course.enrolledStudents.push(req.user._id);
      await course.save();
      
      // Add course to user's enrolled courses
      const user = await User.findById(req.user._id);
      if (user) {
        if (!user.enrolledCourses) {
          user.enrolledCourses = [];
        }
        user.enrolledCourses.push(course._id);
        await user.save();
      }
      
      // Create progress record
      await Progress.create({
        user: req.user._id,
        course: course._id,
        completedLessons: [],
        progressPercentage: 0,
        lastAccessed: new Date()
      });
    }
    
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
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const courses = await Course.find({ instructor: req.user._id })
      .select('-lessons.content')
      .populate('enrolledStudents', 'name email avatar');
      
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
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const user = await User.findById(req.user._id)
      .populate({
        path: 'enrolledCourses',
        select: '-lessons.content',
        populate: {
          path: 'instructor',
          select: 'name email avatar'
        }
      });
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.enrolledCourses);
  } catch (error: any) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ message: 'Server error fetching enrolled courses' });
  }
};