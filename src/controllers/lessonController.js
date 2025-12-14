"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markLessonComplete = exports.deleteLesson = exports.updateLesson = exports.addLesson = exports.getLessonById = void 0;
const Course_1 = __importDefault(require("../models/Course"));
const Progress_1 = __importDefault(require("../models/Progress"));
/**
 * @desc    Get lesson by ID
 * @route   GET /api/courses/:courseId/lessons/:lessonId
 * @access  Private
 */
const getLessonById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, lessonId } = req.params;
        const course = yield Course_1.default.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Check if user is enrolled or is the instructor
        const isEnrolled = req.user && course.enrolledStudents && Array.isArray(course.enrolledStudents) && course.enrolledStudents.some((student) => student && student.toString && student.toString() === req.user._id.toString());
        const isInstructor = req.user && course.instructor && course.instructor.toString && course.instructor.toString() === req.user._id.toString();
        if (!isEnrolled && !isInstructor && req.user && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not enrolled in this course' });
        }
        // Find the lesson
        // Check if lessons is an array of documents with id method or just an array of ObjectIds
        const lesson = Array.isArray(course.lessons) && typeof course.lessons.id === 'function'
            ? course.lessons.id(lessonId)
            : course.lessons && Array.isArray(course.lessons) ? course.lessons.find(l => l && l._id && l._id.toString && l._id.toString() === lessonId) : null;
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        res.json(lesson);
    }
    catch (error) {
        console.error('Get lesson error:', error);
        res.status(500).json({ message: 'Server error fetching lesson' });
    }
});
exports.getLessonById = getLessonById;
/**
 * @desc    Add lesson to course
 * @route   POST /api/courses/:courseId/lessons
 * @access  Private/Instructor
 */
const addLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        const { title, description, videoUrl, content, duration, order, quiz } = req.body;
        const course = yield Course_1.default.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Check if user is the course instructor
        if (req.user && course.instructor && course.instructor.toString && course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to add lessons to this course' });
        }
        // Create new lesson
        const newLesson = {
            title,
            description,
            videoUrl,
            content,
            duration,
            order: order || course.lessons.length + 1,
            quiz
        };
        // Add lesson to course
        course.lessons.push(newLesson);
        yield course.save();
        res.status(201).json(course.lessons[course.lessons.length - 1]);
    }
    catch (error) {
        console.error('Add lesson error:', error);
        res.status(500).json({ message: 'Server error adding lesson' });
    }
});
exports.addLesson = addLesson;
/**
 * @desc    Update lesson
 * @route   PUT /api/courses/:courseId/lessons/:lessonId
 * @access  Private/Instructor
 */
const updateLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, lessonId } = req.params;
        const course = yield Course_1.default.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Check if user is the course instructor
        if (req.user && course.instructor && course.instructor.toString && course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update lessons in this course' });
        }
        // Find the lesson
        // Check if lessons is an array of documents with id method or just an array of ObjectIds
        const lesson = Array.isArray(course.lessons) && typeof course.lessons.id === 'function'
            ? course.lessons.id(lessonId)
            : course.lessons.find(l => l._id.toString() === lessonId);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        // Update lesson fields
        Object.assign(lesson, req.body);
        yield course.save();
        res.json(lesson);
    }
    catch (error) {
        console.error('Update lesson error:', error);
        res.status(500).json({ message: 'Server error updating lesson' });
    }
});
exports.updateLesson = updateLesson;
/**
 * @desc    Delete lesson
 * @route   DELETE /api/courses/:courseId/lessons/:lessonId
 * @access  Private/Instructor
 */
const deleteLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, lessonId } = req.params;
        const course = yield Course_1.default.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Check if user is the course instructor
        if (req.user && course.instructor && course.instructor.toString && course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete lessons from this course' });
        }
        // Find and remove the lesson
        if (typeof course.lessons.pull === 'function') {
            course.lessons.pull({ _id: lessonId });
        }
        else {
            // If lessons is an array of ObjectIds, filter out the one to remove
            course.lessons = course.lessons.filter(l => l._id.toString() !== lessonId);
        }
        yield course.save();
        // Update progress records to remove this lesson from completedLessons
        yield Progress_1.default.updateMany({ course: courseId, completedLessons: lessonId }, { $pull: { completedLessons: lessonId } });
        res.json({ message: 'Lesson removed' });
    }
    catch (error) {
        console.error('Delete lesson error:', error);
        res.status(500).json({ message: 'Server error deleting lesson' });
    }
});
exports.deleteLesson = deleteLesson;
/**
 * @desc    Mark lesson as completed
 * @route   POST /api/courses/:courseId/lessons/:lessonId/complete
 * @access  Private
 */
const markLessonComplete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, lessonId } = req.params;
        // Find the course and verify lesson exists
        const course = yield Course_1.default.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Check if lessons is an array of documents with id method or just an array of ObjectIds
        const lesson = Array.isArray(course.lessons) && typeof course.lessons.id === 'function'
            ? course.lessons.id(lessonId)
            : course.lessons.find(l => l._id.toString() === lessonId);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        // Find or create progress record
        let progress = yield Progress_1.default.findOne({
            user: req.user._id,
            course: courseId
        });
        if (!progress) {
            // Create new progress record if not exists
            progress = new Progress_1.default({
                user: req.user._id,
                course: courseId,
                completedLessons: [],
                progressPercentage: 0,
                lastAccessed: new Date()
            });
        }
        // Check if lesson is already marked as completed
        if (!progress.completedLessons.includes(lessonId)) {
            // Add lesson to completed lessons
            progress.completedLessons.push(lessonId);
            // Calculate progress percentage
            progress.progressPercentage =
                (progress.completedLessons.length / course.lessons.length) * 100;
            // Update last accessed
            progress.lastAccessed = new Date();
            yield progress.save();
        }
        res.json(progress);
    }
    catch (error) {
        console.error('Mark lesson complete error:', error);
        res.status(500).json({ message: 'Server error marking lesson as complete' });
    }
});
exports.markLessonComplete = markLessonComplete;
