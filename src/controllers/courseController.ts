import { Request, Response } from 'express';
import axios from 'axios';
import Course from '../models/Course';
import User from '../models/User';
import Progress from '../models/Progress';
import Purchase from '../models/Purchase';

/**
 * @desc    Get all courses
 * @route   GET /api/courses
 * @access  Public
 */
export const getCourses = async (req: Request, res: Response) => {
  try {
    const { category, level, search } = req.query;
    
    // Build filter object
    const filter: any = {};
    
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
    
    const courses = await Course.find(filter)
      .populate('instructor', 'name email avatar')
      .select('-lessons.content');
      
    res.json(courses);
  } catch (error: any) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error fetching courses' });
  }
};

/**
 * @desc    Get single course by ID
 * @route   GET /api/courses/:id
 * @access  Public
 */
export const getCourseById = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email avatar')
      .populate('enrolledStudents', 'name email avatar');
      
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course);
  } catch (error: any) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error fetching course' });
  }
};

/**
 * @desc    Create a new course
 * @route   POST /api/courses
 * @access  Private/Instructor
 */
export const createCourse = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      thumbnail,
      price,
      duration,
      level,
      category,
      topics,
      lessons,
      moduleQuiz
    } = req.body;
    
    // Create course with current user as instructor
    const course = await Course.create({
      title,
      description,
      instructor: req.user?._id,
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
  } catch (error: any) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error creating course' });
  }
};

/**
 * @desc    Update a course
 * @route   PUT /api/courses/:id
 * @access  Private/Instructor
 */
export const updateCourse = async (req: Request, res: Response) => {
  try {
    let course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is the course instructor
    if (req.user && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }
    
    // Update course
    course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.json(course);
  } catch (error: any) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error updating course' });
  }
};

/**
 * @desc    Delete a course
 * @route   DELETE /api/courses/:id
 * @access  Private/Instructor
 */
export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is the course instructor
    if (req.user && course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }
    
    await course.deleteOne();
    
    // Also delete all progress records for this course
    await Progress.deleteMany({ course: req.params.id });
    
    res.json({ message: 'Course removed' });
  } catch (error: any) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error deleting course' });
  }
};

/**
 * @desc    Enroll in a course
 * @route   POST /api/courses/:id/enroll
 * @access  Private/Student
 */
export const enrollCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is already enrolled
    const alreadyEnrolled = req.user && course.enrolledStudents.some(
      (student) => student.toString() === req.user._id.toString()
    );
    
    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const CURRENCY_RATES: Record<string, number> = {
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
      const existingPurchase = await Purchase.findOne({ reference });
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

          const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
              Authorization: `Bearer ${secretKey}`,
              'Content-Type': 'application/json'
            }
          });

          const responseData = response.data as any;
          if (responseData && responseData.status && responseData.data && responseData.data.status === 'success') {
            isVerified = true;
            transactionAmount = responseData.data.amount / 100; // Paystack is in kobo
            transactionCurrency = responseData.data.currency || 'USD';
          } else {
            console.warn(`Paystack verification failed for ref ${reference}:`, response.data);
          }
        } else if (paymentGateway === 'flutterwave') {
          const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
          if (!secretKey) {
            console.error('FLUTTERWAVE_SECRET_KEY is not defined in environment variables');
            return res.status(500).json({ message: 'Payment verification config error' });
          }

          const response = await axios.get(`https://api.flutterwave.com/v3/transactions/${reference}/verify`, {
            headers: {
              Authorization: `Bearer ${secretKey}`,
              'Content-Type': 'application/json'
            }
          });

          const responseData = response.data as any;
          if (responseData && responseData.status === 'success' && responseData.data && responseData.data.status === 'successful') {
            isVerified = true;
            transactionAmount = responseData.data.amount; // Flutterwave is in standard unit
            transactionCurrency = responseData.data.currency || 'USD';
          } else {
            console.warn(`Flutterwave verification failed for ref ${reference}:`, response.data);
          }
        }
      } catch (err: any) {
        console.error(`Error calling ${paymentGateway} API for ref ${reference}:`, err.message || err);
        return res.status(400).json({ message: 'Failed to contact payment provider for verification' });
      }

      if (!isVerified) {
        console.warn(`Failed payment verification attempt by user ${req.user?._id} for course ${course._id} with ref ${reference} on gateway ${paymentGateway}`);
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
        console.warn(`Amount mismatch for user ${req.user?._id}: expected ${expectedAmount} ${transactionCurrency}, got ${transactionAmount} ${transactionCurrency}`);
        return res.status(400).json({ message: 'Paid amount does not match the course price' });
      }

      // Create purchase record
      await Purchase.create({
        user: req.user?._id,
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
      const user = await User.findById(req.user._id);
      if (user) {
        if (!user.enrolledCourses) {
          user.enrolledCourses = [];
        }
        user.enrolledCourses.push(course._id);
        await user.save();
      }
      
      // Create progress record
      await Progress.create({
        user: req.user._id,
        course: course._id,
        completedLessons: [],
        progressPercentage: 0,
        lastAccessed: new Date()
      });
    }
    
    res.json({ message: 'Successfully enrolled in course' });
  } catch (error: any) {
    console.error('Enroll course error:', error);
    res.status(500).json({ message: 'Server error enrolling in course' });
  }
};

/**
 * @desc    Get instructor courses
 * @route   GET /api/courses/instructor
 * @access  Private/Instructor
 */
export const getInstructorCourses = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const courses = await Course.find({ instructor: req.user._id })
      .select('-lessons.content')
      .populate('enrolledStudents', 'name email avatar');
      
    res.json(courses);
  } catch (error: any) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({ message: 'Server error fetching instructor courses' });
  }
};

/**
 * @desc    Get enrolled courses for current user
 * @route   GET /api/courses/enrolled
 * @access  Private
 */
export const getEnrolledCourses = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const user = await User.findById(req.user._id)
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
  } catch (error: any) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ message: 'Server error fetching enrolled courses' });
  }
};