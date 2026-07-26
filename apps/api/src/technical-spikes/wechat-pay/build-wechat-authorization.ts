import { sign } from 'node:crypto';
import { buildWechatRequestSignatureMessage } from './build-wechat-signature-message.js';
import type { WechatAuthorizationInput } from './wechat-pay-crypto.types.js';

function assertAuthorizationValue(name: string, value: string): void {
  if (value.length === 0 || /[",\\\r\n]/.test(value)) {
    throw new Error(`${name}不是有效的微信支付Authorization字段`);
  }
}

export function buildWechatAuthorization(input: WechatAuthorizationInput): string {
  assertAuthorizationValue('mchId', input.mchId);
  assertAuthorizationValue('serialNo', input.serialNo);
  assertAuthorizationValue('nonce', input.nonce);
  assertAuthorizationValue('timestamp', input.timestamp);
  if (input.privateKey.trim().length === 0) {
    throw new Error('privateKey不能为空');
  }

  const message = buildWechatRequestSignatureMessage(input);
  const signature = sign('RSA-SHA256', Buffer.from(message), input.privateKey).toString('base64');

  return (
    'WECHATPAY2-SHA256-RSA2048 ' +
    `mchid="${input.mchId}",` +
    `nonce_str="${input.nonce}",` +
    `signature="${signature}",` +
    `timestamp="${input.timestamp}",` +
    `serial_no="${input.serialNo}"`
  );
}
