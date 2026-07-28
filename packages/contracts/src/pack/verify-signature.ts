import { manifestBytesForSigning } from './canonical-json.js';
import { PackVerificationError } from './errors.js';
import type { PackManifest } from './manifest.js';
import { base64ToBytes, getTrustedPublicKeyHex, hexToBytes } from './trusted-keys.js';

export interface Ed25519Verifier {
  verify(
    signature: Uint8Array,
    message: Uint8Array,
    publicKey: Uint8Array,
  ): boolean | Promise<boolean>;
}

export async function verifyManifestSignature(
  manifest: PackManifest,
  ed25519: Ed25519Verifier,
): Promise<void> {
  const publicKeyHex = getTrustedPublicKeyHex(manifest.keyId);
  if (!publicKeyHex) {
    throw new PackVerificationError('PACK_KEY_UNKNOWN', `unknown keyId: ${manifest.keyId}`);
  }

  const { signature, ...manifestWithoutSignature } = manifest;
  void signature;
  const message = manifestBytesForSigning(manifestWithoutSignature);

  let signatureBytes: Uint8Array;
  try {
    signatureBytes = base64ToBytes(manifest.signature);
  } catch {
    throw new PackVerificationError('PACK_SIGNATURE_INVALID', 'signature is not valid base64');
  }

  const publicKey = hexToBytes(publicKeyHex);
  const valid = await ed25519.verify(signatureBytes, message, publicKey);
  if (!valid) {
    throw new PackVerificationError(
      'PACK_SIGNATURE_INVALID',
      'manifest signature verification failed',
    );
  }
}

export function signManifestPayload(
  manifestWithoutSignature: Record<string, unknown>,
  privateKeyHex: string,
  sign: (message: Uint8Array, privateKey: Uint8Array) => Uint8Array | Promise<Uint8Array>,
): Promise<string> {
  const message = manifestBytesForSigning(manifestWithoutSignature);
  const privateKey = hexToBytes(privateKeyHex);
  return Promise.resolve(sign(message, privateKey)).then((signature) => bytesToBase64(signature));
}

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export { bytesToBase64 };
