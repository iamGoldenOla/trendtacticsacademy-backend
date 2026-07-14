"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.getAllUsers = exports.updateUserProfile = exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const supabase_1 = require("../utils/supabase");
const supabaseModels_1 = require("../utils/supabaseModels");
/**
 * @desc    Register a new user with Supabase Auth
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        // Sign up user with Supabase Auth
        const { data, error } = await supabase_1.supabaseAdmin.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role: role || 'student'
                }
            }
        });
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        // Also create user in users table for additional data
        if (data.user) {
            await supabaseModels_1.User.create({
                id: data.user.id,
                name,
                email,
                password, // Note: In production, you might not want to store this
                role: role || 'student',
                dashboard_preferences: {}
            });
        }
        res.status(201).json({
            user: data.user,
            session: data.session
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};
exports.registerUser = registerUser;
/**
 * @desc    Login user with Supabase Auth
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Sign in user with Supabase Auth
        const { data, error } = await supabase_1.supabaseAdmin.auth.signInWithPassword({
            email,
            password
        });
        if (error) {
            return res.status(401).json({ message: error.message });
        }
        res.json({
            user: data.user,
            session: data.session
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
        // Get user ID from authenticated user
        const userId = req.user.id;
        // Get user from users table
        const user = await supabaseModels_1.User.findById(userId);
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
        const userId = req.user.id;
        // Update user in users table
        const updatedUser = await supabaseModels_1.User.update(userId, {
            name: req.body.name,
            email: req.body.email,
            avatar: req.body.avatar,
            phone: req.body.phone,
            dashboard_preferences: req.body.dashboard_preferences,
            social_links: req.body.social_links
        });
        res.json(updatedUser);
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
        // Check if user is admin (you'll need to implement this check based on your auth setup)
        // For now, we'll just return all users
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const users = await supabaseModels_1.User.findAll(page, limit);
        res.json(users);
    }
    catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
};
exports.getAllUsers = getAllUsers;
/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logoutUser = async (req, res) => {
    try {
        // Sign out user with Supabase Auth
        const { error } = await supabase_1.supabaseAdmin.auth.signOut();
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        res.json({ message: 'Logged out successfully' });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Server error during logout' });
    }
};
exports.logoutUser = logoutUser;
