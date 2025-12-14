import { Request, Response, NextFunction } from 'express';

/**
 * Async handler wrapper to catch errors in async route handlers
 * This eliminates the need for try-catch blocks in every async route handler
 * 
 * @param fn - The async function to wrap
 * @returns Express middleware function
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;