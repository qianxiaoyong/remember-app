import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { AuditLogWriteInput } from '@remember/contracts';
import { auditLogWriteInputSchema } from '@remember/contracts';
import { AuditRepository } from './audit.repository.js';

export interface WriteAuditLogInput extends AuditLogWriteInput {
  actorAdminUserId: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  writeAuditLog(input: WriteAuditLogInput, client?: Prisma.TransactionClient) {
    const validated = auditLogWriteInputSchema.parse({
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      payloadSummary: input.payloadSummary,
      result: input.result,
      errorCode: input.errorCode,
    });
    return this.auditRepository.createAuditLog(
      {
        actorAdminUserId: input.actorAdminUserId,
        action: validated.action,
        targetType: validated.targetType,
        targetId: validated.targetId,
        payloadSummary: validated.payloadSummary as Prisma.InputJsonValue,
        result: validated.result,
        ...(validated.errorCode !== undefined ? { errorCode: validated.errorCode } : {}),
      },
      client,
    );
  }
}
