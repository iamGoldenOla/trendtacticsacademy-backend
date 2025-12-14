"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uploadController_1 = require("../controllers/uploadController");
const fileUpload_1 = require("../utils/fileUpload");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Avatar upload route
router.post('/avatar', auth_1.protect, fileUpload_1.avatarUpload.single('avatar'), uploadController_1.uploadAvatar);
// Course thumbnail upload route
router.post('/thumbnail/:courseId', auth_1.protect, (0, auth_1.authorize)('instructor', 'admin'), fileUpload_1.thumbnailUpload.single('thumbnail'), uploadController_1.uploadThumbnail);
exports.default = router;
