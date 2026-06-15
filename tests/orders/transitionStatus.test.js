import { describe, it, expect } from 'vitest';
import { transitionStatus } from '../../orders/service/transitionStatus.js';
import { Order } from '../../orders/model/Order.js';
import { Product } from '../../catalog/model/Product.js';

const userId = '6a000000000000000000001a';

async function createOrder(status, items = []) {
  return Order.create({ userId, items, total: 0, status });
}

describe('transitionStatus — valid transitions', () => {
  it('pending → processing', async () => {
    const order = await createOrder('pending');
    const updated = await transitionStatus(order._id.toString(), 'processing');
    expect(updated.status).toBe('processing');
  });

  it('pending → cancelled', async () => {
    const order = await createOrder('pending');
    const updated = await transitionStatus(order._id.toString(), 'cancelled');
    expect(updated.status).toBe('cancelled');
  });

  it('processing → shipped', async () => {
    const order = await createOrder('processing');
    const updated = await transitionStatus(order._id.toString(), 'shipped');
    expect(updated.status).toBe('shipped');
  });

  it('processing → cancelled', async () => {
    const order = await createOrder('processing');
    const updated = await transitionStatus(order._id.toString(), 'cancelled');
    expect(updated.status).toBe('cancelled');
  });

  it('shipped → delivered', async () => {
    const order = await createOrder('shipped');
    const updated = await transitionStatus(order._id.toString(), 'delivered');
    expect(updated.status).toBe('delivered');
  });

  it('shipped → lost', async () => {
    const order = await createOrder('shipped');
    const updated = await transitionStatus(order._id.toString(), 'lost');
    expect(updated.status).toBe('lost');
  });
});

describe('transitionStatus — invalid transitions', () => {
  it('throws 422 for pending → shipped', async () => {
    const order = await createOrder('pending');
    await expect(transitionStatus(order._id.toString(), 'shipped')).rejects.toMatchObject({ code: 422 });
  });

  it('throws 422 for delivered → cancelled', async () => {
    const order = await createOrder('delivered');
    await expect(transitionStatus(order._id.toString(), 'cancelled')).rejects.toMatchObject({ code: 422 });
  });

  it('throws 422 for lost → delivered', async () => {
    const order = await createOrder('lost');
    await expect(transitionStatus(order._id.toString(), 'delivered')).rejects.toMatchObject({ code: 422 });
  });

  it('throws 404 for non-existent order', async () => {
    await expect(
      transitionStatus('6a000000000000000000dead', 'processing')
    ).rejects.toMatchObject({ code: 404 });
  });
});

describe('transitionStatus — stock restoration on cancel', () => {
  it('restores stock when cancelling from pending', async () => {
    const product = await Product.create({ name: 'Glove', price: 15, stock: 3 });
    const order = await Order.create({
      userId,
      items: [{ productId: product._id, name: 'Glove', price: 15, quantity: 3 }],
      total: 45,
      status: 'pending',
    });

    await transitionStatus(order._id.toString(), 'cancelled');

    const restored = await Product.findById(product._id);
    expect(restored.stock).toBe(6);
  });

  it('does not restore stock when transitioning to lost', async () => {
    const product = await Product.create({ name: 'Hat', price: 25, stock: 0 });
    const order = await Order.create({
      userId,
      items: [{ productId: product._id, name: 'Hat', price: 25, quantity: 2 }],
      total: 50,
      status: 'shipped',
    });

    await transitionStatus(order._id.toString(), 'lost');

    const unchanged = await Product.findById(product._id);
    expect(unchanged.stock).toBe(0);
  });
});
