import express from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.use(authenticate);

router
  .route('/')
  .post(orderController.createOrder)
  .get(orderController.getOrders);

router
  .route('/:id')
  .get(orderController.getOrder)
  .put(orderController.updateOrder)
  .delete(orderController.deleteOrder);

export default router;
