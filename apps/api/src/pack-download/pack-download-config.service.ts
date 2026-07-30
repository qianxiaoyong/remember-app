import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

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

  resolveMockPackFile(): MockPackFileInfo {
    const configured = process.env.PACK_DOWNLOAD_MOCK_ZIP_PATH?.trim();
    const absolutePath = configured
      ? resolve(configured)
      : resolve(process.cwd(), '../../tools/pack-builder/fixtures/remember-test-pack.zip');

    const bytes = readFileSync(absolutePath);
    const sha256 = createHash('sha256').update(bytes).digest('hex');

    return {
      absolutePath,
      sha256,
      sizeBytes: bytes.byteLength,
      manifestPackId: 'remember-test-pack',
    };
  }
}
