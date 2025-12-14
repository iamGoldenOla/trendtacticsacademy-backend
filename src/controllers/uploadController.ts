import { Request, Response } from 'express';
import { getFileUrl, deleteFile } from '../utils/fileUpload';
import User from '../models/User';
import Course from '../models/Course';
import path from 'path';

/**
 * @desc    Upload user avatar
 * @route   POST /api/upload/avatar
 * @access  Private
 */
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Get file URL
    const avatarUrl = getFileUrl(req, req.file.filename, 'avatar');

    // Update user's avatar in database
    const user = await User.findById(req.user._id);

    if (!user) {
      // Delete uploaded file if user not found
      deleteFile(req.file.filename, 'avatar');
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const oldAvatarFilename = path.basename(user.avatar);
      deleteFile(oldAvatarFilename, 'avatar');
    }

    // Update user with new avatar URL
    user.avatar = avatarUrl;
    await user.save();

    res.json({
      message: 'Avatar uploaded successfully',
      avatarUrl
    });
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Server error uploading avatar' });
  }
};

/**
 * @desc    Upload course thumbnail
 * @route   POST /api/upload/thumbnail/:courseId
 * @access  Private/Instructor
 */
export const uploadThumbnail = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { courseId } = req.params;

    // Get file URL
    const thumbnailUrl = getFileUrl(req, req.file.filename, 'thumbnail');

    // Find course
    const course = await Course.findById(courseId);

    if (!course) {
      // Delete uploaded file if course not found
      deleteFile(req.file.filename, 'thumbnail');
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      // Delete uploaded file if not authorized
      deleteFile(req.file.filename, 'thumbnail');
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    // Delete old thumbnail if exists
    if (course.thumbnail) {
      const oldThumbnailFilename = path.basename(course.thumbnail);
      deleteFile(oldThumbnailFilename, 'thumbnail');
    }

    // Update course with new thumbnail URL
    course.thumbnail = thumbnailUrl;
    await course.save();

    res.json({
      message: 'Thumbnail uploaded successfully',
      thumbnailUrl
    });
  } catch (error: any) {
    console.error('Thumbnail upload error:', error);
    res.status(500).json({ message: 'Server error uploading thumbnail' });
  }
};