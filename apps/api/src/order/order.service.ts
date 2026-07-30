import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateOrderResponse, OrderDetailResponse } from '@remember/contracts';
import { createOrderResponseSchema, orderDetailResponseSchema } from '@remember/contracts';
import { CatalogRepository } from '../catalog/catalog.repository.js';
import { PackAccessRepository } from '../pack-access/pack-access.repository.js';
import { WechatPayClient } from '../payment/wechat-pay-client.js';
import { OrderRepository } from './order.repository.js';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly catalogRepository: CatalogRepository,
    private readonly packAccessRepository: PackAccessRepository,
    private readonly wechatPayClient: WechatPayClient,
  ) {}

  async createOrder(userId: string, packId: string): Promise<CreateOrderResponse> {
    const pack = await this.catalogRepository.findPublishedPackById(packId);
    if (!pack) {
      throw new NotFoundException({ code: 'PACK_NOT_FOUND', message: '未找到该知识库' });
    }

    const existingAccess = await this.packAccessRepository.findByUserAndPack(userId, packId);
    if (existingAccess) {
      throw new ConflictException({ code: 'PACK_ALREADY_OWNED', message: '您已拥有该知识库' });
    }

    const order = await this.orderRepository.createPendingOrder({
      userId,
      packId,
      amountCents: pack.priceCents,
    });

    const wechatPrepay = this.wechatPayClient.createAppPrepay({
      orderId: order.id,
      amountCents: order.amountCents,
      description: pack.title,
    });

    return createOrderResponseSchema.parse({
      orderId: order.id,
      packId: order.packId,
      amountCents: order.amountCents,
      status: 'pending',
      wechatPrepay,
    });
  }

  async getOrder(userId: string, orderId: string): Promise<OrderDetailResponse> {
    const order = await this.orderRepository.findByIdForUser(orderId, userId);
    if (!order) {
      throw new NotFoundException({ code: 'ORDER_NOT_FOUND', message: '未找到该订单' });
    }

    return orderDetailResponseSchema.parse({
      orderId: order.id,
      packId: order.packId,
      amountCents: order.amountCents,
      status: order.status,
      ...(order.status === 'paid' ? { paidAt: order.updatedAt.toISOString() } : {}),
    });
  }
}
