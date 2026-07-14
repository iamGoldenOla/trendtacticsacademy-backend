import mongoose, { Document, Schema } from 'mongoose';

export interface IPurchase extends Document {
  user: mongoose.Types.ObjectId;
  courseId: string;
  paymentGateway: 'paystack' | 'flutterwave';
  reference: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: String, required: true },
  paymentGateway: { type: String, enum: ['paystack', 'flutterwave'], required: true },
  reference: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, enum: ['success', 'failed'], default: 'success' }
}, { timestamps: true });

const Purchase = mongoose.model<IPurchase>('Purchase', PurchaseSchema);
export default Purchase;
