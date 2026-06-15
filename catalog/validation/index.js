import { z } from 'zod';

const objectIdPattern = /^[a-f\d]{24}$/i;
const categoryId = z.string().regex(objectIdPattern, 'Invalid category ID');

export const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  cost: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0).default(0),
  categories: z.preprocess(
    (val) => (typeof val === 'string' ? [val] : val),
    z.array(categoryId).optional().default([])
  ),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  cost: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  categories: z.array(categoryId).optional(),
});

export const productIdSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid product ID'),
});

export const discountSchema = z.object({
  percentage: z.number().int().min(1).max(100),
  expiresAt: z.string().datetime(),
});
