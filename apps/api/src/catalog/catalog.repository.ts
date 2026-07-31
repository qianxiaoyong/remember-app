import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
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

@Injectable()
export class CatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  listPublishedPacks(query: ListPublishedPacksQuery): Promise<PackWithTaxonomy[]> {
    const where: Prisma.PackWhereInput = {
      status: 'published',
    };

    if (query.primaryCategory) {
      where.primaryCategory = query.primaryCategory;
    }
    if (query.secondaryCategory && query.secondaryCategory !== '全部') {
      where.secondaryCategory = query.secondaryCategory;
    }
    if (query.versionLabel && query.versionLabel !== '全部版本') {
      where.versionLabel = query.versionLabel;
    }
    if (query.keyword?.trim()) {
      const keyword = query.keyword.trim();
      where.title = { contains: keyword, mode: 'insensitive' };
    }

    return this.prisma.pack.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: packTaxonomyInclude,
    });
  }

  findPublishedPackById(packId: string): Promise<PackWithTaxonomy | null> {
    return this.prisma.pack.findFirst({
      where: { packId, status: 'published' },
      include: packTaxonomyInclude,
    });
  }
}
