import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { PackDownloadAuthorizationResponse } from '@remember/contracts';
import { packDownloadAuthorizationResponseSchema } from '@remember/contracts';
import { CatalogRepository } from '../catalog/catalog.repository.js';
import { PackAccessRepository } from '../pack-access/pack-access.repository.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createDownloadToken } from './download-token.js';
import { PackDownloadConfigService } from './pack-download-config.service.js';

const OFFLINE_LICENSE_DAYS = 30;

@Injectable()
export class PackDownloadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly packAccessRepository: PackAccessRepository,
    private readonly catalogRepository: CatalogRepository,
    private readonly packDownloadConfigService: PackDownloadConfigService,
  ) {}

  async createDownloadAuthorization(
    userId: string,
    packId: string,
  ): Promise<PackDownloadAuthorizationResponse> {
    const pack = await this.catalogRepository.findPublishedPackById(packId);
    if (!pack) {
      throw new NotFoundException({ code: 'PACK_NOT_FOUND', message: '未找到该知识库' });
    }

    const access = await this.packAccessRepository.findByUserAndPack(userId, packId);
    if (!access) {
      throw new ForbiddenException({ code: 'PACK_ACCESS_DENIED', message: '暂无下载权限' });
    }

    if (!pack.currentVersionId) {
      throw new NotFoundException({ code: 'PACK_VERSION_NOT_FOUND', message: '暂无可下载版本' });
    }

    const version = await this.prisma.packVersion.findUnique({
      where: { id: pack.currentVersionId },
    });
    if (!version || version.status !== 'published') {
      throw new NotFoundException({ code: 'PACK_VERSION_NOT_FOUND', message: '暂无可下载版本' });
    }

    if (!this.packDownloadConfigService.readMockEnabled()) {
      throw new ServiceUnavailableException({
        code: 'PACK_DOWNLOAD_NOT_CONFIGURED',
        message: '生产下载尚未配置，请开启 mock 模式或配置 COS',
      });
    }

    const mockFile = this.packDownloadConfigService.resolveMockPackFile();
    const token = createDownloadToken({ userId, packId });
    const baseUrl = this.packDownloadConfigService.readPublicBaseUrl();
    const downloadUrl = `${baseUrl}/api/v1/packs/${encodeURIComponent(packId)}/download?token=${encodeURIComponent(token)}`;

    const offlineLicenseExpiresAt = new Date(
      Date.now() + OFFLINE_LICENSE_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    const devContentPackId =
      mockFile.manifestPackId !== packId ? mockFile.manifestPackId : undefined;

    return packDownloadAuthorizationResponseSchema.parse({
      packId,
      packVersion: version.packVersion,
      sha256: mockFile.sha256,
      sizeBytes: mockFile.sizeBytes,
      downloadUrl,
      offlineLicenseExpiresAt,
      ...(devContentPackId ? { devContentPackId } : {}),
    });
  }

  resolveMockZipPath(): string {
    return this.packDownloadConfigService.resolveMockPackFile().absolutePath;
  }
}
