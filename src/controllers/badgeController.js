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
exports.getUserBadges = exports.awardBadgeToUser = exports.deleteBadge = exports.updateBadge = exports.createBadge = exports.getAllBadges = void 0;
const Badge_1 = __importDefault(require("../models/Badge"));
const User_1 = __importDefault(require("../models/User"));
/**
 * @desc    Get all badges
 * @route   GET /api/badges
 * @access  Public
 */
const getAllBadges = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const badges = yield Badge_1.default.find({});
        res.json(badges);
    }
    catch (error) {
        console.error('Get badges error:', error);
        res.status(500).json({ message: 'Server error fetching badges' });
    }
});
exports.getAllBadges = getAllBadges;
/**
 * @desc    Create a new badge
 * @route   POST /api/badges
 * @access  Private/Admin
 */
const createBadge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, icon } = req.body;
        // Check if badge with same name already exists
        const badgeExists = yield Badge_1.default.findOne({ name });
        if (badgeExists) {
            return res.status(400).json({ message: 'Badge with this name already exists' });
        }
        // Create badge
        const badge = yield Badge_1.default.create({
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
});
exports.createBadge = createBadge;
/**
 * @desc    Update a badge
 * @route   PUT /api/badges/:id
 * @access  Private/Admin
 */
const updateBadge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const badge = yield Badge_1.default.findById(req.params.id);
        if (!badge) {
            return res.status(404).json({ message: 'Badge not found' });
        }
        // Update badge fields
        badge.name = req.body.name || badge.name;
        badge.description = req.body.description || badge.description;
        badge.icon = req.body.icon || badge.icon;
        const updatedBadge = yield badge.save();
        res.json(updatedBadge);
    }
    catch (error) {
        console.error('Update badge error:', error);
        res.status(500).json({ message: 'Server error updating badge' });
    }
});
exports.updateBadge = updateBadge;
/**
 * @desc    Delete a badge
 * @route   DELETE /api/badges/:id
 * @access  Private/Admin
 */
const deleteBadge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const badge = yield Badge_1.default.findById(req.params.id);
        if (!badge) {
            return res.status(404).json({ message: 'Badge not found' });
        }
        yield badge.deleteOne();
        // Remove badge from all users who have it
        yield User_1.default.updateMany({ 'badges.badge': req.params.id }, { $pull: { badges: { badge: req.params.id } } });
        res.json({ message: 'Badge removed' });
    }
    catch (error) {
        console.error('Delete badge error:', error);
        res.status(500).json({ message: 'Server error deleting badge' });
    }
});
exports.deleteBadge = deleteBadge;
/**
 * @desc    Award badge to user
 * @route   POST /api/badges/:id/award/:userId
 * @access  Private/Admin
 */
const awardBadgeToUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, userId } = req.params;
        // Check if badge exists
        const badge = yield Badge_1.default.findById(id);
        if (!badge) {
            return res.status(404).json({ message: 'Badge not found' });
        }
        // Check if user exists
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if user already has this badge
        const alreadyAwarded = user.badges.some((userBadge) => userBadge.badge.toString() === id);
        if (alreadyAwarded) {
            return res.status(400).json({ message: 'User already has this badge' });
        }
        // Award badge to user
        user.badges.push({
            badge: id,
            awardedAt: new Date()
        });
        yield user.save();
        res.json({ message: 'Badge awarded successfully' });
    }
    catch (error) {
        console.error('Award badge error:', error);
        res.status(500).json({ message: 'Server error awarding badge' });
    }
});
exports.awardBadgeToUser = awardBadgeToUser;
/**
 * @desc    Get user badges
 * @route   GET /api/badges/user/:userId
 * @access  Private
 */
const getUserBadges = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        // Check if requesting user is the same as target user or is admin
        if (req.user && req.user._id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view these badges' });
        }
        const user = yield User_1.default.findById(userId).populate('badges.badge');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.badges);
    }
    catch (error) {
        console.error('Get user badges error:', error);
        res.status(500).json({ message: 'Server error fetching user badges' });
    }
});
exports.getUserBadges = getUserBadges;
