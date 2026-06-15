import { Order } from '../../orders/model/Order.js';
import { Product } from '../../catalog/model/Product.js';

function getPeriodStart(period) {
  if (period === 'all') return null;
  const now = new Date();
  const start = new Date(now);
  if (period === 'day') start.setHours(0, 0, 0, 0);
  else if (period === 'week') { start.setDate(now.getDate() - now.getDay()); start.setHours(0, 0, 0, 0); }
  else if (period === 'month') { start.setDate(1); start.setHours(0, 0, 0, 0); }
  else if (period === 'year') { start.setMonth(0, 1); start.setHours(0, 0, 0, 0); }
  return start;
}

export const getDashboardStats = async (period) => {
  const periodStart = getPeriodStart(period);
  const dateFilter = periodStart ? { createdAt: { $gte: periodStart } } : {};
  const orders = await Order.find({
    ...dateFilter,
    status: { $nin: ['cancelled', 'lost'] },
  });

  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const orderCount = orders.length;

  // Collect all unique productIds across orders
  const productIds = [...new Set(orders.flatMap((o) => o.items.map((i) => String(i.productId))))];
  const products = await Product.find({ _id: { $in: productIds } }, { _id: 1, cost: 1 });
  const costMap = Object.fromEntries(products.map((p) => [String(p._id), p.cost ?? 0]));

  const cost = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + (costMap[String(i.productId)] ?? 0) * i.quantity, 0),
    0
  );
  const profit = Math.round((revenue - cost) * 100) / 100;

  return { revenue: Math.round(revenue * 100) / 100, profit, orderCount, period };
};
