"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationController_1 = require("../controllers/notificationController");
const router = express_1.default.Router();
// GET /api/notifications?userId=xxx
router.get('/', notificationController_1.getNotifications);
// PATCH /api/notifications/:id/read
router.patch('/:id/read', notificationController_1.markNotificationRead);
// POST /api/notifications
router.post('/', notificationController_1.createNotification);
exports.default = router;
