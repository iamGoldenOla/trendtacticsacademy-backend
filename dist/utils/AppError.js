"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
/**
 * Custom Application Error class
 * Extends the built-in Error class with additional properties for better error handling
 */
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = isOperational;
        // Capture stack trace
        Error.captureStackTrace(this, this.constructor);
    }
    /**
     * Create a 400 Bad Request error
     */
    static badRequest(message = 'Bad Request') {
        return new AppError(message, 400);
    }
    /**
     * Create a 401 Unauthorized error
     */
    static unauthorized(message = 'Unauthorized') {
        return new AppError(message, 401);
    }
    /**
     * Create a 403 Forbidden error
     */
    static forbidden(message = 'Forbidden') {
        return new AppError(message, 403);
    }
    /**
     * Create a 404 Not Found error
     */
    static notFound(message = 'Resource not found') {
        return new AppError(message, 404);
    }
    /**
     * Create a 409 Conflict error
     */
    static conflict(message = 'Conflict') {
        return new AppError(message, 409);
    }
    /**
     * Create a 422 Unprocessable Entity error
     */
    static unprocessableEntity(message = 'Unprocessable Entity') {
        return new AppError(message, 422);
    }
    /**
     * Create a 429 Too Many Requests error
     */
    static tooManyRequests(message = 'Too Many Requests') {
        return new AppError(message, 429);
    }
    /**
     * Create a 500 Internal Server Error
     */
    static internal(message = 'Internal Server Error') {
        return new AppError(message, 500);
    }
    /**
     * Create a 502 Bad Gateway error
     */
    static badGateway(message = 'Bad Gateway') {
        return new AppError(message, 502);
    }
    /**
     * Create a 503 Service Unavailable error
     */
    static serviceUnavailable(message = 'Service Unavailable') {
        return new AppError(message, 503);
    }
    /**
     * Create error from MongoDB validation error
     */
    static fromMongoValidation(err) {
        const errors = Object.values(err.errors).map((val) => val.message);
        const message = `Invalid input data. ${errors.join('. ')}`;
        return new AppError(message, 400);
    }
    /**
     * Create error from MongoDB duplicate key error
     */
    static fromMongoDuplicate(err) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        const message = `Duplicate field value: ${field} = '${value}'. Please use another value.`;
        return new AppError(message, 400);
    }
    /**
     * Create error from MongoDB cast error
     */
    static fromMongoCast(err) {
        const message = `Invalid ${err.path}: ${err.value}`;
        return new AppError(message, 400);
    }
    /**
     * Create error from JWT error
     */
    static fromJWT(err) {
        if (err.name === 'JsonWebTokenError') {
            return new AppError('Invalid token. Please log in again.', 401);
        }
        else if (err.name === 'TokenExpiredError') {
            return new AppError('Your token has expired. Please log in again.', 401);
        }
        return new AppError('Authentication failed.', 401);
    }
    /**
     * Convert error to JSON for API responses
     */
    toJSON() {
        return {
            success: false,
            status: this.status,
            message: this.message,
            statusCode: this.statusCode,
            ...(process.env.NODE_ENV === 'development' && {
                stack: this.stack,
                code: this.code,
                path: this.path,
                value: this.value,
                errors: this.errors,
            }),
        };
    }
}
exports.AppError = AppError;
exports.default = AppError;
