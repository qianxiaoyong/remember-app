import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PaymentController } from './payment.controller.js';
import { PaymentNotificationService } from './payment-notification.service.js';
import { WechatPayClient } from './wechat-pay-client.js';
import { WechatPayConfigService } from './wechat-pay-config.service.js';

@Module({
  imports: [AuthModule],
  controllers: [PaymentController],
  providers: [WechatPayConfigService, WechatPayClient, PaymentNotificationService],
  exports: [WechatPayConfigService, WechatPayClient, PaymentNotificationService],
})
export class PaymentModule {}

