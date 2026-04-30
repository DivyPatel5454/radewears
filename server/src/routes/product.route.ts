import express from 'express';
import * as productController from '../controllers/product.controller';

const router = express.Router();

router
  .route('/')
  .post(productController.createProduct)
  .get(productController.getProducts);

router
  .route('/:id')
  .get(productController.getProduct)
  .put(productController.updateProduct)
  .delete(productController.deleteProduct);

export default router;
