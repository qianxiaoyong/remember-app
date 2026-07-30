export interface SmsSendInput {
  phone: string;
  code: string;
}

export interface SmsSender {
  sendCode(input: SmsSendInput): Promise<void>;
}

export const SMS_SENDER = Symbol('SMS_SENDER');
