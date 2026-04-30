import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPromotion extends Document {
  code: string;           // e.g. "SUMMER25"
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;  // % or flat ₹ amount
  minOrderValue: number;  // minimum cart total to apply
  usageLimit: number | null;  // null = unlimited
  usedCount: number;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  oneTimePerCustomer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const promotionSchema = new Schema<IPromotion>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,   // always store in uppercase for safe comparison
      maxlength: 50,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    oneTimePerCustomer: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// `code` already has unique index via `unique: true`. No separate index declaration is needed.
const Promotion: Model<IPromotion> = mongoose.model<IPromotion>('Promotion', promotionSchema);
export default Promotion;
