import { afterEach, describe, expect, it } from 'vitest';
import { readCosConfig } from './read-cos-config.js';

describe('readCosConfig', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('COS_ENABLED=false 时不读取密钥', () => {
    delete process.env.COS_SECRET_ID;
    process.env.COS_ENABLED = 'false';

    expect(readCosConfig()).toEqual({ enabled: false });
  });

  it('COS_ENABLED=true 时要求全部 COS 变量', () => {
    process.env.COS_ENABLED = 'true';
    process.env.COS_SECRET_ID = 'secret-id';
    process.env.COS_SECRET_KEY = 'secret-key';
    process.env.COS_REGION = 'ap-guangzhou';
    process.env.COS_BUCKET = 'remember-packs-1250000000';

    expect(readCosConfig()).toEqual({
      enabled: true,
      secretId: 'secret-id',
      secretKey: 'secret-key',
      region: 'ap-guangzhou',
      bucket: 'remember-packs-1250000000',
      presignTtlSeconds: 900,
    });
  });

  it('COS_PRESIGN_TTL_SECONDS 非法时抛错', () => {
    process.env.COS_ENABLED = 'true';
    process.env.COS_SECRET_ID = 'secret-id';
    process.env.COS_SECRET_KEY = 'secret-key';
    process.env.COS_REGION = 'ap-guangzhou';
    process.env.COS_BUCKET = 'remember-packs-1250000000';
    process.env.COS_PRESIGN_TTL_SECONDS = '0';

    expect(() => readCosConfig()).toThrow(/COS_PRESIGN_TTL_SECONDS/);
  });
});
