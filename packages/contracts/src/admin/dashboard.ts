import { z } from 'zod';

export const adminDashboardRangeSchema = z.enum(['1d', '7d', '30d']);

export const adminDashboardSummarySchema = z
  .object({
    range: adminDashboardRangeSchema,
    paidAmountCents: z.number().int().nonnegative(),
    paidOrderCount: z.number().int().nonnegative(),
    refundAmountCents: z.number().int().nonnegative(),
    redemptionCount: z.number().int().nonnegative(),
    newUserCount: z.number().int().nonnegative(),
    activeLoginCount: z.number().int().nonnegative(),
    publishedPackCount: z.number().int().nonnegative(),
    draftPackCount: z.number().int().nonnegative(),
  })
  .strict();

export const adminDashboardRevenuePointSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    paidAmountCents: z.number().int().nonnegative(),
    paidOrderCount: z.number().int().nonnegative(),
  })
  .strict();

export const adminDashboardRevenueSeriesSchema = z
  .object({
    range: adminDashboardRangeSchema,
    points: z.array(adminDashboardRevenuePointSchema),
  })
  .strict();

export const adminDashboardTopPackSchema = z
  .object({
    packId: z.string().min(1),
    title: z.string().min(1),
    paidOrderCount: z.number().int().nonnegative(),
    paidAmountCents: z.number().int().nonnegative(),
  })
  .strict();

export const adminDashboardTopPacksSchema = z
  .object({
    range: adminDashboardRangeSchema,
    items: z.array(adminDashboardTopPackSchema),
  })
  .strict();

export const adminDashboardAlertSchema = z
  .object({
    kind: z.enum(['paid_without_access', 'pending_refund', 'redemption_code_low']),
    message: z.string().min(1),
    count: z.number().int().nonnegative(),
  })
  .strict();

export const adminDashboardAlertsSchema = z
  .object({
    items: z.array(adminDashboardAlertSchema),
  })
  .strict();

export type AdminDashboardRange = z.infer<typeof adminDashboardRangeSchema>;
export type AdminDashboardSummary = z.infer<typeof adminDashboardSummarySchema>;
export type AdminDashboardRevenueSeries = z.infer<typeof adminDashboardRevenueSeriesSchema>;
export type AdminDashboardTopPacks = z.infer<typeof adminDashboardTopPacksSchema>;
export type AdminDashboardAlerts = z.infer<typeof adminDashboardAlertsSchema>;
