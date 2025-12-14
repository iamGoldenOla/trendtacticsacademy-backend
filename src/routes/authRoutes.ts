import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  logoutUser
} from '../controllers/supabaseAuthController';
import { protect, admin } from '../middleware/supabaseAuth';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/logout', protect, logoutUser);

// Admin routes
router.get('/users', protect, admin, getAllUsers);

export default router;