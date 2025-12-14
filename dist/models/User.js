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
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
    avatar: { type: String },
    phone: { type: String },
    enrolledCourses: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Course' }],
    badges: [{
            badge: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Badge' },
            awardedAt: { type: Date, default: Date.now }
        }],
    dashboardPreferences: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    },
    socialLinks: {
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' },
        facebook: { type: String, default: '' },
        instagram: { type: String, default: '' },
        website: { type: String, default: '' }
    }
}, { timestamps: true });
// Add method to check if password matches
UserSchema.methods.matchPassword = async function (enteredPassword) {
    // This will be implemented with bcrypt in the auth middleware
    return enteredPassword === this.password;
};
const User = mongoose_1.default.model('User', UserSchema);
exports.default = User;
