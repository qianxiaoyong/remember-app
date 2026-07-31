import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { AdminCreatePackRequest, AdminUpdatePackRequest } from '@remember/contracts';
import {
  adminPackDetailResponseSchema,
  adminPackListResponseSchema,
  adminPackSummarySchema,
  adminPublishPackVersionResponseSchema,
  adminUploadPackVersionResponseSchema,
} from '@remember/contracts';
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
      versions: pack.versions.map((version) => ({
        id: version.id,
        packId: version.packId,
        packVersion: version.packVersion,
        sha256: version.sha256,
        sizeBytes: Number(version.sizeBytes),
        keyId: version.keyId,
        protocolVersion: version.protocolVersion,
        status: version.status,
        publishedAt: version.publishedAt.toISOString(),
        isCurrent: pack.currentVersionId === version.id,
      })),
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

  async createPack(input: AdminCreatePackRequest) {
    const existing = await this.repository.findPackById(input.packId);
    if (existing) {
      throw new ConflictException({ code: 'PACK_ALREADY_EXISTS', message: '知识库已存在' });
    }

    await this.prisma.pack.create({
      data: {
        packId: input.packId,
        title: input.title,
        ...(input.displayTitle !== undefined ? { displayTitle: input.displayTitle } : {}),
        primaryCategory: input.primaryCategory,
        secondaryCategory: input.secondaryCategory,
        versionLabel: input.versionLabel,
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

    await this.prisma.pack.update({
      where: { packId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.displayTitle !== undefined ? { displayTitle: input.displayTitle } : {}),
        ...(input.primaryCategory !== undefined ? { primaryCategory: input.primaryCategory } : {}),
        ...(input.secondaryCategory !== undefined
          ? { secondaryCategory: input.secondaryCategory }
          : {}),
        ...(input.versionLabel !== undefined ? { versionLabel: input.versionLabel } : {}),
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

    return adminUploadPackVersionResponseSchema.parse({
      version: {
        id: version.id,
        packId: version.packId,
        packVersion: version.packVersion,
        sha256: version.sha256,
        sizeBytes: Number(version.sizeBytes),
        keyId: version.keyId,
        protocolVersion: version.protocolVersion,
        status: version.status,
        publishedAt: version.publishedAt.toISOString(),
        isCurrent: pack.currentVersionId === version.id,
      },
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
}
