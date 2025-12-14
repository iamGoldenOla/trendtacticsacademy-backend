import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories for different upload types
const avatarsDir = path.join(uploadsDir, 'avatars');
const thumbnailsDir = path.join(uploadsDir, 'thumbnails');

if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Configure storage for avatars
const avatarStorage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req: Request, file, cb) => {
    // Use user ID if available, otherwise use timestamp
    const userId = req.user?._id || Date.now().toString();
    cb(null, `${userId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Configure storage for course thumbnails
const thumbnailStorage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    cb(null, thumbnailsDir);
  },
  filename: (req: Request, file, cb) => {
    // Use course ID from params if available, otherwise use timestamp
    const courseId = req.params.courseId || Date.now().toString();
    cb(null, `${courseId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter to allow only images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Create multer upload instances
export const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter
});

export const thumbnailUpload = multer({
  storage: thumbnailStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// Helper function to get file URL
export const getFileUrl = (req: Request, filename: string, type: 'avatar' | 'thumbnail'): string => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${type}s/${filename}`;
};

// Helper function to delete file
export const deleteFile = (filename: string, type: 'avatar' | 'thumbnail'): void => {
  const filePath = path.join(type === 'avatar' ? avatarsDir : thumbnailsDir, filename);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};