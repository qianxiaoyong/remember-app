import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface ProcessPaymentNotificationInput {
  notificationId: string;
  transactionId: string;
  orderId: string;
  amountCents?: number;
  processedAt: Date;
}

export interface ProcessPaymentNotificationResult {
  processed: boolean;
  orderId: string;
  status: string;
}

@Injectable()
export class PaymentNotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async processPaymentNotification(
    input: ProcessPaymentNotificationInput,
  ): Promise<ProcessPaymentNotificationResult> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.paymentEvent.findUnique({
        where: { notificationId: input.notificationId },
      });

      if (existing) {
        if (
          existing.transactionId !== input.transactionId ||
          existing.orderId !== input.orderId
        ) {
          throw new HttpException(
            { code: 'PAYMENT_NOTIFICATION_CONFLICT', message: '支付通知冲突' },
            409,
          );
        }
        const order = await tx.order.findUnique({ where: { id: input.orderId } });
        return {
          processed: false,
          orderId: input.orderId,
          status: order?.status ?? 'pending',
        };
      }

      const order = await tx.order.findUnique({ where: { id: input.orderId } });
      if (!order) {
        throw new HttpException({ code: 'PAYMENT_ORDER_NOT_FOUND', message: '订单不存在' }, 404);
      }

      if (order.status === 'refunded' || order.status === 'refunding') {
        throw new HttpException(
          { code: 'PAYMENT_ORDER_NOT_PAYABLE', message: '订单不可支付' },
          409,
        );
      }

      if (order.status === 'paid') {
        await tx.paymentEvent.create({
          data: {
            notificationId: input.notificationId,
            transactionId: input.transactionId,
            orderId: input.orderId,
            processedAt: input.processedAt,
          },
        });
        return { processed: false, orderId: order.id, status: order.status };
      }

      if (order.status !== 'pending') {
        throw new HttpException(
          { code: 'PAYMENT_ORDER_NOT_PAYABLE', message: '订单不可支付' },
          409,
        );
      }

      if (input.amountCents === undefined) {
        throw new HttpException(
          { code: 'PAYMENT_AMOUNT_MISSING', message: '支付金额缺失' },
          400,
        );
      }

      if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
        throw new HttpException(
          { code: 'PAYMENT_AMOUNT_MISSING', message: '支付金额缺失' },
          400,
        );
      }

      if (order.amountCents !== input.amountCents) {
        throw new HttpException(
          { code: 'PAYMENT_AMOUNT_MISMATCH', message: '支付金额与订单不符' },
          400,
        );
      }

      await tx.paymentEvent.create({
        data: {
          notificationId: input.notificationId,
          transactionId: input.transactionId,
          orderId: input.orderId,
          processedAt: input.processedAt,
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: 'paid', updatedAt: input.processedAt },
      });

      await tx.packAccess.create({
        data: {
          userId: order.userId,
          packId: order.packId,
          orderId: order.id,
          source: 'purchase',
          grantedAt: input.processedAt,
        },
      }).catch(async (error: unknown) => {
        const existingAccess = await tx.packAccess.findUnique({
          where: { userId_packId: { userId: order.userId, packId: order.packId } },
        });
        if (!existingAccess) {
          throw error;
        }
      });

      return { processed: true, orderId: order.id, status: 'paid' };
    });
  }
}
