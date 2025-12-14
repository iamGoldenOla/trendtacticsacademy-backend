"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const progressController_1 = require("../controllers/progressController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Protected routes
router.get('/', auth_1.protect, progressController_1.getAllUserProgress);
router.get('/:courseId', auth_1.protect, progressController_1.getUserCourseProgress);
router.put('/:courseId/access', auth_1.protect, progressController_1.updateLastAccessed);
router.delete('/:courseId', auth_1.protect, progressController_1.resetProgress);
// Instructor routes
router.get('/stats/:courseId', auth_1.protect, (0, auth_1.authorize)('instructor', 'admin'), progressController_1.getCourseCompletionStats);
exports.default = router;
