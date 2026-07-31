import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { verifyPackZipBuffer } from '@remember/pack-builder/verify';
import { readAdminPackConfig } from '../config/read-admin-pack-config.js';

export interface MockPackFileInfo {
  absolutePath: string;
  sha256: string;
  sizeBytes: number;
  manifestPackId: string;
}

@Injectable()
export class PackDownloadConfigService {
  readMockEnabled(): boolean {
    const raw = process.env.PACK_DOWNLOAD_MOCK_ENABLED?.trim().toLowerCase();
    if (raw === 'false' || raw === '0') {
      return false;
    }
    if (raw === 'true' || raw === '1') {
      return true;
    }
    const nodeEnv = process.env.NODE_ENV?.trim().toLowerCase();
    return nodeEnv === 'test' || nodeEnv === 'development';
  }

  readPublicBaseUrl(): string {
    const fromEnv = process.env.API_PUBLIC_BASE_URL?.trim().replace(/\/$/, '');
    if (fromEnv) {
      return fromEnv;
    }
    const port = process.env.PORT?.trim() ?? '3000';
    return `http://127.0.0.1:${port}`;
  }

  async resolvePackDownloadFile(packId: string, packVersion: string): Promise<MockPackFileInfo> {
    const adminPath = join(readAdminPackConfig().storageDir, packId, packVersion, 'pack.zip');
    if (existsSync(adminPath)) {
      return this.buildPackFileInfo(adminPath);
    }

    const configured = process.env.PACK_DOWNLOAD_MOCK_ZIP_PATH?.trim();
    const absolutePath = configured
      ? resolve(configured)
      : resolve(process.cwd(), '../../tools/pack-builder/fixtures/remember-test-pack.zip');
    return this.buildPackFileInfo(absolutePath);
  }

  /** @deprecated 测试夹具回退；请用 resolvePackDownloadFile */
  resolveMockPackFile(): MockPackFileInfo {
    const configured = process.env.PACK_DOWNLOAD_MOCK_ZIP_PATH?.trim();
    const absolutePath = configured
      ? resolve(configured)
      : resolve(process.cwd(), '../../tools/pack-builder/fixtures/remember-test-pack.zip');
    return {
      absolutePath,
      sha256: createHash('sha256').update(readFileSync(absolutePath)).digest('hex'),
      sizeBytes: readFileSync(absolutePath).byteLength,
      manifestPackId: 'remember-test-pack',
    };
  }

  private async buildPackFileInfo(absolutePath: string): Promise<MockPackFileInfo> {
    const bytes = readFileSync(absolutePath);
    const verified = await verifyPackZipBuffer(new Uint8Array(bytes));
    return {
      absolutePath,
      sha256: verified.sha256,
      sizeBytes: verified.sizeBytes,
      manifestPackId: verified.manifest.packId,
    };
  }
}
