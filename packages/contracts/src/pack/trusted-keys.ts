import { TEST_PACK_KEY_ID, TEST_PACK_PUBLIC_KEY_HEX } from './constants.js';

export interface TrustedPublicKey {
  keyId: string;
  publicKeyHex: string;
}

export const PACK_TRUSTED_PUBLIC_KEYS: TrustedPublicKey[] = [
  { keyId: TEST_PACK_KEY_ID, publicKeyHex: TEST_PACK_PUBLIC_KEY_HEX },
];

export function getTrustedPublicKeyHex(keyId: string): string | undefined {
  return PACK_TRUSTED_PUBLIC_KEYS.find((entry) => entry.keyId === keyId)?.publicKeyHex;
}

export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('invalid hex length');
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

export function base64ToBytes(base64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(base64, 'base64'));
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}
