import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  adminExtractSamplePreviewsResponseSchema,
  adminPackVersionSchema,
  adminPublishPackVersionResponseSchema,
  adminUploadPackVersionResponseSchema,
} from '@remember/contracts';
import {
  formatPackSizeLabel,
  readSamplePreviewsFromZip,
} from '@remember/pack-builder/catalog-metadata';
import type { VerifiedPackArchive } from '@remember/pack-builder/verify';
import { AuditService } from '../../audit/audit.service.js';
import { readAdminPackConfig } from '../../config/read-admin-pack-config.js';
import { PackVerifyService } from '../../pack-verify/pack-verify.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CosPackStorage } from '../../storage/cos-pack-storage.js';
import { toAdminPackVersion } from './admin-packs.mapper.js';
import { AdminPacksRepository } from './admin-packs.repository.js';

@Injectable()
export class AdminPackVersionsService {
  private readonly packConfig = readAdminPackConfig();

  constructor(
    private readonly repository: AdminPacksRepository,
    private readonly prisma: PrismaService,
    private readonly packVerifyService: PackVerifyService,
    private readonly auditService: AuditService,
    private readonly cosPackStorage: CosPackStorage,
  ) {}

  async updateVersionNote(packId: string, versionId: string, note: string | null) {
    const version = await this.repository.findVersionById(versionId);
    if (version?.packId !== packId) {
      throw new NotFoundException({ code: 'PACK_VERSION_NOT_FOUND', message: '版本不存在' });
    }

    const updated = await this.prisma.packVersion.update({
      where: { id: versionId },
      data: { note },
    });

    const pack = await this.repository.findPackById(packId);
    return adminPackVersionSchema.parse(
      toAdminPackVersion(updated, pack?.currentVersionId === updated.id),
    );
  }

  async uploadVersion(actorAdminUserId: string, packId: string, zipBytes: Uint8Array) {
    const pack = await this.repository.findPackById(packId);
    if (!pack) {
      throw new NotFoundException({ code: 'PACK_NOT_FOUND', message: '知识库不存在' });
    }

    const verified = await this.packVerifyService.verifyUploadedZip(zipBytes);
    if (verified.manifest.packId !== packId) {
      throw new ConflictException({
        code: 'PACK_ID_MISMATCH',
        message: '包内 packId 与目录不一致',
      });
    }

    const existingVersion = await this.prisma.packVersion.findUnique({
      where: {
        packId_packVersion: {
          packId,
          packVersion: verified.manifest.packVersion,
        },
      },
    });
    if (existingVersion) {
      throw new ConflictException({ code: 'PACK_VERSION_EXISTS', message: '版本已存在' });
    }

    const cosObjectKey = `packs/${packId}/${verified.manifest.packVersion}/pack.zip`;
    const targetPath = join(
      this.packConfig.storageDir,
      packId,
      verified.manifest.packVersion,
      'pack.zip',
    );
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, zipBytes);

    if (this.cosPackStorage.isEnabled()) {
      await this.cosPackStorage.putObject(cosObjectKey, Buffer.from(zipBytes));
    }

    const now = new Date();
    const version = await this.prisma.$transaction(async (tx) => {
      const created = await tx.packVersion.create({
        data: {
          packId,
          packVersion: verified.manifest.packVersion,
          cosObjectKey,
          sha256: verified.sha256,
          sizeBytes: BigInt(verified.sizeBytes),
          keyId: verified.manifest.keyId,
          manifestSignature: verified.manifest.signature,
          protocolVersion: verified.manifest.protocolVersion,
          status: 'draft',
          publishedAt: now,
        },
      });

      await this.auditService.writeAuditLog(
        {
          actorAdminUserId,
          action: 'pack_version.upload',
          targetType: 'pack_version',
          targetId: created.id,
          payloadSummary: {
            packId,
            packVersion: verified.manifest.packVersion,
            protocolVersion: verified.manifest.protocolVersion,
          },
          result: 'success',
        },
        tx,
      );

      return created;
    });

    await this.syncPackCatalogMetadata(packId, zipBytes, verified);

    return adminUploadPackVersionResponseSchema.parse({
      version: toAdminPackVersion(version, pack.currentVersionId === version.id),
      manifestSummary: {
        packId: verified.manifest.packId,
        packVersion: verified.manifest.packVersion,
        protocolVersion: verified.manifest.protocolVersion,
        keyId: verified.manifest.keyId,
        fileCount: verified.manifest.files.length,
        cardCount: verified.cardCount,
        lexiconEntryCount: verified.lexiconEntryCount,
      },
    });
  }

  async publishVersion(actorAdminUserId: string, packId: string, versionId: string) {
    const pack = await this.repository.findPackById(packId);
    if (!pack) {
      throw new NotFoundException({ code: 'PACK_NOT_FOUND', message: '知识库不存在' });
    }

    const version = await this.repository.findVersionById(versionId);
    if (version?.packId !== packId) {
      throw new NotFoundException({ code: 'PACK_VERSION_NOT_FOUND', message: '版本不存在' });
    }

    const zipPath = this.resolveStoredZipPath(packId, version.packVersion);
    const zipBytes = new Uint8Array(await readFile(zipPath));
    const verified = await this.packVerifyService.verifyUploadedZip(zipBytes);
    await this.syncPackCatalogMetadata(packId, zipBytes, verified);

    await this.prisma.$transaction(async (tx) => {
      await tx.packVersion.update({
        where: { id: versionId },
        data: { status: 'published' },
      });
      await tx.pack.update({
        where: { packId },
        data: { currentVersionId: versionId },
      });
      await this.auditService.writeAuditLog(
        {
          actorAdminUserId,
          action: 'pack_version.publish',
          targetType: 'pack_version',
          targetId: versionId,
          payloadSummary: { packId, packVersion: version.packVersion },
          result: 'success',
        },
        tx,
      );
    });

    return adminPublishPackVersionResponseSchema.parse({
      packId,
      currentVersionId: versionId,
      packVersion: version.packVersion,
    });
  }

  async extractSamplePreviewsFromCurrentVersion(packId: string) {
    const pack = await this.repository.findPackById(packId);
    if (!pack?.currentVersionId) {
      throw new NotFoundException({ code: 'PACK_VERSION_NOT_FOUND', message: '暂无发布版本' });
    }

    const current = pack.versions.find((version) => version.id === pack.currentVersionId);
    if (!current) {
      throw new NotFoundException({ code: 'PACK_VERSION_NOT_FOUND', message: '暂无发布版本' });
    }

    const zipPath = this.resolveStoredZipPath(packId, current.packVersion);
    const zipBytes = new Uint8Array(await readFile(zipPath));
    const samplePreviews = readSamplePreviewsFromZip(zipBytes);

    return adminExtractSamplePreviewsResponseSchema.parse({ samplePreviews });
  }

  private resolveStoredZipPath(packId: string, packVersion: string): string {
    return join(this.packConfig.storageDir, packId, packVersion, 'pack.zip');
  }

  private async syncPackCatalogMetadata(
    packId: string,
    zipBytes: Uint8Array,
    verified: VerifiedPackArchive,
  ): Promise<void> {
    const pack = await this.repository.findPackById(packId);
    if (!pack) {
      return;
    }

    const existingPreviews = Array.isArray(pack.samplePreviews) ? pack.samplePreviews : [];
    const samplePreviews =
      existingPreviews.length > 0 ? existingPreviews : readSamplePreviewsFromZip(zipBytes);

    await this.prisma.pack.update({
      where: { packId },
      data: {
        cardCount: verified.cardCount,
        sizeLabel: formatPackSizeLabel(verified.sizeBytes),
        ...(samplePreviews.length > 0
          ? { samplePreviews: samplePreviews as Prisma.InputJsonValue }
          : {}),
      },
    });
  }
}
