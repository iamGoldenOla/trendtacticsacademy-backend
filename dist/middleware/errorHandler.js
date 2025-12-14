"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = exports.notFound = exports.asyncHandler = exports.errorHandler = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const logger_1 = require("../utils/logger");
/**
 * Enhanced error handler middleware with comprehensive logging and type safety
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    // Log error with context
    (0, logger_1.logError)(`${req.method} ${req.originalUrl} - ${err.message}`, err);
    // Base error response
    const errorResponse = {
        success: false,
        error: error.message || 'Internal Server Error',
    };
    // Include stack trace in development
    if (process.env.NODE_ENV !== 'production') {
        errorResponse.stack = err.stack;
        errorResponse.requestId = req.headers['x-request-id'] || 'unknown';
    }
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found with id: ${err.value}`;
        return res.status(404).json({
            ...errorResponse,
            error: message,
            field: err.path,
        });
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const validationErrors = Object.values(err.errors || {}).map((error) => ({
            field: error.path,
            message: error.message,
        }));
        const message = validationErrors.map(e => e.message).join(', ');
        return res.status(400).json({
            ...errorResponse,
            error: 'Validation failed',
            message,
            errors: validationErrors,
        });
    }
    // Mongoose duplicate key errors
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        return res.status(409).json({
            ...errorResponse,
            error: `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`,
            field,
            value,
        });
    }
    // JWT errors
    if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
        return res.status(401).json({
            ...errorResponse,
            error: 'Invalid token. Please log in again.',
        });
    }
    if (err instanceof jsonwebtoken_1.TokenExpiredError) {
        return res.status(401).json({
            ...errorResponse,
            error: 'Your session has expired. Please log in again.',
        });
    }
    // Rate limiting errors
    if (err.message && err.message.includes('Too many requests')) {
        return res.status(429).json({
            ...errorResponse,
            error: 'Too many requests. Please try again later.',
        });
    }
    // File upload errors
    if (err.message && err.message.includes('File too large')) {
        return res.status(413).json({
            ...errorResponse,
            error: 'File size too large. Maximum allowed size is 10MB.',
        });
    }
    // Network/Database connection errors
    if (err.message && (err.message.includes('ECONNREFUSED') || err.message.includes('ETIMEDOUT'))) {
        return res.status(503).json({
            ...errorResponse,
            error: 'Service temporarily unavailable. Please try again later.',
        });
    }
    // Send the error response
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? 'Internal Server Error' : error.message;
    res.status(statusCode).json({
        ...errorResponse,
        error: message,
    });
};
exports.errorHandler = errorHandler;
/**
 * Async error handler wrapper
 */
const asyncHandler = (fn) => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
/**
 * Not found middleware
 */
const notFound = (req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    next(error);
};
exports.notFound = notFound;
/**
 * Custom error class for operational errors
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
