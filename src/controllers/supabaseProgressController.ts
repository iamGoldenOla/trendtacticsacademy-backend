import { Request, Response } from 'express';
import { UserCourseProgress as Progress, Course } from '../utils/supabaseModels';

/**
 * @desc    Get user progress for a specific course
 * @route   GET /api/progress/:courseId
 * @access  Private
 */
export const getUserCourseProgress = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = (req as any).user.id;
    
    // Find progress record
    const progress = await (Progress as any).findByUserAndCourse(userId, courseId);
    
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
    const userId = (req as any).user.id;
    
    // Find all progress records for user
    const progress = await (Progress as any).findByUser(userId);
    
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
    const userId = (req as any).user.id;
    
    // Find progress record
    let progress = await (Progress as any).findByUserAndCourse(userId, courseId);
    
    // If no progress record exists, create one
    if (!progress) {
      // Verify course exists
      const courseExists = await Course.findById(courseId);
      if (!courseExists) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      progress = await (Progress as any).upsert({
        user_id: userId,
        course_id: courseId,
        completed_lessons: [],
        progress_percentage: 0,
        last_accessed: new Date().toISOString()
      });
    } else {
      // Update last accessed time
      progress = await (Progress as any).update(progress.id, {
        last_accessed: new Date().toISOString()
      });
    }
    
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
    const userId = (req as any).user.id;
    
    // Find progress record
    const progress = await (Progress as any).findByUserAndCourse(userId, courseId);
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }
    
    // Update progress record to reset values
    const updatedProgress = await (Progress as any).update(progress.id, {
      completed_lessons: [],
      progress_percentage: 0,
      last_accessed: new Date().toISOString()
    });
    
    res.json({
      message: 'Progress reset successfully',
      progress: updatedProgress
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
    const userId = (req as any).user.id;
    
    // Verify course exists and user is instructor
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is the course instructor or admin
    if (course.instructor_id !== userId && (req as any).user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these statistics' });
    }
    
    // Get all progress records for this course
    // Note: You'll need to implement a method to get all progress for a course
    // This is a simplified version
    
    res.json({
      message: 'Course statistics would be returned here',
      courseId
    });
  } catch (error: any) {
    console.error('Get course stats error:', error);
    res.status(500).json({ message: 'Server error fetching course statistics' });
  }
};