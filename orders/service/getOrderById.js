import { Order } from '../model/Order.js';
import { AppError } from '../../shared/error/AppError.js';

export const getOrderById = async (id, userId = null) => {
  const query = { _id: id };
  if (userId) query.userId = userId;
  let order = Order.findOne(query);
  if (!userId) {
    order = order.populate('userId', 'name email shippingAddress billingAddress');
  }
  order = await order;
  if (!order) throw new AppError(404, 'Order not found');
  return order;
};
