"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.getFileUrl = exports.thumbnailUpload = exports.avatarUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Create uploads directory if it doesn't exist
const uploadsDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Create subdirectories for different upload types
const avatarsDir = path_1.default.join(uploadsDir, 'avatars');
const thumbnailsDir = path_1.default.join(uploadsDir, 'thumbnails');
if (!fs_1.default.existsSync(avatarsDir)) {
    fs_1.default.mkdirSync(avatarsDir, { recursive: true });
}
if (!fs_1.default.existsSync(thumbnailsDir)) {
    fs_1.default.mkdirSync(thumbnailsDir, { recursive: true });
}
// Configure storage for avatars
const avatarStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, avatarsDir);
    },
    filename: (req, file, cb) => {
        var _a;
        // Use user ID if available, otherwise use timestamp
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || Date.now().toString();
        cb(null, `${userId}-${Date.now()}${path_1.default.extname(file.originalname)}`);
    }
});
// Configure storage for course thumbnails
const thumbnailStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, thumbnailsDir);
    },
    filename: (req, file, cb) => {
        // Use course ID from params if available, otherwise use timestamp
        const courseId = req.params.courseId || Date.now().toString();
        cb(null, `${courseId}-${Date.now()}${path_1.default.extname(file.originalname)}`);
    }
});
// File filter to allow only images
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedFileTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed!'));
    }
};
// Create multer upload instances
exports.avatarUpload = (0, multer_1.default)({
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter
});
exports.thumbnailUpload = (0, multer_1.default)({
    storage: thumbnailStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter
});
// Helper function to get file URL
const getFileUrl = (req, filename, type) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}/uploads/${type}s/${filename}`;
};
exports.getFileUrl = getFileUrl;
// Helper function to delete file
const deleteFile = (filename, type) => {
    const filePath = path_1.default.join(type === 'avatar' ? avatarsDir : thumbnailsDir, filename);
    if (fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
    }
};
exports.deleteFile = deleteFile;
