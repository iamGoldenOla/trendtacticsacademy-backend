"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, role, phone } = req.body;
        // Prevent public creation of admin users
        if (role === 'admin') {
            return res.status(403).json({ message: 'Public registration of admin users is not allowed' });
        }
        // Check if user already exists
        const userExists = yield User_1.default.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Hash password
        const hashedPassword = yield (0, password_1.hashPassword)(password);
        // Create user
        const user = yield User_1.default.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'student',
            phone
        });
        // Generate token
        const token = (0, jwt_1.generateToken)(user);
        // Return user data and token
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            token
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});
exports.registerUser = registerUser;
/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Check if password matches
        const isMatch = yield (0, password_1.comparePassword)(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Generate token
        const token = (0, jwt_1.generateToken)(user);
        // Return user data and token
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});
exports.loginUser = loginUser;
/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // User is already attached to req by auth middleware
        const user = yield User_1.default.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error getting profile' });
    }
});
exports.getUserProfile = getUserProfile;
/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Update user fields
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        // Only update password if provided
        if (req.body.password) {
            user.password = yield (0, password_1.hashPassword)(req.body.password);
        }
        // Update avatar if provided
        if (req.body.avatar) {
            user.avatar = req.body.avatar;
        }
        // Update social links if provided
        if (req.body.socialLinks) {
            user.socialLinks = {
                linkedin: req.body.socialLinks.linkedin || user.socialLinks?.linkedin || '',
                github: req.body.socialLinks.github || user.socialLinks?.github || '',
                facebook: req.body.socialLinks.facebook || user.socialLinks?.facebook || '',
                instagram: req.body.socialLinks.instagram || user.socialLinks?.instagram || '',
                website: req.body.socialLinks.website || user.socialLinks?.website || ''
            };
        }
        // Save updated user
        const updatedUser = yield user.save();
        // Generate new token with updated info
        const token = (0, jwt_1.generateToken)(updatedUser);
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            phone: updatedUser.phone,
            socialLinks: updatedUser.socialLinks,
            token
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
});
exports.updateUserProfile = updateUserProfile;
