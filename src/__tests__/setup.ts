import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

let mongoServer: MongoMemoryServer;

// Setup before all tests
beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
});

// Cleanup after each test
afterEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Cleanup after all tests
afterAll(async () => {
  // Close database connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  
  // Stop the in-memory MongoDB instance
  await mongoServer.stop();
});

// Global test utilities
global.testUtils = {
  // Helper to create test user
  createTestUser: async (userData = {}) => {
    const User = mongoose.model('User');
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
  createTestCourse: async (courseData = {}, instructorId?: string) => {
    const Course = mongoose.model('Course');
    const defaultCourse = {
      title: 'Test Course',
      description: 'A test course description',
      category: 'Technology',
      level: 'beginner',
      price: 99.99,
      duration: 10,
      tags: ['test', 'course'],
      instructor: instructorId || new mongoose.Types.ObjectId(),
      isPublished: true,
    };
    
    const course = new Course({ ...defaultCourse, ...courseData });
    return await course.save();
  },
  
  // Helper to create test lesson
  createTestLesson: async (lessonData = {}, courseId?: string) => {
    const Lesson = mongoose.model('Lesson');
    const defaultLesson = {
      title: 'Test Lesson',
      description: 'A test lesson description',
      content: 'Test lesson content',
      order: 1,
      duration: 30,
      course: courseId || new mongoose.Types.ObjectId(),
      isPreview: false,
    };
    
    const lesson = new Lesson({ ...defaultLesson, ...lessonData });
    return await lesson.save();
  },
  
  // Helper to generate JWT token for testing
  generateTestToken: (userId: string, role = 'student') => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  },
};

// Extend global namespace for TypeScript
declare global {
  var testUtils: {
    createTestUser: (userData?: any) => Promise<any>;
    createTestCourse: (courseData?: any, instructorId?: string) => Promise<any>;
    createTestLesson: (lessonData?: any, courseId?: string) => Promise<any>;
    generateTestToken: (userId: string, role?: string) => string;
  };
}