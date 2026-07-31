import { Injectable } from '@nestjs/common';
import type { AuditLog, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

export interface CreateAuditLogInput {
  actorAdminUserId: string;
  action: string;
  targetType: string;
  targetId: string;
  payloadSummary: Prisma.InputJsonValue;
  result: 'success' | 'failure';
  errorCode?: string | undefined;
}

type AuditLogClient = PrismaService | Prisma.TransactionClient;

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  createAuditLog(
    input: CreateAuditLogInput,
    client: AuditLogClient = this.prisma,
  ): Promise<AuditLog> {
    const data: Prisma.AuditLogUncheckedCreateInput = {
      actorAdminUserId: input.actorAdminUserId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      payloadSummary: input.payloadSummary,
      result: input.result,
    };
    if (input.errorCode !== undefined) {
      data.errorCode = input.errorCode;
    }
    return client.auditLog.create({ data });
  }
}
