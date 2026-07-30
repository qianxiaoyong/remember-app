import { Injectable } from '@nestjs/common';
import type { Order, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  createPendingOrder(input: {
    userId: string;
    packId: string;
    amountCents: number;
  }): Promise<Order> {
    return this.prisma.order.create({
      data: {
        userId: input.userId,
        packId: input.packId,
        amountCents: input.amountCents,
        status: 'pending',
        channel: 'wechat',
      },
    });
  }

  findByIdForUser(orderId: string, userId: string): Promise<Order | null> {
    return this.prisma.order.findFirst({
      where: { id: orderId, userId },
    });
  }

  findById(orderId: string): Promise<Order | null> {
    return this.prisma.order.findUnique({ where: { id: orderId } });
  }

  findByIdInTransaction(
    tx: Prisma.TransactionClient,
    orderId: string,
  ): Promise<Order | null> {
    return tx.order.findUnique({ where: { id: orderId } });
  }
}
