"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    let error = Object.assign({}, err);
    error.message = err.message;
    // Log to console for dev
    console.error(err);
    // Error response
    const errorResponse = {
        success: false,
        error: error.message || 'Server Error',
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    };
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        return res.status(404).json(Object.assign(Object.assign({}, errorResponse), { error: message }));
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors || {}).map(val => val.message).join(', ');
        return res.status(400).json(Object.assign(Object.assign({}, errorResponse), { error: message, errors: Object.values(err.errors).map((error) => ({
                field: error.path,
                message: error.message
            })) }));
    }
    // Mongoose duplicate key errors
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json(Object.assign(Object.assign({}, errorResponse), { error: `Duplicate value for ${field}`, field }));
    }
    // JWT errors
    if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
        return res.status(401).json(Object.assign(Object.assign({}, errorResponse), { error: 'Not authorized to access this resource' }));
    }
    if (err instanceof jsonwebtoken_1.TokenExpiredError) {
        return res.status(401).json(Object.assign(Object.assign({}, errorResponse), { error: 'Your token has expired. Please log in again.' }));
    }
    // Send the error response
    res.status(error.statusCode || 500).json(errorResponse);
};
exports.errorHandler = errorHandler;
