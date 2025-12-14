"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJsonContentType = exports.sanitizeBody = exports.validateFileUpload = exports.validatePagination = exports.validateObjectId = exports.validateRequest = void 0;
const { validationResult } = require('express-validator');
const AppError_1 = require("../utils/AppError");
/**
 * Middleware to validate request data using express-validator
 * Should be used after validation rules are defined
 */
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Format validation errors
        const formattedErrors = errors.array().map((error) => {
            return {
                field: error.type === 'field' ? error.path : 'unknown',
                message: error.msg,
                value: error.type === 'field' ? error.value : undefined,
            };
        });
        // Create error message
        const errorMessage = formattedErrors
            .map((err) => `${err.field}: ${err.message}`)
            .join(', ');
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: formattedErrors,
            details: errorMessage,
        });
    }
    next();
};
exports.validateRequest = validateRequest;
/**
 * Custom validation middleware for specific use cases
 */
const validateObjectId = (paramName) => {
    return (req, res, next) => {
        const id = req.params[paramName];
        // MongoDB ObjectId validation regex
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!id || !objectIdRegex.test(id)) {
            return next(new AppError_1.AppError(`Invalid ${paramName}. Must be a valid MongoDB ObjectId.`, 400));
        }
        next();
    };
};
exports.validateObjectId = validateObjectId;
/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
    const { page, limit } = req.query;
    if (page) {
        const pageNum = parseInt(page);
        if (isNaN(pageNum) || pageNum < 1) {
            return next(new AppError_1.AppError('Page must be a positive integer', 400));
        }
        req.query.page = pageNum.toString();
    }
    if (limit) {
        const limitNum = parseInt(limit);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            return next(new AppError_1.AppError('Limit must be a positive integer between 1 and 100', 400));
        }
        req.query.limit = limitNum.toString();
    }
    next();
};
exports.validatePagination = validatePagination;
/**
 * Validate file upload
 */
const validateFileUpload = (allowedTypes, maxSize = 5 * 1024 * 1024) => {
    return (req, res, next) => {
        var _a;
        if (!req.file && !req.files) {
            return next(new AppError_1.AppError('No file uploaded', 400));
        }
        const file = req.file || (Array.isArray(req.files) ? req.files[0] : (_a = req.files) === null || _a === void 0 ? void 0 : _a[Object.keys(req.files)[0]]);
        if (!file) {
            return next(new AppError_1.AppError('No file uploaded', 400));
        }
        // Check file type
        if (!allowedTypes.includes(file.mimetype)) {
            return next(new AppError_1.AppError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`, 400));
        }
        // Check file size
        if (file.size > maxSize) {
            return next(new AppError_1.AppError(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`, 400));
        }
        next();
    };
};
exports.validateFileUpload = validateFileUpload;
/**
 * Sanitize request body by removing potentially dangerous fields
 */
const sanitizeBody = (dangerousFields = ['__proto__', 'constructor', 'prototype']) => {
    return (req, res, next) => {
        if (req.body && typeof req.body === 'object') {
            dangerousFields.forEach(field => {
                delete req.body[field];
            });
        }
        next();
    };
};
exports.sanitizeBody = sanitizeBody;
/**
 * Validate JSON content type
 */
const validateJsonContentType = (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        if (!req.is('application/json')) {
            return next(new AppError_1.AppError('Content-Type must be application/json', 400));
        }
    }
    next();
};
exports.validateJsonContentType = validateJsonContentType;
exports.default = {
    validateRequest: exports.validateRequest,
    validateObjectId: exports.validateObjectId,
    validatePagination: exports.validatePagination,
    validateFileUpload: exports.validateFileUpload,
    sanitizeBody: exports.sanitizeBody,
    validateJsonContentType: exports.validateJsonContentType,
};
