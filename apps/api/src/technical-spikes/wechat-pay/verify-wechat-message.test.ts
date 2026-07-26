import { generateKeyPairSync, sign } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifyWechatMessage } from './verify-wechat-message.js';

function createSignedInput() {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const timestamp = '1722850421';
  const nonce = 'd824f2e086d3c1df967785d13fcd22ef';
  const body = '{"code_url":"weixin://wxpay/bizpayurl?pr=JyC91EIz1"}';
  const message = `${timestamp}\n${nonce}\n${body}\n`;
  const signature = sign('RSA-SHA256', Buffer.from(message), privateKey).toString('base64');

  return {
    timestamp,
    nonce,
    body,
    signature,
    publicKey: publicKey.export({ type: 'spki', format: 'pem' }),
  };
}

describe('verifyWechatMessage', () => {
  it('使用原始body验证微信支付响应或回调签名', () => {
    expect(verifyWechatMessage(createSignedInput())).toBe(true);
  });

  it.each([
    ['timestamp', '1722850422'],
    ['nonce', 'different-nonce'],
    ['body', '{"code_url":"tampered"}'],
    ['signature', Buffer.alloc(256).toString('base64')],
  ] as const)('拒绝被篡改的%s', (name, value) => {
    expect(verifyWechatMessage({ ...createSignedInput(), [name]: value })).toBe(false);
  });

  it('拒绝不匹配的平台公钥', () => {
    const input = createSignedInput();
    const { publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const otherPublicKey = publicKey.export({ type: 'spki', format: 'pem' });

    expect(verifyWechatMessage({ ...input, publicKey: otherPublicKey })).toBe(false);
  });

  it.each([
    (signature: string) => `${signature}!!`,
    (signature: string) => ` ${signature}`,
    (signature: string) => signature.replace(/=+$/, ''),
  ])('拒绝非规范Base64签名', (mutateSignature) => {
    const input = createSignedInput();
    expect(verifyWechatMessage({ ...input, signature: mutateSignature(input.signature) })).toBe(
      false,
    );
  });
});
