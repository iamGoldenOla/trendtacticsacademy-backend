import { Request, Response, NextFunction } from 'express';
const { validationResult } = require('express-validator');
import { AppError } from '../utils/AppError';

/**
 * Middleware to validate request data using express-validator
 * Should be used after validation rules are defined
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Format validation errors
    const formattedErrors = errors.array().map((error: any) => {
      return {
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined,
      };
    });

    // Create error message
    const errorMessage = formattedErrors
      .map((err: any) => `${err.field}: ${err.message}`)
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

/**
 * Custom validation middleware for specific use cases
 */
export const validateObjectId = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    
    // MongoDB ObjectId validation regex
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    
    if (!id || !objectIdRegex.test(id)) {
      return next(new AppError(`Invalid ${paramName}. Must be a valid MongoDB ObjectId.`, 400));
    }
    
    next();
  };
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
  const { page, limit } = req.query;
  
  if (page) {
    const pageNum = parseInt(page as string);
    if (isNaN(pageNum) || pageNum < 1) {
      return next(new AppError('Page must be a positive integer', 400));
    }
    req.query.page = pageNum.toString();
  }
  
  if (limit) {
    const limitNum = parseInt(limit as string);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return next(new AppError('Limit must be a positive integer between 1 and 100', 400));
    }
    req.query.limit = limitNum.toString();
  }
  
  next();
};

/**
 * Validate file upload
 */
export const validateFileUpload = (allowedTypes: string[], maxSize: number = 5 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.file && !req.files) {
      return next(new AppError('No file uploaded', 400));
    }
    
    const file = req.file || (Array.isArray(req.files) ? req.files[0] : req.files?.[Object.keys(req.files)[0]]);
    
    if (!file) {
      return next(new AppError('No file uploaded', 400));
    }
    
    // Check file type
    if (!allowedTypes.includes((file as any).mimetype)) {
      return next(
        new AppError(
          `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
          400
        )
      );
    }
    
    // Check file size
    if ((file as any).size > maxSize) {
      return next(
        new AppError(
          `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`,
          400
        )
      );
    }
    
    next();
  };
};

/**
 * Sanitize request body by removing potentially dangerous fields
 */
export const sanitizeBody = (dangerousFields: string[] = ['__proto__', 'constructor', 'prototype']) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === 'object') {
      dangerousFields.forEach(field => {
        delete req.body[field];
      });
    }
    next();
  };
};

/**
 * Validate JSON content type
 */
export const validateJsonContentType = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    if (!req.is('application/json')) {
      return next(new AppError('Content-Type must be application/json', 400));
    }
  }
  next();
};

export default {
  validateRequest,
  validateObjectId,
  validatePagination,
  validateFileUpload,
  sanitizeBody,
  validateJsonContentType,
};