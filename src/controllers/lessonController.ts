import { Request, Response } from 'express';
import { supabaseAdmin } from '../utils/supabase';

/**
 * @desc    Get lesson by ID
 * @route   GET /api/courses/:courseId/lessons/:lessonId
 * @access  Private
 */
export const getLessonById = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    
    const { data: lesson, error } = await supabaseAdmin
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .maybeSingle();
      
    if (error) throw error;
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    res.json(lesson);
  } catch (error: any) {
    console.error('Get lesson error:', error);
    res.status(500).json({ message: 'Server error fetching lesson' });
  }
};

/**
 * @desc    Add lesson to course
 * @route   POST /api/courses/:courseId/lessons
 * @access  Private/Instructor
 */
export const addLesson = async (req: Request, res: Response) => {
  try {
    const { title, description, videoUrl, content, duration, order, moduleId, isPreview, resources } = req.body;
    
    const { data: lesson, error } = await supabaseAdmin
      .from('lessons')
      .insert({
        title,
        description,
        video_url: videoUrl,
        content,
        duration,
        order_index: order,
        module_id: moduleId,
        is_preview: isPreview || false,
        resources: resources || {}
      })
      .select()
      .single();
      
    if (error) throw error;
    res.status(201).json(lesson);
  } catch (error: any) {
    console.error('Add lesson error:', error);
    res.status(500).json({ message: 'Server error adding lesson' });
  }
};

/**
 * @desc    Update lesson
 * @route   PUT /api/courses/:courseId/lessons/:lessonId
 * @access  Private/Instructor
 */
export const updateLesson = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { title, description, videoUrl, content, duration, order, isPreview, resources } = req.body;
    
    const { data: lesson, error } = await supabaseAdmin
      .from('lessons')
      .update({
        title,
        description,
        video_url: videoUrl,
        content,
        duration,
        order_index: order,
        is_preview: isPreview,
        resources: resources
      })
      .eq('id', lessonId)
      .select()
      .single();
      
    if (error) throw error;
    res.json(lesson);
  } catch (error: any) {
    console.error('Update lesson error:', error);
    res.status(500).json({ message: 'Server error updating lesson' });
  }
};

/**
 * @desc    Delete lesson
 * @route   DELETE /api/courses/:courseId/lessons/:lessonId
 * @access  Private/Instructor
 */
export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    
    const { error } = await supabaseAdmin
      .from('lessons')
      .delete()
      .eq('id', lessonId);
      
    if (error) throw error;
    res.json({ message: 'Lesson removed' });
  } catch (error: any) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ message: 'Server error deleting lesson' });
  }
};

/**
 * @desc    Mark lesson as completed
 * @route   POST /api/courses/:courseId/lessons/:lessonId/complete
 * @access  Private
 */
export const markLessonComplete = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;
    
    const { data: progress, error } = await supabaseAdmin
      .from('user_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    res.json(progress);
  } catch (error: any) {
    console.error('Mark lesson complete error:', error);
    res.status(500).json({ message: 'Server error marking lesson as complete' });
  }
};