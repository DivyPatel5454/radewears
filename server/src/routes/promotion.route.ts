import express from 'express';
import * as promotionController from '../controllers/promotion.controller';

const router = express.Router();

// ── Public endpoints (store frontend) ──
// POST /v1/promotions/validate — check if a promo code is valid
router.post('/validate', promotionController.validatePromotion);
// POST /v1/promotions/redeem  — increment usage count after checkout
router.post('/redeem', promotionController.redeemPromotion);

// ── Admin CRUD endpoints ──
router.route('/').get(promotionController.getPromotions).post(promotionController.createPromotion);
router.route('/:id').put(promotionController.updatePromotion).delete(promotionController.deletePromotion);

export default router;
