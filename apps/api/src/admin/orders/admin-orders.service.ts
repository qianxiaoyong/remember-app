import { Injectable } from '@nestjs/common';
import type {
  AdminListOrdersQuery,
  AdminOrderDetail,
  AdminOrderListResponse,
} from '@remember/contracts';
import { adminOrderDetailSchema, adminOrderListResponseSchema } from '@remember/contracts';
import { AdminOrdersRepository } from './admin-orders.repository.js';

@Injectable()
export class AdminOrdersService {
  constructor(private readonly repository: AdminOrdersRepository) {}

  async listOrders(query: AdminListOrdersQuery): Promise<AdminOrderListResponse> {
    const result = await this.repository.listOrders(query);
    return adminOrderListResponseSchema.parse({
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      items: result.rows.map((row) => ({
        orderId: row.id,
        userId: row.userId,
        maskedPhone: row.user.maskedPhone,
        packId: row.packId,
        packTitle: row.pack.title,
        amountCents: row.amountCents,
        status: row.status,
        ...(row.channel ? { channel: row.channel } : {}),
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      })),
    });
  }

  async getOrderDetail(orderId: string): Promise<AdminOrderDetail> {
    const order = await this.repository.findOrderDetail(orderId);
    return adminOrderDetailSchema.parse({
      orderId: order.id,
      userId: order.userId,
      maskedPhone: order.user.maskedPhone,
      packId: order.packId,
      packTitle: order.pack.title,
      amountCents: order.amountCents,
      status: order.status,
      ...(order.channel ? { channel: order.channel } : {}),
      ...(order.sourceCode ? { sourceCode: order.sourceCode } : {}),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      paymentEvents: order.paymentEvents.map((event) => ({
        notificationId: event.notificationId,
        transactionId: event.transactionId,
        processedAt: event.processedAt.toISOString(),
      })),
      refunds: order.refunds.map((refund) => ({
        refundId: refund.id,
        status: refund.status,
        createdAt: refund.createdAt.toISOString(),
      })),
    });
  }
}
