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
exports.submitModuleQuizAnswers = exports.updateModuleQuiz = exports.getModuleQuiz = exports.submitQuizAnswers = exports.updateLessonQuiz = exports.addQuizToLesson = exports.getLessonQuiz = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Course_1 = __importDefault(require("../models/Course"));
const Progress_1 = __importDefault(require("../models/Progress"));
/**
 * @desc    Get quiz for a lesson
 * @route   GET /api/courses/:courseId/lessons/:lessonId/quiz
 * @access  Private
 */
const getLessonQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, lessonId } = req.params;
        const course = yield Course_1.default.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Check if user is enrolled or is the instructor
        const isEnrolled = req.user && Array.isArray(course.enrolledStudents) && course.enrolledStudents.some((student) => student.toString() === req.user._id.toString());
        const isInstructor = req.user && course.instructor.toString() === req.user._id.toString();
        if (!isEnrolled && !isInstructor && req.user && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not enrolled in this course' });
        }
        // Find the lesson
        // Find the lesson using find method instead of id method
        const lesson = Array.isArray(course.lessons) ?
            course.lessons.find((l) => l && l._id && l._id.toString && l._id.toString() === lessonId) :
            null;
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        if (!lesson.quiz || lesson.quiz.length === 0) {
            return res.status(404).json({ message: 'No quiz found for this lesson' });
        }
        // Return quiz without correct answers for students
        if (isEnrolled && !isInstructor && req.user && req.user.role !== 'admin') {
            const sanitizedQuiz = lesson.quiz.map(q => {
                // Check if q has the required properties
                if (q && typeof q === 'object' && '_id' in q && 'question' in q && 'options' in q) {
                    return {
                        _id: q._id,
                        question: q.question,
                        options: q.options
                    };
                }
                // Return a default structure if properties are missing
                return {
                    _id: q._id || null,
                    question: '',
                    options: []
                };
            });
            return res.json(sanitizedQuiz);
        }
        // Return full quiz with answers for instructors and admins
        // Ensure lesson is an object with a quiz property before accessing it
        if (lesson && typeof lesson === 'object' && 'quiz' in lesson) {
            res.json(lesson.quiz);
        }
        else {
            res.status(404).json({ message: 'Quiz not found for this lesson' });
        }
    }
    catch (error) {
        console.error('Get lesson quiz error:', error);
        res.status(500).json({ message: 'Server error fetching lesson quiz' });
    }
});
exports.getLessonQuiz = getLessonQuiz;
/**
 * @desc    Add quiz to lesson
 * @route   POST /api/courses/:courseId/lessons/:lessonId/quiz
 * @access  Private/Instructor
 */
const addQuizToLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, lessonId } = req.params;
        const quizQuestions = req.body.questions;
        if (!quizQuestions || !Array.isArray(quizQuestions) || quizQuestions.length === 0) {
            return res.status(400).json({ message: 'Please provide quiz questions' });
        }
        const course = yield Course_1.default.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Check if user is the course instructor
        if (req.user && course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to add quiz to this lesson' });
        }
        // Find the lesson using find method instead of id method
        const lesson = Array.isArray(course.lessons) ?
            course.lessons.find((l) => l && l._id && l._id.toString && l._id.toString() === lessonId) :
            null;
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        // Add quiz to lesson
        lesson.quiz = quizQuestions;
        yield course.save();
        res.json(lesson.quiz);
    }
    catch (error) {
        console.error('Add quiz error:', error);
        res.status(500).json({ message: 'Server error adding quiz' });
    }
});
exports.addQuizToLesson = addQuizToLesson;
/**
 * @desc    Update quiz for a lesson
 * @route   PUT /api/courses/:courseId/lessons/:lessonId/quiz
 * @access  Private/Instructor
 */
const updateLessonQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, lessonId } = req.params;
        const quizQuestions = req.body.questions;
        if (!quizQuestions || !Array.isArray(quizQuestions)) {
            return res.status(400).json({ message: 'Please provide quiz questions' });
        }
        const course = yield Course_1.default.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Check if user is the course instructor
        if (req.user && course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update quiz for this lesson' });
        }
        // Find the lesson
        // Find the lesson using find method instead of id method
        const lesson = Array.isArray(course.lessons) ?
            course.lessons.find((l) => l && l._id && l._id.toString && l._id.toString() === lessonId) :
            null;
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        // Update quiz
        lesson.quiz = quizQuestions;
        yield course.save();
        res.json(lesson.quiz);
    }
    catch (error) {
        console.error('Update quiz error:', error);
        res.status(500).json({ message: 'Server error updating quiz' });
    }
});
exports.updateLessonQuiz = updateLessonQuiz;
/**
 * @desc    Submit quiz answers
 * @route   POST /api/courses/:courseId/lessons/:lessonId/quiz/submit
 * @access  Private
 */
const submitQuizAnswers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, lessonId } = req.params;
        const { answers } = req.body;
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'Please provide answers' });
        }
        const course = yield Course_1.default.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Check if user is enrolled
        const isEnrolled = req.user && course.enrolledStudents && Array.isArray(course.enrolledStudents) && course.enrolledStudents.some((student) => student && student.toString && student.toString() === req.user._id.toString());
        if (!isEnrolled && req.user && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not enrolled in this course' });
        }
        // Find the lesson
        // Find the lesson using find method instead of id method
        const lesson = Array.isArray(course.lessons) ?
            course.lessons.find((l) => l && l._id && l._id.toString && l._id.toString() === lessonId) :
            null;
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        if (!lesson.quiz || lesson.quiz.length === 0) {
            return res.status(404).json({ message: 'No quiz found for this lesson' });
        }
        // Grade the quiz
        const results = answers.map(answer => {
            const question = lesson && typeof lesson === 'object' && 'quiz' in lesson && lesson.quiz && Array.isArray(lesson.quiz)
                ? lesson.quiz.find((q) => q && q._id && q._id.toString() === answer.questionId)
                : null;
            if (!question) {
                return {
                    questionId: answer.questionId,
                    correct: false,
                    message: 'Question not found'
                };
            }
            // Ensure question is a proper IQuizQuestion object with required properties
            if ('correctAnswer' in question && 'question' in question) {
                const isCorrect = question.correctAnswer === answer.selectedOption;
                return {
                    questionId: answer.questionId,
                    question: question.question,
                    correct: isCorrect,
                    selectedOption: answer.selectedOption,
                    correctOption: isCorrect ? undefined : question.correctAnswer,
                    explanation: question.explanation
                };
            }
            else {
                // Handle case where question might be an ObjectId
                return {
                    questionId: answer.questionId,
                    correct: false,
                    message: 'Question data not properly loaded'
                };
            }
        });
        // Calculate score
        const totalQuestions = lesson && typeof lesson === 'object' && 'quiz' in lesson && Array.isArray(lesson.quiz)
            ? lesson.quiz.length
            : 0;
        const correctAnswers = results.filter(result => result.correct).length;
        const score = (correctAnswers / totalQuestions) * 100;
        // If score is passing (e.g., >= 70%), mark lesson as completed
        if (score >= 70) {
            // Find or create progress record
            let progress = yield Progress_1.default.findOne({
                user: req.user._id,
                course: courseId
            });
            if (!progress) {
                progress = new Progress_1.default({
                    user: req.user._id,
                    course: courseId,
                    completedLessons: [],
                    progressPercentage: 0,
                    lastAccessed: new Date()
                });
            }
            // Add lesson to completed lessons if not already there
            const lessonIdStr = lessonId.toString();
            const lessonNotCompleted = !progress.completedLessons.some((id) => id && id.toString && id.toString() === lessonIdStr);
            if (lessonNotCompleted) {
                // Convert lessonId to ObjectId if needed
                // Convert string to ObjectId if needed
                const lessonObjectId = typeof lessonId === 'string' ?
                    new mongoose_1.default.Types.ObjectId(lessonId) :
                    lessonId;
                progress.completedLessons.push(lessonObjectId);
                // Calculate progress percentage
                progress.progressPercentage =
                    (progress.completedLessons.length / course.lessons.length) * 100;
                // Update last accessed
                progress.lastAccessed = new Date();
                yield progress.save();
            }
        }
        res.json({
            score,
            totalQuestions,
            correctAnswers,
            passing: score >= 70,
            results
        });
    }
    catch (error) {
        console.error('Submit quiz answers error:', error);
        res.status(500).json({ message: 'Server error submitting quiz answers' });
    }
});
exports.submitQuizAnswers = submitQuizAnswers;
/**
 * @desc    Get module quiz
 * @route   GET /api/courses/:courseId/module-quiz
 * @access  Private
 */
const getModuleQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
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
        if (!course.moduleQuiz || course.moduleQuiz.length === 0) {
            return res.status(404).json({ message: 'No module quiz found for this course' });
        }
        // Return quiz without correct answers for students
        if (isEnrolled && !isInstructor && req.user && req.user.role !== 'admin' && course.moduleQuiz) {
            const sanitizedQuiz = course.moduleQuiz.map(q => {
                // Check if q has the required properties
                if (q && typeof q === 'object' && '_id' in q && 'question' in q && 'options' in q) {
                    return {
                        _id: q._id,
                        question: q.question,
                        options: q.options
                    };
                }
                // Return a default structure if properties are missing
                return {
                    _id: q._id || null,
                    question: '',
                    options: []
                };
            });
            return res.json(sanitizedQuiz);
        }
        // Return full quiz with answers for instructors and admins
        res.json(course.moduleQuiz);
    }
    catch (error) {
        console.error('Get module quiz error:', error);
        res.status(500).json({ message: 'Server error fetching module quiz' });
    }
});
exports.getModuleQuiz = getModuleQuiz;
/**
 * @desc    Add or update module quiz
 * @route   PUT /api/courses/:courseId/module-quiz
 * @access  Private/Instructor
 */
const updateModuleQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        const quizQuestions = req.body.questions;
        if (!quizQuestions || !Array.isArray(quizQuestions)) {
            return res.status(400).json({ message: 'Please provide quiz questions' });
        }
        const course = yield Course_1.default.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Check if user is the course instructor
        if (req.user && course.instructor && course.instructor.toString && course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update module quiz for this course' });
        }
        // Update module quiz
        course.moduleQuiz = quizQuestions;
        yield course.save();
        res.json(course.moduleQuiz);
    }
    catch (error) {
        console.error('Update module quiz error:', error);
        res.status(500).json({ message: 'Server error updating module quiz' });
    }
});
exports.updateModuleQuiz = updateModuleQuiz;
/**
 * @desc    Submit module quiz answers
 * @route   POST /api/courses/:courseId/module-quiz/submit
 * @access  Private
 */
const submitModuleQuizAnswers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        const { answers } = req.body;
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'Please provide answers' });
        }
        const course = yield Course_1.default.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Check if user is enrolled
        const isEnrolled = req.user && course.enrolledStudents && Array.isArray(course.enrolledStudents) && course.enrolledStudents.some((student) => student && student.toString && student.toString() === req.user._id.toString());
        if (!isEnrolled && req.user && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not enrolled in this course' });
        }
        if (!course.moduleQuiz || course.moduleQuiz.length === 0) {
            return res.status(404).json({ message: 'No module quiz found for this course' });
        }
        // Grade the quiz
        const results = answers.map(answer => {
            const question = course.moduleQuiz && course.moduleQuiz.find((q) => q && q._id && q._id.toString() === answer.questionId);
            if (!question) {
                return {
                    questionId: answer.questionId,
                    correct: false,
                    message: 'Question not found'
                };
            }
            // Ensure question is a proper IQuizQuestion object with required properties
            if ('correctAnswer' in question && 'question' in question) {
                const isCorrect = question.correctAnswer === answer.selectedOption;
                return {
                    questionId: answer.questionId,
                    question: question.question,
                    correct: isCorrect,
                    selectedOption: answer.selectedOption,
                    correctOption: isCorrect ? undefined : question.correctAnswer,
                    explanation: question.explanation
                };
            }
            else {
                // Handle case where question might be an ObjectId
                return {
                    questionId: answer.questionId,
                    correct: false,
                    message: 'Question data not properly loaded'
                };
            }
        });
        // Calculate score
        const totalQuestions = course.moduleQuiz.length;
        const correctAnswers = results.filter(result => result.correct).length;
        const score = (correctAnswers / totalQuestions) * 100;
        // If score is passing (e.g., >= 70%), award a badge if available
        if (score >= 70) {
            // Logic for awarding completion badge could be added here
        }
        res.json({
            score,
            totalQuestions,
            correctAnswers,
            passing: score >= 70,
            results
        });
    }
    catch (error) {
        console.error('Submit module quiz answers error:', error);
        res.status(500).json({ message: 'Server error submitting module quiz answers' });
    }
});
exports.submitModuleQuizAnswers = submitModuleQuizAnswers;
