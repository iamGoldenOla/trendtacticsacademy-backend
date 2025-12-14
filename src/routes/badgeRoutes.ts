import express from 'express';
import {
  getAllBadges,
  createBadge,
  updateBadge,
  deleteBadge,
  awardBadgeToUser,
  getUserBadges
} from '../controllers/badgeController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getAllBadges);

// Protected routes
router.get('/user/:userId', protect, getUserBadges);

// Admin routes
router.post('/', protect, authorize('admin'), createBadge);
router.put('/:id', protect, authorize('admin'), updateBadge);
router.delete('/:id', protect, authorize('admin'), deleteBadge);
router.post('/:id/award/:userId', protect, authorize('admin'), awardBadgeToUser);

export default router;