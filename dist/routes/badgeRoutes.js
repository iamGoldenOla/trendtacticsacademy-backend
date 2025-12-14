"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const badgeController_1 = require("../controllers/badgeController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.get('/', badgeController_1.getAllBadges);
// Protected routes
router.get('/user/:userId', auth_1.protect, badgeController_1.getUserBadges);
// Admin routes
router.post('/', auth_1.protect, (0, auth_1.authorize)('admin'), badgeController_1.createBadge);
router.put('/:id', auth_1.protect, (0, auth_1.authorize)('admin'), badgeController_1.updateBadge);
router.delete('/:id', auth_1.protect, (0, auth_1.authorize)('admin'), badgeController_1.deleteBadge);
router.post('/:id/award/:userId', auth_1.protect, (0, auth_1.authorize)('admin'), badgeController_1.awardBadgeToUser);
exports.default = router;
