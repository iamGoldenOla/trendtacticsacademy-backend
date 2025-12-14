import express from 'express';
import { getNotifications, markNotificationRead, createNotification } from '../controllers/notificationController';

const router = express.Router();

// GET /api/notifications?userId=xxx
router.get('/', getNotifications);
// PATCH /api/notifications/:id/read
router.patch('/:id/read', markNotificationRead);
// POST /api/notifications
router.post('/', createNotification);

export default router;