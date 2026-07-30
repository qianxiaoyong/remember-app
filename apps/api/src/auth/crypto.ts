import { createHash, randomBytes } from 'node:crypto';

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

export function hashPhone(phone: string, pepper: string): string {
  return sha256Hex(`${phone}:${pepper}`);
}

export function hashSmsCode(challengeId: string, code: string, pepper: string): string {
  return sha256Hex(`${challengeId}:${code}:${pepper}`);
}

export function hashSessionToken(token: string): string {
  return sha256Hex(token);
}

export function createSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

export function createSmsCode(mockEnabled: boolean): string {
  if (mockEnabled) {
    return '000000';
  }
  const value = randomBytes(4).readUInt32BE(0) % 1_000_000;
  return value.toString().padStart(6, '0');
}

export function maskPhone(phone: string): string {
  return `${phone.slice(0, 3)}****${phone.slice(7)}`;
}
