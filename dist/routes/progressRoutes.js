"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabaseProgressController_1 = require("../controllers/supabaseProgressController");
const supabaseAuth_1 = require("../middleware/supabaseAuth");
const router = express_1.default.Router();
// Protected routes
router.get('/', supabaseAuth_1.protect, supabaseProgressController_1.getAllUserProgress);
router.get('/:courseId', supabaseAuth_1.protect, supabaseProgressController_1.getUserCourseProgress);
router.put('/:courseId/access', supabaseAuth_1.protect, supabaseProgressController_1.updateLastAccessed);
router.delete('/:courseId', supabaseAuth_1.protect, supabaseProgressController_1.resetProgress);
// Instructor routes
router.get('/stats/:courseId', supabaseAuth_1.protect, supabaseAuth_1.instructor, supabaseProgressController_1.getCourseCompletionStats);
exports.default = router;
