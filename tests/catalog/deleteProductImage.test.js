import { describe, it, expect } from 'vitest';
import { deleteProductImage } from '../../catalog/service/index.js';
import { Product } from '../../catalog/model/Product.js';

describe('deleteProductImage', () => {
  it('removes the image at the given index', async () => {
    const product = await Product.create({
      name: 'Boot',
      price: 80,
      stock: 5,
      images: ['uploads/a.jpg', 'uploads/b.jpg', 'uploads/c.jpg'],
    });

    const updated = await deleteProductImage(product._id.toString(), 1);

    expect(updated.images).toEqual(['uploads/a.jpg', 'uploads/c.jpg']);
  });

  it('throws 404 when index is out of bounds', async () => {
    const product = await Product.create({
      name: 'Jacket',
      price: 120,
      stock: 3,
      images: ['uploads/x.jpg'],
    });

    await expect(deleteProductImage(product._id.toString(), 5)).rejects.toMatchObject({ code: 404 });
  });

  it('throws 404 when product does not exist', async () => {
    await expect(
      deleteProductImage('6a000000000000000000dead', 0)
    ).rejects.toMatchObject({ code: 404 });
  });
});
