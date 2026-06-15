import mongoose from 'mongoose';
import { Product } from '../../catalog/model/Product.js';
import { Order } from '../model/Order.js';
import { AppError } from '../../shared/error/AppError.js';

export const placeOrder = async (userId, items) => {
  // Validate all products exist and have enough stock
  const productIds = items.map((i) => new mongoose.Types.ObjectId(i.productId));
  const products = await Product.find({ _id: { $in: productIds } });

  if (products.length !== items.length) {
    throw new AppError(404, 'Product not found');
  }

  const productMap = Object.fromEntries(products.map((p) => [p._id.toString(), p]));

  for (const item of items) {
    const product = productMap[item.productId];
    if (product.stock < item.quantity) {
      throw new AppError(422, 'Insufficient stock for one or more products');
    }
  }

  // Decrement stock atomically for each item
  for (const item of items) {
    const result = await Product.findOneAndUpdate(
      { _id: item.productId, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } }
    );
    if (!result) {
      throw new AppError(422, 'Insufficient stock for one or more products');
    }
  }

  // Build snapshot items and compute total
  const orderItems = items.map((item) => {
    const product = productMap[item.productId];
    return {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    };
  });

  const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return Order.create({ userId, items: orderItems, total, status: 'pending' });
};
