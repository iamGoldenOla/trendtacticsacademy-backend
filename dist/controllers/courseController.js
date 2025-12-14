"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnrolledCourses = exports.getInstructorCourses = exports.enrollCourse = exports.deleteCourse = exports.updateCourse = exports.createCourse = exports.getCourseById = exports.getCourses = void 0;
const Course_1 = __importDefault(require("../models/Course"));
const User_1 = __importDefault(require("../models/User"));
const Progress_1 = __importDefault(require("../models/Progress"));
/**
 * @desc    Get all courses
 * @route   GET /api/courses
 * @access  Public
 */
const getCourses = async (req, res) => {
    try {
        const { category, level, search } = req.query;
        // Build filter object
        const filter = {};
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
        const courses = await Course_1.default.find(filter)
            .populate('instructor', 'name email avatar')
            .select('-lessons.content');
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
        const course = await Course_1.default.findById(req.params.id)
            .populate('instructor', 'name email avatar')
            .populate('enrolledStudents', 'name email avatar');
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
    var _a;
    try {
        const { title, description, thumbnail, price, duration, level, category, topics, lessons, moduleQuiz } = req.body;
        // Create course with current user as instructor
        const course = await Course_1.default.create({
            title,
            description,
            instructor: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
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
        let course = await Course_1.default.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Check if user is the course instructor
        if (req.user && course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }
        // Update course
        course = await Course_1.default.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
        res.json(course);
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
        const course = await Course_1.default.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Check if user is the course instructor
        if (req.user && course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this course' });
        }
        await course.deleteOne();
        // Also delete all progress records for this course
        await Progress_1.default.deleteMany({ course: req.params.id });
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
        const course = await Course_1.default.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Check if user is already enrolled
        const alreadyEnrolled = req.user && course.enrolledStudents.some((student) => student.toString() === req.user._id.toString());
        if (alreadyEnrolled) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }
        // Add user to enrolled students
        if (req.user) {
            course.enrolledStudents.push(req.user._id);
            await course.save();
            // Add course to user's enrolled courses
            const user = await User_1.default.findById(req.user._id);
            if (user) {
                if (!user.enrolledCourses) {
                    user.enrolledCourses = [];
                }
                user.enrolledCourses.push(course._id);
                await user.save();
            }
            // Create progress record
            await Progress_1.default.create({
                user: req.user._id,
                course: course._id,
                completedLessons: [],
                progressPercentage: 0,
                lastAccessed: new Date()
            });
        }
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
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const courses = await Course_1.default.find({ instructor: req.user._id })
            .select('-lessons.content')
            .populate('enrolledStudents', 'name email avatar');
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
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const user = await User_1.default.findById(req.user._id)
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
    }
    catch (error) {
        console.error('Get enrolled courses error:', error);
        res.status(500).json({ message: 'Server error fetching enrolled courses' });
    }
};
exports.getEnrolledCourses = getEnrolledCourses;
