import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  read: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  link: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;