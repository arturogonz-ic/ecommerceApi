import { z } from 'zod';

export const placeOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid product ID'),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
});

export const transitionStatusSchema = z.object({
  status: z.enum(['processing', 'shipped', 'delivered', 'cancelled', 'lost']),
  shippingCarrier: z.string().optional(),
  trackingId: z.string().optional(),
});

export const orderIdSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid order ID'),
});

export const listOrdersSchema = z.object({
  createdAtFrom: z.string().datetime().optional(),
  createdAtTo: z.string().datetime().optional(),
  deliveryAtFrom: z.string().datetime().optional(),
  deliveryAtTo: z.string().datetime().optional(),
  productIds: z
    .union([
      z.string().regex(/^[a-f\d]{24}$/i, 'Invalid product ID'),
      z.array(z.string().regex(/^[a-f\d]{24}$/i, 'Invalid product ID')),
    ])
    .optional(),
  categoryIds: z
    .union([
      z.string().regex(/^[a-f\d]{24}$/i, 'Invalid category ID'),
      z.array(z.string().regex(/^[a-f\d]{24}$/i, 'Invalid category ID')),
    ])
    .optional(),
  status: z
    .union([
      z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'lost']),
      z.array(z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'lost'])),
    ])
    .optional(),
});
