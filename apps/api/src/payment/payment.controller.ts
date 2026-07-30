import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Post,
} from '@nestjs/common';
import type { SimulatePaymentNotifyResponse } from '@remember/contracts';
import {
  simulatePaymentNotifyRequestSchema,
  simulatePaymentNotifyResponseSchema,
} from '@remember/contracts';
import { PaymentNotificationService } from './payment-notification.service.js';
import { WechatPayConfigService } from './wechat-pay-config.service.js';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentNotificationService: PaymentNotificationService,
    private readonly wechatPayConfigService: WechatPayConfigService,
  ) {}

  @Post('test/simulate-notify')
  @HttpCode(200)
  async simulateNotify(@Body() body: unknown): Promise<SimulatePaymentNotifyResponse> {
    const config = this.wechatPayConfigService.read();
    if (!config.mockEnabled) {
      throw new ForbiddenException({
        code: 'MOCK_PAYMENT_DISABLED',
        message: '模拟支付回调仅在 mock 模式可用',
      });
    }

    const input = simulatePaymentNotifyRequestSchema.parse(body);

    const result = await this.paymentNotificationService.processPaymentNotification({
      notificationId: input.notificationId ?? `mock-n-${input.orderId}`,
      transactionId: input.transactionId ?? `mock-t-${input.orderId}`,
      orderId: input.orderId,
      ...(input.amountCents !== undefined ? { amountCents: input.amountCents } : {}),
      processedAt: new Date(),
    });

    return simulatePaymentNotifyResponseSchema.parse({
      processed: result.processed,
      orderId: result.orderId,
      status: result.status,
    });
  }
}
