"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AISession = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AIMessageSchema = new mongoose_1.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    metadata: {
        confidence: {
            type: Number,
            min: 0,
            max: 1,
        },
        sources: [{
                type: String,
            }],
        suggestions: [{
                type: String,
            }],
    },
});
const AISessionSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    course: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Course',
    },
    lesson: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Lesson',
    },
    sessionId: {
        type: String,
        required: true,
        unique: true,
    },
    context: {
        userId: {
            type: String,
            required: true,
        },
        courseId: String,
        lessonId: String,
        topic: String,
        userLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner',
        },
        userProgress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        learningStyle: {
            type: String,
            enum: ['visual', 'auditory', 'kinesthetic', 'reading'],
        },
        previousSessions: {
            type: Number,
            default: 0,
        },
    },
    messages: [AIMessageSchema],
    status: {
        type: String,
        enum: ['active', 'completed', 'expired'],
        default: 'active',
    },
    lastActivity: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
// Indexes for better query performance
AISessionSchema.index({ user: 1, createdAt: -1 });
AISessionSchema.index({ sessionId: 1 });
AISessionSchema.index({ status: 1, lastActivity: 1 });
AISessionSchema.index({ 'context.courseId': 1, user: 1 });
// Auto-expire sessions after 24 hours of inactivity
AISessionSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 86400 });
// Pre-save middleware to update lastActivity
AISessionSchema.pre('save', function (next) {
    if (this.isModified('messages')) {
        this.lastActivity = new Date();
    }
    next();
});
// Instance methods
AISessionSchema.methods.addMessage = function (message) {
    this.messages.push({
        ...message,
        timestamp: new Date(),
    });
    this.lastActivity = new Date();
    return this.save();
};
AISessionSchema.methods.markCompleted = function () {
    this.status = 'completed';
    return this.save();
};
AISessionSchema.methods.isExpired = function () {
    const now = new Date();
    const expiryTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    return (now.getTime() - this.lastActivity.getTime()) > expiryTime;
};
// Static methods
AISessionSchema.statics.findActiveSession = function (userId, courseId) {
    const query = {
        user: userId,
        status: 'active',
    };
    if (courseId) {
        query['context.courseId'] = courseId;
    }
    return this.findOne(query).sort({ lastActivity: -1 });
};
AISessionSchema.statics.getUserSessionStats = function (userId) {
    return this.aggregate([
        { $match: { user: new mongoose_1.default.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalSessions: { $sum: 1 },
                activeSessions: {
                    $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                },
                completedSessions: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                },
                totalMessages: { $sum: { $size: '$messages' } },
                avgMessagesPerSession: { $avg: { $size: '$messages' } },
                lastSessionDate: { $max: '$createdAt' },
            }
        }
    ]);
};
AISessionSchema.statics.cleanupExpiredSessions = function () {
    const expiryDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    return this.updateMany({
        status: 'active',
        lastActivity: { $lt: expiryDate }
    }, {
        $set: { status: 'expired' }
    });
};
exports.AISession = mongoose_1.default.model('AISession', AISessionSchema);
