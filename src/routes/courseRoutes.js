"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseController_1 = require("../controllers/courseController");
const lessonController_1 = require("../controllers/lessonController");
const quizController_1 = require("../controllers/quizController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.get('/', courseController_1.getCourses);
router.get('/:id', courseController_1.getCourseById);
// Protected routes
router.post('/', auth_1.protect, (0, auth_1.authorize)('instructor', 'admin'), courseController_1.createCourse);
router.put('/:id', auth_1.protect, (0, auth_1.authorize)('instructor', 'admin'), courseController_1.updateCourse);
router.delete('/:id', auth_1.protect, (0, auth_1.authorize)('instructor', 'admin'), courseController_1.deleteCourse);
router.post('/:id/enroll', auth_1.protect, courseController_1.enrollCourse);
// Instructor routes
router.get('/instructor/courses', auth_1.protect, (0, auth_1.authorize)('instructor', 'admin'), courseController_1.getInstructorCourses);
// Student routes
router.get('/student/enrolled', auth_1.protect, courseController_1.getEnrolledCourses);
// Lesson routes
router.get('/:courseId/lessons/:lessonId', auth_1.protect, lessonController_1.getLessonById);
router.post('/:courseId/lessons', auth_1.protect, (0, auth_1.authorize)('instructor', 'admin'), lessonController_1.addLesson);
router.put('/:courseId/lessons/:lessonId', auth_1.protect, (0, auth_1.authorize)('instructor', 'admin'), lessonController_1.updateLesson);
router.delete('/:courseId/lessons/:lessonId', auth_1.protect, (0, auth_1.authorize)('instructor', 'admin'), lessonController_1.deleteLesson);
router.post('/:courseId/lessons/:lessonId/complete', auth_1.protect, lessonController_1.markLessonComplete);
// Quiz routes
router.get('/:courseId/lessons/:lessonId/quiz', auth_1.protect, quizController_1.getLessonQuiz);
router.post('/:courseId/lessons/:lessonId/quiz', auth_1.protect, (0, auth_1.authorize)('instructor', 'admin'), quizController_1.addQuizToLesson);
router.put('/:courseId/lessons/:lessonId/quiz', auth_1.protect, (0, auth_1.authorize)('instructor', 'admin'), quizController_1.updateLessonQuiz);
router.post('/:courseId/lessons/:lessonId/quiz/submit', auth_1.protect, quizController_1.submitQuizAnswers);
// Module quiz routes
router.get('/:courseId/module-quiz', auth_1.protect, quizController_1.getModuleQuiz);
router.put('/:courseId/module-quiz', auth_1.protect, (0, auth_1.authorize)('instructor', 'admin'), quizController_1.updateModuleQuiz);
router.post('/:courseId/module-quiz/submit', auth_1.protect, quizController_1.submitModuleQuizAnswers);
exports.default = router;
