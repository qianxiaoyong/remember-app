import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { CATALOG_ALL_VERSION_LABEL } from '@remember/contracts';
import { PrismaService } from '../prisma/prisma.service.js';

export interface ListPublishedPacksQuery {
  primaryCategory?: string;
  secondaryCategory?: string;
  versionLabel?: string;
  keyword?: string;
}

const packTaxonomyInclude = {
  primaryNode: true,
  secondaryNode: true,
  versionNode: true,
} as const;

export type PackWithTaxonomy = Prisma.PackGetPayload<{ include: typeof packTaxonomyInclude }>;

export interface CatalogCurrentVersion {
  packVersion: string;
  protocolVersion: number;
}

export type PackWithCatalogVersion = PackWithTaxonomy & {
  currentVersion: CatalogCurrentVersion | null;
};

@Injectable()
export class CatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listPublishedPacks(query: ListPublishedPacksQuery): Promise<PackWithCatalogVersion[]> {
    const where: Prisma.PackWhereInput = {
      status: 'published',
    };

    if (query.primaryCategory) {
      where.primaryCategory = query.primaryCategory;
    }
    if (query.secondaryCategory && query.secondaryCategory !== '全部') {
      where.secondaryCategory = query.secondaryCategory;
    }
    if (query.versionLabel && query.versionLabel !== CATALOG_ALL_VERSION_LABEL) {
      where.OR = [
        { versionLabel: query.versionLabel },
        { versionLabel: CATALOG_ALL_VERSION_LABEL },
      ];
    }
    if (query.keyword?.trim()) {
      const keyword = query.keyword.trim();
      where.title = { contains: keyword, mode: 'insensitive' };
    }

    const packs = await this.prisma.pack.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: packTaxonomyInclude,
    });

    return this.attachCurrentVersions(packs);
  }

  findPublishedPackById(packId: string): Promise<PackWithCatalogVersion | null> {
    return this.prisma.pack
      .findFirst({
        where: { packId, status: 'published' },
        include: packTaxonomyInclude,
      })
      .then(async (pack) => {
        if (!pack) {
          return null;
        }
        const [withVersion] = await this.attachCurrentVersions([pack]);
        return withVersion ?? null;
      });
  }

  private async attachCurrentVersions(
    packs: PackWithTaxonomy[],
  ): Promise<PackWithCatalogVersion[]> {
    const versionIds = packs
      .map((pack) => pack.currentVersionId)
      .filter((id): id is string => Boolean(id));

    if (versionIds.length === 0) {
      return packs.map((pack) => ({ ...pack, currentVersion: null }));
    }

    const versions = await this.prisma.packVersion.findMany({
      where: { id: { in: versionIds }, status: 'published' },
      select: { id: true, packVersion: true, protocolVersion: true },
    });
    const versionById = new Map(versions.map((version) => [version.id, version]));

    return packs.map((pack) => {
      const current = pack.currentVersionId
        ? (versionById.get(pack.currentVersionId) ?? null)
        : null;
      return {
        ...pack,
        currentVersion: current
          ? { packVersion: current.packVersion, protocolVersion: current.protocolVersion }
          : null,
      };
    });
  }
}
