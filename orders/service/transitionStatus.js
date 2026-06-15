import { Product } from '../../catalog/model/Product.js';
import { Order } from '../model/Order.js';
import { AppError } from '../../shared/error/AppError.js';

const VALID_TRANSITIONS = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'lost'],
  delivered: [],
  cancelled: [],
  lost: [],
};

export const transitionStatus = async (id, newStatus, shippingData = {}) => {
  const order = await Order.findById(id);
  if (!order) throw new AppError(404, 'Order not found');

  const allowed = VALID_TRANSITIONS[order.status];
  if (!allowed.includes(newStatus)) {
    throw new AppError(422, 'Invalid state transition');
  }

  if (newStatus === 'cancelled') {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }
  }

  order.status = newStatus;

  if (newStatus === 'shipped' && shippingData) {
    if (shippingData.shippingCarrier) {
      order.shippingCarrier = shippingData.shippingCarrier;
    }
    if (shippingData.trackingId) {
      order.trackingId = shippingData.trackingId;
    }
  }

  await order.save();
  return order;
};
