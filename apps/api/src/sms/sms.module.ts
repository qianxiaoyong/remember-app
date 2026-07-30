import { Module } from '@nestjs/common';
import { readAuthConfig } from '../config/read-auth-config.js';
import { MockSmsSender } from './mock-sms-sender.js';
import { SMS_SENDER } from './sms-sender.port.js';
import { TencentSmsSender } from './tencent-sms-sender.js';

@Module({
  providers: [
    MockSmsSender,
    TencentSmsSender,
    {
      provide: SMS_SENDER,
      useFactory: (mockSender: MockSmsSender, tencentSender: TencentSmsSender) => {
        const config = readAuthConfig();
        return config.smsMockEnabled ? mockSender : tencentSender;
      },
      inject: [MockSmsSender, TencentSmsSender],
    },
  ],
  exports: [SMS_SENDER],
})
export class SmsModule {}
