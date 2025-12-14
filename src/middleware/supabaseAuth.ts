import { Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabase';

// Supabase authentication middleware
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
    
    // Add user to request object
    (req as any).user = data.user;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Admin authorization middleware
export const admin = (req: Request, res: Response, next: NextFunction) => {
  // Get user from request (attached by protect middleware)
  const user = (req as any).user;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized as admin' });
  }
  
  next();
};

// Instructor authorization middleware
export const instructor = (req: Request, res: Response, next: NextFunction) => {
  // Get user from request (attached by protect middleware)
  const user = (req as any).user;
  
  if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
    return res.status(403).json({ message: 'Not authorized as instructor' });
  }
  
  next();
};