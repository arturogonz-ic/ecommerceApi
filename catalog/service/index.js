import fs from 'fs/promises';
import { Product } from '../model/Product.js';
import { Category } from '../../categories/model/Category.js';
import { Order } from '../../orders/model/Order.js';
import { AppError } from '../../shared/error/AppError.js';

// Returns the active discount rate (0-1) and lazily flips isActive=false if expired.
function resolveDiscount(discount, docId, Model) {
  if (!discount || !discount.isActive) return 0;
  if (discount.expiresAt <= new Date()) {
    Model.findByIdAndUpdate(docId, { 'discount.isActive': false }).catch(() => {});
    return 0;
  }
  return discount.percentage / 100;
}

function computeEffectivePrice(product, categoryRates) {
  let rate = 1 - resolveDiscount(product.discount, product._id, Product);
  for (const r of categoryRates) {
    rate *= 1 - r;
  }
  return Math.round(product.price * rate * 100) / 100;
}

async function getCategoryRates(categoryIds) {
  if (!categoryIds || categoryIds.length === 0) return [];
  const cats = await Category.find({ _id: { $in: categoryIds } });
  return cats.map((c) => resolveDiscount(c.discount, c._id, Category));
}

function toPlain(product) {
  const obj = product.toObject();
  return obj;
}

export const listProducts = async () => {
  const products = await Product.find();
  return Promise.all(
    products.map(async (p) => {
      const rates = await getCategoryRates(p.categories);
      const plain = toPlain(p);
      plain.effectivePrice = computeEffectivePrice(p, rates);
      return plain;
    })
  );
};

export const getProductById = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new AppError(404, 'Product not found');
  const rates = await getCategoryRates(product.categories);
  const plain = toPlain(product);
  plain.effectivePrice = computeEffectivePrice(product, rates);
  return plain;
};

export const getBestSellers = async () => {
  const pipeline = [
    { $match: { status: 'delivered' } },
    { $unwind: '$items' },
    { $group: { _id: '$items.productId', totalSold: { $sum: '$items.quantity' } } },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    { $replaceRoot: { newRoot: { $mergeObjects: ['$product', { totalSold: '$totalSold' }] } } },
  ];

  const docs = await Order.aggregate(pipeline);

  if (docs.length === 0) {
    const products = await Product.find().sort({ createdAt: -1 }).limit(10);
    return Promise.all(
      products.map(async (p) => {
        const rates = await getCategoryRates(p.categories);
        const plain = toPlain(p);
        plain.effectivePrice = computeEffectivePrice(p, rates);
        return plain;
      })
    );
  }

  return Promise.all(
    docs.map(async (doc) => {
      const product = new Product(doc);
      product._id = doc._id;
      const rates = await getCategoryRates(doc.categories ?? []);
      doc.effectivePrice = computeEffectivePrice(product, rates);
      doc.images = doc.images ?? [];
      return doc;
    })
  );
};

export const createProduct = (data, files = []) => {
  const images = files.map((f) => `uploads/${f.filename}`);
  return Product.create({ ...data, images });
};

export const updateProduct = async (id, data) => {
  const product = await Product.findByIdAndUpdate(id, data, { new: true });
  if (!product) throw new AppError(404, 'Product not found');
  return product;
};

export const deleteProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new AppError(404, 'Product not found');
  await Promise.all(product.images.map((p) => fs.unlink(p).catch(() => {})));
};

export const deleteProductImage = async (id, index) => {
  const product = await Product.findById(id);
  if (!product) throw new AppError(404, 'Product not found');
  if (index < 0 || index >= product.images.length) throw new AppError(404, 'Image not found');
  const [filePath] = product.images.splice(index, 1);
  await fs.unlink(filePath).catch(() => {});
  product.markModified('images');
  await product.save();
  return product;
};

export const applyProductDiscount = async (id, data) => {
  const product = await Product.findByIdAndUpdate(
    id,
    { discount: { ...data, isActive: true } },
    { new: true }
  );
  if (!product) throw new AppError(404, 'Product not found');
  const rates = await getCategoryRates(product.categories);
  const plain = toPlain(product);
  plain.effectivePrice = computeEffectivePrice(product, rates);
  return plain;
};

export const removeProductDiscount = async (id) => {
  const product = await Product.findByIdAndUpdate(
    id,
    { 'discount.isActive': false },
    { new: true }
  );
  if (!product) throw new AppError(404, 'Product not found');
  return product;
};
