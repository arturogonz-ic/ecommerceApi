import { Order } from '../model/Order.js';

export const getOrdersByUser = (userId) =>
  Order.find({ userId }).sort({ createdAt: -1 });
