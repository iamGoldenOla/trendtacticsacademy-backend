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
exports.getCourseCompletionStats = exports.resetProgress = exports.updateLastAccessed = exports.getAllUserProgress = exports.getUserCourseProgress = void 0;
const Progress_1 = __importDefault(require("../models/Progress"));
const Course_1 = __importDefault(require("../models/Course"));
/**
 * @desc    Get user progress for a specific course
 * @route   GET /api/progress/:courseId
 * @access  Private
 */
const getUserCourseProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        // Find progress record
        const progress = yield Progress_1.default.findOne({
            user: req.user && req.user._id,
            course: courseId
        });
        if (!progress) {
            return res.status(404).json({ message: 'Progress not found' });
        }
        res.json(progress);
    }
    catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ message: 'Server error fetching progress' });
    }
});
exports.getUserCourseProgress = getUserCourseProgress;
/**
 * @desc    Get all progress for current user
 * @route   GET /api/progress
 * @access  Private
 */
const getAllUserProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find all progress records for user
        const progress = yield Progress_1.default.find({ user: req.user && req.user._id })
            .populate('course', 'title thumbnail');
        res.json(progress);
    }
    catch (error) {
        console.error('Get all progress error:', error);
        res.status(500).json({ message: 'Server error fetching all progress' });
    }
});
exports.getAllUserProgress = getAllUserProgress;
/**
 * @desc    Update last accessed time for a course
 * @route   PUT /api/progress/:courseId/access
 * @access  Private
 */
const updateLastAccessed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        // Find progress record
        let progress = yield Progress_1.default.findOne({
            user: req.user && req.user._id,
            course: courseId
        });
        // If no progress record exists, create one
        if (!progress) {
            // Verify course exists
            const courseExists = yield Course_1.default.findById(courseId);
            if (!courseExists) {
                return res.status(404).json({ message: 'Course not found' });
            }
            progress = new Progress_1.default({
                user: req.user && req.user._id,
                course: courseId,
                completedLessons: [],
                progressPercentage: 0,
                lastAccessed: new Date()
            });
        }
        else {
            // Update last accessed time
            progress.lastAccessed = new Date();
        }
        yield progress.save();
        res.json(progress);
    }
    catch (error) {
        console.error('Update last accessed error:', error);
        res.status(500).json({ message: 'Server error updating last accessed time' });
    }
});
exports.updateLastAccessed = updateLastAccessed;
/**
 * @desc    Reset user progress for a course
 * @route   DELETE /api/progress/:courseId
 * @access  Private
 */
const resetProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        // Find and delete progress record
        const progress = yield Progress_1.default.findOneAndDelete({
            user: req.user && req.user._id,
            course: courseId
        });
        if (!progress) {
            return res.status(404).json({ message: 'Progress not found' });
        }
        // Create new empty progress record
        const newProgress = yield Progress_1.default.create({
            user: req.user && req.user._id,
            course: courseId,
            completedLessons: [],
            progressPercentage: 0,
            lastAccessed: new Date()
        });
        res.json({
            message: 'Progress reset successfully',
            progress: newProgress
        });
    }
    catch (error) {
        console.error('Reset progress error:', error);
        res.status(500).json({ message: 'Server error resetting progress' });
    }
});
exports.resetProgress = resetProgress;
/**
 * @desc    Get course completion statistics for instructor
 * @route   GET /api/progress/stats/:courseId
 * @access  Private/Instructor
 */
const getCourseCompletionStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        // Verify course exists and user is instructor
        const course = yield Course_1.default.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Check if user is the course instructor
        if (req.user && course.instructor && course.instructor.toString && course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view these statistics' });
        }
        // Get all progress records for this course
        const progressRecords = yield Progress_1.default.find({ course: courseId });
        // Calculate statistics
        const totalStudents = course.enrolledStudents.length;
        const studentsWithProgress = progressRecords.length;
        // Calculate average progress percentage
        const totalProgressPercentage = progressRecords.reduce((sum, record) => sum + record.progressPercentage, 0);
        const averageProgress = studentsWithProgress > 0
            ? totalProgressPercentage / studentsWithProgress
            : 0;
        // Count completed students (100% progress)
        const completedStudents = progressRecords.filter((record) => record.progressPercentage === 100).length;
        // Get lesson completion counts
        const lessonCompletionCounts = {};
        course.lessons.forEach(lesson => {
            // Handle both ObjectId and ILesson cases
            const lessonId = typeof lesson === 'object' && lesson !== null
                ? (lesson._id ? lesson._id.toString() : lesson.toString())
                : lesson.toString();
            const completionCount = progressRecords.filter(record => record.completedLessons.some(id => id.toString() === lessonId)).length;
            lessonCompletionCounts[lessonId] = completionCount;
        });
        res.json({
            totalStudents,
            studentsWithProgress,
            averageProgress,
            completedStudents,
            completionRate: totalStudents > 0 ? (completedStudents / totalStudents) * 100 : 0,
            lessonCompletionCounts
        });
    }
    catch (error) {
        console.error('Get course stats error:', error);
        res.status(500).json({ message: 'Server error fetching course statistics' });
    }
});
exports.getCourseCompletionStats = getCourseCompletionStats;
