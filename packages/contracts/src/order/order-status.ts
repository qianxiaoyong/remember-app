import { z } from 'zod';

export const orderStatusSchema = z.enum([
  'pending',
  'paid',
  'refunding',
  'refunded',
  'closed',
]);

export type OrderStatus = z.infer<typeof orderStatusSchema>;
