import {
  Body,
  Controller,
  ForbiddenException,
  Headers,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import type { SimulatePaymentNotifyResponse } from '@remember/contracts';
import {
  simulatePaymentNotifyRequestSchema,
  simulatePaymentNotifyResponseSchema,
} from '@remember/contracts';
import { AuthService } from '../auth/auth.service.js';
import { tryReadAuthContext, type RequestWithAuth } from '../auth/auth.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PaymentNotificationService } from './payment-notification.service.js';
import { WechatPayConfigService } from './wechat-pay-config.service.js';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentNotificationService: PaymentNotificationService,
    private readonly wechatPayConfigService: WechatPayConfigService,
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('test/simulate-notify')
  @HttpCode(200)
  async simulateNotify(
    @Req() request: RequestWithAuth,
    @Headers('x-mock-payment-secret') mockPaymentSecret: string | undefined,
    @Body() body: unknown,
  ): Promise<SimulatePaymentNotifyResponse> {
    const config = this.wechatPayConfigService.read();
    if (!config.mockEnabled) {
      throw new ForbiddenException({
        code: 'MOCK_PAYMENT_DISABLED',
        message: '模拟支付回调仅在 mock 模式可用',
      });
    }

    const input = simulatePaymentNotifyRequestSchema.parse(body);
    const order = await this.prisma.order.findUnique({ where: { id: input.orderId } });
    if (!order) {
      throw new ForbiddenException({
        code: 'MOCK_PAYMENT_UNAUTHORIZED',
        message: '无权模拟该订单支付回调',
      });
    }

    const auth = await tryReadAuthContext(this.authService, request);
    const secretMatches =
      config.mockNotifySecret !== null &&
      mockPaymentSecret !== undefined &&
      mockPaymentSecret === config.mockNotifySecret;
    const ownerMatches = auth?.userId === order.userId;

    if (!secretMatches && !ownerMatches) {
      throw new ForbiddenException({
        code: 'MOCK_PAYMENT_UNAUTHORIZED',
        message: '无权模拟该订单支付回调',
      });
    }

    const result = await this.paymentNotificationService.processPaymentNotification({
      notificationId: input.notificationId ?? `mock-n-${input.orderId}`,
      transactionId: input.transactionId ?? `mock-t-${input.orderId}`,
      orderId: input.orderId,
      processedAt: new Date(),
      ...(input.amountCents !== undefined ? { amountCents: input.amountCents } : {}),
    });

    return simulatePaymentNotifyResponseSchema.parse({
      processed: result.processed,
      orderId: result.orderId,
      status: result.status,
    });
  }
}
