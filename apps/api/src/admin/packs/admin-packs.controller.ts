import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MAX_PACK_ZIP_BYTES } from '@remember/contracts';
import {
  adminCreatePackRequestSchema,
  adminUpdatePackRequestSchema,
  adminUpdatePackVersionNoteRequestSchema,
} from '@remember/contracts';
import {
  AdminAuthGuard,
  requireAdminAuthContext,
  type RequestWithAdminAuth,
} from '../../admin-auth/admin-auth.guard.js';
import { AdminPacksService } from './admin-packs.service.js';
import { AdminPackVersionsService } from './admin-pack-versions.service.js';

@Controller('admin/packs')
@UseGuards(AdminAuthGuard)
export class AdminPacksController {
  constructor(
    private readonly service: AdminPacksService,
    private readonly versionsService: AdminPackVersionsService,
  ) {}

  @Get()
  listPacks() {
    return this.service.listPacks();
  }

  @Get(':packId')
  getPack(@Param('packId') packId: string) {
    return this.service.getPack(packId);
  }

  @Post()
  createPack(@Body() body: unknown) {
    return this.service.createPack(adminCreatePackRequestSchema.parse(body));
  }

  @Patch(':packId')
  updatePack(@Param('packId') packId: string, @Body() body: unknown) {
    return this.service.updatePack(packId, adminUpdatePackRequestSchema.parse(body));
  }

  @Delete(':packId')
  @HttpCode(204)
  async deletePack(@Req() request: RequestWithAdminAuth, @Param('packId') packId: string) {
    const admin = requireAdminAuthContext(request);
    await this.service.deletePack(admin.adminUserId, packId);
  }

  @Post(':packId/versions')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_PACK_ZIP_BYTES },
    }),
  )
  uploadVersion(
    @Req() request: RequestWithAdminAuth,
    @Param('packId') packId: string,
    @UploadedFile() file: { buffer: Buffer } | undefined,
  ) {
    const admin = requireAdminAuthContext(request);
    if (!file || file.buffer.byteLength === 0) {
      throw new BadRequestException({ code: 'PACK_FILE_MISSING', message: '请上传 zip 文件' });
    }
    return this.versionsService.uploadVersion(
      admin.adminUserId,
      packId,
      new Uint8Array(file.buffer),
    );
  }

  @Post(':packId/versions/:versionId/publish')
  publishVersion(
    @Req() request: RequestWithAdminAuth,
    @Param('packId') packId: string,
    @Param('versionId') versionId: string,
  ) {
    const admin = requireAdminAuthContext(request);
    return this.versionsService.publishVersion(admin.adminUserId, packId, versionId);
  }

  @Patch(':packId/versions/:versionId')
  updateVersionNote(
    @Param('packId') packId: string,
    @Param('versionId') versionId: string,
    @Body() body: unknown,
  ) {
    const input = adminUpdatePackVersionNoteRequestSchema.parse(body);
    return this.versionsService.updateVersionNote(packId, versionId, input.note);
  }

  @Post(':packId/extract-sample-previews')
  @HttpCode(200)
  extractSamplePreviews(@Param('packId') packId: string) {
    return this.versionsService.extractSamplePreviewsFromCurrentVersion(packId);
  }
}
