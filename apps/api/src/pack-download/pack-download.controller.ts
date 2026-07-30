import {
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpException,
  Param,
  Post,
  Query,
  Req,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { PackDownloadAuthorizationResponse } from '@remember/contracts';
import { createReadStream } from 'node:fs';
import { AuthGuard, requireAuthContext, type RequestWithAuth } from '../auth/auth.guard.js';
import { verifyDownloadToken } from './download-token.js';
import { PackDownloadService } from './pack-download.service.js';

@Controller('packs')
export class PackDownloadController {
  constructor(private readonly packDownloadService: PackDownloadService) {}

  @Post(':packId/download-authorization')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  createDownloadAuthorization(
    @Req() request: RequestWithAuth,
    @Param('packId') packId: string,
  ): Promise<PackDownloadAuthorizationResponse> {
    const auth = requireAuthContext(request);
    return this.packDownloadService.createDownloadAuthorization(auth.userId, packId);
  }

  @Get(':packId/download')
  downloadPack(
    @Param('packId') packId: string,
    @Query('token') token: string | undefined,
  ): StreamableFile {
    if (!token?.trim()) {
      throw new ForbiddenException({ code: 'PACK_DOWNLOAD_TOKEN_INVALID', message: '下载授权无效' });
    }

    let payload;
    try {
      payload = verifyDownloadToken(token.trim());
    } catch (error) {
      const code =
        error instanceof Error && error.message === 'PACK_DOWNLOAD_TOKEN_EXPIRED'
          ? 'PACK_DOWNLOAD_TOKEN_EXPIRED'
          : 'PACK_DOWNLOAD_TOKEN_INVALID';
      throw new ForbiddenException({
        code,
        message: code === 'PACK_DOWNLOAD_TOKEN_EXPIRED' ? '下载链接已过期' : '下载授权无效',
      });
    }

    if (payload.packId !== packId) {
      throw new ForbiddenException({ code: 'PACK_DOWNLOAD_TOKEN_INVALID', message: '下载授权无效' });
    }

    try {
      const zipPath = this.packDownloadService.resolveMockZipPath();
      return new StreamableFile(createReadStream(zipPath), {
        type: 'application/zip',
      });
    } catch (error) {
      throw new HttpException(
        {
          code: 'PACK_DOWNLOAD_FAILED',
          message: error instanceof Error ? error.message : '下载失败',
        },
        500,
      );
    }
  }
}
