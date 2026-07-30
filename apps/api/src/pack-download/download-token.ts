import { createHmac, timingSafeEqual } from 'node:crypto';

export interface DownloadTokenPayload {
  userId: string;
  packId: string;
  expiresAtMs: number;
}

function readPepper(): string {
  const pepper =
    process.env.PACK_DOWNLOAD_TOKEN_PEPPER?.trim() || process.env.AUTH_PHONE_PEPPER?.trim();
  if (!pepper) {
    throw new Error('Missing PACK_DOWNLOAD_TOKEN_PEPPER or AUTH_PHONE_PEPPER');
  }
  return pepper;
}

function signPayload(payload: string, pepper: string): string {
  return createHmac('sha256', pepper).update(payload, 'utf8').digest('base64url');
}

export function createDownloadToken(input: {
  userId: string;
  packId: string;
  ttlSeconds?: number;
}): string {
  const pepper = readPepper();
  const expiresAtMs = Date.now() + (input.ttlSeconds ?? 900) * 1000;
  const body = `${input.userId}|${input.packId}|${expiresAtMs}`;
  const signature = signPayload(body, pepper);
  return `${Buffer.from(body, 'utf8').toString('base64url')}.${signature}`;
}

export function verifyDownloadToken(token: string): DownloadTokenPayload {
  const pepper = readPepper();
  const [encodedBody, signature] = token.split('.');
  if (!encodedBody || !signature) {
    throw new Error('PACK_DOWNLOAD_TOKEN_INVALID');
  }

  const body = Buffer.from(encodedBody, 'base64url').toString('utf8');
  const expected = signPayload(body, pepper);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    throw new Error('PACK_DOWNLOAD_TOKEN_INVALID');
  }

  const [userId, packId, expiresAtRaw] = body.split('|');
  if (!userId || !packId || !expiresAtRaw) {
    throw new Error('PACK_DOWNLOAD_TOKEN_INVALID');
  }

  const expiresAtMs = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs < Date.now()) {
    throw new Error('PACK_DOWNLOAD_TOKEN_EXPIRED');
  }

  return { userId, packId, expiresAtMs };
}
