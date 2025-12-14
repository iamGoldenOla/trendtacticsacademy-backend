import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

/**
 * Generate a JWT token for a user
 * @param user User document
 * @returns JWT token
 */
export const generateToken = (user: IUser): string => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET as string,
    { expiresIn: '30d' }
  );
};

/**
 * Verify a JWT token
 * @param token JWT token
 * @returns Decoded token payload or null if invalid
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string);
  } catch (error) {
    return null;
  }
};