"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = exports.markNotificationRead = exports.getNotifications = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
// Get all notifications for a user
const getNotifications = async (req, res) => {
    var _a;
    try {
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || req.body.userId || req.query.userId;
        if (!userId)
            return res.status(400).json({ error: 'User ID required' });
        const notifications = await Notification_1.default.find({ user: userId }).sort({ createdAt: -1 });
        res.json(notifications);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};
exports.getNotifications = getNotifications;
// Mark a notification as read
const markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification_1.default.findByIdAndUpdate(id, { read: true }, { new: true });
        if (!notification)
            return res.status(404).json({ error: 'Notification not found' });
        res.json(notification);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};
exports.markNotificationRead = markNotificationRead;
// Create a notification
const createNotification = async (req, res) => {
    try {
        const { user, type, message, link } = req.body;
        if (!user || !message)
            return res.status(400).json({ error: 'User and message required' });
        const notification = await Notification_1.default.create({ user, type, message, link });
        res.status(201).json(notification);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create notification' });
    }
};
exports.createNotification = createNotification;
