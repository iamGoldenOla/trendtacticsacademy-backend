"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const dotenv_1 = __importDefault(require("dotenv"));
// Load test environment variables
dotenv_1.default.config({ path: '.env.test' });
let mongoServer;
// Setup before all tests
beforeAll(async () => {
    // Create in-memory MongoDB instance
    mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    // Connect to the in-memory database
    await mongoose_1.default.connect(mongoUri);
});
// Cleanup after each test
afterEach(async () => {
    // Clear all collections
    const collections = mongoose_1.default.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
});
// Cleanup after all tests
afterAll(async () => {
    // Close database connection
    await mongoose_1.default.connection.dropDatabase();
    await mongoose_1.default.connection.close();
    // Stop the in-memory MongoDB instance
    await mongoServer.stop();
});
// Global test utilities
global.testUtils = {
    // Helper to create test user
    createTestUser: async (userData = {}) => {
        const User = mongoose_1.default.model('User');
        const defaultUser = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            role: 'student',
            isEmailVerified: true,
            isActive: true,
        };
        const user = new User({ ...defaultUser, ...userData });
        return await user.save();
    },
    // Helper to create test course
    createTestCourse: async (courseData = {}, instructorId) => {
        const Course = mongoose_1.default.model('Course');
        const defaultCourse = {
            title: 'Test Course',
            description: 'A test course description',
            category: 'Technology',
            level: 'beginner',
            price: 99.99,
            duration: 10,
            tags: ['test', 'course'],
            instructor: instructorId || new mongoose_1.default.Types.ObjectId(),
            isPublished: true,
        };
        const course = new Course({ ...defaultCourse, ...courseData });
        return await course.save();
    },
    // Helper to create test lesson
    createTestLesson: async (lessonData = {}, courseId) => {
        const Lesson = mongoose_1.default.model('Lesson');
        const defaultLesson = {
            title: 'Test Lesson',
            description: 'A test lesson description',
            content: 'Test lesson content',
            order: 1,
            duration: 30,
            course: courseId || new mongoose_1.default.Types.ObjectId(),
            isPreview: false,
        };
        const lesson = new Lesson({ ...defaultLesson, ...lessonData });
        return await lesson.save();
    },
    // Helper to generate JWT token for testing
    generateTestToken: (userId, role = 'student') => {
        const jwt = require('jsonwebtoken');
        return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
    },
};
