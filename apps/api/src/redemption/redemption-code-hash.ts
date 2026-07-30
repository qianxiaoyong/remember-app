import { createHash } from 'node:crypto';

export function hashRedemptionCode(code: string, pepper: string): string {
  const normalized = code.trim().toUpperCase();
  return createHash('sha256').update(`${normalized}:${pepper}`, 'utf8').digest('hex');
}
