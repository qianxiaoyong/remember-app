import { Injectable, Optional, ServiceUnavailableException, Inject } from '@nestjs/common';
import COS from 'cos-nodejs-sdk-v5';
import {
  assertCosConfigEnabled,
  readCosConfig,
  type CosConfig,
  type ReadCosConfigResult,
} from '../config/read-cos-config.js';

type CosClient = Pick<COS, 'putObject' | 'getObjectUrl'>;

export const COS_CLIENT_FACTORY = Symbol('COS_CLIENT_FACTORY');
export type CosClientFactory = (config: CosConfig) => CosClient;

function createCosClient(config: CosConfig): CosClient {
  return new COS({
    SecretId: config.secretId,
    SecretKey: config.secretKey,
  });
}

function promisifyPutObject(
  client: CosClient,
  params: COS.PutObjectParams,
): Promise<COS.PutObjectResult> {
  return new Promise((resolve, reject) => {
    client.putObject(params, (error, data) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(data);
    });
  });
}

function promisifyGetObjectUrl(
  client: CosClient,
  params: COS.GetObjectUrlParams,
): Promise<COS.GetObjectUrlResult> {
  return new Promise((resolve, reject) => {
    client.getObjectUrl(params, (error, data) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(data);
    });
  });
}

@Injectable()
export class CosPackStorage {
  private readonly config: ReadCosConfigResult;
  private readonly client: CosClient | null;

  constructor(
    @Optional()
    @Inject(COS_CLIENT_FACTORY)
    clientFactory?: CosClientFactory,
  ) {
    this.config = readCosConfig();
    const createClient = clientFactory ?? createCosClient;
    this.client = this.config.enabled ? createClient(this.config) : null;
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  async putObject(key: string, body: Buffer): Promise<void> {
    const config = this.requireEnabledConfig();

    try {
      await promisifyPutObject(this.client!, {
        Bucket: config.bucket,
        Region: config.region,
        Key: key,
        Body: body,
        ContentType: 'application/zip',
      });
    } catch (error) {
      throw new ServiceUnavailableException({
        code: 'COS_PUT_FAILED',
        message: error instanceof Error ? error.message : 'COS 上传失败',
      });
    }
  }

  async getPresignedDownloadUrl(key: string): Promise<string> {
    const config = this.requireEnabledConfig();

    try {
      const result = await promisifyGetObjectUrl(this.client!, {
        Bucket: config.bucket,
        Region: config.region,
        Key: key,
        Sign: true,
        Expires: config.presignTtlSeconds,
      });

      if (!result.Url) {
        throw new Error('COS presign URL missing');
      }

      return result.Url;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      throw new ServiceUnavailableException({
        code: 'COS_PRESIGN_FAILED',
        message: error instanceof Error ? error.message : 'COS 预签名失败',
      });
    }
  }

  private requireEnabledConfig(): CosConfig {
    if (!this.config.enabled || !this.client) {
      throw new ServiceUnavailableException({
        code: 'COS_NOT_ENABLED',
        message: 'COS 尚未启用',
      });
    }

    assertCosConfigEnabled(this.config);
    return this.config;
  }
}
