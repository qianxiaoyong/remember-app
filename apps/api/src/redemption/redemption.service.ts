import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import type { RedeemCodeResponse } from '@remember/contracts';
import { redeemCodeResponseSchema } from '@remember/contracts';
import { PrismaService } from '../prisma/prisma.service.js';
import { PackAccessRepository } from '../pack-access/pack-access.repository.js';
import { RedemptionConfigService } from './redemption-config.service.js';
import { hashRedemptionCode } from './redemption-code-hash.js';
import { RedemptionRepository } from './redemption.repository.js';

@Injectable()
export class RedemptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redemptionRepository: RedemptionRepository,
    private readonly packAccessRepository: PackAccessRepository,
    private readonly redemptionConfigService: RedemptionConfigService,
  ) {}

  async redeem(userId: string, rawCode: string): Promise<RedeemCodeResponse> {
    const { codePepper } = this.redemptionConfigService.read();
    const codeHash = hashRedemptionCode(rawCode, codePepper);
    const code = await this.redemptionRepository.findActiveCodeByHash(codeHash);

    if (!code) {
      throw new NotFoundException({ code: 'REDEMPTION_CODE_INVALID', message: '兑换码无效' });
    }

    const now = new Date();
    if (code.expiresAt && code.expiresAt.getTime() < now.getTime()) {
      throw new HttpException(
        { code: 'REDEMPTION_CODE_EXPIRED', message: '兑换码已过期' },
        400,
      );
    }

    const existingAccess = await this.packAccessRepository.findByUserAndPack(userId, code.packId);
    if (existingAccess) {
      return redeemCodeResponseSchema.parse({
        packId: code.packId,
        alreadyOwned: true,
      });
    }

    if (code.redeemedCount >= code.maxRedemptions) {
      throw new HttpException(
        { code: 'REDEMPTION_CODE_EXHAUSTED', message: '兑换码已达使用上限' },
        400,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const lockedCode = await tx.redemptionCode.findUnique({ where: { id: code.id } });
      if (!lockedCode || lockedCode.status !== 'active') {
        throw new NotFoundException({ code: 'REDEMPTION_CODE_INVALID', message: '兑换码无效' });
      }
      if (lockedCode.expiresAt && lockedCode.expiresAt.getTime() < now.getTime()) {
        throw new HttpException(
          { code: 'REDEMPTION_CODE_EXPIRED', message: '兑换码已过期' },
          400,
        );
      }
      if (lockedCode.redeemedCount >= lockedCode.maxRedemptions) {
        throw new HttpException(
          { code: 'REDEMPTION_CODE_EXHAUSTED', message: '兑换码已达使用上限' },
          400,
        );
      }

      const existing = await tx.packAccess.findUnique({
        where: { userId_packId: { userId, packId: lockedCode.packId } },
      });
      if (existing) {
        return { packId: lockedCode.packId, alreadyOwned: true as const };
      }

      const order = await tx.order.create({
        data: {
          userId,
          packId: lockedCode.packId,
          amountCents: 0,
          status: 'paid',
          channel: 'redemption',
        },
      });

      await tx.packAccess.create({
        data: {
          userId,
          packId: lockedCode.packId,
          orderId: order.id,
          source: 'redemption',
          grantedAt: now,
        },
      });

      await tx.redemptionEvent.create({
        data: {
          redemptionCodeId: lockedCode.id,
          userId,
          packId: lockedCode.packId,
          orderId: order.id,
          redeemedAt: now,
        },
      });

      await tx.redemptionCode.update({
        where: { id: lockedCode.id },
        data: { redeemedCount: { increment: 1 } },
      });

      return { packId: lockedCode.packId, alreadyOwned: false as const };
    });

    return redeemCodeResponseSchema.parse(result);
  }
}
