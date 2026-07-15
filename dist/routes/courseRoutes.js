"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabaseCourseController_1 = require("../controllers/supabaseCourseController");
const lessonController_1 = require("../controllers/lessonController");
const supabaseProgressController_1 = require("../controllers/supabaseProgressController");
const quizController_1 = require("../controllers/quizController");
const supabaseAuth_1 = require("../middleware/supabaseAuth");
const router = express_1.default.Router();
// Public routes
router.get('/', supabaseCourseController_1.getCourses);
router.get('/:id', supabaseCourseController_1.getCourseById);
// Protected routes
router.post('/', supabaseAuth_1.protect, supabaseAuth_1.instructor, supabaseCourseController_1.createCourse);
router.put('/:id', supabaseAuth_1.protect, supabaseAuth_1.instructor, supabaseCourseController_1.updateCourse);
router.delete('/:id', supabaseAuth_1.protect, supabaseAuth_1.instructor, supabaseCourseController_1.deleteCourse);
router.post('/:id/enroll', supabaseAuth_1.protect, supabaseCourseController_1.enrollCourse);
// Instructor routes
router.get('/instructor/courses', supabaseAuth_1.protect, supabaseAuth_1.instructor, supabaseCourseController_1.getInstructorCourses);
// Student routes
router.get('/student/enrolled', supabaseAuth_1.protect, supabaseCourseController_1.getEnrolledCourses);
// Lesson routes
router.get('/:courseId/lessons/:lessonId', supabaseAuth_1.protect, lessonController_1.getLessonById);
router.post('/:courseId/lessons', supabaseAuth_1.protect, supabaseAuth_1.instructor, lessonController_1.addLesson);
router.put('/:courseId/lessons/:lessonId', supabaseAuth_1.protect, supabaseAuth_1.instructor, lessonController_1.updateLesson);
router.delete('/:courseId/lessons/:lessonId', supabaseAuth_1.protect, supabaseAuth_1.instructor, lessonController_1.deleteLesson);
router.post('/:courseId/lessons/:lessonId/complete', supabaseAuth_1.protect, supabaseProgressController_1.markLessonComplete);
// Quiz routes
router.get('/:courseId/lessons/:lessonId/quiz', supabaseAuth_1.protect, quizController_1.getLessonQuiz);
router.post('/:courseId/lessons/:lessonId/quiz', supabaseAuth_1.protect, supabaseAuth_1.instructor, quizController_1.addQuizToLesson);
router.put('/:courseId/lessons/:lessonId/quiz', supabaseAuth_1.protect, supabaseAuth_1.instructor, quizController_1.updateLessonQuiz);
router.post('/:courseId/lessons/:lessonId/quiz/submit', supabaseAuth_1.protect, quizController_1.submitQuizAnswers);
// Module quiz routes
router.get('/:courseId/module-quiz', supabaseAuth_1.protect, quizController_1.getModuleQuiz);
router.put('/:courseId/module-quiz', supabaseAuth_1.protect, supabaseAuth_1.instructor, quizController_1.updateModuleQuiz);
router.post('/:courseId/module-quiz/submit', supabaseAuth_1.protect, quizController_1.submitModuleQuizAnswers);
exports.default = router;
