"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSession = exports.personalizeLearningPath = exports.analyzeProgress = exports.generateContent = exports.getAnalytics = exports.getRecommendations = exports.sendChatMessage = exports.startTutorSession = void 0;
const User_1 = __importDefault(require("../models/User"));
const Course_1 = __importDefault(require("../models/Course"));
const Progress_1 = __importDefault(require("../models/Progress"));
const AISession_1 = require("../models/AISession");
const aiService_1 = require("../services/aiService");
const asyncHandler_1 = require("../middleware/asyncHandler");
const AppError_1 = require("../utils/AppError");
/**
 * AI Controller for TrendyAI Integration
 * Handles all AI-powered features including tutoring, recommendations, and analytics
 */
/**
 * @desc    Start new AI tutor session
 * @route   POST /api/ai/session/start
 * @access  Private
 */
exports.startTutorSession = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    var _a;
    const { courseId, lessonId, topic, userLevel } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        throw new AppError_1.AppError('User not authenticated', 401);
    }
    // Validate course if provided
    if (courseId) {
        const course = await Course_1.default.findById(courseId);
        if (!course) {
            throw new AppError_1.AppError('Course not found', 404);
        }
    }
    // Get user context for personalization
    const user = await User_1.default.findById(userId).select('-password');
    if (!user) {
        throw new AppError_1.AppError('User not found', 404);
    }
    // Get user's progress if course is specified
    let userProgress = null;
    if (courseId) {
        userProgress = await Progress_1.default.findOne({ user: userId, course: courseId });
    }
    // Create session context
    const sessionContext = {
        userId,
        courseId,
        lessonId,
        topic,
        userLevel: userLevel || 'beginner',
        userProgress: (userProgress === null || userProgress === void 0 ? void 0 : userProgress.progressPercentage) || 0,
        learningStyle: 'visual', // Default learning style
        previousSessions: await AISession_1.AISession.countDocuments({ user: userId }),
    };
    try {
        // Call TrendyAI service to start session
        const aiResponse = await aiService_1.aiService.startSession(sessionContext);
        // Create session record in database
        const session = await AISession_1.AISession.create({
            user: userId,
            course: courseId,
            lesson: lessonId,
            sessionId: aiResponse.sessionId,
            context: sessionContext,
            messages: [{
                    role: 'system',
                    content: aiResponse.welcomeMessage,
                    timestamp: new Date(),
                }],
            status: 'active',
        });
        res.status(201).json({
            success: true,
            data: {
                id: session._id,
                sessionId: aiResponse.sessionId,
                welcomeMessage: aiResponse.welcomeMessage,
                context: sessionContext,
                createdAt: session.createdAt,
            },
        });
    }
    catch (error) {
        console.error('AI Session Start Error:', error);
        throw new AppError_1.AppError('Failed to start AI tutor session', 500);
    }
});
/**
 * @desc    Send message to AI tutor
 * @route   POST /api/ai/chat
 * @access  Private
 */
exports.sendChatMessage = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    var _a;
    const { sessionId, message, context } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId || !sessionId || !message) {
        throw new AppError_1.AppError('Missing required fields', 400);
    }
    // Find session
    const session = await AISession_1.AISession.findOne({
        sessionId,
        user: userId,
        status: 'active'
    });
    if (!session) {
        throw new AppError_1.AppError('AI session not found or expired', 404);
    }
    try {
        // Add user message to session
        const userMessage = {
            role: 'user',
            content: message,
            timestamp: new Date(),
        };
        session.messages.push(userMessage);
        // Prepare context for AI
        const aiContext = {
            ...session.context,
            ...context,
            conversationHistory: session.messages.slice(-10), // Last 10 messages for context
        };
        // Call TrendyAI service
        const aiResponse = await aiService_1.aiService.sendMessage(sessionId, message, aiContext);
        // Add AI response to session
        const aiMessage = {
            role: 'assistant',
            content: aiResponse.content,
            timestamp: new Date(),
            metadata: aiResponse.metadata,
        };
        session.messages.push(aiMessage);
        session.lastActivity = new Date();
        await session.save();
        res.json({
            success: true,
            data: aiMessage,
        });
    }
    catch (error) {
        console.error('AI Chat Error:', error);
        throw new AppError_1.AppError('Failed to process AI chat message', 500);
    }
});
/**
 * @desc    Get AI-powered learning recommendations
 * @route   POST /api/ai/recommendations
 * @access  Private
 */
exports.getRecommendations = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    var _a;
    const { courseId, currentProgress, learningGoals } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        throw new AppError_1.AppError('User not authenticated', 401);
    }
    // Get user data
    const user = await User_1.default.findById(userId).select('-password');
    if (!user) {
        throw new AppError_1.AppError('User not found', 404);
    }
    // Get user's progress and performance data
    const userProgress = await Progress_1.default.find({ user: userId })
        .populate('course', 'title category level')
        .sort({ updatedAt: -1 })
        .limit(10);
    // Get user's enrolled courses
    const enrolledCourses = await Course_1.default.find({
        _id: { $in: user.enrolledCourses }
    }).select('title category level topics');
    const recommendationContext = {
        userId,
        courseId,
        currentProgress,
        learningGoals: learningGoals || [],
        userProfile: {
            level: 'beginner', // Default level
            interests: [], // Not available in current model
            learningStyle: 'visual', // Default learning style
            completedCourses: userProgress.filter((p) => p.progressPercentage === 100).length,
            averageProgress: userProgress.reduce((acc, p) => acc + p.progressPercentage, 0) / userProgress.length || 0,
        },
        enrolledCourses: enrolledCourses.map((course) => ({
            id: course._id,
            title: course.title,
            category: course.category,
            level: course.level,
            topics: course.topics,
        })),
    };
    try {
        const recommendations = await aiService_1.aiService.getRecommendations(recommendationContext);
        res.json({
            success: true,
            data: recommendations,
        });
    }
    catch (error) {
        console.error('AI Recommendations Error:', error);
        throw new AppError_1.AppError('Failed to get AI recommendations', 500);
    }
});
/**
 * @desc    Get AI analytics for user learning patterns
 * @route   GET /api/ai/analytics
 * @access  Private
 */
exports.getAnalytics = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    var _a, _b;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { timeframe = 'month' } = req.query;
    if (!userId) {
        throw new AppError_1.AppError('User not authenticated', 401);
    }
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (timeframe) {
        case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        case 'all':
        default:
            startDate = new Date(0); // Beginning of time
    }
    // Get user's learning data
    const user = await User_1.default.findById(userId).select('-password');
    const userProgress = await Progress_1.default.find({
        user: userId,
        updatedAt: { $gte: startDate }
    }).populate('course', 'title category level duration');
    const aiSessions = await AISession_1.AISession.find({
        user: userId,
        createdAt: { $gte: startDate }
    });
    const analyticsContext = {
        userId,
        timeframe,
        userData: {
            totalCourses: ((_b = user === null || user === void 0 ? void 0 : user.enrolledCourses) === null || _b === void 0 ? void 0 : _b.length) || 0,
            completedCourses: userProgress.filter((p) => p.progressPercentage === 100).length,
            averageProgress: userProgress.reduce((acc, p) => acc + p.progressPercentage, 0) / userProgress.length || 0,
            totalStudyTime: userProgress.reduce((acc, p) => acc + (p.timeSpent || 0), 0),
            aiInteractions: aiSessions.length,
            learningStreak: 0, // Not available in current model
        },
        progressData: userProgress.map((p) => ({
            courseId: p.course._id,
            courseTitle: p.course.title,
            category: p.course.category,
            level: p.course.level,
            progress: p.progressPercentage,
            timeSpent: p.timeSpent,
            lastAccessed: p.updatedAt,
        })),
        sessionData: aiSessions.map((s) => ({
            sessionId: s.sessionId,
            duration: s.messages.length,
            topics: s.context.topic,
            createdAt: s.createdAt,
        })),
    };
    try {
        const analytics = await aiService_1.aiService.getAnalytics(analyticsContext);
        res.json({
            success: true,
            data: analytics,
        });
    }
    catch (error) {
        console.error('AI Analytics Error:', error);
        throw new AppError_1.AppError('Failed to get AI analytics', 500);
    }
});
/**
 * @desc    Generate AI-powered content
 * @route   POST /api/ai/generate
 * @access  Private (Instructor/Admin)
 */
exports.generateContent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    var _a;
    const { type, courseId, lessonId, topic, difficulty, count = 5 } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        throw new AppError_1.AppError('User not authenticated', 401);
    }
    // Check if user is instructor or admin
    const user = await User_1.default.findById(userId);
    if (!user || !['instructor', 'admin'].includes(user.role)) {
        throw new AppError_1.AppError('Access denied. Instructor or admin role required.', 403);
    }
    // Validate course
    const course = await Course_1.default.findById(courseId);
    if (!course) {
        throw new AppError_1.AppError('Course not found', 404);
    }
    // Check if user is the instructor of this course (unless admin)
    if (user.role === 'instructor' && course.instructor.toString() !== userId) {
        throw new AppError_1.AppError('Access denied. You can only generate content for your own courses.', 403);
    }
    const generationContext = {
        type,
        courseId,
        lessonId,
        topic,
        difficulty,
        count,
        courseContext: {
            title: course.title,
            description: course.description,
            level: course.level,
            category: course.category,
            topics: course.topics,
        },
    };
    try {
        const generatedContent = await aiService_1.aiService.generateContent(generationContext);
        res.json({
            success: true,
            data: generatedContent,
        });
    }
    catch (error) {
        console.error('AI Content Generation Error:', error);
        throw new AppError_1.AppError('Failed to generate AI content', 500);
    }
});
/**
 * @desc    Analyze user progress with AI insights
 * @route   POST /api/ai/analyze-progress
 * @access  Private
 */
exports.analyzeProgress = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    var _a;
    const { courseId, timeframe = 'month' } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        throw new AppError_1.AppError('User not authenticated', 401);
    }
    // Get user progress data
    const progress = await Progress_1.default.findOne({ user: userId, course: courseId });
    if (!progress) {
        throw new AppError_1.AppError('Progress data not found', 404);
    }
    // Get course data separately
    const course = await Course_1.default.findById(courseId);
    if (!course) {
        throw new AppError_1.AppError('Course not found', 404);
    }
    // Get AI sessions for this course
    const aiSessions = await AISession_1.AISession.find({
        user: userId,
        course: courseId,
    }).sort({ createdAt: -1 }).limit(10);
    const analysisContext = {
        userId,
        courseId,
        timeframe,
        progressData: {
            completionPercentage: progress.progressPercentage,
            timeSpent: 0, // timeSpent not available in current Progress model
            lessonsCompleted: progress.completedLessons,
            quizzesCompleted: [], // Not available in current model
            lastAccessed: progress.updatedAt,
        },
        courseData: {
            title: course.title,
            level: course.level,
            totalLessons: course.lessons.length,
            topics: course.topics,
        },
        aiInteractions: aiSessions.map((s) => ({
            sessionId: s.sessionId,
            messageCount: s.messages.length,
            topics: s.context.topic,
            duration: s.lastActivity ?
                (s.lastActivity.getTime() - s.createdAt.getTime()) / 1000 / 60 : 0, // minutes
        })),
    };
    try {
        const analysis = await aiService_1.aiService.analyzeProgress(analysisContext);
        res.json({
            success: true,
            data: analysis,
        });
    }
    catch (error) {
        console.error('AI Progress Analysis Error:', error);
        throw new AppError_1.AppError('Failed to analyze progress', 500);
    }
});
/**
 * @desc    Get personalized learning path
 * @route   POST /api/ai/personalize-path
 * @access  Private
 */
exports.personalizeLearningPath = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    var _a;
    const { courseId, learningStyle, goals, timeAvailable } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        throw new AppError_1.AppError('User not authenticated', 401);
    }
    // Get course and user data
    const course = await Course_1.default.findById(courseId);
    const user = await User_1.default.findById(userId).select('-password');
    const progress = await Progress_1.default.findOne({ user: userId, course: courseId });
    if (!course) {
        throw new AppError_1.AppError('Course not found', 404);
    }
    if (!user) {
        throw new AppError_1.AppError('User not found', 404);
    }
    const personalizationContext = {
        userId,
        courseId,
        userProfile: {
            level: 'beginner', // Default level
            learningStyle: learningStyle || 'visual',
            goals: goals || [],
            timeAvailable: timeAvailable || 5, // hours per week
            currentProgress: (progress === null || progress === void 0 ? void 0 : progress.progressPercentage) || 0,
            completedLessons: (progress === null || progress === void 0 ? void 0 : progress.completedLessons) || [],
        },
        courseData: {
            title: course.title,
            level: course.level,
            lessons: course.lessons,
            topics: course.topics,
            estimatedDuration: course.duration,
        },
    };
    try {
        const personalizedPath = await aiService_1.aiService.personalizeLearningPath(personalizationContext);
        res.json({
            success: true,
            data: personalizedPath,
        });
    }
    catch (error) {
        console.error('AI Personalization Error:', error);
        throw new AppError_1.AppError('Failed to personalize learning path', 500);
    }
});
/**
 * @desc    Get AI session by ID
 * @route   GET /api/ai/session/:sessionId
 * @access  Private
 */
exports.getSession = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    var _a;
    const { sessionId } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        throw new AppError_1.AppError('User not authenticated', 401);
    }
    const session = await AISession_1.AISession.findOne({
        sessionId,
        user: userId
    }).populate('course', 'title').populate('lesson', 'title');
    if (!session) {
        throw new AppError_1.AppError('AI session not found', 404);
    }
    res.json({
        success: true,
        data: session,
    });
});
