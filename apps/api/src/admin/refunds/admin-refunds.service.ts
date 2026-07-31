import { ConflictException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import type { AdminCreateRefundRequest, AdminCreateRefundResponse } from '@remember/contracts';
import { adminCreateRefundResponseSchema } from '@remember/contracts';
import { AuditService } from '../../audit/audit.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { WechatPayConfigService } from '../../payment/wechat-pay-config.service.js';

@Injectable()
export class AdminRefundsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly wechatPayConfig: WechatPayConfigService,
  ) {}

  async createRefund(
    actorAdminUserId: string,
    input: AdminCreateRefundRequest,
  ): Promise<AdminCreateRefundResponse> {
    const config = this.wechatPayConfig.read();
    if (!config.mockEnabled) {
      throw new HttpException({ code: 'REFUND_NOT_AVAILABLE', message: '真实退款尚未启用' }, 503);
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({ where: { id: input.orderId } });
        if (!order) {
          throw new NotFoundException({ code: 'ORDER_NOT_FOUND', message: '订单不存在' });
        }
        if (order.status !== 'paid') {
          throw new ConflictException({ code: 'ORDER_NOT_REFUNDABLE', message: '订单不可退款' });
        }

        const existingRefund = await tx.refund.findFirst({
          where: { orderId: order.id, status: { in: ['pending', 'succeeded'] } },
        });
        if (existingRefund) {
          throw new ConflictException({ code: 'REFUND_ALREADY_EXISTS', message: '退款已存在' });
        }

        await tx.order.update({
          where: { id: order.id },
          data: { status: 'refunding' },
        });

        const refund = await tx.refund.create({
          data: { orderId: order.id, status: 'pending' },
        });

        await tx.refund.update({
          where: { id: refund.id },
          data: { status: 'succeeded' },
        });
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'refunded' },
        });

        await this.auditService.writeAuditLog(
          {
            actorAdminUserId,
            action: 'refund.create',
            targetType: 'order',
            targetId: order.id,
            payloadSummary: {
              orderId: order.id,
              amountCents: order.amountCents,
              ...(input.reason ? { reason: input.reason } : {}),
            },
            result: 'success',
          },
          tx,
        );

        return {
          refundId: refund.id,
          orderId: order.id,
          status: 'succeeded' as const,
          orderStatus: 'refunded' as const,
        };
      });

      return adminCreateRefundResponseSchema.parse(result);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof HttpException
      ) {
        await this.auditService.writeAuditLog({
          actorAdminUserId,
          action: 'refund.create',
          targetType: 'order',
          targetId: input.orderId,
          payloadSummary: {
            orderId: input.orderId,
            ...(input.reason ? { reason: input.reason } : {}),
          },
          result: 'failure',
          errorCode:
            error instanceof NotFoundException
              ? 'ORDER_NOT_FOUND'
              : error instanceof ConflictException
                ? 'ORDER_NOT_REFUNDABLE'
                : 'REFUND_NOT_AVAILABLE',
        });
        throw error;
      }

      await this.auditService.writeAuditLog({
        actorAdminUserId,
        action: 'refund.create',
        targetType: 'order',
        targetId: input.orderId,
        payloadSummary: { orderId: input.orderId },
        result: 'failure',
        errorCode: 'REFUND_FAILED',
      });
      throw error;
    }
  }
}
