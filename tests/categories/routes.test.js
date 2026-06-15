import { describe, it, expect, beforeEach } from 'vitest';
import { api, createAdmin, loginAdmin } from '../helpers.js';
import { Category } from '../../categories/model/Category.js';
import { Product } from '../../catalog/model/Product.js';

let adminCookie;

beforeEach(async () => {
  await createAdmin();
  adminCookie = await loginAdmin();
});

describe('GET /categories', () => {
  it('returns empty array when no categories', async () => {
    const res = await api.get('/categories');
    expect(res.status).toBe(200);
    expect(res.body.data.categories).toEqual([]);
  });

  it('returns all categories', async () => {
    await Category.create({ name: 'Electronics' });
    await Category.create({ name: 'Clothing' });

    const res = await api.get('/categories');
    expect(res.status).toBe(200);
    expect(res.body.data.categories).toHaveLength(2);
  });
});

describe('POST /categories', () => {
  it('creates a category as admin', async () => {
    const res = await api
      .post('/categories')
      .set('Cookie', adminCookie)
      .send({ name: 'Books', description: 'All kinds of books' });

    expect(res.status).toBe(201);
    expect(res.body.data.category.name).toBe('Books');
    expect(res.body.data.category.description).toBe('All kinds of books');
  });

  it('returns 401 without admin cookie', async () => {
    const res = await api.post('/categories').send({ name: 'Books' });
    expect(res.status).toBe(401);
  });

  it('returns 400 when name is missing', async () => {
    const res = await api
      .post('/categories')
      .set('Cookie', adminCookie)
      .send({ description: 'No name' });
    expect(res.status).toBe(400);
  });

  it('returns 409 for duplicate name', async () => {
    await Category.create({ name: 'Duplicate' });
    const res = await api
      .post('/categories')
      .set('Cookie', adminCookie)
      .send({ name: 'Duplicate' });
    expect(res.status).toBe(409);
  });
});

describe('DELETE /categories/:id', () => {
  it('deletes a category', async () => {
    const cat = await Category.create({ name: 'ToDelete' });

    const res = await api
      .delete(`/categories/${cat._id}`)
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(await Category.findById(cat._id)).toBeNull();
  });

  it('removes category from products on deletion', async () => {
    const cat = await Category.create({ name: 'Orphan' });
    const product = await Product.create({
      name: 'Widget',
      price: 10,
      stock: 5,
      categories: [cat._id],
    });

    await api.delete(`/categories/${cat._id}`).set('Cookie', adminCookie);

    const updated = await Product.findById(product._id);
    expect(updated.categories).toHaveLength(0);
  });

  it('returns 404 for non-existent category', async () => {
    const res = await api
      .delete('/categories/6a000000000000000000dead')
      .set('Cookie', adminCookie);
    expect(res.status).toBe(404);
  });

  it('returns 401 without admin cookie', async () => {
    const cat = await Category.create({ name: 'Protected' });
    const res = await api.delete(`/categories/${cat._id}`);
    expect(res.status).toBe(401);
  });
});

describe('GET /categories/:id/product-count', () => {
  it('returns count of products with that category', async () => {
    const cat = await Category.create({ name: 'Counted' });
    await Product.create({ name: 'P1', price: 10, stock: 1, categories: [cat._id] });
    await Product.create({ name: 'P2', price: 20, stock: 1, categories: [cat._id] });

    const res = await api
      .get(`/categories/${cat._id}/product-count`)
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.count).toBe(2);
  });

  it('returns 0 when no products have the category', async () => {
    const cat = await Category.create({ name: 'Empty' });
    const res = await api
      .get(`/categories/${cat._id}/product-count`)
      .set('Cookie', adminCookie);
    expect(res.body.data.count).toBe(0);
  });

  it('returns 404 for non-existent category', async () => {
    const res = await api
      .get('/categories/6a000000000000000000dead/product-count')
      .set('Cookie', adminCookie);
    expect(res.status).toBe(404);
  });
});
