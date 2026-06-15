import * as categoryService from '../service/index.js';
import { createCategorySchema, categoryIdSchema, discountSchema } from '../validation/index.js';
import { success } from '../../shared/response/index.js';

export const listCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.listCategories();
    res.json(success({ categories }));
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const data = createCategorySchema.parse(req.body);
    const category = await categoryService.createCategory(data);
    res.status(201).json(success({ category }));
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = categoryIdSchema.parse(req.params);
    await categoryService.deleteCategory(id);
    res.json(success(null));
  } catch (err) {
    next(err);
  }
};

export const getProductCount = async (req, res, next) => {
  try {
    const { id } = categoryIdSchema.parse(req.params);
    const count = await categoryService.getProductCount(id);
    res.json(success({ count }));
  } catch (err) {
    next(err);
  }
};

export const applyCategoryDiscount = async (req, res, next) => {
  try {
    const { id } = categoryIdSchema.parse(req.params);
    const data = discountSchema.parse(req.body);
    const category = await categoryService.applyCategoryDiscount(id, data);
    res.json(success({ category }));
  } catch (err) {
    next(err);
  }
};

export const removeCategoryDiscount = async (req, res, next) => {
  try {
    const { id } = categoryIdSchema.parse(req.params);
    const category = await categoryService.removeCategoryDiscount(id);
    res.json(success({ category }));
  } catch (err) {
    next(err);
  }
};
