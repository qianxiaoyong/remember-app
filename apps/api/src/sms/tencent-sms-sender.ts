import { Injectable } from '@nestjs/common';
import type { SmsSendInput, SmsSender } from './sms-sender.port.js';

@Injectable()
export class TencentSmsSender implements SmsSender {
  sendCode(input: SmsSendInput): Promise<void> {
    void input;
    return Promise.reject(new Error('Tencent SMS is not configured'));
  }
}
