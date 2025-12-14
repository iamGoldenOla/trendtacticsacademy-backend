"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aiController_1 = require("../controllers/aiController");
const auth_1 = require("../middleware/auth");
const validateRequest_1 = require("../middleware/validateRequest");
const { body, param, query } = require('express-validator');
const router = express_1.default.Router();
// Validation schemas
const startSessionValidation = [
    body('courseId').optional().isMongoId().withMessage('Invalid course ID'),
    body('lessonId').optional().isMongoId().withMessage('Invalid lesson ID'),
    body('topic').optional().isString().trim().isLength({ min: 1, max: 200 }).withMessage('Topic must be 1-200 characters'),
    body('userLevel').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid user level'),
];
const chatMessageValidation = [
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('message').isString().trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters'),
    body('context').optional().isObject().withMessage('Context must be an object'),
];
const recommendationsValidation = [
    body('courseId').optional().isMongoId().withMessage('Invalid course ID'),
    body('currentProgress').optional().isNumeric().isFloat({ min: 0, max: 100 }).withMessage('Progress must be 0-100'),
    body('learningGoals').optional().isArray().withMessage('Learning goals must be an array'),
];
const generateContentValidation = [
    body('type').isIn(['quiz', 'scenario', 'exercise', 'summary']).withMessage('Invalid content type'),
    body('courseId').isMongoId().withMessage('Course ID is required'),
    body('lessonId').optional().isMongoId().withMessage('Invalid lesson ID'),
    body('topic').isString().trim().isLength({ min: 1, max: 200 }).withMessage('Topic is required'),
    body('difficulty').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty level'),
    body('count').optional().isInt({ min: 1, max: 20 }).withMessage('Count must be 1-20'),
];
const analyzeProgressValidation = [
    body('courseId').isMongoId().withMessage('Course ID is required'),
    body('timeframe').optional().isIn(['week', 'month', 'all']).withMessage('Invalid timeframe'),
];
const personalizePathValidation = [
    body('courseId').isMongoId().withMessage('Course ID is required'),
    body('learningStyle').optional().isIn(['visual', 'auditory', 'kinesthetic', 'reading']).withMessage('Invalid learning style'),
    body('goals').optional().isArray().withMessage('Goals must be an array'),
    body('timeAvailable').optional().isNumeric().isFloat({ min: 1, max: 168 }).withMessage('Time available must be 1-168 hours'),
];
const sessionIdValidation = [
    param('sessionId').notEmpty().withMessage('Session ID is required'),
];
const analyticsValidation = [
    query('timeframe').optional().isIn(['week', 'month', 'all']).withMessage('Invalid timeframe'),
];
// AI Tutor Session Routes
/**
 * @route   POST /api/ai/session/start
 * @desc    Start new AI tutor session
 * @access  Private
 */
router.post('/session/start', auth_1.protect, startSessionValidation, validateRequest_1.validateRequest, aiController_1.startTutorSession);
/**
 * @route   GET /api/ai/session/:sessionId
 * @desc    Get AI session by ID
 * @access  Private
 */
router.get('/session/:sessionId', auth_1.protect, sessionIdValidation, validateRequest_1.validateRequest, aiController_1.getSession);
/**
 * @route   POST /api/ai/chat
 * @desc    Send message to AI tutor
 * @access  Private
 */
router.post('/chat', auth_1.protect, chatMessageValidation, validateRequest_1.validateRequest, aiController_1.sendChatMessage);
// AI Recommendations Routes
/**
 * @route   POST /api/ai/recommendations
 * @desc    Get AI-powered learning recommendations
 * @access  Private
 */
router.post('/recommendations', auth_1.protect, recommendationsValidation, validateRequest_1.validateRequest, aiController_1.getRecommendations);
// AI Analytics Routes
/**
 * @route   GET /api/ai/analytics
 * @desc    Get AI analytics for user learning patterns
 * @access  Private
 */
router.get('/analytics', auth_1.protect, analyticsValidation, validateRequest_1.validateRequest, aiController_1.getAnalytics);
/**
 * @route   POST /api/ai/analyze-progress
 * @desc    Analyze user progress with AI insights
 * @access  Private
 */
router.post('/analyze-progress', auth_1.protect, analyzeProgressValidation, validateRequest_1.validateRequest, aiController_1.analyzeProgress);
// AI Content Generation Routes (Instructor/Admin only)
/**
 * @route   POST /api/ai/generate
 * @desc    Generate AI-powered content
 * @access  Private (Instructor/Admin)
 */
router.post('/generate', auth_1.protect, (0, auth_1.authorize)('instructor', 'admin'), generateContentValidation, validateRequest_1.validateRequest, aiController_1.generateContent);
// AI Personalization Routes
/**
 * @route   POST /api/ai/personalize-path
 * @desc    Get personalized learning path
 * @access  Private
 */
router.post('/personalize-path', auth_1.protect, personalizePathValidation, validateRequest_1.validateRequest, aiController_1.personalizeLearningPath);
// Health check route for AI service
/**
 * @route   GET /api/ai/health
 * @desc    Check AI service health
 * @access  Private (Admin only)
 */
router.get('/health', auth_1.protect, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        // Basic health check - you can enhance this
        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                trendyAI: {
                    status: process.env.TRENDY_AI_API_KEY ? 'configured' : 'not_configured',
                    baseURL: process.env.TRENDY_AI_BASE_URL || 'not_set',
                },
                database: 'connected', // Assuming DB is connected if we reach here
            },
            version: '1.0.0',
        };
        res.json({
            success: true,
            data: healthStatus,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'AI service health check failed',
            error: process.env.NODE_ENV === 'development' ? error : undefined,
        });
    }
});
exports.default = router;
