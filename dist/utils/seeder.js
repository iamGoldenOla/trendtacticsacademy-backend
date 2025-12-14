"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const Course_1 = __importDefault(require("../models/Course"));
const Badge_1 = __importDefault(require("../models/Badge"));
const password_1 = require("./password");
// Load env vars
dotenv_1.default.config();
// Connect to DB
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            throw new Error('MongoDB connection string is not defined in environment variables');
        }
        const conn = await mongoose_1.default.connect(mongoURI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};
// Sample data
const createSampleData = async () => {
    try {
        // Clear existing data
        await User_1.default.deleteMany();
        await Course_1.default.deleteMany();
        await Badge_1.default.deleteMany();
        console.log('Data cleared...');
        // Create admin user
        const adminPassword = await (0, password_1.hashPassword)('admin123');
        const admin = await User_1.default.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: adminPassword,
            role: 'admin'
        });
        // Create instructor user
        const instructorPassword = await (0, password_1.hashPassword)('instructor123');
        const instructor = await User_1.default.create({
            name: 'John Instructor',
            email: 'instructor@example.com',
            password: instructorPassword,
            role: 'instructor'
        });
        // Create student user
        const studentPassword = await (0, password_1.hashPassword)('student123');
        const student = await User_1.default.create({
            name: 'Jane Student',
            email: 'student@example.com',
            password: studentPassword,
            role: 'student'
        });
        // Create badges
        const completionBadge = await Badge_1.default.create({
            name: 'Course Completion',
            description: 'Awarded for completing a course',
            icon: 'trophy'
        });
        const perfectScoreBadge = await Badge_1.default.create({
            name: 'Perfect Score',
            description: 'Awarded for achieving a perfect score on a quiz',
            icon: 'star'
        });
        console.log('Sample users and badges created!');
        process.exit(0);
        // Create sample course
        const course = await Course_1.default.create({
            title: 'Introduction to Web Development',
            description: 'Learn the basics of HTML, CSS, and JavaScript',
            instructor: instructor._id,
            thumbnail: 'https://via.placeholder.com/300',
            price: 49.99,
            duration: '4 weeks',
            level: 'Beginner',
            category: 'Web Development',
            topics: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
            lessons: [
                {
                    title: 'HTML Basics',
                    description: 'Learn the fundamentals of HTML',
                    videoUrl: 'https://example.com/video1',
                    content: '<h1>HTML Basics</h1><p>HTML is the standard markup language for Web pages.</p>',
                    duration: 45,
                    order: 1,
                    quiz: [
                        {
                            question: 'What does HTML stand for?',
                            options: [
                                'Hyper Text Markup Language',
                                'High Tech Modern Language',
                                'Hyper Transfer Markup Language',
                                'Home Tool Markup Language'
                            ],
                            correctAnswer: 'Hyper Text Markup Language',
                            explanation: 'HTML stands for Hyper Text Markup Language.'
                        }
                    ]
                },
                {
                    title: 'CSS Fundamentals',
                    description: 'Learn how to style your HTML with CSS',
                    videoUrl: 'https://example.com/video2',
                    content: '<h1>CSS Fundamentals</h1><p>CSS is used to style web pages.</p>',
                    duration: 50,
                    order: 2
                }
            ],
            moduleQuiz: [
                {
                    question: 'Which language is used for styling web pages?',
                    options: ['HTML', 'CSS', 'JavaScript', 'PHP'],
                    correctAnswer: 'CSS',
                    explanation: 'CSS (Cascading Style Sheets) is used for styling web pages.'
                },
                {
                    question: 'Which tag is used to define a hyperlink in HTML?',
                    options: ['<link>', '<a>', '<href>', '<url>'],
                    correctAnswer: '<a>',
                    explanation: 'The <a> tag defines a hyperlink in HTML.'
                }
            ]
        });
        console.log('Sample data created!');
        process.exit(0);
    }
    catch (error) {
        console.error(`Error creating sample data: ${error.message}`);
        process.exit(1);
    }
};
// Run the seeder
connectDB().then(() => {
    createSampleData();
});
