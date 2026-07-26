import type {
  WechatMessageSignatureInput,
  WechatRequestSignatureInput,
} from './wechat-pay-crypto.types.js';

function assertSignatureLine(name: string, value: string): void {
  if (value.length === 0 || value.includes('\n') || value.includes('\r')) {
    throw new Error(`${name}不是有效的微信支付签名字段`);
  }
}

function assertRequestMethod(value: string): void {
  if (value !== 'GET' && value !== 'POST') {
    throw new Error('method不是支持的微信支付请求方法');
  }
}

export function buildWechatRequestSignatureMessage(input: WechatRequestSignatureInput): string {
  assertRequestMethod(input.method);
  if (!input.path.startsWith('/')) {
    throw new Error('path必须是去除域名后的绝对URL');
  }
  assertSignatureLine('path', input.path);
  assertSignatureLine('timestamp', input.timestamp);
  assertSignatureLine('nonce', input.nonce);

  return `${input.method}\n${input.path}\n${input.timestamp}\n${input.nonce}\n${input.body}\n`;
}

export function buildWechatMessageSignatureMessage(
  input: Pick<WechatMessageSignatureInput, 'timestamp' | 'nonce' | 'body'>,
): string {
  assertSignatureLine('timestamp', input.timestamp);
  assertSignatureLine('nonce', input.nonce);
  return `${input.timestamp}\n${input.nonce}\n${input.body}\n`;
}
