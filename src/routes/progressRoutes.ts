import express from 'express';
import {
  getUserCourseProgress,
  getAllUserProgress,
  updateLastAccessed,
  resetProgress,
  getCourseCompletionStats
} from '../controllers/supabaseProgressController';
import { protect, instructor } from '../middleware/supabaseAuth';

const router = express.Router();

// Protected routes
router.get('/', protect, getAllUserProgress);
router.get('/:courseId', protect, getUserCourseProgress);
router.put('/:courseId/access', protect, updateLastAccessed);
router.delete('/:courseId', protect, resetProgress);

// Instructor routes
router.get('/stats/:courseId', protect, instructor, getCourseCompletionStats);

export default router;