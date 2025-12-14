import mongoose, { Document, Schema } from 'mongoose';

export interface IBadge extends Document {
  name: string;
  description: string;
  icon?: string;
  awardedAt: Date;
}

const BadgeSchema = new Schema<IBadge>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String },
  awardedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Badge = mongoose.model<IBadge>('Badge', BadgeSchema);
export default Badge;