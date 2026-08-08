import { join } from 'node:path';
import { MAX_ADMIN_MEDIA_UPLOAD_BYTES } from '@remember/contracts';

export interface AdminMediaConfig {
  storageDir: string;
  uploadMaxBytes: number;
}

export function readAdminMediaConfig(): AdminMediaConfig {
  const storageDirRaw = process.env.ADMIN_MEDIA_STORAGE_DIR?.trim();
  const storageDir = storageDirRaw ?? join(process.cwd(), 'data', 'media');

  const maxBytesRaw = process.env.ADMIN_MEDIA_UPLOAD_MAX_BYTES?.trim();
  const uploadMaxBytes = maxBytesRaw ? Number(maxBytesRaw) : MAX_ADMIN_MEDIA_UPLOAD_BYTES;
  if (!Number.isFinite(uploadMaxBytes) || uploadMaxBytes <= 0) {
    throw new Error('ADMIN_MEDIA_UPLOAD_MAX_BYTES must be a positive number');
  }

  return { storageDir, uploadMaxBytes };
}

export function readApiPublicBaseUrl(): string {
  const fromEnv = process.env.API_PUBLIC_BASE_URL?.trim().replace(/\/$/, '');
  if (fromEnv) {
    return fromEnv;
  }
  const port = process.env.PORT?.trim() ?? '3000';
  return `http://127.0.0.1:${port}`;
}
