import { z } from 'zod';

export const auditLogResultSchema = z.enum(['success', 'failure']);

export const auditLogWriteInputSchema = z
  .object({
    action: z.string().trim().min(1).max(128),
    targetType: z.string().trim().min(1).max(64),
    targetId: z.string().trim().min(1).max(128),
    payloadSummary: z.record(z.string(), z.unknown()),
    result: auditLogResultSchema,
    errorCode: z.string().trim().min(1).max(64).optional(),
  })
  .strict();

export const auditLogEntrySchema = z
  .object({
    id: z.uuid(),
    actorAdminUserId: z.uuid(),
    action: z.string().min(1),
    targetType: z.string().min(1),
    targetId: z.string().min(1),
    payloadSummary: z.record(z.string(), z.unknown()),
    result: auditLogResultSchema,
    errorCode: z.string().min(1).optional(),
    createdAt: z.iso.datetime(),
  })
  .strict();

export type AuditLogWriteInput = z.infer<typeof auditLogWriteInputSchema>;
export type AuditLogEntry = z.infer<typeof auditLogEntrySchema>;
