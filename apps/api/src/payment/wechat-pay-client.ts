import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { WechatAppPrepayParams } from '@remember/contracts';
import { WechatPayConfigService } from './wechat-pay-config.service.js';

export interface CreateAppPrepayInput {
  orderId: string;
  amountCents: number;
  description: string;
}

@Injectable()
export class WechatPayClient {
  constructor(private readonly wechatPayConfigService: WechatPayConfigService) {}

  createAppPrepay(input: CreateAppPrepayInput): WechatAppPrepayParams {
    const config = this.wechatPayConfigService.read();
    if (!config.mockEnabled) {
      throw new Error('WechatPayClient 生产下单尚未在本环境启用，请设置 WECHAT_PAY_MOCK_ENABLED=true');
    }

    const nonceStr = randomBytes(8).toString('hex');
    const timeStamp = Math.floor(Date.now() / 1000).toString();
    const prepayId = `wx${input.orderId.replace(/-/g, '').slice(0, 24)}`;

    return {
      appId: config.appId,
      partnerId: config.mchId,
      prepayId,
      packageValue: 'Sign=WXPay',
      nonceStr,
      timeStamp,
      sign: 'MOCK_SIGN',
    };
  }
}
