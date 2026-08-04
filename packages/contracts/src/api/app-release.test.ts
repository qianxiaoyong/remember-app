import { describe, expect, it } from 'vitest';
import { appReleaseResponseSchema } from './app-release.js';

describe('appReleaseResponseSchema', () => {
  it('parses release metadata', () => {
    const body = appReleaseResponseSchema.parse({
      minAndroidVersion: '1.0.0',
      latestApkUrl: 'https://remember.wehub.top/download/app.apk',
      forceUpdateBelow: '0.9.0',
    });
    expect(body.minAndroidVersion).toBe('1.0.0');
  });
});
