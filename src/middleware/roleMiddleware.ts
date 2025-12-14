import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../utils/AppError';

// Extend the AuthenticatedRequest interface to include additional properties
interface ExtendedRequest extends AuthenticatedRequest {
  resourceOwnerId?: string;
  courseInstructorId?: string;
}

/**
 * Role-based authorization middleware
 * Checks if the authenticated user has one of the required roles
 */
export const authorize = (...roles: string[]) => {
  return (req: ExtendedRequest, res: Response, next: NextFunction) => {
    // Check if user is authenticated
    if (!req.user) {
      return next(new AppError('Access denied. Authentication required.', 401));
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Check if user is admin
 */
export const requireAdmin = authorize('admin');

/**
 * Check if user is instructor or admin
 */
export const requireInstructor = authorize('instructor', 'admin');

/**
 * Check if user is student, instructor, or admin (any authenticated user)
 */
export const requireAuthenticated = authorize('student', 'instructor', 'admin');

/**
 * Check if user owns the resource or is admin
 * This middleware should be used after a middleware that sets req.resourceOwnerId
 */
export const requireOwnershipOrAdmin = (req: ExtendedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Access denied. Authentication required.', 401));
  }

  // Admin can access everything
  if (req.user.role === 'admin') {
    return next();
  }

  // Check if user owns the resource
  const resourceOwnerId = req.resourceOwnerId || req.params.userId;
  if (req.user.id !== resourceOwnerId) {
    return next(
      new AppError('Access denied. You can only access your own resources.', 403)
    );
  }

  next();
};

/**
 * Check if user is instructor of the course or admin
 * This middleware should be used after a middleware that sets req.courseInstructorId
 */
export const requireCourseInstructorOrAdmin = (req: ExtendedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Access denied. Authentication required.', 401));
  }

  // Admin can access everything
  if (req.user.role === 'admin') {
    return next();
  }

  // Check if user is instructor
  if (req.user.role !== 'instructor') {
    return next(
      new AppError('Access denied. Instructor role required.', 403)
    );
  }

  // Check if user is the instructor of this course
  const courseInstructorId = req.courseInstructorId;
  if (req.user.id !== courseInstructorId) {
    return next(
      new AppError('Access denied. You can only manage your own courses.', 403)
    );
  }

  next();
};

export default {
  authorize,
  requireAdmin,
  requireInstructor,
  requireAuthenticated,
  requireOwnershipOrAdmin,
  requireCourseInstructorOrAdmin,
};