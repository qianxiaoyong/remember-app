import { ServiceUnavailableException } from '@nestjs/common';
import type COS from 'cos-nodejs-sdk-v5';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CosPackStorage } from './cos-pack-storage.js';

type MockCosClient = Pick<COS, 'putObject' | 'getObjectUrl'>;

describe('CosPackStorage', () => {
  const originalEnv = { ...process.env };
  const putObjectMock = vi.fn();
  const getObjectUrlMock = vi.fn();

  beforeEach(() => {
    putObjectMock.mockReset();
    getObjectUrlMock.mockReset();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  function createStorage() {
    const client: MockCosClient = {
      putObject: putObjectMock as MockCosClient['putObject'],
      getObjectUrl: getObjectUrlMock as MockCosClient['getObjectUrl'],
    };
    return new CosPackStorage(() => client);
  }

  function enableCosEnv() {
    process.env.COS_ENABLED = 'true';
    process.env.COS_SECRET_ID = 'secret-id';
    process.env.COS_SECRET_KEY = 'secret-key';
    process.env.COS_REGION = 'ap-guangzhou';
    process.env.COS_BUCKET = 'remember-packs-1250000000';
    process.env.COS_PRESIGN_TTL_SECONDS = '600';
  }

  it('COS 未启用时 isEnabled 为 false', async () => {
    process.env.COS_ENABLED = 'false';
    const storage = createStorage();

    expect(storage.isEnabled()).toBe(false);
    await expect(
      storage.putObject('packs/demo/1.0.0/pack.zip', Buffer.from('zip')),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('putObject 调用 COS SDK 并传入 bucket/key/body', async () => {
    enableCosEnv();
    putObjectMock.mockImplementation((_params: unknown, callback: (...args: unknown[]) => void) => {
      callback(null, {});
    });

    const storage = createStorage();
    const body = Buffer.from('zip-bytes');
    await storage.putObject('packs/demo/1.0.0/pack.zip', body);

    expect(putObjectMock).toHaveBeenCalledWith(
      {
        Bucket: 'remember-packs-1250000000',
        Region: 'ap-guangzhou',
        Key: 'packs/demo/1.0.0/pack.zip',
        Body: body,
        ContentType: 'application/zip',
      },
      expect.any(Function),
    );
  });

  it('getPresignedDownloadUrl 返回签名 URL', async () => {
    enableCosEnv();
    getObjectUrlMock.mockImplementation(
      (_params: unknown, callback: (...args: unknown[]) => void) => {
        callback(null, { Url: 'https://signed.example/pack.zip?sign=1' });
      },
    );

    const storage = createStorage();
    const url = await storage.getPresignedDownloadUrl('packs/demo/1.0.0/pack.zip');

    expect(url).toBe('https://signed.example/pack.zip?sign=1');
    expect(getObjectUrlMock).toHaveBeenCalledWith(
      {
        Bucket: 'remember-packs-1250000000',
        Region: 'ap-guangzhou',
        Key: 'packs/demo/1.0.0/pack.zip',
        Sign: true,
        Expires: 600,
      },
      expect.any(Function),
    );
  });

  it('COS SDK 失败时抛 ServiceUnavailableException', async () => {
    enableCosEnv();
    putObjectMock.mockImplementation((_params: unknown, callback: (...args: unknown[]) => void) => {
      callback(new Error('network down'), null);
    });

    const storage = createStorage();

    await expect(
      storage.putObject('packs/demo/1.0.0/pack.zip', Buffer.from('zip')),
    ).rejects.toMatchObject({
      response: { code: 'COS_PUT_FAILED' },
    });
  });
});
