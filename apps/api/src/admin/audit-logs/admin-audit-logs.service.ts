import { Injectable } from '@nestjs/common';
import type { AdminListAuditLogsQuery } from '@remember/contracts';
import { adminAuditLogListResponseSchema } from '@remember/contracts';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AdminAuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async listAuditLogs(query: AdminListAuditLogsQuery) {
    const where: {
      action?: string;
      targetType?: string;
    } = {};
    if (query.action) {
      where.action = query.action;
    }
    if (query.targetType) {
      where.targetType = query.targetType;
    }

    const skip = (query.page - 1) * query.pageSize;
    const [rows, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: { actorAdminUser: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return adminAuditLogListResponseSchema.parse({
      total,
      page: query.page,
      pageSize: query.pageSize,
      items: rows.map((row) => ({
        id: row.id,
        actorAdminUserId: row.actorAdminUserId,
        actorLoginName: row.actorAdminUser.loginName,
        action: row.action,
        targetType: row.targetType,
        targetId: row.targetId,
        payloadSummary:
          typeof row.payloadSummary === 'object' && row.payloadSummary !== null
            ? (row.payloadSummary as Record<string, unknown>)
            : {},
        result: row.result,
        ...(row.errorCode ? { errorCode: row.errorCode } : {}),
        createdAt: row.createdAt.toISOString(),
      })),
    });
  }
}
