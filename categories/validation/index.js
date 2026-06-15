import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const categoryIdSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid category ID'),
});

export const discountSchema = z.object({
  percentage: z.number().int().min(1).max(100),
  expiresAt: z.string().datetime(),
});
