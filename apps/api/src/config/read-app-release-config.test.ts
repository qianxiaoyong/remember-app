import { describe, expect, it } from 'vitest';
import { readAppReleaseConfig } from './read-app-release-config.js';

describe('readAppReleaseConfig', () => {
  it('returns null when required env is missing', () => {
    expect(readAppReleaseConfig({})).toBeNull();
  });

  it('parses configured release metadata', () => {
    expect(
      readAppReleaseConfig({
        APP_RELEASE_MIN_ANDROID_VERSION: '1.0.0',
        APP_RELEASE_LATEST_APK_URL: 'https://remember.wehub.top/download/app.apk',
        APP_RELEASE_FORCE_UPDATE_BELOW: '0.9.0',
      }),
    ).toEqual({
      minAndroidVersion: '1.0.0',
      latestApkUrl: 'https://remember.wehub.top/download/app.apk',
      forceUpdateBelow: '0.9.0',
    });
  });
});
