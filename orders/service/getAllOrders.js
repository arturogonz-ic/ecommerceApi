import { Order } from '../model/Order.js';
import { Product } from '../../catalog/model/Product.js';

export const getAllOrders = async (filters = {}) => {
  const query = {};

  if (filters.createdAtFrom || filters.createdAtTo) {
    query.createdAt = {};
    if (filters.createdAtFrom) {
      query.createdAt.$gte = new Date(filters.createdAtFrom);
    }
    if (filters.createdAtTo) {
      query.createdAt.$lte = new Date(filters.createdAtTo);
    }
  }

  if (filters.deliveryAtFrom || filters.deliveryAtTo) {
    query.deliveryAt = {};
    if (filters.deliveryAtFrom) {
      query.deliveryAt.$gte = new Date(filters.deliveryAtFrom);
    }
    if (filters.deliveryAtTo) {
      query.deliveryAt.$lte = new Date(filters.deliveryAtTo);
    }
  }

  if (filters.status) {
    const statusArray = Array.isArray(filters.status) ? filters.status : [filters.status];
    if (statusArray.length > 0) {
      query.status = { $in: statusArray };
    }
  }

  if (filters.productIds && filters.productIds.length > 0) {
    const productArray = Array.isArray(filters.productIds) ? filters.productIds : [filters.productIds];
    query['items.productId'] = { $all: productArray };
  }

  if (filters.categoryIds && filters.categoryIds.length > 0) {
    const categoryArray = Array.isArray(filters.categoryIds) ? filters.categoryIds : [filters.categoryIds];
    const productsByCategory = await Promise.all(
      categoryArray.map(catId => Product.find({ categories: catId }).distinct('_id'))
    );
    const categoryConditions = productsByCategory.map(products => ({
      'items.productId': { $in: products }
    }));
    query.$and = (query.$and || []).concat(categoryConditions);
  }

  return Order.find(query)
    .populate('userId', 'name email shippingAddress billingAddress')
    .sort({ createdAt: -1 });
};
