import { createDecipheriv } from 'node:crypto';
import type { WechatEncryptedResource } from './wechat-pay-crypto.types.js';

const authTagLength = 16;

function assertAlgorithm(value: string): void {
  if (value !== 'AEAD_AES_256_GCM') {
    throw new Error('不支持的微信支付资源加密算法');
  }
}

function decodeCiphertext(value: string): Buffer {
  if (value.length === 0 || value.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) {
    throw new Error('ciphertext不是有效的Base64');
  }

  const decoded = Buffer.from(value, 'base64');
  if (decoded.toString('base64') !== value) {
    throw new Error('ciphertext不是规范的Base64');
  }
  return decoded;
}

export function decryptWechatResource(
  resource: WechatEncryptedResource,
  apiV3Key: Uint8Array,
): Uint8Array {
  assertAlgorithm(resource.algorithm);
  if (apiV3Key.byteLength !== 32) {
    throw new Error('APIv3 key必须是32字节');
  }
  if (Buffer.byteLength(resource.nonce) !== 12) {
    throw new Error('nonce必须是12字节');
  }

  const encryptedWithTag = decodeCiphertext(resource.ciphertext);
  if (encryptedWithTag.byteLength <= authTagLength) {
    throw new Error('ciphertext必须包含加密内容和16字节认证标签');
  }

  const encrypted = encryptedWithTag.subarray(0, -authTagLength);
  const authTag = encryptedWithTag.subarray(-authTagLength);
  const decipher = createDecipheriv('aes-256-gcm', apiV3Key, resource.nonce);
  decipher.setAAD(Buffer.from(resource.associatedData));
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}
