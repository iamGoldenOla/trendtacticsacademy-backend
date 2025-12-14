import { Request, Response } from 'express';
import Badge from '../models/Badge';
import User from '../models/User';
import { IUserBadge } from '../models/User';

/**
 * @desc    Get all badges
 * @route   GET /api/badges
 * @access  Public
 */
export const getAllBadges = async (req: Request, res: Response) => {
  try {
    const badges = await Badge.find({});
    res.json(badges);
  } catch (error: any) {
    console.error('Get badges error:', error);
    res.status(500).json({ message: 'Server error fetching badges' });
  }
};

/**
 * @desc    Create a new badge
 * @route   POST /api/badges
 * @access  Private/Admin
 */
export const createBadge = async (req: Request, res: Response) => {
  try {
    const { name, description, icon } = req.body;
    
    // Check if badge with same name already exists
    const badgeExists = await Badge.findOne({ name });
    if (badgeExists) {
      return res.status(400).json({ message: 'Badge with this name already exists' });
    }
    
    // Create badge
    const badge = await Badge.create({
      name,
      description,
      icon
    });
    
    res.status(201).json(badge);
  } catch (error: any) {
    console.error('Create badge error:', error);
    res.status(500).json({ message: 'Server error creating badge' });
  }
};

/**
 * @desc    Update a badge
 * @route   PUT /api/badges/:id
 * @access  Private/Admin
 */
export const updateBadge = async (req: Request, res: Response) => {
  try {
    const badge = await Badge.findById(req.params.id);
    
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }
    
    // Update badge fields
    badge.name = req.body.name || badge.name;
    badge.description = req.body.description || badge.description;
    badge.icon = req.body.icon || badge.icon;
    
    const updatedBadge = await badge.save();
    
    res.json(updatedBadge);
  } catch (error: any) {
    console.error('Update badge error:', error);
    res.status(500).json({ message: 'Server error updating badge' });
  }
};

/**
 * @desc    Delete a badge
 * @route   DELETE /api/badges/:id
 * @access  Private/Admin
 */
export const deleteBadge = async (req: Request, res: Response) => {
  try {
    const badge = await Badge.findById(req.params.id);
    
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }
    
    await badge.deleteOne();
    
    // Remove badge from all users who have it
    await User.updateMany(
      { 'badges.badge': req.params.id },
      { $pull: { badges: { badge: req.params.id } } }
    );
    
    res.json({ message: 'Badge removed' });
  } catch (error: any) {
    console.error('Delete badge error:', error);
    res.status(500).json({ message: 'Server error deleting badge' });
  }
};

/**
 * @desc    Award badge to user
 * @route   POST /api/badges/:id/award/:userId
 * @access  Private/Admin
 */
export const awardBadgeToUser = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;
    
    // Check if badge exists
    const badge = await Badge.findById(id);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user already has this badge
    if (!user.badges) {
      user.badges = [];
    }
    const alreadyAwarded = (user.badges as IUserBadge[]).some(
      (userBadge) => userBadge.badge && userBadge.badge.toString() === id
    );
    
    if (alreadyAwarded) {
      return res.status(400).json({ message: 'User already has this badge' });
    }
    
    // Award badge to user
    (user.badges as IUserBadge[]).push({
      badge: new (require('mongoose').Types.ObjectId)(id),
      awardedAt: new Date()
    });
    
    await user.save();
    
    res.json({ message: 'Badge awarded successfully' });
  } catch (error: any) {
    console.error('Award badge error:', error);
    res.status(500).json({ message: 'Server error awarding badge' });
  }
};

/**
 * @desc    Get user badges
 * @route   GET /api/badges/user/:userId
 * @access  Private
 */
export const getUserBadges = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Check if requesting user is the same as target user or is admin
    if (req.user && req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these badges' });
    }
    
    const user = await User.findById(userId).populate('badges.badge');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.badges);
  } catch (error: any) {
    console.error('Get user badges error:', error);
    res.status(500).json({ message: 'Server error fetching user badges' });
  }
};

// Remove inline IUserBadge interface