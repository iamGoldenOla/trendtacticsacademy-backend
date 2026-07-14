"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnrolledCourses = exports.getInstructorCourses = exports.enrollCourse = exports.deleteCourse = exports.updateCourse = exports.createCourse = exports.getCourseById = exports.getCourses = void 0;
const supabaseModels_1 = require("../utils/supabaseModels");
/**
 * @desc    Get all courses
 * @route   GET /api/courses
 * @access  Public
 */
const getCourses = async (req, res) => {
    try {
        const { category, level, search } = req.query;
        // Build filters
        const filters = {};
        if (category) {
            filters.category = category;
        }
        if (level) {
            filters.level = level;
        }
        if (search) {
            filters.search = search;
        }
        const courses = await supabaseModels_1.Course.findAll(filters);
        res.json(courses);
    }
    catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ message: 'Server error fetching courses' });
    }
};
exports.getCourses = getCourses;
/**
 * @desc    Get single course by ID
 * @route   GET /api/courses/:id
 * @access  Public
 */
const getCourseById = async (req, res) => {
    try {
        const course = await supabaseModels_1.Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    }
    catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({ message: 'Server error fetching course' });
    }
};
exports.getCourseById = getCourseById;
/**
 * @desc    Create a new course
 * @route   POST /api/courses
 * @access  Private/Instructor
 */
const createCourse = async (req, res) => {
    try {
        const { title, description, thumbnail, price, duration, level, category, topics } = req.body;
        // Create course with current user as instructor
        const course = await supabaseModels_1.Course.create({
            title,
            description,
            instructor_id: req.user.id,
            thumbnail,
            price,
            duration,
            level,
            category,
            topics: topics || [],
            rating: 0
        });
        res.status(201).json(course);
    }
    catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ message: 'Server error creating course' });
    }
};
exports.createCourse = createCourse;
/**
 * @desc    Update a course
 * @route   PUT /api/courses/:id
 * @access  Private/Instructor
 */
const updateCourse = async (req, res) => {
    try {
        // Check if user is the course instructor
        const course = await supabaseModels_1.Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        if (course.instructor_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }
        // Update course
        const updatedCourse = await supabaseModels_1.Course.update(req.params.id, req.body);
        res.json(updatedCourse);
    }
    catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ message: 'Server error updating course' });
    }
};
exports.updateCourse = updateCourse;
/**
 * @desc    Delete a course
 * @route   DELETE /api/courses/:id
 * @access  Private/Instructor
 */
const deleteCourse = async (req, res) => {
    try {
        const course = await supabaseModels_1.Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Check if user is the course instructor or admin
        const userId = req.user.id;
        const userRole = req.user.role;
        if (course.instructor_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this course' });
        }
        // Delete course
        await supabaseModels_1.Course.delete(req.params.id);
        // Also delete all progress records for this course
        // Note: You'll need to implement this in your Supabase models
        res.json({ message: 'Course removed' });
    }
    catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ message: 'Server error deleting course' });
    }
};
exports.deleteCourse = deleteCourse;
/**
 * @desc    Enroll in a course
 * @route   POST /api/courses/:id/enroll
 * @access  Private/Student
 */
const enrollCourse = async (req, res) => {
    try {
        const course = await supabaseModels_1.Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const userId = req.user.id;
        // Check if user is already enrolled
        const isEnrolled = await supabaseModels_1.Enrollment.isEnrolled(userId, req.params.id);
        if (isEnrolled) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }
        // Enroll user in course
        await supabaseModels_1.Enrollment.enroll({
            user_id: userId,
            course_id: req.params.id
        });
        // Create progress record
        await supabaseModels_1.LessonProgress.upsert({
            user_id: userId,
            course_id: req.params.id,
            completed_lessons: [],
            progress_percentage: 0,
            last_accessed: new Date().toISOString()
        });
        res.json({ message: 'Successfully enrolled in course' });
    }
    catch (error) {
        console.error('Enroll course error:', error);
        res.status(500).json({ message: 'Server error enrolling in course' });
    }
};
exports.enrollCourse = enrollCourse;
/**
 * @desc    Get instructor courses
 * @route   GET /api/courses/instructor
 * @access  Private/Instructor
 */
const getInstructorCourses = async (req, res) => {
    try {
        const userId = req.user.id;
        const courses = await supabaseModels_1.Course.findByInstructor(userId);
        res.json(courses);
    }
    catch (error) {
        console.error('Get instructor courses error:', error);
        res.status(500).json({ message: 'Server error fetching instructor courses' });
    }
};
exports.getInstructorCourses = getInstructorCourses;
/**
 * @desc    Get enrolled courses for current user
 * @route   GET /api/courses/enrolled
 * @access  Private
 */
const getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.user.id;
        const enrollments = await supabaseModels_1.Enrollment.findByUser(userId);
        res.json(enrollments);
    }
    catch (error) {
        console.error('Get enrolled courses error:', error);
        res.status(500).json({ message: 'Server error fetching enrolled courses' });
    }
};
exports.getEnrolledCourses = getEnrolledCourses;
