import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { AdminCreatePackRequest, AdminUpdatePackRequest } from '@remember/contracts';
import {
  adminPackDetailResponseSchema,
  adminPackListResponseSchema,
  adminPackSummarySchema,
  adminPackVersionSchema,
  adminPublishPackVersionResponseSchema,
  adminUploadPackVersionResponseSchema,
} from '@remember/contracts';
import {
  formatPackSizeLabel,
  readSamplePreviewsFromZip,
} from '@remember/pack-builder/catalog-metadata';
import type { VerifiedPackArchive } from '@remember/pack-builder/verify';
import { resolvePackTaxonomy, resolvePackTaxonomyUpdate } from '../../catalog/resolve-pack-taxonomy.js';
import { AuditService } from '../../audit/audit.service.js';
import { readAdminPackConfig } from '../../config/read-admin-pack-config.js';
import { PackVerifyService } from '../../pack-verify/pack-verify.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AdminPacksRepository {
  constructor(private readonly prisma: PrismaService) {}

  listPacks() {
    return this.prisma.pack.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  findPackById(packId: string) {
    return this.prisma.pack.findUnique({
      where: { packId },
      include: { versions: { orderBy: { publishedAt: 'desc' } } },
    });
  }

  findVersionById(versionId: string) {
    return this.prisma.packVersion.findUnique({ where: { id: versionId } });
  }
}

@Injectable()
export class AdminPacksService {
  private readonly packConfig = readAdminPackConfig();

  constructor(
    private readonly repository: AdminPacksRepository,
    private readonly prisma: PrismaService,
    private readonly packVerifyService: PackVerifyService,
    private readonly auditService: AuditService,
  ) {}

  async listPacks() {
    const packs = await this.repository.listPacks();
    const versionIds = packs
      .map((pack) => pack.currentVersionId)
      .filter((value): value is string => Boolean(value));
    const versions =
      versionIds.length > 0
        ? await this.prisma.packVersion.findMany({ where: { id: { in: versionIds } } })
        : [];
    const versionById = new Map(versions.map((version) => [version.id, version]));

    return adminPackListResponseSchema.parse({
      items: packs.map((pack) =>
        this.toPackSummary(pack, versionById.get(pack.currentVersionId ?? '')),
      ),
    });
  }

  async getPack(packId: string) {
    const pack = await this.repository.findPackById(packId);
    if (!pack) {
      throw new NotFoundException({ code: 'PACK_NOT_FOUND', message: '知识库不存在' });
    }

    const current = pack.currentVersionId
      ? pack.versions.find((version) => version.id === pack.currentVersionId)
      : undefined;

    return adminPackDetailResponseSchema.parse({
      pack: this.toPackSummary(pack, current),
      versions: pack.versions.map((version) => this.toAdminPackVersion(version, pack.currentVersionId === version.id)),
    });
  }

  private toPackSummary(
    pack: Awaited<ReturnType<AdminPacksRepository['listPacks']>>[number],
    current?: { packVersion: string; protocolVersion: number },
  ) {
    return adminPackSummarySchema.parse({
      packId: pack.packId,
      title: pack.title,
      ...(pack.displayTitle ? { displayTitle: pack.displayTitle } : {}),
      primaryCategory: pack.primaryCategory,
      secondaryCategory: pack.secondaryCategory,
      versionLabel: pack.versionLabel,
      ...(pack.primaryNodeId ? { primaryNodeId: pack.primaryNodeId } : {}),
      ...(pack.secondaryNodeId ? { secondaryNodeId: pack.secondaryNodeId } : {}),
      ...(pack.versionNodeId ? { versionNodeId: pack.versionNodeId } : {}),
      contentTags: Array.isArray(pack.contentTags)
        ? pack.contentTags.filter((item): item is string => typeof item === 'string')
        : [],
      cardCount: pack.cardCount,
      sizeLabel: pack.sizeLabel,
      summary: pack.summary,
      priceCents: pack.priceCents,
      status: pack.status,
      ...(pack.currentVersionId ? { currentVersionId: pack.currentVersionId } : {}),
      ...(current ? { currentPackVersion: current.packVersion } : {}),
      ...(current ? { protocolVersion: current.protocolVersion } : {}),
      updatedAt: pack.updatedAt.toISOString(),
    });
  }

  private toAdminPackVersion(
    version: {
      id: string;
      packId: string;
      packVersion: string;
      sha256: string;
      sizeBytes: bigint;
      keyId: string;
      protocolVersion: number;
      status: string;
      publishedAt: Date;
      note: string | null;
    },
    isCurrent: boolean,
  ) {
    return {
      id: version.id,
      packId: version.packId,
      packVersion: version.packVersion,
      sha256: version.sha256,
      sizeBytes: Number(version.sizeBytes),
      keyId: version.keyId,
      protocolVersion: version.protocolVersion,
      status: version.status,
      publishedAt: version.publishedAt.toISOString(),
      isCurrent,
      ...(version.note ? { note: version.note } : {}),
    };
  }

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
      this.toAdminPackVersion(updated, pack?.currentVersionId === updated.id),
    );
  }

  async createPack(input: AdminCreatePackRequest) {
    const existing = await this.repository.findPackById(input.packId);
    if (existing) {
      throw new ConflictException({ code: 'PACK_ALREADY_EXISTS', message: '知识库已存在' });
    }

    const taxonomy = await resolvePackTaxonomy(this.prisma, input);

    await this.prisma.pack.create({
      data: {
        packId: input.packId,
        title: input.title,
        ...(input.displayTitle !== undefined ? { displayTitle: input.displayTitle } : {}),
        primaryCategory: taxonomy.primaryCategory,
        secondaryCategory: taxonomy.secondaryCategory,
        versionLabel: taxonomy.versionLabel,
        primaryNodeId: taxonomy.primaryNodeId,
        secondaryNodeId: taxonomy.secondaryNodeId,
        versionNodeId: taxonomy.versionNodeId,
        contentTags: input.contentTags,
        cardCount: input.cardCount,
        sizeLabel: input.sizeLabel,
        summary: input.summary,
        priceCents: input.priceCents,
        samplePreviews: input.samplePreviews,
        ...(input.introMedia !== undefined ? { introMedia: input.introMedia } : {}),
        status: input.status,
      },
    });

    return this.listPacks();
  }

  async updatePack(packId: string, input: AdminUpdatePackRequest) {
    const pack = await this.repository.findPackById(packId);
    if (!pack) {
      throw new NotFoundException({ code: 'PACK_NOT_FOUND', message: '知识库不存在' });
    }

    const taxonomy = await resolvePackTaxonomyUpdate(this.prisma, pack, input);

    await this.prisma.pack.update({
      where: { packId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.displayTitle !== undefined ? { displayTitle: input.displayTitle } : {}),
        ...(taxonomy
          ? {
              primaryCategory: taxonomy.primaryCategory,
              secondaryCategory: taxonomy.secondaryCategory,
              versionLabel: taxonomy.versionLabel,
              primaryNodeId: taxonomy.primaryNodeId,
              secondaryNodeId: taxonomy.secondaryNodeId,
              versionNodeId: taxonomy.versionNodeId,
            }
          : {
              ...(input.primaryCategory !== undefined
                ? { primaryCategory: input.primaryCategory }
                : {}),
              ...(input.secondaryCategory !== undefined
                ? { secondaryCategory: input.secondaryCategory }
                : {}),
              ...(input.versionLabel !== undefined ? { versionLabel: input.versionLabel } : {}),
            }),
        ...(input.contentTags !== undefined ? { contentTags: input.contentTags } : {}),
        ...(input.cardCount !== undefined ? { cardCount: input.cardCount } : {}),
        ...(input.sizeLabel !== undefined ? { sizeLabel: input.sizeLabel } : {}),
        ...(input.summary !== undefined ? { summary: input.summary } : {}),
        ...(input.priceCents !== undefined ? { priceCents: input.priceCents } : {}),
        ...(input.samplePreviews !== undefined ? { samplePreviews: input.samplePreviews } : {}),
        ...(input.introMedia !== undefined ? { introMedia: input.introMedia } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });

    return this.listPacks();
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
      version: this.toAdminPackVersion(version, pack.currentVersionId === version.id),
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
          ? { samplePreviews: JSON.parse(JSON.stringify(samplePreviews)) }
          : {}),
      },
    });
  }
}
