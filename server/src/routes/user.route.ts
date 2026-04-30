import express from 'express';
import { getProfile, updateCart, getOrders } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.use(authenticate);
router.get('/me', getProfile);
router.put('/me/cart', updateCart);
router.get('/me/orders', getOrders);

export default router;
