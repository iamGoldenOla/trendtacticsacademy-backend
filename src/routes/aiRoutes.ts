import express from 'express';
import {
  startTutorSession,
  sendChatMessage,
  getRecommendations,
  getAnalytics,
  generateContent,
  analyzeProgress,
  personalizeLearningPath,
  getSession,
} from '../controllers/aiController';
import { protect, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
const { body, param, query } = require('express-validator');

const router = express.Router();

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
router.post(
  '/session/start',
  protect,
  startSessionValidation,
  validateRequest,
  startTutorSession
);

/**
 * @route   GET /api/ai/session/:sessionId
 * @desc    Get AI session by ID
 * @access  Private
 */
router.get(
  '/session/:sessionId',
  protect,
  sessionIdValidation,
  validateRequest,
  getSession
);

/**
 * @route   POST /api/ai/chat
 * @desc    Send message to AI tutor
 * @access  Private
 */
router.post(
  '/chat',
  protect,
  chatMessageValidation,
  validateRequest,
  sendChatMessage
);

// AI Recommendations Routes
/**
 * @route   POST /api/ai/recommendations
 * @desc    Get AI-powered learning recommendations
 * @access  Private
 */
router.post(
  '/recommendations',
  protect,
  recommendationsValidation,
  validateRequest,
  getRecommendations
);

// AI Analytics Routes
/**
 * @route   GET /api/ai/analytics
 * @desc    Get AI analytics for user learning patterns
 * @access  Private
 */
router.get(
  '/analytics',
  protect,
  analyticsValidation,
  validateRequest,
  getAnalytics
);

/**
 * @route   POST /api/ai/analyze-progress
 * @desc    Analyze user progress with AI insights
 * @access  Private
 */
router.post(
  '/analyze-progress',
  protect,
  analyzeProgressValidation,
  validateRequest,
  analyzeProgress
);

// AI Content Generation Routes (Instructor/Admin only)
/**
 * @route   POST /api/ai/generate
 * @desc    Generate AI-powered content
 * @access  Private (Instructor/Admin)
 */
router.post(
  '/generate',
  protect,
  authorize('instructor', 'admin'),
  generateContentValidation,
  validateRequest,
  generateContent
);

// AI Personalization Routes
/**
 * @route   POST /api/ai/personalize-path
 * @desc    Get personalized learning path
 * @access  Private
 */
router.post(
  '/personalize-path',
  protect,
  personalizePathValidation,
  validateRequest,
  personalizeLearningPath
);

// Health check route for AI service
/**
 * @route   GET /api/ai/health
 * @desc    Check AI service health
 * @access  Private (Admin only)
 */
router.get(
  '/health',
  protect,
  authorize('admin'),
  async (req, res) => {
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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'AI service health check failed',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }
);

export default router;