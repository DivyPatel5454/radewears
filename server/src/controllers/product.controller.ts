import { Request, Response } from 'express';
import Product from '../models/Product';
import { AppError } from '../middlewares/error';

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ status: 'success', data: { product } });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const filter: any = {};
    const includeOutOfStock = req.query.includeOutOfStock === 'true';
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.adminId) {
      filter.adminId = req.query.adminId;
    }
    if (!includeOutOfStock) {
      filter.stock = { $gt: 0 };
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: products.length, data: { products } });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const includeOutOfStock = req.query.includeOutOfStock === 'true';
    const product = await Product.findById(req.params.id);
    if (!product || (!includeOutOfStock && product.stock <= 0)) {
      throw new AppError(404, 'No product found with that ID');
    }
    res.status(200).json({ status: 'success', data: { product } });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      throw new AppError(404, 'No product found with that ID');
    }
    res.status(200).json({ status: 'success', data: { product } });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      throw new AppError(404, 'No product found with that ID');
    }
    res.status(204).json({ status: 'success', data: null });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
