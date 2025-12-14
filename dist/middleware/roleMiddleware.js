"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCourseInstructorOrAdmin = exports.requireOwnershipOrAdmin = exports.requireAuthenticated = exports.requireInstructor = exports.requireAdmin = exports.authorize = void 0;
const AppError_1 = require("../utils/AppError");
/**
 * Role-based authorization middleware
 * Checks if the authenticated user has one of the required roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        // Check if user is authenticated
        if (!req.user) {
            return next(new AppError_1.AppError('Access denied. Authentication required.', 401));
        }
        // Check if user has required role
        if (!roles.includes(req.user.role)) {
            return next(new AppError_1.AppError(`Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`, 403));
        }
        next();
    };
};
exports.authorize = authorize;
/**
 * Check if user is admin
 */
exports.requireAdmin = (0, exports.authorize)('admin');
/**
 * Check if user is instructor or admin
 */
exports.requireInstructor = (0, exports.authorize)('instructor', 'admin');
/**
 * Check if user is student, instructor, or admin (any authenticated user)
 */
exports.requireAuthenticated = (0, exports.authorize)('student', 'instructor', 'admin');
/**
 * Check if user owns the resource or is admin
 * This middleware should be used after a middleware that sets req.resourceOwnerId
 */
const requireOwnershipOrAdmin = (req, res, next) => {
    if (!req.user) {
        return next(new AppError_1.AppError('Access denied. Authentication required.', 401));
    }
    // Admin can access everything
    if (req.user.role === 'admin') {
        return next();
    }
    // Check if user owns the resource
    const resourceOwnerId = req.resourceOwnerId || req.params.userId;
    if (req.user.id !== resourceOwnerId) {
        return next(new AppError_1.AppError('Access denied. You can only access your own resources.', 403));
    }
    next();
};
exports.requireOwnershipOrAdmin = requireOwnershipOrAdmin;
/**
 * Check if user is instructor of the course or admin
 * This middleware should be used after a middleware that sets req.courseInstructorId
 */
const requireCourseInstructorOrAdmin = (req, res, next) => {
    if (!req.user) {
        return next(new AppError_1.AppError('Access denied. Authentication required.', 401));
    }
    // Admin can access everything
    if (req.user.role === 'admin') {
        return next();
    }
    // Check if user is instructor
    if (req.user.role !== 'instructor') {
        return next(new AppError_1.AppError('Access denied. Instructor role required.', 403));
    }
    // Check if user is the instructor of this course
    const courseInstructorId = req.courseInstructorId;
    if (req.user.id !== courseInstructorId) {
        return next(new AppError_1.AppError('Access denied. You can only manage your own courses.', 403));
    }
    next();
};
exports.requireCourseInstructorOrAdmin = requireCourseInstructorOrAdmin;
exports.default = {
    authorize: exports.authorize,
    requireAdmin: exports.requireAdmin,
    requireInstructor: exports.requireInstructor,
    requireAuthenticated: exports.requireAuthenticated,
    requireOwnershipOrAdmin: exports.requireOwnershipOrAdmin,
    requireCourseInstructorOrAdmin: exports.requireCourseInstructorOrAdmin,
};
