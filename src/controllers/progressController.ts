import { Request, Response } from 'express';
import Progress from '../models/Progress';
import Course from '../models/Course';

/**
 * @desc    Get user progress for a specific course
 * @route   GET /api/progress/:courseId
 * @access  Private
 */
export const getUserCourseProgress = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    
    // Find progress record
    const progress = await Progress.findOne({
      user: req.user && req.user._id,
      course: courseId
    });
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }
    
    res.json(progress);
  } catch (error: any) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error fetching progress' });
  }
};

/**
 * @desc    Get all progress for current user
 * @route   GET /api/progress
 * @access  Private
 */
export const getAllUserProgress = async (req: Request, res: Response) => {
  try {
    // Find all progress records for user
    const progress = await Progress.find({ user: req.user && req.user._id })
      .populate('course', 'title thumbnail');
    
    res.json(progress);
  } catch (error: any) {
    console.error('Get all progress error:', error);
    res.status(500).json({ message: 'Server error fetching all progress' });
  }
};

/**
 * @desc    Update last accessed time for a course
 * @route   PUT /api/progress/:courseId/access
 * @access  Private
 */
export const updateLastAccessed = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    
    // Find progress record
    let progress = await Progress.findOne({
      user: req.user && req.user._id,
      course: courseId
    });
    
    // If no progress record exists, create one
    if (!progress) {
      // Verify course exists
      const courseExists = await Course.findById(courseId);
      if (!courseExists) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      progress = new Progress({
        user: req.user && req.user._id,
        course: courseId,
        completedLessons: [],
        progressPercentage: 0,
        lastAccessed: new Date()
      });
    } else {
      // Update last accessed time
      progress.lastAccessed = new Date();
    }
    
    await progress.save();
    
    res.json(progress);
  } catch (error: any) {
    console.error('Update last accessed error:', error);
    res.status(500).json({ message: 'Server error updating last accessed time' });
  }
};

/**
 * @desc    Reset user progress for a course
 * @route   DELETE /api/progress/:courseId
 * @access  Private
 */
export const resetProgress = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    
    // Find and delete progress record
    const progress = await Progress.findOneAndDelete({
      user: req.user && req.user._id,
      course: courseId
    });
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }
    
    // Create new empty progress record
    const newProgress = await Progress.create({
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
  } catch (error: any) {
    console.error('Reset progress error:', error);
    res.status(500).json({ message: 'Server error resetting progress' });
  }
};

/**
 * @desc    Get course completion statistics for instructor
 * @route   GET /api/progress/stats/:courseId
 * @access  Private/Instructor
 */
export const getCourseCompletionStats = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    
    // Verify course exists and user is instructor
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is the course instructor
    if (req.user && course.instructor && course.instructor.toString && course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these statistics' });
    }
    
    // Get all progress records for this course
    const progressRecords = await Progress.find({ course: courseId });
    
    // Calculate statistics
    const totalStudents = course.enrolledStudents.length;
    const studentsWithProgress = progressRecords.length;
    
    // Calculate average progress percentage
    const totalProgressPercentage = progressRecords.reduce(
      (sum, record) => sum + record.progressPercentage,
      0
    );
    const averageProgress = studentsWithProgress > 0 
      ? totalProgressPercentage / studentsWithProgress 
      : 0;
    
    // Count completed students (100% progress)
    const completedStudents = progressRecords.filter(
      (record) => record.progressPercentage === 100
    ).length;
    
    // Get lesson completion counts
    const lessonCompletionCounts: Record<string, number> = {};
    
    course.lessons.forEach((lesson: any) => {
      let lessonId: string = '';
      if (typeof lesson === 'object' && lesson !== null && '_id' in lesson) {
        lessonId = lesson._id ? lesson._id.toString() : '';
      } else if (typeof lesson === 'string' || typeof lesson === 'number') {
        lessonId = lesson.toString();
      }
      if (!lessonId) return;
      const completionCount = progressRecords.filter(record => 
        record.completedLessons.some(id => id.toString() === lessonId)
      ).length;
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
  } catch (error: any) {
    console.error('Get course stats error:', error);
    res.status(500).json({ message: 'Server error fetching course statistics' });
  }
};