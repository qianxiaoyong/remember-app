import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createDownloadToken, verifyDownloadToken } from './download-token.js';

describe('download-token', () => {
  it('round-trip token', () => {
    process.env.PACK_DOWNLOAD_TOKEN_PEPPER ??= 'test-download-pepper';
    const token = createDownloadToken({
      userId: '550e8400-e29b-41d4-a716-446655440000',
      packId: 'demo-primary-grade3',
      ttlSeconds: 60,
    });
    const payload = verifyDownloadToken(token);
    expect(payload.packId).toBe('demo-primary-grade3');
  });

  it('rejects tampered token', () => {
    process.env.PACK_DOWNLOAD_TOKEN_PEPPER ??= 'test-download-pepper';
    const token = createDownloadToken({
      userId: '550e8400-e29b-41d4-a716-446655440000',
      packId: 'demo-primary-grade3',
      ttlSeconds: 60,
    });
    expect(() => verifyDownloadToken(`${token}x`)).toThrow('PACK_DOWNLOAD_TOKEN_INVALID');
  });

  it('rejects expired token', () => {
    process.env.PACK_DOWNLOAD_TOKEN_PEPPER ??= 'test-download-pepper';
    const pepper = process.env.PACK_DOWNLOAD_TOKEN_PEPPER;
    const expiresAtMs = Date.now() - 1000;
    const body = `550e8400-e29b-41d4-a716-446655440000|demo-primary-grade3|${String(expiresAtMs)}`;
    const signature = createHmac('sha256', pepper).update(body, 'utf8').digest('base64url');
    const token = `${Buffer.from(body, 'utf8').toString('base64url')}.${signature}`;
    expect(() => verifyDownloadToken(token)).toThrow('PACK_DOWNLOAD_TOKEN_EXPIRED');
  });
});
