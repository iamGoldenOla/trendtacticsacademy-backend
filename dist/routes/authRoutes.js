"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabaseAuthController_1 = require("../controllers/supabaseAuthController");
const supabaseAuth_1 = require("../middleware/supabaseAuth");
const router = express_1.default.Router();
// Public routes
router.post('/register', supabaseAuthController_1.registerUser);
router.post('/login', supabaseAuthController_1.loginUser);
// Protected routes
router.get('/profile', supabaseAuth_1.protect, supabaseAuthController_1.getUserProfile);
router.put('/profile', supabaseAuth_1.protect, supabaseAuthController_1.updateUserProfile);
router.post('/logout', supabaseAuth_1.protect, supabaseAuthController_1.logoutUser);
// Admin routes
router.get('/users', supabaseAuth_1.protect, supabaseAuth_1.admin, supabaseAuthController_1.getAllUsers);
exports.default = router;
