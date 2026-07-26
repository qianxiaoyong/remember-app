import { createCipheriv } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { decryptWechatResource } from './decrypt-wechat-resource.js';

const apiV3Key = Buffer.from('0123456789abcdef0123456789abcdef');

function createEncryptedResource() {
  const nonce = '0123456789ab';
  const associatedData = 'transaction';
  const cipher = createCipheriv('aes-256-gcm', apiV3Key, nonce);
  cipher.setAAD(Buffer.from(associatedData));
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from('{"trade_state":"SUCCESS"}')),
    cipher.final(),
  ]);
  const ciphertext = Buffer.concat([encrypted, cipher.getAuthTag()]).toString('base64');

  return { algorithm: 'AEAD_AES_256_GCM' as const, ciphertext, nonce, associatedData };
}

describe('decryptWechatResource', () => {
  it('把末尾16字节认证标签与加密内容分离后解密', () => {
    const plaintext = decryptWechatResource(createEncryptedResource(), apiV3Key);
    expect(Buffer.from(plaintext).toString()).toBe('{"trade_state":"SUCCESS"}');
  });

  it.each([Buffer.alloc(31), Buffer.alloc(33)])('拒绝非32字节APIv3密钥', (key) => {
    expect(() => decryptWechatResource(createEncryptedResource(), key)).toThrow(
      'APIv3 key必须是32字节',
    );
  });

  it('拒绝非AEAD_AES_256_GCM算法', () => {
    expect(() =>
      decryptWechatResource(
        { ...createEncryptedResource(), algorithm: 'AES_CBC' as 'AEAD_AES_256_GCM' },
        apiV3Key,
      ),
    ).toThrow('不支持的微信支付资源加密算法');
  });

  it('拒绝没有加密内容的认证标签', () => {
    const ciphertext = Buffer.alloc(16).toString('base64');
    expect(() =>
      decryptWechatResource({ ...createEncryptedResource(), ciphertext }, apiV3Key),
    ).toThrow('ciphertext必须包含加密内容和16字节认证标签');
  });

  it.each([
    ['nonce', '0123456789ac'],
    ['associatedData', 'different'],
  ] as const)('拒绝错误的%s', (name, value) => {
    expect(() =>
      decryptWechatResource({ ...createEncryptedResource(), [name]: value }, apiV3Key),
    ).toThrow();
  });

  it('拒绝被篡改的认证标签', () => {
    const resource = createEncryptedResource();
    const bytes = Buffer.from(resource.ciphertext, 'base64');
    const lastByte = bytes.at(-1);
    if (lastByte === undefined) throw new Error('测试密文不能为空');
    bytes[bytes.length - 1] = lastByte ^ 1;

    expect(() =>
      decryptWechatResource({ ...resource, ciphertext: bytes.toString('base64') }, apiV3Key),
    ).toThrow();
  });

  it('拒绝被篡改的加密内容', () => {
    const resource = createEncryptedResource();
    const bytes = Buffer.from(resource.ciphertext, 'base64');
    const firstByte = bytes.at(0);
    if (firstByte === undefined) throw new Error('测试密文不能为空');
    bytes[0] = firstByte ^ 1;

    expect(() =>
      decryptWechatResource({ ...resource, ciphertext: bytes.toString('base64') }, apiV3Key),
    ).toThrow();
  });
});
