import { Request, Response } from 'express';
import Notification from '../models/Notification';

// Get all notifications for a user
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id || req.body.userId || req.query.userId;
    if (!userId) return res.status(400).json({ error: 'User ID required' });
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Mark a notification as read
export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Create a notification
export const createNotification = async (req: Request, res: Response) => {
  try {
    const { user, type, message, link } = req.body;
    if (!user || !message) return res.status(400).json({ error: 'User and message required' });
    const notification = await Notification.create({ user, type, message, link });
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
};