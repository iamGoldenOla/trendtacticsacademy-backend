import { Request, Response } from 'express';
import User from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      dashboardPreferences: {}
    });

    // Generate token
    const token = generateToken(user);

    // Return user data and token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      dashboardPreferences: user.dashboardPreferences,
      token
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user);

    // Return user data and token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      dashboardPreferences: user.dashboardPreferences,
      token
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    // User is already attached to req by auth middleware
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error getting profile' });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.dashboardPreferences) {
      user.dashboardPreferences = req.body.dashboardPreferences;
    }
    
    // Only update password if provided
    if (req.body.password) {
      user.password = await hashPassword(req.body.password);
    }

    // Update avatar if provided
    if (req.body.avatar) {
      user.avatar = req.body.avatar;
    }

    // Save updated user
    const updatedUser = await user.save();

    // Generate new token with updated info
    const token = generateToken(updatedUser);

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      dashboardPreferences: updatedUser.dashboardPreferences,
      token
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/auth/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Only allow admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error: any) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};