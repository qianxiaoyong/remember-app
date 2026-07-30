import { Injectable } from '@nestjs/common';

export interface WechatPayConfig {
  mockEnabled: boolean;
  mockNotifySecret: string | null;
  appId: string;
  mchId: string;
}

function readBoolean(name: string, defaultValue: boolean): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  if (!raw) {
    return defaultValue;
  }
  return raw === 'true' || raw === '1';
}

@Injectable()
export class WechatPayConfigService {
  read(): WechatPayConfig {
    const nodeEnv = process.env.NODE_ENV?.trim().toLowerCase();
    const mockEnabled =
      readBoolean('WECHAT_PAY_MOCK_ENABLED', nodeEnv === 'test' || nodeEnv === 'development');

    return {
      mockEnabled,
      mockNotifySecret: process.env.WECHAT_PAY_MOCK_NOTIFY_SECRET?.trim() || null,
      appId: process.env.WECHAT_PAY_APP_ID?.trim() || 'wxmockappid',
      mchId: process.env.WECHAT_PAY_MCH_ID?.trim() || '1900000001',
    };
  }
}
