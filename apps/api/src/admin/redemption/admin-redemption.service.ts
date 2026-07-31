import { randomBytes } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  AdminCreateRedemptionBatchRequest,
  AdminListRedemptionCodesQuery,
} from '@remember/contracts';
import {
  adminCreateRedemptionBatchResponseSchema,
  adminRedemptionCodeListResponseSchema,
} from '@remember/contracts';
import { hashRedemptionCode } from '../../redemption/redemption-code-hash.js';
import { RedemptionConfigService } from '../../redemption/redemption-config.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

function generateRedemptionCode(prefix: string): string {
  const raw = randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
}

@Injectable()
export class AdminRedemptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redemptionConfig: RedemptionConfigService,
  ) {}

  async createBatch(input: AdminCreateRedemptionBatchRequest) {
    const pack = await this.prisma.pack.findUnique({ where: { packId: input.packId } });
    if (!pack) {
      throw new NotFoundException({ code: 'PACK_NOT_FOUND', message: '知识库不存在' });
    }

    const pepper = this.redemptionConfig.read().codePepper;
    const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;

    const created = await this.prisma.$transaction(async (tx) => {
      const items = [];
      for (let index = 0; index < input.count; index += 1) {
        const code = generateRedemptionCode(input.prefix);
        const row = await tx.redemptionCode.create({
          data: {
            codeHash: hashRedemptionCode(code, pepper),
            packId: input.packId,
            maxRedemptions: input.maxRedemptions,
            expiresAt,
            status: 'active',
          },
        });
        items.push({
          id: row.id,
          packId: row.packId,
          code,
          maxRedemptions: row.maxRedemptions,
          redeemedCount: row.redeemedCount,
          ...(row.expiresAt ? { expiresAt: row.expiresAt.toISOString() } : {}),
          status: row.status,
          createdAt: row.createdAt.toISOString(),
        });
      }
      return items;
    });

    return adminCreateRedemptionBatchResponseSchema.parse({ items: created });
  }

  async listCodes(query: AdminListRedemptionCodesQuery) {
    const where: {
      packId?: string;
      status?: string;
    } = {};
    if (query.packId) {
      where.packId = query.packId;
    }
    if (query.status) {
      where.status = query.status;
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
      items: rows.map((row) => ({
        id: row.id,
        packId: row.packId,
        codePreview: `hash:${row.codeHash.slice(0, 8)}`,
        maxRedemptions: row.maxRedemptions,
        redeemedCount: row.redeemedCount,
        ...(row.expiresAt ? { expiresAt: row.expiresAt.toISOString() } : {}),
        status: row.status,
        createdAt: row.createdAt.toISOString(),
      })),
    });
  }
}
