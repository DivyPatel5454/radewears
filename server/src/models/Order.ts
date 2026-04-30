import mongoose, { Document, Model, Schema } from 'mongoose';

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface IOrderItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  image?: string;
  size?: string;
  color?: string;
  trackingId?: string;
  isCustomDesign?: boolean;
  uploadedDesignUrl?: string;
  uploadedDesignUrls?: string[];
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  orderId: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  date: string;
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  discount?: number;
  promoCode?: string;
  status: OrderStatus;
  address: string;
  refundApproved: boolean;
  cancelReason?: string;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String },
    size: { type: String },
    color: { type: String },
    trackingId: { type: String, trim: true },
    isCustomDesign: { type: Boolean, default: false },
    uploadedDesignUrl: { type: String },
    uploadedDesignUrls: { type: [String], default: [] },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      phone: { type: String, trim: true },
    },
    date: { type: String, required: true },
    items: { type: [orderItemSchema], required: true, default: [] },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    promoCode: { type: String, trim: true },
    shipping: { type: Number, required: true, min: 0, default: 0 },
    tax: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
      required: true,
    },
    address: { type: String, required: true, trim: true },
    refundApproved: { type: Boolean, default: false },
    cancelReason: { type: String, trim: true },
  },
  { timestamps: true }
);

const Order: Model<IOrder> = mongoose.model<IOrder>('Order', orderSchema);
export default Order;
