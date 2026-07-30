import { describe, expect, it } from 'vitest';
import { packDownloadAuthorizationResponseSchema } from './download-authorization.js';

describe('pack-download contracts', () => {
  it('packDownloadAuthorizationResponse round-trip', () => {
    const response = packDownloadAuthorizationResponseSchema.parse({
      packId: 'demo-primary-grade3',
      packVersion: '1.0.0',
      sha256: '43006107439d77e9c31aa359fda4ca6424185768abe371598c58ba9cda4d978b',
      sizeBytes: 2706,
      downloadUrl: 'http://127.0.0.1:3000/api/v1/packs/demo-primary-grade3/download?token=abc',
      offlineLicenseExpiresAt: '2026-08-29T08:00:00.000Z',
      devContentPackId: 'remember-test-pack',
    });
    expect(response.devContentPackId).toBe('remember-test-pack');
  });
});
