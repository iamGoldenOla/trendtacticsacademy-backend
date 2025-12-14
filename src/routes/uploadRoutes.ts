import express from 'express';
import { uploadAvatar, uploadThumbnail } from '../controllers/uploadController';
import { avatarUpload, thumbnailUpload } from '../utils/fileUpload';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Avatar upload route
router.post('/avatar', protect, avatarUpload.single('avatar'), uploadAvatar);

// Course thumbnail upload route
router.post(
  '/thumbnail/:courseId',
  protect,
  authorize('instructor', 'admin'),
  thumbnailUpload.single('thumbnail'),
  uploadThumbnail
);

export default router;