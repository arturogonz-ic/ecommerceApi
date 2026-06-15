import { describe, it, expect } from 'vitest';
import { placeOrder } from '../../orders/service/placeOrder.js';
import { Product } from '../../catalog/model/Product.js';

describe('placeOrder', () => {
  it('creates an order and decrements stock', async () => {
    const product = await Product.create({ name: 'Shoe', price: 50, stock: 10 });

    const order = await placeOrder('6a000000000000000000001a', [
      { productId: product._id.toString(), quantity: 3 },
    ]);

    expect(order.status).toBe('pending');
    expect(order.items[0].name).toBe('Shoe');
    expect(order.items[0].price).toBe(50);
    expect(order.items[0].quantity).toBe(3);
    expect(order.total).toBe(150);

    const updated = await Product.findById(product._id);
    expect(updated.stock).toBe(7);
  });

  it('snapshots price at order time — product price change does not affect order', async () => {
    const product = await Product.create({ name: 'Bag', price: 100, stock: 5 });

    const order = await placeOrder('6a000000000000000000001a', [
      { productId: product._id.toString(), quantity: 1 },
    ]);

    await Product.findByIdAndUpdate(product._id, { price: 999 });

    expect(order.items[0].price).toBe(100);
  });

  it('throws 422 when stock is insufficient', async () => {
    const product = await Product.create({ name: 'Cap', price: 20, stock: 2 });

    await expect(
      placeOrder('6a000000000000000000001a', [
        { productId: product._id.toString(), quantity: 5 },
      ])
    ).rejects.toMatchObject({ code: 422 });
  });

  it('throws 404 when product does not exist', async () => {
    await expect(
      placeOrder('6a000000000000000000001a', [
        { productId: '6a000000000000000000dead', quantity: 1 },
      ])
    ).rejects.toMatchObject({ code: 404 });
  });

  it('does not decrement stock if any item fails', async () => {
    const good = await Product.create({ name: 'Sock', price: 5, stock: 10 });

    await expect(
      placeOrder('6a000000000000000000001a', [
        { productId: good._id.toString(), quantity: 2 },
        { productId: '6a000000000000000000dead', quantity: 1 },
      ])
    ).rejects.toMatchObject({ code: 404 });

    const unchanged = await Product.findById(good._id);
    expect(unchanged.stock).toBe(10);
  });
});
