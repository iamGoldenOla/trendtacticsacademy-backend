import { Request, Response } from 'express';
import { Course, Enrollment, LessonProgress as Progress } from '../utils/supabaseModels';
import axios from 'axios';
import { supabaseAdmin } from '../utils/supabase';

/**
 * @desc    Get all courses
 * @route   GET /api/courses
 * @access  Public
 */
export const getCourses = async (req: Request, res: Response) => {
  try {
    const { category, level, search } = req.query;
    
    // Build filters
    const filters: any = {};
    
    if (category) {
      filters.category = category as string;
    }
    
    if (level) {
      filters.level = level as string;
    }
    
    if (search) {
      filters.search = search as string;
    }
    
    const courses = await Course.findAll(filters);
    
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
    const course = await Course.findById(req.params.id);
    
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
      topics
    } = req.body;
    
    // Create course with current user as instructor
    const course = await Course.create({
      title,
      description,
      instructor_id: (req as any).user.id,
      thumbnail,
      price,
      duration,
      level,
      category,
      topics: topics || [],
      rating: 0
    } as any);
    
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
    // Check if user is the course instructor
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.instructor_id !== (req as any).user.id) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }
    
    // Update course
    const updatedCourse = await Course.update(req.params.id, req.body);
    
    res.json(updatedCourse);
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
    
    // Check if user is the course instructor or admin
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    
    if (course.instructor_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }
    
    // Delete course
    await Course.delete(req.params.id);
    
    // Also delete all progress records for this course
    // Note: You'll need to implement this in your Supabase models
    
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
    // 1. Strict authentication check
    if (!req.user || !(req as any).user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const courseIdInput = req.params.id;
    const userId = (req as any).user.id;
    const userEmail = (req as any).user.email;
    const userName = (req as any).user.name || '';

    // Check if input is a valid UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseIdInput);

    let course: any = null;
    if (isUUID) {
      const { data, error } = await supabaseAdmin
        .from('courses')
        .select('*')
        .eq('id', courseIdInput)
        .maybeSingle();
      if (error) {
        console.error('Error fetching course by ID:', error);
      }
      course = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('courses')
        .select('*')
        .eq('slug', courseIdInput)
        .maybeSingle();
      if (error) {
        console.error('Error fetching course by slug:', error);
      }
      course = data;

      // Fallback: search by title
      if (!course) {
        const titleSearch = courseIdInput
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        const { data: titleData, error: titleError } = await supabaseAdmin
          .from('courses')
          .select('*')
          .ilike('title', `%${titleSearch}%`)
          .limit(1)
          .maybeSingle();
        if (titleError) {
          console.error('Error fetching course by title:', titleError);
        }
        course = titleData;
      }
    }

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // 2. Check if user is already enrolled
    const { data: existingEnrollment, error: enrollCheckError } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', course.id)
      .maybeSingle();

    if (enrollCheckError) {
      console.error('Error checking existing enrollment:', enrollCheckError);
    }

    if (existingEnrollment) {
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

    // Fallback expected USD prices
    const EXPECTED_PRICES: Record<string, number> = {
      'vibe-coding': 10.00,
      'facebook-ads': 8.00,
      'prompt-engineering': 10.00
    };

    const courseSlug = course.slug || '';

    const expectedPriceUSD = (course.price !== undefined && course.price !== null && Number(course.price) > 0)
      ? Number(course.price)
      : (EXPECTED_PRICES[courseSlug] || 0);

    // Secure Payment Verification for paid courses
    if (expectedPriceUSD > 0) {
      const { reference, paymentGateway } = req.body;

      if (!reference || !paymentGateway) {
        return res.status(400).json({ message: 'Payment reference and gateway are required for paid courses' });
      }

      if (paymentGateway !== 'paystack' && paymentGateway !== 'flutterwave') {
        return res.status(400).json({ message: 'Invalid payment gateway' });
      }

      // Idempotency Check in Supabase payments table
      const { data: existingPayment, error: paymentCheckError } = await supabaseAdmin
        .from('payments')
        .select('*')
        .eq('reference', reference)
        .maybeSingle();

      if (paymentCheckError) {
        console.error('Error checking existing payments:', paymentCheckError);
      }

      if (existingPayment) {
        return res.status(400).json({ message: 'This transaction reference has already been used' });
      }

      let isVerified = false;
      let transactionAmount = 0;
      let transactionCurrency = 'USD';
      let rawData: any = null;

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
          rawData = responseData;
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
          rawData = responseData;
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
        console.warn(`Failed payment verification attempt by user ${userId} for course ${course.id} with ref ${reference} on gateway ${paymentGateway}`);
        return res.status(400).json({ message: 'Payment could not be verified' });
      }

      // Check currency rate
      const rate = CURRENCY_RATES[transactionCurrency];
      if (!rate) {
        return res.status(400).json({ message: `Unsupported transaction currency: ${transactionCurrency}` });
      }

      // Calculate expected amount
      const expectedAmount = Math.round(expectedPriceUSD * rate);
      const diff = Math.abs(transactionAmount - expectedAmount);

      if (diff > 1.0) {
        console.warn(`Amount mismatch for user ${userId}: expected ${expectedAmount} ${transactionCurrency}, got ${transactionAmount} ${transactionCurrency}`);
        return res.status(400).json({ message: 'Paid amount does not match the course price' });
      }

      // Create purchase record in payments ledger
      const { error: paymentInsertError } = await supabaseAdmin
        .from('payments')
        .insert({
          user_id: userId,
          course_id: course.id,
          amount: Math.round(transactionAmount),
          status: 'success',
          reference: reference,
          gateway: paymentGateway,
          customer_name: userName || '',
          raw_data: rawData
        });

      if (paymentInsertError) {
        console.error('Failed to log payment in Supabase:', paymentInsertError);
        return res.status(500).json({ message: 'Failed to record payment transaction' });
      }
    }

    // Enroll user in course
    const { error: enrollInsertError } = await supabaseAdmin
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: course.id,
        enrollment_date: new Date().toISOString()
      });

    if (enrollInsertError) {
      console.error('Failed to create enrollment record in Supabase:', enrollInsertError);
      return res.status(500).json({ message: 'Failed to complete course enrollment' });
    }

    // Create progress records in lesson_progress if course has lessons
    const { data: lessons, error: lessonsError } = await supabaseAdmin
      .from('lessons')
      .select(`
        id,
        module:modules!inner(course_id)
      `)
      .eq('modules.course_id', course.id);

    if (lessonsError) {
      console.error('Error fetching lessons to initialize progress:', lessonsError);
    }

    if (lessons && lessons.length > 0) {
      // Upsert progress for the first lesson to start the course
      await supabaseAdmin
        .from('lesson_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessons[0].id,
          completed: false,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, lesson_id' });

    }

    res.json({ success: true, message: 'Successfully enrolled in course' });
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
    const userId = (req as any).user.id;
    
    const courses = await (Course as any).findByInstructor(userId);
    
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
    const userId = (req as any).user.id;
    
    const enrollments = await Enrollment.findByUser(userId);
    
    res.json(enrollments);
  } catch (error: any) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ message: 'Server error fetching enrolled courses' });
  }
};

/**
 * @desc    Generate/Retrieve certificate for completed course
 * @route   POST /api/courses/:courseId/certificate
 * @access  Private
 */
export const generateCertificate = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = (req as any).user.id;

    // 1. Fetch enrollment to check progress
    const { data: enrollment, error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (enrollError) {
      console.error('Error fetching enrollment:', enrollError);
      return res.status(500).json({ message: 'Server error checking enrollment' });
    }

    if (!enrollment) {
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }

    // 2. Fetch all lessons in this course to see if all are completed
    const { data: lessons, error: lessonsError } = await supabaseAdmin
      .from('lessons')
      .select('id, module:modules!inner(course_id)')
      .eq('modules.course_id', courseId);

    if (lessonsError) {
      console.error('Error fetching course lessons:', lessonsError);
      return res.status(500).json({ message: 'Server error fetching course lessons' });
    }

    const completedLessons = enrollment.completed_lessons || [];
    const totalLessonsCount = lessons ? lessons.length : 0;

    // Guard against empty course
    if (totalLessonsCount === 0) {
      return res.status(400).json({ message: 'This course has no lessons' });
    }

    // Check if progress is 100%
    const isCompleted = completedLessons.length >= totalLessonsCount;
    if (!isCompleted) {
      return res.status(400).json({
        message: `Course not completed. Completed ${completedLessons.length} of ${totalLessonsCount} lessons.`
      });
    }

    // 3. Check if certificate already exists
    const { data: existingCert, error: certError } = await supabaseAdmin
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (certError) {
      console.error('Error checking certificate:', certError);
      return res.status(500).json({ message: 'Server error checking certificate' });
    }

    if (existingCert) {
      return res.json(existingCert);
    }

    // 4. Create new certificate
    const { data: newCert, error: createError } = await supabaseAdmin
      .from('certificates')
      .insert({
        user_id: userId,
        course_id: courseId,
        enrollment_id: enrollment.id,
        issued_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating certificate:', createError);
      return res.status(500).json({ message: 'Server error generating certificate' });
    }

    res.status(201).json(newCert);
  } catch (error: any) {
    console.error('Generate certificate error:', error);
    res.status(500).json({ message: 'Server error generating certificate' });
  }
};