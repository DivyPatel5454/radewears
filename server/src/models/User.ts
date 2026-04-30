import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICartItem {
  id?: string;
  productId: string;
  name: string;
  price: number;
  discount?: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
  isCustomDesign?: boolean;
  uploadedDesignUrl?: string;
  uploadedDesignUrls?: string[];
}

export interface IUser extends Document {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
  cart: ICartItem[];
  purchaseHistory: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    id: { type: String, trim: true },
    productId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String, trim: true },
    color: { type: String, trim: true },
    image: { type: String, trim: true },
    isCustomDesign: { type: Boolean, default: false },
    uploadedDesignUrl: { type: String, trim: true },
    uploadedDesignUrls: [{ type: String, trim: true }],
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    avatar: { type: String, trim: true },
    cart: { type: [cartItemSchema], default: [] },
    purchaseHistory: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;
