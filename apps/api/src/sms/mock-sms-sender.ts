import { Injectable } from '@nestjs/common';
import type { SmsSendInput, SmsSender } from './sms-sender.port.js';

@Injectable()
export class MockSmsSender implements SmsSender {
  sendCode(input: SmsSendInput): Promise<void> {
    void input;
    return Promise.resolve();
  }
}
