import { describe, it, expect, beforeEach } from 'vitest';
import { api, createUser, createAdmin, loginUser, loginAdmin } from '../helpers.js';
import { Product } from '../../catalog/model/Product.js';

let userCookie;
let adminCookie;
let product;

beforeEach(async () => {
  await createUser();
  await createAdmin();
  userCookie = await loginUser();
  adminCookie = await loginAdmin();
  product = await Product.create({ name: 'Widget', price: 25, stock: 20 });
});

describe('POST /orders', () => {
  it('places an order and decrements stock', async () => {
    const res = await api
      .post('/orders')
      .set('Cookie', userCookie)
      .send({ items: [{ productId: product._id.toString(), quantity: 2 }] });

    expect(res.status).toBe(201);
    expect(res.body.data.order.status).toBe('pending');
    expect(res.body.data.order.total).toBe(50);

    const updated = await Product.findById(product._id);
    expect(updated.stock).toBe(18);
  });

  it('returns 401 without user cookie', async () => {
    const res = await api
      .post('/orders')
      .send({ items: [{ productId: product._id.toString(), quantity: 1 }] });

    expect(res.status).toBe(401);
  });

  it('returns 400 for empty items array', async () => {
    const res = await api
      .post('/orders')
      .set('Cookie', userCookie)
      .send({ items: [] });

    expect(res.status).toBe(400);
  });

  it('returns 422 for insufficient stock', async () => {
    const res = await api
      .post('/orders')
      .set('Cookie', userCookie)
      .send({ items: [{ productId: product._id.toString(), quantity: 999 }] });

    expect(res.status).toBe(422);
  });

  it('returns 404 for non-existent product', async () => {
    const res = await api
      .post('/orders')
      .set('Cookie', userCookie)
      .send({ items: [{ productId: '6a000000000000000000dead', quantity: 1 }] });

    expect(res.status).toBe(404);
  });
});

describe('GET /orders/mine', () => {
  it('returns user orders', async () => {
    await api
      .post('/orders')
      .set('Cookie', userCookie)
      .send({ items: [{ productId: product._id.toString(), quantity: 1 }] });

    const res = await api.get('/orders/mine').set('Cookie', userCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.orders).toHaveLength(1);
  });

  it('returns empty array when no orders', async () => {
    const res = await api.get('/orders/mine').set('Cookie', userCookie);
    expect(res.status).toBe(200);
    expect(res.body.data.orders).toEqual([]);
  });

  it('returns 401 without cookie', async () => {
    const res = await api.get('/orders/mine');
    expect(res.status).toBe(401);
  });
});

describe('GET /orders/my/:id', () => {
  it('returns own order detail', async () => {
    const placed = await api
      .post('/orders')
      .set('Cookie', userCookie)
      .send({ items: [{ productId: product._id.toString(), quantity: 1 }] });

    const orderId = placed.body.data.order._id;
    const res = await api.get(`/orders/my/${orderId}`).set('Cookie', userCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.order._id).toBe(orderId);
  });

  it('returns 404 when order belongs to another user', async () => {
    const placed = await api
      .post('/orders')
      .set('Cookie', userCookie)
      .send({ items: [{ productId: product._id.toString(), quantity: 1 }] });

    const orderId = placed.body.data.order._id;

    await createUser({ email: 'other@test.com' });
    const otherCookie = await loginUser('other@test.com', 'password123');

    const res = await api.get(`/orders/my/${orderId}`).set('Cookie', otherCookie);
    expect(res.status).toBe(404);
  });
});

describe('GET /orders (admin)', () => {
  it('returns all orders', async () => {
    await api
      .post('/orders')
      .set('Cookie', userCookie)
      .send({ items: [{ productId: product._id.toString(), quantity: 1 }] });

    const res = await api.get('/orders').set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.orders).toHaveLength(1);
  });

  it('returns 401 without admin cookie', async () => {
    const res = await api.get('/orders');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /orders/:id/status', () => {
  it('transitions pending → processing', async () => {
    const placed = await api
      .post('/orders')
      .set('Cookie', userCookie)
      .send({ items: [{ productId: product._id.toString(), quantity: 1 }] });

    const orderId = placed.body.data.order._id;

    const res = await api
      .patch(`/orders/${orderId}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'processing' });

    expect(res.status).toBe(200);
    expect(res.body.data.order.status).toBe('processing');
  });

  it('restores stock on cancellation', async () => {
    await api
      .post('/orders')
      .set('Cookie', userCookie)
      .send({ items: [{ productId: product._id.toString(), quantity: 3 }] });

    const stockAfterOrder = (await Product.findById(product._id)).stock;
    expect(stockAfterOrder).toBe(17);

    const orders = await api.get('/orders').set('Cookie', adminCookie);
    const orderId = orders.body.data.orders[0]._id;

    await api
      .patch(`/orders/${orderId}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'cancelled' });

    const restored = await Product.findById(product._id);
    expect(restored.stock).toBe(20);
  });

  it('returns 422 for invalid transition', async () => {
    const placed = await api
      .post('/orders')
      .set('Cookie', userCookie)
      .send({ items: [{ productId: product._id.toString(), quantity: 1 }] });

    const orderId = placed.body.data.order._id;

    const res = await api
      .patch(`/orders/${orderId}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'delivered' });

    expect(res.status).toBe(422);
  });

  it('returns 401 without admin cookie', async () => {
    const placed = await api
      .post('/orders')
      .set('Cookie', userCookie)
      .send({ items: [{ productId: product._id.toString(), quantity: 1 }] });

    const orderId = placed.body.data.order._id;

    const res = await api
      .patch(`/orders/${orderId}/status`)
      .send({ status: 'processing' });

    expect(res.status).toBe(401);
  });
});
