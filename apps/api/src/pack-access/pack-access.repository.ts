import { Injectable } from '@nestjs/common';
import type { PackAccess, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PackAccessRepository {
  constructor(private readonly prisma: PrismaService) {}

  listByUserId(userId: string): Promise<PackAccess[]> {
    return this.prisma.packAccess.findMany({
      where: { userId },
      orderBy: { grantedAt: 'desc' },
    });
  }

  findByUserAndPack(userId: string, packId: string): Promise<PackAccess | null> {
    return this.prisma.packAccess.findUnique({
      where: { userId_packId: { userId, packId } },
    });
  }

  createInTransaction(
    tx: Prisma.TransactionClient,
    input: {
      userId: string;
      packId: string;
      orderId: string;
      source: string;
      grantedAt: Date;
    },
  ): Promise<PackAccess> {
    return tx.packAccess.create({ data: input });
  }
}
