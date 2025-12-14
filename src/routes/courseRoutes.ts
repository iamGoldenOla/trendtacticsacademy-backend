import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  getInstructorCourses,
  getEnrolledCourses
} from '../controllers/supabaseCourseController';
import {
  getLessonById,
  addLesson,
  updateLesson,
  deleteLesson,
  markLessonComplete
} from '../controllers/lessonController';
import {
  getLessonQuiz,
  addQuizToLesson,
  updateLessonQuiz,
  submitQuizAnswers,
  getModuleQuiz,
  updateModuleQuiz,
  submitModuleQuizAnswers
} from '../controllers/quizController';
import { protect, instructor } from '../middleware/supabaseAuth';

const router = express.Router();

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Protected routes
router.post('/', protect, instructor, createCourse);
router.put('/:id', protect, instructor, updateCourse);
router.delete('/:id', protect, instructor, deleteCourse);
router.post('/:id/enroll', protect, enrollCourse);

// Instructor routes
router.get('/instructor/courses', protect, instructor, getInstructorCourses);

// Student routes
router.get('/student/enrolled', protect, getEnrolledCourses);

// Lesson routes
router.get('/:courseId/lessons/:lessonId', protect, getLessonById);
router.post('/:courseId/lessons', protect, instructor, addLesson);
router.put('/:courseId/lessons/:lessonId', protect, instructor, updateLesson);
router.delete('/:courseId/lessons/:lessonId', protect, instructor, deleteLesson);
router.post('/:courseId/lessons/:lessonId/complete', protect, markLessonComplete);

// Quiz routes
router.get('/:courseId/lessons/:lessonId/quiz', protect, getLessonQuiz);
router.post('/:courseId/lessons/:lessonId/quiz', protect, instructor, addQuizToLesson);
router.put('/:courseId/lessons/:lessonId/quiz', protect, instructor, updateLessonQuiz);
router.post('/:courseId/lessons/:lessonId/quiz/submit', protect, submitQuizAnswers);

// Module quiz routes
router.get('/:courseId/module-quiz', protect, getModuleQuiz);
router.put('/:courseId/module-quiz', protect, instructor, updateModuleQuiz);
router.post('/:courseId/module-quiz/submit', protect, submitModuleQuizAnswers);

export default router;