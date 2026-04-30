import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Product from '../models/Product';
import { AppError } from '../middlewares/error';
import { sendOrderConfirmationEmail } from '../utils/emailService';

export const createOrder = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = (req as any).user;
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({ status: 'error', message: 'Authentication required' });
    }

    const {
      orderId,
      date,
      customer,
      address,
      items,
      subtotal,
      shipping,
      tax,
      total,
      discount = 0,
      promoCode,
    } = req.body as any;

    if (!orderId || typeof orderId !== 'string') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ status: 'error', message: 'Invalid order ID' });
    }
    if (!date || typeof date !== 'string') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ status: 'error', message: 'Invalid date' });
    }
    if (
      !customer ||
      typeof customer.name !== 'string' ||
      typeof customer.email !== 'string' ||
      typeof customer.phone !== 'string'
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ status: 'error', message: 'Invalid customer data' });
    }
    if (!address || typeof address !== 'string') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ status: 'error', message: 'Invalid address' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ status: 'error', message: 'Order must contain at least one item' });
    }
    const validatedItems = items.map((item: any) => ({
      productId: String(item.productId || item.id || '').trim(),
      name: String(item.name || '').trim(),
      qty: Number(item.qty),
      price: Number(item.price),
      image: item.image || undefined,
      size: item.size ? String(item.size).trim() : undefined,
      color: item.color ? String(item.color).trim() : undefined,
      trackingId: undefined as string | undefined,
      isCustomDesign: Boolean(item.isCustomDesign),
      uploadedDesignUrl: item.uploadedDesignUrl ? String(item.uploadedDesignUrl).trim() : undefined,
      uploadedDesignUrls: Array.isArray(item.uploadedDesignUrls) ? item.uploadedDesignUrls.map(String) : undefined,
    }));
    if (validatedItems.some((item) => !item.productId || !item.name || item.qty <= 0 || item.price < 0)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ status: 'error', message: 'Invalid item data' });
    }

    const cleanedItems = validatedItems.map((item) => {
      const { image, uploadedDesignUrls, ...rest } = item;
      const cleaned = image ? { ...rest, image } : rest;
      if (uploadedDesignUrls && uploadedDesignUrls.length > 0) {
        return { ...cleaned, uploadedDesignUrls };
      }
      return cleaned;
    });

    if (typeof subtotal !== 'number' || typeof shipping !== 'number' || typeof tax !== 'number' || typeof total !== 'number') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ status: 'error', message: 'Invalid order totals' });
    }

    const enrichedItems = [] as any[];
    for (const item of cleanedItems) {
      if (mongoose.isValidObjectId(item.productId) && !item.productId.startsWith("custom-")) {
        const product = await Product.findOneAndUpdate(
          { _id: item.productId, stock: { $gte: item.qty } },
          { $inc: { stock: -item.qty } },
          { new: true, session }
        );
        if (!product) {
          throw new AppError(400, `Insufficient stock for product "${item.name}"`);
        }
        enrichedItems.push({ ...item, trackingId: product.adminId?.trim() });
      } else {
        enrichedItems.push(item);
      }
    }

    const newOrder = {
      orderId: orderId.trim(),
      date: date.trim(),
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
      },
      address: address.trim(),
      items: enrichedItems,
      subtotal,
      discount: Math.max(0, Number(discount)),
      promoCode: promoCode ? String(promoCode).toUpperCase().trim() : undefined,
      shipping,
      tax,
      total,
      user: user._id,
      status: 'Pending',
    };

    const order = await new Order(newOrder).save({ session });

    user.purchaseHistory.push(order._id);
    user.cart = [];
    await user.save({ session });
    await session.commitTransaction();
    session.endSession();

    // Send order confirmation email asynchronously
    sendOrderConfirmationEmail(customer.email.trim(), order.orderId);

    res.status(201).json({ status: 'success', data: { order } });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Authentication required' });
    }

    const filter: any = { user: user._id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: orders.length, data: { orders } });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new AppError(404, 'No order found with that ID');
    }
    res.status(200).json({ status: 'success', data: { order } });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!order) {
      throw new AppError(404, 'No order found with that ID');
    }
    res.status(200).json({ status: 'success', data: { order } });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      throw new AppError(404, 'No order found with that ID');
    }
    res.status(204).json({ status: 'success', data: null });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
