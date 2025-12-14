import mongoose, { Document, Schema } from 'mongoose';

export interface IProgress extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  completedLessons: mongoose.Types.ObjectId[];
  progressPercentage: number;
  lastAccessed: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgress>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  completedLessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  progressPercentage: { type: Number, default: 0 },
  lastAccessed: { type: Date, default: Date.now }
}, { timestamps: true });

// Create a compound index to ensure a user can only have one progress record per course
ProgressSchema.index({ user: 1, course: 1 }, { unique: true });

const Progress = mongoose.model<IProgress>('Progress', ProgressSchema);
export default Progress;