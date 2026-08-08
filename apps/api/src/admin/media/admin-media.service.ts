import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ADMIN_MEDIA_ALLOWED_MIME_TYPES } from '@remember/contracts';
import {
  readAdminMediaConfig,
  readApiPublicBaseUrl,
} from '../../config/read-admin-media-config.js';

const MIME_TO_EXT: Record<(typeof ADMIN_MEDIA_ALLOWED_MIME_TYPES)[number], string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

@Injectable()
export class AdminMediaService {
  private readonly config = readAdminMediaConfig();

  async uploadImage(file: {
    buffer: Buffer;
    mimetype: string;
    size: number;
  }): Promise<{ url: string }> {
    if (file.buffer.byteLength === 0) {
      throw new BadRequestException({ code: 'MEDIA_FILE_EMPTY', message: '文件为空' });
    }
    if (file.size > this.config.uploadMaxBytes) {
      throw new BadRequestException({ code: 'MEDIA_FILE_TOO_LARGE', message: '文件过大' });
    }
    if (
      !ADMIN_MEDIA_ALLOWED_MIME_TYPES.includes(
        file.mimetype as (typeof ADMIN_MEDIA_ALLOWED_MIME_TYPES)[number],
      )
    ) {
      throw new BadRequestException({
        code: 'MEDIA_FILE_TYPE_INVALID',
        message: '不支持的图片格式',
      });
    }
    const ext = MIME_TO_EXT[file.mimetype as (typeof ADMIN_MEDIA_ALLOWED_MIME_TYPES)[number]];
    const filename = `${randomUUID()}${ext}`;
    await mkdir(this.config.storageDir, { recursive: true });
    const filePath = join(this.config.storageDir, filename);
    await writeFile(filePath, file.buffer);
    const baseUrl = readApiPublicBaseUrl();
    return { url: `${baseUrl}/api/v1/media/${filename}` };
  }
}
