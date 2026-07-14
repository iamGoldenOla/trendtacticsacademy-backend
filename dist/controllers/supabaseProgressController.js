"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourseCompletionStats = exports.resetProgress = exports.updateLastAccessed = exports.getAllUserProgress = exports.getUserCourseProgress = void 0;
const supabaseModels_1 = require("../utils/supabaseModels");
/**
 * @desc    Get user progress for a specific course
 * @route   GET /api/progress/:courseId
 * @access  Private
 */
const getUserCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;
        // Find progress record
        const progress = await supabaseModels_1.UserCourseProgress.findByUserAndCourse(userId, courseId);
        if (!progress) {
            return res.status(404).json({ message: 'Progress not found' });
        }
        res.json(progress);
    }
    catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ message: 'Server error fetching progress' });
    }
};
exports.getUserCourseProgress = getUserCourseProgress;
/**
 * @desc    Get all progress for current user
 * @route   GET /api/progress
 * @access  Private
 */
const getAllUserProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        // Find all progress records for user
        const progress = await supabaseModels_1.UserCourseProgress.findByUser(userId);
        res.json(progress);
    }
    catch (error) {
        console.error('Get all progress error:', error);
        res.status(500).json({ message: 'Server error fetching all progress' });
    }
};
exports.getAllUserProgress = getAllUserProgress;
/**
 * @desc    Update last accessed time for a course
 * @route   PUT /api/progress/:courseId/access
 * @access  Private
 */
const updateLastAccessed = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;
        // Find progress record
        let progress = await supabaseModels_1.UserCourseProgress.findByUserAndCourse(userId, courseId);
        // If no progress record exists, create one
        if (!progress) {
            // Verify course exists
            const courseExists = await supabaseModels_1.Course.findById(courseId);
            if (!courseExists) {
                return res.status(404).json({ message: 'Course not found' });
            }
            progress = await supabaseModels_1.UserCourseProgress.upsert({
                user_id: userId,
                course_id: courseId,
                completed_lessons: [],
                progress_percentage: 0,
                last_accessed: new Date().toISOString()
            });
        }
        else {
            // Update last accessed time
            progress = await supabaseModels_1.UserCourseProgress.update(progress.id, {
                last_accessed: new Date().toISOString()
            });
        }
        res.json(progress);
    }
    catch (error) {
        console.error('Update last accessed error:', error);
        res.status(500).json({ message: 'Server error updating last accessed time' });
    }
};
exports.updateLastAccessed = updateLastAccessed;
/**
 * @desc    Reset user progress for a course
 * @route   DELETE /api/progress/:courseId
 * @access  Private
 */
const resetProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;
        // Find progress record
        const progress = await supabaseModels_1.UserCourseProgress.findByUserAndCourse(userId, courseId);
        if (!progress) {
            return res.status(404).json({ message: 'Progress not found' });
        }
        // Update progress record to reset values
        const updatedProgress = await supabaseModels_1.UserCourseProgress.update(progress.id, {
            completed_lessons: [],
            progress_percentage: 0,
            last_accessed: new Date().toISOString()
        });
        res.json({
            message: 'Progress reset successfully',
            progress: updatedProgress
        });
    }
    catch (error) {
        console.error('Reset progress error:', error);
        res.status(500).json({ message: 'Server error resetting progress' });
    }
};
exports.resetProgress = resetProgress;
/**
 * @desc    Get course completion statistics for instructor
 * @route   GET /api/progress/stats/:courseId
 * @access  Private/Instructor
 */
const getCourseCompletionStats = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;
        // Verify course exists and user is instructor
        const course = await supabaseModels_1.Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Check if user is the course instructor or admin
        if (course.instructor_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view these statistics' });
        }
        // Get all progress records for this course
        // Note: You'll need to implement a method to get all progress for a course
        // This is a simplified version
        res.json({
            message: 'Course statistics would be returned here',
            courseId
        });
    }
    catch (error) {
        console.error('Get course stats error:', error);
        res.status(500).json({ message: 'Server error fetching course statistics' });
    }
};
exports.getCourseCompletionStats = getCourseCompletionStats;
