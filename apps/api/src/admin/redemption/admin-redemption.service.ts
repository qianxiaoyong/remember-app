import { randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { RedemptionCode } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import type {
  AdminCreateRedemptionBatchRequest,
  AdminListRedemptionCodesQuery,
  AdminUpdateRedemptionCodeRequest,
} from '@remember/contracts';
import {
  adminCreateRedemptionBatchResponseSchema,
  adminRedemptionCodeDetailSchema,
  adminRedemptionCodeListResponseSchema,
} from '@remember/contracts';
import { AuditService } from '../../audit/audit.service.js';
import { hashRedemptionCode } from '../../redemption/redemption-code-hash.js';
import { RedemptionConfigService } from '../../redemption/redemption-config.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

function generateRedemptionCode(prefix: string): string {
  const raw = randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
}

function redemptionAuditCodeHint(code: string | null | undefined, codeHash: string): string {
  if (code && code.length >= 4) {
    return `***${code.slice(-4)}`;
  }
  return `hash:${codeHash.slice(0, 8)}`;
}

function mapRedemptionCodeItem(row: RedemptionCode) {
  const isExhausted = row.status === 'active' && row.redeemedCount >= row.maxRedemptions;
  const canEdit = row.status !== 'deleted';
  const canRestore = row.status === 'deleted';
  return {
    id: row.id,
    packId: row.packId,
    maxRedemptions: row.maxRedemptions,
    redeemedCount: row.redeemedCount,
    ...(row.expiresAt ? { expiresAt: row.expiresAt.toISOString() } : {}),
    ...(row.note ? { note: row.note } : {}),
    status: row.status as 'active' | 'disabled' | 'deleted',
    isExhausted,
    canEdit,
    canRestore,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    ...(row.deletedAt ? { deletedAt: row.deletedAt.toISOString() } : {}),
  };
}

function mapRedemptionListItem(row: RedemptionCode) {
  const base = mapRedemptionCodeItem(row);
  if (row.code) {
    return { ...base, code: row.code };
  }
  return { ...base, codePreview: `hash:${row.codeHash.slice(0, 8)}` };
}

function mapRedemptionDetailItem(row: RedemptionCode) {
  const base = mapRedemptionListItem(row);
  if (row.code) {
    return { ...base, code: row.code };
  }
  return base;
}

@Injectable()
export class AdminRedemptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redemptionConfig: RedemptionConfigService,
    private readonly auditService: AuditService,
  ) {}

  async createBatch(actorAdminUserId: string, input: AdminCreateRedemptionBatchRequest) {
    const pack = await this.prisma.pack.findUnique({ where: { packId: input.packId } });
    if (!pack) {
      throw new NotFoundException({ code: 'PACK_NOT_FOUND', message: '知识库不存在' });
    }

    const pepper = this.redemptionConfig.read().codePepper;
    const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;

    const created = await this.prisma.$transaction(async (tx) => {
      const items: RedemptionCode[] = [];
      for (let index = 0; index < input.count; index += 1) {
        const code = generateRedemptionCode(input.prefix);
        const row = await tx.redemptionCode.create({
          data: {
            codeHash: hashRedemptionCode(code, pepper),
            code,
            packId: input.packId,
            maxRedemptions: input.maxRedemptions,
            expiresAt,
            status: 'active',
          },
        });
        items.push(row);
      }

      await this.auditService.writeAuditLog(
        {
          actorAdminUserId,
          action: 'redemption_code.batch_create',
          targetType: 'redemption_code',
          targetId: input.packId,
          payloadSummary: {
            packId: input.packId,
            count: input.count,
            maxRedemptions: input.maxRedemptions,
          },
          result: 'success',
        },
        tx,
      );

      return items;
    });

    return adminCreateRedemptionBatchResponseSchema.parse({
      items: created.map((row) => ({
        ...mapRedemptionCodeItem(row),
        code: row.code ?? '',
      })),
    });
  }

  async listCodes(query: AdminListRedemptionCodesQuery) {
    const where: Prisma.RedemptionCodeWhereInput = {};
    if (query.packId) {
      where.packId = query.packId;
    }
    if (query.keyword) {
      where.code = { contains: query.keyword, mode: 'insensitive' };
    }
    if (query.status) {
      where.status = query.status;
    } else if (!query.includeDeleted) {
      where.status = { not: 'deleted' };
    }

    const skip = (query.page - 1) * query.pageSize;
    const [rows, total] = await Promise.all([
      this.prisma.redemptionCode.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
      this.prisma.redemptionCode.count({ where }),
    ]);

    return adminRedemptionCodeListResponseSchema.parse({
      total,
      page: query.page,
      pageSize: query.pageSize,
      items: rows.map((row) => mapRedemptionListItem(row)),
    });
  }

  async getCode(id: string) {
    const row = await this.prisma.redemptionCode.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: { redeemedAt: 'desc' },
          take: 5,
          include: { user: { select: { maskedPhone: true } } },
        },
      },
    });
    if (!row) {
      throw new NotFoundException({ code: 'REDEMPTION_CODE_NOT_FOUND', message: '兑换码不存在' });
    }

    return adminRedemptionCodeDetailSchema.parse({
      ...mapRedemptionDetailItem(row),
      recentRedemptions: row.events.map((event) => ({
        id: event.id,
        maskedPhone: event.user.maskedPhone,
        redeemedAt: event.redeemedAt.toISOString(),
      })),
    });
  }

  async updateCode(
    actorAdminUserId: string,
    id: string,
    input: AdminUpdateRedemptionCodeRequest,
  ) {
    const row = await this.requireEditableCode(id);
    const data: Prisma.RedemptionCodeUpdateInput = {};

    if (input.maxRedemptions !== undefined) {
      if (input.maxRedemptions < row.redeemedCount) {
        throw new BadRequestException({
          code: 'REDEMPTION_MAX_TOO_LOW',
          message: `上限不能小于已兑换次数（${String(row.redeemedCount)}）`,
        });
      }
      data.maxRedemptions = input.maxRedemptions;
    }

    if (input.expiresAt !== undefined) {
      data.expiresAt = input.expiresAt === null ? null : new Date(input.expiresAt);
    }

    if (input.note !== undefined) {
      data.note = input.note;
    }

    if (input.status !== undefined) {
      if (row.status === 'deleted') {
        throw new ConflictException({
          code: 'REDEMPTION_CODE_DELETED',
          message: '已删除的兑换码请使用恢复操作',
        });
      }
      data.status = input.status;
    }

    if (Object.keys(data).length === 0) {
      return mapRedemptionListItem(row);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const next = await tx.redemptionCode.update({
        where: { id },
        data,
      });
      await this.auditService.writeAuditLog(
        {
          actorAdminUserId,
          action: 'redemption_code.update',
          targetType: 'redemption_code',
          targetId: id,
          payloadSummary: {
            packId: row.packId,
            codeHint: redemptionAuditCodeHint(row.code, row.codeHash),
            changes: input,
          },
          result: 'success',
        },
        tx,
      );
      return next;
    });

    return mapRedemptionListItem(updated);
  }

  async deleteCode(actorAdminUserId: string, id: string) {
    const row = await this.requireEditableCode(id);
    if (row.status === 'deleted') {
      return mapRedemptionListItem(row);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const next = await tx.redemptionCode.update({
        where: { id },
        data: {
          status: 'deleted',
          deletedAt: new Date(),
        },
      });
      await this.auditService.writeAuditLog(
        {
          actorAdminUserId,
          action: 'redemption_code.delete',
          targetType: 'redemption_code',
          targetId: id,
          payloadSummary: {
            packId: row.packId,
            codeHint: redemptionAuditCodeHint(row.code, row.codeHash),
          },
          result: 'success',
        },
        tx,
      );
      return next;
    });

    return mapRedemptionListItem(updated);
  }

  async restoreCode(actorAdminUserId: string, id: string) {
    const row = await this.prisma.redemptionCode.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException({ code: 'REDEMPTION_CODE_NOT_FOUND', message: '兑换码不存在' });
    }
    if (row.status !== 'deleted') {
      throw new ConflictException({
        code: 'REDEMPTION_CODE_NOT_DELETED',
        message: '仅已删除的兑换码可恢复',
      });
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const next = await tx.redemptionCode.update({
        where: { id },
        data: {
          status: 'active',
          deletedAt: null,
        },
      });
      await this.auditService.writeAuditLog(
        {
          actorAdminUserId,
          action: 'redemption_code.restore',
          targetType: 'redemption_code',
          targetId: id,
          payloadSummary: {
            packId: row.packId,
            codeHint: redemptionAuditCodeHint(row.code, row.codeHash),
          },
          result: 'success',
        },
        tx,
      );
      return next;
    });

    return mapRedemptionListItem(updated);
  }

  private async requireEditableCode(id: string): Promise<RedemptionCode> {
    const row = await this.prisma.redemptionCode.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException({ code: 'REDEMPTION_CODE_NOT_FOUND', message: '兑换码不存在' });
    }
    if (row.status === 'deleted') {
      throw new ConflictException({
        code: 'REDEMPTION_CODE_DELETED',
        message: '已删除的兑换码请使用恢复操作',
      });
    }
    return row;
  }
}
