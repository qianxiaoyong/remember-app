import { createVerify } from 'node:crypto';
import { buildWechatMessageSignatureMessage } from './build-wechat-signature-message.js';
import type { WechatMessageSignatureInput } from './wechat-pay-crypto.types.js';

function decodeSignature(value: string): Buffer | null {
  if (value.length === 0 || value.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) {
    return null;
  }

  const decoded = Buffer.from(value, 'base64');
  return decoded.toString('base64') === value ? decoded : null;
}

export function verifyWechatMessage(input: WechatMessageSignatureInput): boolean {
  const signature = decodeSignature(input.signature);
  if (signature === null) return false;

  const verifier = createVerify('RSA-SHA256');
  verifier.update(buildWechatMessageSignatureMessage(input));
  verifier.end();
  return verifier.verify(input.publicKey, signature);
}
