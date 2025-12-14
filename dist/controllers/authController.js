"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.updateUserProfile = exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        // Check if user already exists
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Hash password
        const hashedPassword = await (0, password_1.hashPassword)(password);
        // Create user
        const user = await User_1.default.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'student',
            dashboardPreferences: {}
        });
        // Generate token
        const token = (0, jwt_1.generateToken)(user);
        // Return user data and token
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            dashboardPreferences: user.dashboardPreferences,
            token
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};
exports.registerUser = registerUser;
/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Check if password matches
        const isMatch = await (0, password_1.comparePassword)(password, user.password);
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
            avatar: user.avatar,
            dashboardPreferences: user.dashboardPreferences,
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};
exports.loginUser = loginUser;
/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getUserProfile = async (req, res) => {
    try {
        // User is already attached to req by auth middleware
        const user = await User_1.default.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error getting profile' });
    }
};
exports.getUserProfile = getUserProfile;
/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateUserProfile = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Update user fields
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.dashboardPreferences) {
            user.dashboardPreferences = req.body.dashboardPreferences;
        }
        // Only update password if provided
        if (req.body.password) {
            user.password = await (0, password_1.hashPassword)(req.body.password);
        }
        // Update avatar if provided
        if (req.body.avatar) {
            user.avatar = req.body.avatar;
        }
        // Save updated user
        const updatedUser = await user.save();
        // Generate new token with updated info
        const token = (0, jwt_1.generateToken)(updatedUser);
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            dashboardPreferences: updatedUser.dashboardPreferences,
            token
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};
exports.updateUserProfile = updateUserProfile;
/**
 * @desc    Get all users (admin only)
 * @route   GET /api/auth/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res) => {
    try {
        // Only allow admin
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Admins only' });
        }
        const users = await User_1.default.find().select('-password');
        res.json(users);
    }
    catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
};
exports.getAllUsers = getAllUsers;
