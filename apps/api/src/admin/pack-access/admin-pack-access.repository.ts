import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { AdminListPackAccessQuery } from '@remember/contracts';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AdminPackAccessRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listPackAccess(query: AdminListPackAccessQuery) {
    const where: Prisma.PackAccessWhereInput = {};
    if (query.userId) {
      where.userId = query.userId;
    }
    if (query.packId) {
      where.packId = query.packId;
    }

    const skip = (query.page - 1) * query.pageSize;
    const [rows, total] = await Promise.all([
      this.prisma.packAccess.findMany({
        where,
        include: { user: true, pack: true },
        orderBy: { grantedAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
      this.prisma.packAccess.count({ where }),
    ]);

    return { rows, total, page: query.page, pageSize: query.pageSize };
  }

  findUserById(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  findPackById(packId: string) {
    return this.prisma.pack.findUnique({ where: { packId } });
  }

  findByUserAndPack(userId: string, packId: string) {
    return this.prisma.packAccess.findUnique({
      where: { userId_packId: { userId, packId } },
    });
  }
}
