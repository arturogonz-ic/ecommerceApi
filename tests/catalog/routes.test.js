import { describe, it, expect, beforeEach } from 'vitest';
import { api, createAdmin, loginAdmin } from '../helpers.js';
import { Product } from '../../catalog/model/Product.js';

let adminCookie;

beforeEach(async () => {
  await createAdmin();
  adminCookie = await loginAdmin();
});

describe('GET /catalog/products', () => {
  it('returns empty array when no products', async () => {
    const res = await api.get('/catalog/products');
    expect(res.status).toBe(200);
    expect(res.body.data.products).toEqual([]);
  });

  it('returns all products', async () => {
    await Product.create({ name: 'A', price: 10, stock: 5 });
    await Product.create({ name: 'B', price: 20, stock: 3 });

    const res = await api.get('/catalog/products');
    expect(res.status).toBe(200);
    expect(res.body.data.products).toHaveLength(2);
  });
});

describe('GET /catalog/products/:id', () => {
  it('returns product by id', async () => {
    const product = await Product.create({ name: 'Shoe', price: 50, stock: 10 });

    const res = await api.get(`/catalog/products/${product._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.product.name).toBe('Shoe');
  });

  it('returns 404 for non-existent id', async () => {
    const res = await api.get('/catalog/products/6a000000000000000000dead');
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid id format', async () => {
    const res = await api.get('/catalog/products/not-an-id');
    expect(res.status).toBe(400);
  });
});

describe('POST /catalog/products', () => {
  it('creates a product as admin', async () => {
    const res = await api
      .post('/catalog/products')
      .set('Cookie', adminCookie)
      .field('name', 'Sneaker')
      .field('price', '99.99')
      .field('stock', '20');

    expect(res.status).toBe(201);
    expect(res.body.data.product.name).toBe('Sneaker');
    expect(res.body.data.product.images).toEqual([]);
  });

  it('returns 401 without admin cookie', async () => {
    const res = await api
      .post('/catalog/products')
      .field('name', 'Sneaker')
      .field('price', '99.99')
      .field('stock', '20');

    expect(res.status).toBe(401);
  });

  it('returns 400 when name is missing', async () => {
    const res = await api
      .post('/catalog/products')
      .set('Cookie', adminCookie)
      .field('price', '50')
      .field('stock', '5');

    expect(res.status).toBe(400);
  });
});

describe('PUT /catalog/products/:id', () => {
  it('updates product fields', async () => {
    const product = await Product.create({ name: 'Old', price: 10, stock: 5 });

    const res = await api
      .put(`/catalog/products/${product._id}`)
      .set('Cookie', adminCookie)
      .send({ name: 'New', price: 20 });

    expect(res.status).toBe(200);
    expect(res.body.data.product.name).toBe('New');
    expect(res.body.data.product.price).toBe(20);
  });

  it('returns 401 without admin cookie', async () => {
    const product = await Product.create({ name: 'Old', price: 10, stock: 5 });
    const res = await api.put(`/catalog/products/${product._id}`).send({ name: 'New' });
    expect(res.status).toBe(401);
  });
});

describe('DELETE /catalog/products/:id', () => {
  it('deletes a product', async () => {
    const product = await Product.create({ name: 'Gone', price: 10, stock: 1 });

    const res = await api
      .delete(`/catalog/products/${product._id}`)
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();

    const found = await Product.findById(product._id);
    expect(found).toBeNull();
  });

  it('returns 404 for non-existent product', async () => {
    const res = await api
      .delete('/catalog/products/6a000000000000000000dead')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(404);
  });
});
