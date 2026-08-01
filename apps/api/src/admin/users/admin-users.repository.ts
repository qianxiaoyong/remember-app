import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { AdminListUsersQuery } from '@remember/contracts';
import { PrismaService } from '../../prisma/prisma.service.js';

const userListInclude = {
  _count: {
    select: {
      packAccesses: true,
      orders: { where: { status: 'paid' } },
    },
  },
  sessions: {
    where: { revokedAt: null },
    orderBy: { lastActiveAt: 'desc' as const },
    take: 1,
    select: { lastActiveAt: true },
  },
} satisfies Prisma.UserInclude;

export type AdminUserListRow = Prisma.UserGetPayload<{ include: typeof userListInclude }>;

@Injectable()
export class AdminUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(query: AdminListUsersQuery): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};
    if (query.userId) {
      where.id = query.userId;
    }
    if (query.maskedPhone) {
      where.maskedPhone = { contains: query.maskedPhone };
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.registeredSince || query.registeredUntil) {
      where.createdAt = {};
      if (query.registeredSince) {
        where.createdAt.gte = new Date(query.registeredSince);
      }
      if (query.registeredUntil) {
        where.createdAt.lte = new Date(query.registeredUntil);
      }
    }
    return where;
  }

  async listUsers(query: AdminListUsersQuery) {
    const where = this.buildWhere(query);
    const skip = (query.page - 1) * query.pageSize;

    const [rows, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: userListInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { rows, total, page: query.page, pageSize: query.pageSize };
  }

  async findUserDetail(userId: string): Promise<AdminUserListRow> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: userListInclude,
    });
    if (!user) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND', message: '用户不存在' });
    }
    return user;
  }
}
