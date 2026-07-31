import { join } from 'node:path';
import { MAX_PACK_ZIP_BYTES } from '@remember/contracts';

export interface AdminPackConfig {
  storageDir: string;
  uploadMaxBytes: number;
}

export function readAdminPackConfig(): AdminPackConfig {
  const storageDirRaw = process.env.ADMIN_PACK_STORAGE_DIR?.trim();
  const storageDir = storageDirRaw ? storageDirRaw : join(process.cwd(), 'data', 'pack-storage');

  const maxBytesRaw = process.env.ADMIN_PACK_UPLOAD_MAX_BYTES?.trim();
  const uploadMaxBytes = maxBytesRaw ? Number(maxBytesRaw) : MAX_PACK_ZIP_BYTES;
  if (!Number.isFinite(uploadMaxBytes) || uploadMaxBytes <= 0) {
    throw new Error('ADMIN_PACK_UPLOAD_MAX_BYTES must be a positive number');
  }

  return { storageDir, uploadMaxBytes };
}
