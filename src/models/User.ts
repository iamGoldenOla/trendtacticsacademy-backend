import mongoose, { Document, Schema } from 'mongoose';
import { IBadge } from './Badge';

export interface IUserBadge {
  badge: mongoose.Types.ObjectId;
  awardedAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'instructor' | 'admin';
  avatar?: string;
  phone?: string;
  enrolledCourses?: mongoose.Types.ObjectId[];
  badges?: IUserBadge[];
  dashboardPreferences?: {
    activeTab?: string;
    theme?: string;
    [key: string]: any;
  };
  socialLinks?: {
    linkedin?: string;
    github?: string;
    facebook?: string;
    instagram?: string;
    website?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
  avatar: { type: String },
  phone: { type: String },
  enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  badges: [{
    badge: { type: Schema.Types.ObjectId, ref: 'Badge' },
    awardedAt: { type: Date, default: Date.now }
  }],
  dashboardPreferences: {
    type: Schema.Types.Mixed,
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
UserSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> {
  // This will be implemented with bcrypt in the auth middleware
  return enteredPassword === this.password;
};

const User = mongoose.model<IUser>('User', UserSchema);
export default User;