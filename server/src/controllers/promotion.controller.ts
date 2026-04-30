import { Request, Response } from 'express';
import Promotion from '../models/Promotion';

// ──────────────────────────────────────────────────────────
// Admin: List all promotions
// ──────────────────────────────────────────────────────────
export const getPromotions = async (_req: Request, res: Response) => {
  try {
    const promotions = await Promotion.find({}).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: promotions.length, data: { promotions } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ──────────────────────────────────────────────────────────
// Admin: Create promotion
// ──────────────────────────────────────────────────────────
export const createPromotion = async (req: Request, res: Response) => {
  try {
    const {
      code, description, discountType, discountValue,
      minOrderValue, usageLimit, startDate, endDate,
      isActive, oneTimePerCustomer,
    } = req.body;

    // Basic sanitisation
    if (!code || !description || !discountType || discountValue === undefined) {
      return res.status(400).json({ status: 'error', message: 'code, description, discountType and discountValue are required.' });
    }
    if (!['percentage', 'fixed'].includes(discountType)) {
      return res.status(400).json({ status: 'error', message: 'discountType must be "percentage" or "fixed".' });
    }
    if (discountType === 'percentage' && (discountValue < 1 || discountValue > 100)) {
      return res.status(400).json({ status: 'error', message: 'Percentage discount must be between 1 and 100.' });
    }
    if (discountValue < 0) {
      return res.status(400).json({ status: 'error', message: 'discountValue cannot be negative.' });
    }

    const promotion = await Promotion.create({
      code: String(code).toUpperCase().trim(),
      description,
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue ?? 0),
      usageLimit: usageLimit ? Number(usageLimit) : null,
      startDate: startDate || null,
      endDate: endDate || null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      oneTimePerCustomer: Boolean(oneTimePerCustomer),
    });

    res.status(201).json({ status: 'success', data: { promotion } });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ status: 'error', message: 'A promotion with this code already exists.' });
    }
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// ──────────────────────────────────────────────────────────
// Admin: Update promotion
// ──────────────────────────────────────────────────────────
export const updatePromotion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };

    // Normalise code to uppercase if being changed
    if (update.code) update.code = String(update.code).toUpperCase().trim();

    const promotion = await Promotion.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!promotion) return res.status(404).json({ status: 'error', message: 'Promotion not found.' });

    res.status(200).json({ status: 'success', data: { promotion } });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ status: 'error', message: 'A promotion with this code already exists.' });
    }
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// ──────────────────────────────────────────────────────────
// Admin: Delete promotion
// ──────────────────────────────────────────────────────────
export const deletePromotion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const promotion = await Promotion.findByIdAndDelete(id);
    if (!promotion) return res.status(404).json({ status: 'error', message: 'Promotion not found.' });
    res.status(204).json({ status: 'success', data: null });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ──────────────────────────────────────────────────────────
// PUBLIC: Validate a promo code (called from cart/checkout)
// Returns discount info WITHOUT leaking sensitive data
// Rate-limited by the global API limiter to prevent brute force
// ──────────────────────────────────────────────────────────
export const validatePromotion = async (req: Request, res: Response) => {
  try {
    const rawCode = req.body.code;
    const orderValue = Number(req.body.orderValue ?? 0);

    if (!rawCode || typeof rawCode !== 'string') {
      return res.status(400).json({ status: 'error', message: 'No promo code provided.' });
    }

    // Sanitise: only allow alphanumeric + hyphen/underscore, max 50 chars
    const code = String(rawCode).toUpperCase().trim().replace(/[^A-Z0-9_-]/g, '');
    if (!code || code.length > 50) {
      return res.status(400).json({ valid: false, message: 'Invalid promo code format.' });
    }

    const promo = await Promotion.findOne({ code });

    if (!promo || !promo.isActive) {
      return res.status(200).json({ valid: false, message: 'Invalid or inactive promo code.' });
    }

    // Check date range
    const now = new Date();
    if (promo.startDate && now < promo.startDate) {
      return res.status(200).json({ valid: false, message: 'This promotion has not started yet.' });
    }
    if (promo.endDate && now > promo.endDate) {
      return res.status(200).json({ valid: false, message: 'This promotion has expired.' });
    }

    // Check usage limit
    if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
      return res.status(200).json({ valid: false, message: 'This promo code has reached its usage limit.' });
    }

    // Check minimum order value
    if (orderValue < promo.minOrderValue) {
      return res.status(200).json({
        valid: false,
        message: `Minimum order value of ₹${promo.minOrderValue.toFixed(2)} required.`,
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (promo.discountType === 'percentage') {
      discountAmount = (orderValue * promo.discountValue) / 100;
    } else {
      discountAmount = Math.min(promo.discountValue, orderValue); // can't discount more than order
    }

    return res.status(200).json({
      valid: true,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountAmount: Math.round(discountAmount * 100) / 100,
      description: promo.description,
      message: `Promo code applied! You save ₹${discountAmount.toFixed(2)}.`,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Server error. Please try again.' });
  }
};

// ──────────────────────────────────────────────────────────
// PUBLIC: Increment usedCount after successful checkout
// Called server-side after order is confirmed (not on validate)
// ──────────────────────────────────────────────────────────
export const redeemPromotion = async (req: Request, res: Response) => {
  try {
    const rawCode = req.body.code;
    if (!rawCode) return res.status(400).json({ status: 'error', message: 'Code required.' });

    const code = String(rawCode).toUpperCase().trim();
    const promo = await Promotion.findOneAndUpdate(
      { code, isActive: true },
      { $inc: { usedCount: 1 } },
      { new: true }
    );

    if (!promo) return res.status(404).json({ status: 'error', message: 'Promotion not found or inactive.' });

    res.status(200).json({ status: 'success', message: 'Promo code redeemed.' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
