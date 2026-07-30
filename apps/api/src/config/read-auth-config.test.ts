import { afterEach, describe, expect, it } from 'vitest';
import { readAuthConfig } from './read-auth-config.js';

describe('readAuthConfig', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('dev 环境允许 mock 短信', () => {
    process.env.AUTH_PHONE_PEPPER = 'test-pepper';
    process.env.SMS_MOCK_ENABLED = 'true';
    process.env.NODE_ENV = 'development';

    expect(readAuthConfig().smsMockEnabled).toBe(true);
  });

  it('production 禁止 mock 短信', () => {
    process.env.AUTH_PHONE_PEPPER = 'test-pepper';
    process.env.SMS_MOCK_ENABLED = 'true';
    process.env.NODE_ENV = 'production';

    expect(() => readAuthConfig()).toThrow(/production/i);
  });
});
