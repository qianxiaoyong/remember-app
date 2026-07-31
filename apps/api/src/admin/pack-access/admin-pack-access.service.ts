import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type {
  AdminGrantPackAccessRequest,
  AdminGrantPackAccessResponse,
  AdminListPackAccessQuery,
} from '@remember/contracts';
import {
  adminGrantPackAccessResponseSchema,
  adminPackAccessListResponseSchema,
} from '@remember/contracts';
import { AuditService } from '../../audit/audit.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AdminPackAccessRepository } from './admin-pack-access.repository.js';

@Injectable()
export class AdminPackAccessService {
  constructor(
    private readonly repository: AdminPackAccessRepository,
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listPackAccess(query: AdminListPackAccessQuery) {
    const result = await this.repository.listPackAccess(query);
    return adminPackAccessListResponseSchema.parse({
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      items: result.rows.map((row) => ({
        id: row.id.toString(),
        userId: row.userId,
        maskedPhone: row.user.maskedPhone,
        packId: row.packId,
        packTitle: row.pack.title,
        source: row.source,
        ...(row.orderId ? { orderId: row.orderId } : {}),
        grantedAt: row.grantedAt.toISOString(),
      })),
    });
  }

  async grantPackAccess(
    actorAdminUserId: string,
    input: AdminGrantPackAccessRequest,
  ): Promise<AdminGrantPackAccessResponse> {
    const user = await this.repository.findUserById(input.userId);
    if (!user) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND', message: '用户不存在' });
    }

    const pack = await this.repository.findPackById(input.packId);
    if (!pack) {
      throw new NotFoundException({ code: 'PACK_NOT_FOUND', message: '知识库不存在' });
    }

    const existing = await this.repository.findByUserAndPack(input.userId, input.packId);
    if (existing) {
      throw new ConflictException({ code: 'PACK_ALREADY_OWNED', message: '用户已拥有该知识库' });
    }

    const now = new Date();
    const access = await this.prisma.$transaction(async (tx) => {
      const created = await tx.packAccess.create({
        data: {
          userId: input.userId,
          packId: input.packId,
          source: 'admin_grant',
          grantedAt: now,
        },
      });
      await this.auditService.writeAuditLog(
        {
          actorAdminUserId,
          action: 'pack_access.grant',
          targetType: 'pack_access',
          targetId: `${input.packId}:${input.userId}`,
          payloadSummary: {
            packId: input.packId,
            userId: input.userId,
            ...(input.note ? { note: input.note } : {}),
          },
          result: 'success',
        },
        tx,
      );
      return created;
    });

    return adminGrantPackAccessResponseSchema.parse({
      id: access.id.toString(),
      userId: access.userId,
      packId: access.packId,
      source: 'admin_grant',
      grantedAt: access.grantedAt.toISOString(),
    });
  }
}
