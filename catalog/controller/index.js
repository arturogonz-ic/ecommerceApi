import multer from 'multer';
import * as catalogService from '../service/index.js';
import { createProductSchema, updateProductSchema, productIdSchema, discountSchema } from '../validation/index.js';
import { success } from '../../shared/response/index.js';
import { AppError } from '../../shared/error/AppError.js';

export const listProducts = async (req, res, next) => {
  try {
    const products = await catalogService.listProducts();
    res.json(success({ products }));
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const { id } = productIdSchema.parse(req.params);
    const product = await catalogService.getProductById(id);
    res.json(success({ product }));
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const data = createProductSchema.parse(req.body);
    const product = await catalogService.createProduct(data, req.files ?? []);
    res.status(201).json(success({ product }));
  } catch (err) {
    if (err instanceof multer.MulterError) {
      return next(new AppError(400, err.message));
    }
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = productIdSchema.parse(req.params);
    const data = updateProductSchema.parse(req.body);
    const product = await catalogService.updateProduct(id, data);
    res.json(success({ product }));
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = productIdSchema.parse(req.params);
    await catalogService.deleteProduct(id);
    res.json(success(null));
  } catch (err) {
    next(err);
  }
};

export const deleteImage = async (req, res, next) => {
  try {
    const { id } = productIdSchema.parse(req.params);
    const index = parseInt(req.params.index, 10);
    if (isNaN(index)) throw new AppError(400, 'Invalid image index');
    const product = await catalogService.deleteProductImage(id, index);
    res.json(success({ product }));
  } catch (err) {
    next(err);
  }
};

export const applyProductDiscount = async (req, res, next) => {
  try {
    const { id } = productIdSchema.parse(req.params);
    const data = discountSchema.parse(req.body);
    const product = await catalogService.applyProductDiscount(id, data);
    res.json(success({ product }));
  } catch (err) {
    next(err);
  }
};

export const removeProductDiscount = async (req, res, next) => {
  try {
    const { id } = productIdSchema.parse(req.params);
    const product = await catalogService.removeProductDiscount(id);
    res.json(success({ product }));
  } catch (err) {
    next(err);
  }
};

export const bestSellers = async (req, res, next) => {
  try {
    const products = await catalogService.getBestSellers();
    res.json(success({ products }));
  } catch (err) {
    next(err);
  }
};
