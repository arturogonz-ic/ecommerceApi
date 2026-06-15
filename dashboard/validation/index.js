import { z } from 'zod';

export const periodSchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year', 'all']).default('month'),
});
