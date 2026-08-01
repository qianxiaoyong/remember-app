import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { AdminCreatePackRequest, AdminUpdatePackRequest } from '@remember/contracts';
import { adminPackDetailResponseSchema, adminPackListResponseSchema } from '@remember/contracts';
import {
  resolvePackTaxonomy,
  resolvePackTaxonomyUpdate,
} from '../../catalog/resolve-pack-taxonomy.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { toAdminPackSummary, toAdminPackVersion } from './admin-packs.mapper.js';
import { AdminPacksRepository } from './admin-packs.repository.js';

@Injectable()
export class AdminPacksService {
  constructor(
    private readonly repository: AdminPacksRepository,
    private readonly prisma: PrismaService,
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
        toAdminPackSummary(pack, versionById.get(pack.currentVersionId ?? '')),
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
      pack: toAdminPackSummary(pack, current),
      versions: pack.versions.map((version) =>
        toAdminPackVersion(version, pack.currentVersionId === version.id),
      ),
    });
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
        ...(input.coverUrl !== undefined ? { coverUrl: input.coverUrl } : {}),
        ...(input.coverBadge !== undefined ? { coverBadge: input.coverBadge } : {}),
        ...(input.coverLines !== undefined ? { coverLines: input.coverLines } : {}),
        includedHighlights: input.includedHighlights,
        samplePreviews: input.samplePreviews,
        ...(input.introMedia !== undefined ? { introMedia: input.introMedia } : {}),
        status: input.status ?? 'draft',
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
              ...(input.primaryNodeId !== undefined ? { primaryNodeId: input.primaryNodeId } : {}),
              ...(input.secondaryNodeId !== undefined
                ? { secondaryNodeId: input.secondaryNodeId }
                : {}),
              ...(input.versionNodeId !== undefined ? { versionNodeId: input.versionNodeId } : {}),
            }),
        ...(input.contentTags !== undefined ? { contentTags: input.contentTags } : {}),
        ...(input.cardCount !== undefined ? { cardCount: input.cardCount } : {}),
        ...(input.sizeLabel !== undefined ? { sizeLabel: input.sizeLabel } : {}),
        ...(input.summary !== undefined ? { summary: input.summary } : {}),
        ...(input.priceCents !== undefined ? { priceCents: input.priceCents } : {}),
        ...(input.coverUrl !== undefined ? { coverUrl: input.coverUrl } : {}),
        ...(input.coverBadge !== undefined ? { coverBadge: input.coverBadge } : {}),
        ...(input.coverLines !== undefined ? { coverLines: input.coverLines } : {}),
        ...(input.includedHighlights !== undefined
          ? { includedHighlights: input.includedHighlights }
          : {}),
        ...(input.samplePreviews !== undefined ? { samplePreviews: input.samplePreviews } : {}),
        ...(input.introMedia !== undefined ? { introMedia: input.introMedia } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });

    return this.listPacks();
  }
}
