import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { AdminListOrdersQuery } from '@remember/contracts';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AdminOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listOrders(query: AdminListOrdersQuery) {
    const where: Prisma.OrderWhereInput = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.packId) {
      where.packId = query.packId;
    }
    if (query.userId) {
      where.userId = query.userId;
    }

    const skip = (query.page - 1) * query.pageSize;
    const [rows, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { user: true, pack: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { rows, total, page: query.page, pageSize: query.pageSize };
  }

  async findOrderDetail(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        pack: true,
        paymentEvents: { orderBy: { processedAt: 'desc' } },
        refunds: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!order) {
      throw new NotFoundException({ code: 'ORDER_NOT_FOUND', message: '订单不存在' });
    }
    return order;
  }
}
