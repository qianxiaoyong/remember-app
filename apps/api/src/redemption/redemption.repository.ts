import { Injectable } from '@nestjs/common';
import type { RedemptionCode } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class RedemptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveCodeByHash(codeHash: string): Promise<RedemptionCode | null> {
    return this.prisma.redemptionCode.findFirst({
      where: { codeHash, status: 'active' },
    });
  }
}
