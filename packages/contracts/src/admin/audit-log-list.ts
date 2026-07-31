import { z } from 'zod';
import { auditLogEntrySchema } from './audit-log-entry.js';

export const adminListAuditLogsQuerySchema = z
  .object({
    action: z.string().trim().min(1).optional(),
    targetType: z.string().trim().min(1).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export type AdminListAuditLogsQuery = z.infer<typeof adminListAuditLogsQuerySchema>;

export const adminAuditLogListItemSchema = auditLogEntrySchema.extend({
  actorLoginName: z.string().min(1),
});

export const adminAuditLogListResponseSchema = z
  .object({
    items: z.array(adminAuditLogListItemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
  })
  .strict();

export type AdminAuditLogListResponse = z.infer<typeof adminAuditLogListResponseSchema>;
