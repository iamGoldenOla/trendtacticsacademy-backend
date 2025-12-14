import { Request, Response } from 'express';
import { supabaseAdmin } from '../utils/supabase';
import { User } from '../utils/supabaseModels';

/**
 * @desc    Register a new user with Supabase Auth
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Sign up user with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: role || 'student'
        }
      }
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // Also create user in users table for additional data
    if (data.user) {
      await User.create({
        id: data.user.id,
        name,
        email,
        password, // Note: In production, you might not want to store this
        role: role || 'student',
        dashboard_preferences: {}
      });
    }

    res.status(201).json({
      user: data.user,
      session: data.session
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * @desc    Login user with Supabase Auth
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Sign in user with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ message: error.message });
    }

    res.json({
      user: data.user,
      session: data.session
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
    // Get user ID from authenticated user
    const userId = (req as any).user.id;

    // Get user from users table
    const user = await User.findById(userId);

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
    const userId = (req as any).user.id;
    
    // Update user in users table
    const updatedUser = await User.update(userId, {
      name: req.body.name,
      email: req.body.email,
      avatar: req.body.avatar,
      phone: req.body.phone,
      dashboard_preferences: req.body.dashboard_preferences,
      social_links: req.body.social_links
    });

    res.json(updatedUser);
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
    // Check if user is admin (you'll need to implement this check based on your auth setup)
    // For now, we'll just return all users
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const users = await User.findAll(page, limit);
    res.json(users);
  } catch (error: any) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logoutUser = async (req: Request, res: Response) => {
  try {
    // Sign out user with Supabase Auth
    const { error } = await supabaseAdmin.auth.signOut();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};