import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import logger, { logError } from '../utils/logger';
import { ApiResponse, ValidationError } from '../types';

interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: Record<string, any>;
  errors?: Record<string, any>;
  value?: string;
  path?: string;
  location?: string;
  isOperational?: boolean;
}

/**
 * Enhanced error handler middleware with comprehensive logging and type safety
 */
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error with context
  logError(`${req.method} ${req.originalUrl} - ${err.message}`, err);

  // Base error response
  const errorResponse: ApiResponse = {
    success: false,
    error: error.message || 'Internal Server Error',
  };

  // Include stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    (errorResponse as any).stack = err.stack;
    (errorResponse as any).requestId = req.headers['x-request-id'] || 'unknown';
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id: ${(err as any).value}`;
    return res.status(404).json({
      ...errorResponse,
      error: message,
      field: (err as any).path,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const validationErrors: ValidationError[] = Object.values(err.errors || {}).map((error: any) => ({
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
    const field = Object.keys((err as any).keyValue)[0];
    const value = (err as any).keyValue[field];
    return res.status(409).json({
      ...errorResponse,
      error: `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`,
      field,
      value,
    });
  }

  // JWT errors
  if (err instanceof JsonWebTokenError) {
    return res.status(401).json({
      ...errorResponse,
      error: 'Invalid token. Please log in again.',
    });
  }

  if (err instanceof TokenExpiredError) {
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

/**
 * Async error handler wrapper
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Not found middleware
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Route ${req.originalUrl} not found`) as CustomError;
  error.statusCode = 404;
  next(error);
};

/**
 * Custom error class for operational errors
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}