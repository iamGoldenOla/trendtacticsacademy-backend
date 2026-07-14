"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnrolledCourses = exports.getInstructorCourses = exports.enrollCourse = exports.deleteCourse = exports.updateCourse = exports.createCourse = exports.getCourseById = exports.getCourses = void 0;
const axios_1 = __importDefault(require("axios"));
const Course_1 = __importDefault(require("../models/Course"));
const User_1 = __importDefault(require("../models/User"));
const Progress_1 = __importDefault(require("../models/Progress"));
const Purchase_1 = __importDefault(require("../models/Purchase"));
/**
 * @desc    Get all courses
 * @route   GET /api/courses
 * @access  Public
 */
const getCourses = async (req, res) => {
    try {
        const { category, level, search } = req.query;
        // Build filter object
        const filter = {};
        if (category) {
            filter.category = category;
        }
        if (level) {
            filter.level = level;
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        const courses = await Course_1.default.find(filter)
            .populate('instructor', 'name email avatar')
            .select('-lessons.content');
        res.json(courses);
    }
    catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ message: 'Server error fetching courses' });
    }
};
exports.getCourses = getCourses;
/**
 * @desc    Get single course by ID
 * @route   GET /api/courses/:id
 * @access  Public
 */
const getCourseById = async (req, res) => {
    try {
        const course = await Course_1.default.findById(req.params.id)
            .populate('instructor', 'name email avatar')
            .populate('enrolledStudents', 'name email avatar');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    }
    catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({ message: 'Server error fetching course' });
    }
};
exports.getCourseById = getCourseById;
/**
 * @desc    Create a new course
 * @route   POST /api/courses
 * @access  Private/Instructor
 */
const createCourse = async (req, res) => {
    var _a;
    try {
        const { title, description, thumbnail, price, duration, level, category, topics, lessons, moduleQuiz } = req.body;
        // Create course with current user as instructor
        const course = await Course_1.default.create({
            title,
            description,
            instructor: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            thumbnail,
            price,
            duration,
            level,
            category,
            topics,
            lessons: lessons || [],
            moduleQuiz: moduleQuiz || [],
            enrolledStudents: [],
            rating: 0
        });
        res.status(201).json(course);
    }
    catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ message: 'Server error creating course' });
    }
};
exports.createCourse = createCourse;
/**
 * @desc    Update a course
 * @route   PUT /api/courses/:id
 * @access  Private/Instructor
 */
const updateCourse = async (req, res) => {
    try {
        let course = await Course_1.default.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Check if user is the course instructor
        if (req.user && course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }
        // Update course
        course = await Course_1.default.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
        res.json(course);
    }
    catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ message: 'Server error updating course' });
    }
};
exports.updateCourse = updateCourse;
/**
 * @desc    Delete a course
 * @route   DELETE /api/courses/:id
 * @access  Private/Instructor
 */
const deleteCourse = async (req, res) => {
    try {
        const course = await Course_1.default.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Check if user is the course instructor
        if (req.user && course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this course' });
        }
        await course.deleteOne();
        // Also delete all progress records for this course
        await Progress_1.default.deleteMany({ course: req.params.id });
        res.json({ message: 'Course removed' });
    }
    catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ message: 'Server error deleting course' });
    }
};
exports.deleteCourse = deleteCourse;
/**
 * @desc    Enroll in a course
 * @route   POST /api/courses/:id/enroll
 * @access  Private/Student
 */
const enrollCourse = async (req, res) => {
    var _a, _b, _c;
    try {
        const course = await Course_1.default.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Check if user is already enrolled
        const alreadyEnrolled = req.user && course.enrolledStudents.some((student) => student.toString() === req.user._id.toString());
        if (alreadyEnrolled) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }
        const CURRENCY_RATES = {
            'USD': 1.00,
            'NGN': 1500,
            'EUR': 0.92,
            'GBP': 0.79,
            'CAD': 1.35,
            'AUD': 1.52
        };
        // Secure Payment Verification for paid courses
        if (course.price > 0) {
            const { reference, paymentGateway } = req.body;
            if (!reference || !paymentGateway) {
                return res.status(400).json({ message: 'Payment reference and gateway are required for paid courses' });
            }
            if (paymentGateway !== 'paystack' && paymentGateway !== 'flutterwave') {
                return res.status(400).json({ message: 'Invalid payment gateway' });
            }
            // 1. Idempotency Check
            const existingPurchase = await Purchase_1.default.findOne({ reference });
            if (existingPurchase) {
                return res.status(400).json({ message: 'This transaction reference has already been used' });
            }
            let isVerified = false;
            let transactionAmount = 0;
            let transactionCurrency = 'USD';
            try {
                if (paymentGateway === 'paystack') {
                    const secretKey = process.env.PAYSTACK_SECRET_KEY;
                    if (!secretKey) {
                        console.error('PAYSTACK_SECRET_KEY is not defined in environment variables');
                        return res.status(500).json({ message: 'Payment verification config error' });
                    }
                    const response = await axios_1.default.get(`https://api.paystack.co/transaction/verify/${reference}`, {
                        headers: {
                            Authorization: `Bearer ${secretKey}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    const responseData = response.data;
                    if (responseData && responseData.status && responseData.data && responseData.data.status === 'success') {
                        isVerified = true;
                        transactionAmount = responseData.data.amount / 100; // Paystack is in kobo
                        transactionCurrency = responseData.data.currency || 'USD';
                    }
                    else {
                        console.warn(`Paystack verification failed for ref ${reference}:`, response.data);
                    }
                }
                else if (paymentGateway === 'flutterwave') {
                    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
                    if (!secretKey) {
                        console.error('FLUTTERWAVE_SECRET_KEY is not defined in environment variables');
                        return res.status(500).json({ message: 'Payment verification config error' });
                    }
                    const response = await axios_1.default.get(`https://api.flutterwave.com/v3/transactions/${reference}/verify`, {
                        headers: {
                            Authorization: `Bearer ${secretKey}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    const responseData = response.data;
                    if (responseData && responseData.status === 'success' && responseData.data && responseData.data.status === 'successful') {
                        isVerified = true;
                        transactionAmount = responseData.data.amount; // Flutterwave is in standard unit
                        transactionCurrency = responseData.data.currency || 'USD';
                    }
                    else {
                        console.warn(`Flutterwave verification failed for ref ${reference}:`, response.data);
                    }
                }
            }
            catch (err) {
                console.error(`Error calling ${paymentGateway} API for ref ${reference}:`, err.message || err);
                return res.status(400).json({ message: 'Failed to contact payment provider for verification' });
            }
            if (!isVerified) {
                console.warn(`Failed payment verification attempt by user ${(_a = req.user) === null || _a === void 0 ? void 0 : _a._id} for course ${course._id} with ref ${reference} on gateway ${paymentGateway}`);
                return res.status(400).json({ message: 'Payment could not be verified' });
            }
            // Check if currency rate exists
            const rate = CURRENCY_RATES[transactionCurrency];
            if (!rate) {
                return res.status(400).json({ message: `Unsupported transaction currency: ${transactionCurrency}` });
            }
            // Calculate expected amount
            const expectedAmount = Math.round(course.price * rate);
            // Give a tiny tolerance (1.0) due to floating point roundings
            const diff = Math.abs(transactionAmount - expectedAmount);
            if (diff > 1.0) {
                console.warn(`Amount mismatch for user ${(_b = req.user) === null || _b === void 0 ? void 0 : _b._id}: expected ${expectedAmount} ${transactionCurrency}, got ${transactionAmount} ${transactionCurrency}`);
                return res.status(400).json({ message: 'Paid amount does not match the course price' });
            }
            // Create purchase record
            await Purchase_1.default.create({
                user: (_c = req.user) === null || _c === void 0 ? void 0 : _c._id,
                courseId: course.id,
                paymentGateway,
                reference,
                amount: transactionAmount,
                currency: transactionCurrency,
                status: 'success'
            });
        }
        // Add user to enrolled students
        if (req.user) {
            course.enrolledStudents.push(req.user._id);
            await course.save();
            // Add course to user's enrolled courses
            const user = await User_1.default.findById(req.user._id);
            if (user) {
                if (!user.enrolledCourses) {
                    user.enrolledCourses = [];
                }
                user.enrolledCourses.push(course._id);
                await user.save();
            }
            // Create progress record
            await Progress_1.default.create({
                user: req.user._id,
                course: course._id,
                completedLessons: [],
                progressPercentage: 0,
                lastAccessed: new Date()
            });
        }
        res.json({ message: 'Successfully enrolled in course' });
    }
    catch (error) {
        console.error('Enroll course error:', error);
        res.status(500).json({ message: 'Server error enrolling in course' });
    }
};
exports.enrollCourse = enrollCourse;
/**
 * @desc    Get instructor courses
 * @route   GET /api/courses/instructor
 * @access  Private/Instructor
 */
const getInstructorCourses = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const courses = await Course_1.default.find({ instructor: req.user._id })
            .select('-lessons.content')
            .populate('enrolledStudents', 'name email avatar');
        res.json(courses);
    }
    catch (error) {
        console.error('Get instructor courses error:', error);
        res.status(500).json({ message: 'Server error fetching instructor courses' });
    }
};
exports.getInstructorCourses = getInstructorCourses;
/**
 * @desc    Get enrolled courses for current user
 * @route   GET /api/courses/enrolled
 * @access  Private
 */
const getEnrolledCourses = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const user = await User_1.default.findById(req.user._id)
            .populate({
            path: 'enrolledCourses',
            select: '-lessons.content',
            populate: {
                path: 'instructor',
                select: 'name email avatar'
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.enrolledCourses);
    }
    catch (error) {
        console.error('Get enrolled courses error:', error);
        res.status(500).json({ message: 'Server error fetching enrolled courses' });
    }
};
exports.getEnrolledCourses = getEnrolledCourses;
