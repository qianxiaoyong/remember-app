import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import type { RedeemCodeResponse } from '@remember/contracts';
import { redeemCodeResponseSchema } from '@remember/contracts';
import { PrismaService } from '../prisma/prisma.service.js';
import { PackAccessRepository } from '../pack-access/pack-access.repository.js';
import { RedemptionConfigService } from './redemption-config.service.js';
import { hashRedemptionCode } from './redemption-code-hash.js';
import { RedemptionRepository } from './redemption.repository.js';

const REDEMPTION_RATE_LIMIT_MAX = 10;
const REDEMPTION_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

@Injectable()
export class RedemptionService {
  private readonly attemptTimestampsByUser = new Map<string, number[]>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redemptionRepository: RedemptionRepository,
    private readonly packAccessRepository: PackAccessRepository,
    private readonly redemptionConfigService: RedemptionConfigService,
  ) {}

  async redeem(userId: string, rawCode: string): Promise<RedeemCodeResponse> {
    this.assertRateLimit(userId);

    const { codePepper } = this.redemptionConfigService.read();
    const codeHash = hashRedemptionCode(rawCode, codePepper);
    const code = await this.redemptionRepository.findActiveCodeByHash(codeHash);

    if (!code) {
      throw new NotFoundException({ code: 'REDEMPTION_CODE_INVALID', message: '兑换码无效' });
    }

    const now = new Date();
    if (code.expiresAt && code.expiresAt.getTime() < now.getTime()) {
      throw new HttpException({ code: 'REDEMPTION_CODE_EXPIRED', message: '兑换码已过期' }, 400);
    }

    const existingAccess = await this.packAccessRepository.findByUserAndPack(userId, code.packId);
    if (existingAccess) {
      return redeemCodeResponseSchema.parse({
        packId: code.packId,
        alreadyOwned: true,
      });
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const lockedRows = await tx.$queryRaw<
        {
          id: string;
          pack_id: string;
          max_redemptions: number;
          redeemed_count: number;
          status: string;
          expires_at: Date | null;
        }[]
      >`
        SELECT id, pack_id, max_redemptions, redeemed_count, status, expires_at
        FROM redemption_codes
        WHERE id = ${code.id}::uuid
        FOR UPDATE
      `;
      const lockedCode = lockedRows[0];
      if (lockedCode?.status !== 'active') {
        throw new NotFoundException({ code: 'REDEMPTION_CODE_INVALID', message: '兑换码无效' });
      }
      if (lockedCode.expires_at && lockedCode.expires_at.getTime() < now.getTime()) {
        throw new HttpException({ code: 'REDEMPTION_CODE_EXPIRED', message: '兑换码已过期' }, 400);
      }

      const existing = await tx.packAccess.findUnique({
        where: { userId_packId: { userId, packId: lockedCode.pack_id } },
      });
      if (existing) {
        return { packId: lockedCode.pack_id, alreadyOwned: true as const };
      }

      const incrementResult = await tx.redemptionCode.updateMany({
        where: {
          id: lockedCode.id,
          status: 'active',
          redeemedCount: { lt: lockedCode.max_redemptions },
        },
        data: { redeemedCount: { increment: 1 } },
      });
      if (incrementResult.count !== 1) {
        throw new HttpException(
          { code: 'REDEMPTION_CODE_EXHAUSTED', message: '兑换码已达使用上限' },
          400,
        );
      }

      const order = await tx.order.create({
        data: {
          userId,
          packId: lockedCode.pack_id,
          amountCents: 0,
          status: 'paid',
          channel: 'redemption',
        },
      });

      await tx.packAccess.create({
        data: {
          userId,
          packId: lockedCode.pack_id,
          orderId: order.id,
          source: 'redemption',
          grantedAt: now,
        },
      });

      await tx.redemptionEvent.create({
        data: {
          redemptionCodeId: lockedCode.id,
          userId,
          packId: lockedCode.pack_id,
          orderId: order.id,
          redeemedAt: now,
        },
      });

      return { packId: lockedCode.pack_id, alreadyOwned: false as const };
    });

    return redeemCodeResponseSchema.parse(result);
  }

  private assertRateLimit(userId: string): void {
    const now = Date.now();
    const recent = (this.attemptTimestampsByUser.get(userId) ?? []).filter(
      (timestamp) => now - timestamp < REDEMPTION_RATE_LIMIT_WINDOW_MS,
    );
    if (recent.length >= REDEMPTION_RATE_LIMIT_MAX) {
      throw new HttpException(
        { code: 'REDEMPTION_RATE_LIMITED', message: '兑换尝试过于频繁，请稍后再试' },
        429,
      );
    }
    recent.push(now);
    this.attemptTimestampsByUser.set(userId, recent);
  }
}
