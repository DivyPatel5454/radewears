import { Request, Response } from 'express';
import User from '../models/User';
import Order from '../models/Order';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'User not authorized' });
    }
    return res.status(200).json({ status: 'success', data: { user } });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateCart = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'User not authorized' });
    }

    const cart = Array.isArray(req.body.cart) ? req.body.cart.map((item: any) => ({
      id: item.id || item.productId || "",
      productId: item.productId || item.id || "",
      name: item.name || "",
      price: item.price || 0,
      discount: item.discount || 0,
      quantity: item.quantity || 1,
      size: item.size,
      color: item.color,
      image: item.image,
      isCustomDesign: item.isCustomDesign || false,
      uploadedDesignUrl: item.uploadedDesignUrl,
      uploadedDesignUrls: Array.isArray(item.uploadedDesignUrls) ? item.uploadedDesignUrls : [],
    })) : [];

    user.cart = cart;
    await user.save();
    return res.status(200).json({ status: 'success', data: { cart: user.cart } });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'User not authorized' });
    }
    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ status: 'success', results: orders.length, data: { orders } });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
