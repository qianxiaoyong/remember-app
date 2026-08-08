import { createReadStream, existsSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { readAdminMediaConfig } from '../config/read-admin-media-config.js';

const EXT_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

const SAFE_FILENAME_PATTERN = /^[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$/i;

@Controller('media')
export class MediaController {
  @Get(':filename')
  serve(@Param('filename') filename: string, @Res() response: Response): void {
    const safeName = basename(filename);
    if (safeName !== filename || !SAFE_FILENAME_PATTERN.test(safeName)) {
      throw new NotFoundException();
    }
    const config = readAdminMediaConfig();
    const filePath = resolve(config.storageDir, safeName);
    if (!filePath.startsWith(resolve(config.storageDir)) || !existsSync(filePath)) {
      throw new NotFoundException();
    }
    const ext = extname(safeName).toLowerCase();
    const contentType = EXT_TO_MIME[ext] ?? 'application/octet-stream';
    response.setHeader('Content-Type', contentType);
    response.setHeader('Cache-Control', 'public, max-age=86400');
    createReadStream(filePath).pipe(response);
  }
}
