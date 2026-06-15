import { Category } from '../model/Category.js';
import { Product } from '../../catalog/model/Product.js';
import { AppError } from '../../shared/error/AppError.js';

export const listCategories = () => Category.find();

export const createCategory = async (data) => {
  try {
    return await Category.create(data);
  } catch (err) {
    if (err.code === 11000) throw new AppError(409, 'Category name already in use');
    throw err;
  }
};

export const deleteCategory = async (id) => {
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw new AppError(404, 'Category not found');
  await Product.updateMany({ categories: id }, { $pull: { categories: id } });
};

export const getProductCount = async (id) => {
  const exists = await Category.exists({ _id: id });
  if (!exists) throw new AppError(404, 'Category not found');
  return Product.countDocuments({ categories: id });
};

export const applyCategoryDiscount = async (id, data) => {
  const category = await Category.findByIdAndUpdate(
    id,
    { discount: { ...data, isActive: true } },
    { new: true }
  );
  if (!category) throw new AppError(404, 'Category not found');
  return category;
};

export const removeCategoryDiscount = async (id) => {
  const category = await Category.findByIdAndUpdate(
    id,
    { 'discount.isActive': false },
    { new: true }
  );
  if (!category) throw new AppError(404, 'Category not found');
  return category;
};
