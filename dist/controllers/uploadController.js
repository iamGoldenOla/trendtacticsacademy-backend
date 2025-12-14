"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadThumbnail = exports.uploadAvatar = void 0;
const fileUpload_1 = require("../utils/fileUpload");
const User_1 = __importDefault(require("../models/User"));
const Course_1 = __importDefault(require("../models/Course"));
const path_1 = __importDefault(require("path"));
/**
 * @desc    Upload user avatar
 * @route   POST /api/upload/avatar
 * @access  Private
 */
const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }
        // Get file URL
        const avatarUrl = (0, fileUpload_1.getFileUrl)(req, req.file.filename, 'avatar');
        // Update user's avatar in database
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            // Delete uploaded file if user not found
            (0, fileUpload_1.deleteFile)(req.file.filename, 'avatar');
            return res.status(404).json({ message: 'User not found' });
        }
        // Delete old avatar if exists
        if (user.avatar) {
            const oldAvatarFilename = path_1.default.basename(user.avatar);
            (0, fileUpload_1.deleteFile)(oldAvatarFilename, 'avatar');
        }
        // Update user with new avatar URL
        user.avatar = avatarUrl;
        await user.save();
        res.json({
            message: 'Avatar uploaded successfully',
            avatarUrl
        });
    }
    catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({ message: 'Server error uploading avatar' });
    }
};
exports.uploadAvatar = uploadAvatar;
/**
 * @desc    Upload course thumbnail
 * @route   POST /api/upload/thumbnail/:courseId
 * @access  Private/Instructor
 */
const uploadThumbnail = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }
        const { courseId } = req.params;
        // Get file URL
        const thumbnailUrl = (0, fileUpload_1.getFileUrl)(req, req.file.filename, 'thumbnail');
        // Find course
        const course = await Course_1.default.findById(courseId);
        if (!course) {
            // Delete uploaded file if course not found
            (0, fileUpload_1.deleteFile)(req.file.filename, 'thumbnail');
            return res.status(404).json({ message: 'Course not found' });
        }
        // Check if user is the course instructor
        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            // Delete uploaded file if not authorized
            (0, fileUpload_1.deleteFile)(req.file.filename, 'thumbnail');
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }
        // Delete old thumbnail if exists
        if (course.thumbnail) {
            const oldThumbnailFilename = path_1.default.basename(course.thumbnail);
            (0, fileUpload_1.deleteFile)(oldThumbnailFilename, 'thumbnail');
        }
        // Update course with new thumbnail URL
        course.thumbnail = thumbnailUrl;
        await course.save();
        res.json({
            message: 'Thumbnail uploaded successfully',
            thumbnailUrl
        });
    }
    catch (error) {
        console.error('Thumbnail upload error:', error);
        res.status(500).json({ message: 'Server error uploading thumbnail' });
    }
};
exports.uploadThumbnail = uploadThumbnail;
