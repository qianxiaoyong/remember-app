import {
  BadRequestException,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  MAX_ADMIN_MEDIA_UPLOAD_BYTES,
  adminMediaUploadCoverResponseSchema,
  adminMediaUploadResponseSchema,
} from '@remember/contracts';
import { AdminAuthGuard } from '../../admin-auth/admin-auth.guard.js';
import { AdminMediaService } from './admin-media.service.js';

@Controller('admin/media')
@UseGuards(AdminAuthGuard)
export class AdminMediaController {
  constructor(private readonly service: AdminMediaService) {}

  @Post('upload')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_ADMIN_MEDIA_UPLOAD_BYTES },
    }),
  )
  async upload(
    @UploadedFile() file: { buffer: Buffer; mimetype: string; size: number } | undefined,
  ) {
    if (!file || file.buffer.byteLength === 0) {
      throw new BadRequestException({ code: 'MEDIA_FILE_MISSING', message: '请上传图片文件' });
    }
    const result = await this.service.uploadImage(file);
    return adminMediaUploadResponseSchema.parse(result);
  }

  @Post('upload-cover')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_ADMIN_MEDIA_UPLOAD_BYTES },
    }),
  )
  async uploadCover(
    @UploadedFile() file: { buffer: Buffer; mimetype: string; size: number } | undefined,
  ) {
    if (!file || file.buffer.byteLength === 0) {
      throw new BadRequestException({ code: 'MEDIA_FILE_MISSING', message: '请上传图片文件' });
    }
    const result = await this.service.uploadCoverImage(file);
    return adminMediaUploadCoverResponseSchema.parse(result);
  }
}
