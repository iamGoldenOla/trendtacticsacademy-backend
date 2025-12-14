"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserBadges = exports.awardBadgeToUser = exports.deleteBadge = exports.updateBadge = exports.createBadge = exports.getAllBadges = void 0;
const Badge_1 = __importDefault(require("../models/Badge"));
const User_1 = __importDefault(require("../models/User"));
/**
 * @desc    Get all badges
 * @route   GET /api/badges
 * @access  Public
 */
const getAllBadges = async (req, res) => {
    try {
        const badges = await Badge_1.default.find({});
        res.json(badges);
    }
    catch (error) {
        console.error('Get badges error:', error);
        res.status(500).json({ message: 'Server error fetching badges' });
    }
};
exports.getAllBadges = getAllBadges;
/**
 * @desc    Create a new badge
 * @route   POST /api/badges
 * @access  Private/Admin
 */
const createBadge = async (req, res) => {
    try {
        const { name, description, icon } = req.body;
        // Check if badge with same name already exists
        const badgeExists = await Badge_1.default.findOne({ name });
        if (badgeExists) {
            return res.status(400).json({ message: 'Badge with this name already exists' });
        }
        // Create badge
        const badge = await Badge_1.default.create({
            name,
            description,
            icon
        });
        res.status(201).json(badge);
    }
    catch (error) {
        console.error('Create badge error:', error);
        res.status(500).json({ message: 'Server error creating badge' });
    }
};
exports.createBadge = createBadge;
/**
 * @desc    Update a badge
 * @route   PUT /api/badges/:id
 * @access  Private/Admin
 */
const updateBadge = async (req, res) => {
    try {
        const badge = await Badge_1.default.findById(req.params.id);
        if (!badge) {
            return res.status(404).json({ message: 'Badge not found' });
        }
        // Update badge fields
        badge.name = req.body.name || badge.name;
        badge.description = req.body.description || badge.description;
        badge.icon = req.body.icon || badge.icon;
        const updatedBadge = await badge.save();
        res.json(updatedBadge);
    }
    catch (error) {
        console.error('Update badge error:', error);
        res.status(500).json({ message: 'Server error updating badge' });
    }
};
exports.updateBadge = updateBadge;
/**
 * @desc    Delete a badge
 * @route   DELETE /api/badges/:id
 * @access  Private/Admin
 */
const deleteBadge = async (req, res) => {
    try {
        const badge = await Badge_1.default.findById(req.params.id);
        if (!badge) {
            return res.status(404).json({ message: 'Badge not found' });
        }
        await badge.deleteOne();
        // Remove badge from all users who have it
        await User_1.default.updateMany({ 'badges.badge': req.params.id }, { $pull: { badges: { badge: req.params.id } } });
        res.json({ message: 'Badge removed' });
    }
    catch (error) {
        console.error('Delete badge error:', error);
        res.status(500).json({ message: 'Server error deleting badge' });
    }
};
exports.deleteBadge = deleteBadge;
/**
 * @desc    Award badge to user
 * @route   POST /api/badges/:id/award/:userId
 * @access  Private/Admin
 */
const awardBadgeToUser = async (req, res) => {
    try {
        const { id, userId } = req.params;
        // Check if badge exists
        const badge = await Badge_1.default.findById(id);
        if (!badge) {
            return res.status(404).json({ message: 'Badge not found' });
        }
        // Check if user exists
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if user already has this badge
        if (!user.badges) {
            user.badges = [];
        }
        const alreadyAwarded = user.badges.some((userBadge) => userBadge.badge && userBadge.badge.toString() === id);
        if (alreadyAwarded) {
            return res.status(400).json({ message: 'User already has this badge' });
        }
        // Award badge to user
        user.badges.push({
            badge: new (require('mongoose').Types.ObjectId)(id),
            awardedAt: new Date()
        });
        await user.save();
        res.json({ message: 'Badge awarded successfully' });
    }
    catch (error) {
        console.error('Award badge error:', error);
        res.status(500).json({ message: 'Server error awarding badge' });
    }
};
exports.awardBadgeToUser = awardBadgeToUser;
/**
 * @desc    Get user badges
 * @route   GET /api/badges/user/:userId
 * @access  Private
 */
const getUserBadges = async (req, res) => {
    try {
        const { userId } = req.params;
        // Check if requesting user is the same as target user or is admin
        if (req.user && req.user._id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view these badges' });
        }
        const user = await User_1.default.findById(userId).populate('badges.badge');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.badges);
    }
    catch (error) {
        console.error('Get user badges error:', error);
        res.status(500).json({ message: 'Server error fetching user badges' });
    }
};
exports.getUserBadges = getUserBadges;
// Remove inline IUserBadge interface
