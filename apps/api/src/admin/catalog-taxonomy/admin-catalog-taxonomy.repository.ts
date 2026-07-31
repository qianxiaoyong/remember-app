import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AdminCatalogTaxonomyRepository {
  constructor(private readonly prisma: PrismaService) {}

  listAllTaxonomy() {
    return this.prisma.catalogPrimaryNode.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  listAllVersions() {
    return this.prisma.catalogVersionNode.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  findPrimaryById(id: string) {
    return this.prisma.catalogPrimaryNode.findUnique({ where: { id } });
  }

  findSecondaryById(id: string) {
    return this.prisma.catalogSecondaryNode.findUnique({ where: { id } });
  }

  findVersionById(id: string) {
    return this.prisma.catalogVersionNode.findUnique({ where: { id } });
  }

  countPacksByPrimaryNodeId(primaryNodeId: string) {
    return this.prisma.pack.count({ where: { primaryNodeId } });
  }

  countPacksBySecondaryNodeId(secondaryNodeId: string) {
    return this.prisma.pack.count({ where: { secondaryNodeId } });
  }

  countPacksByVersionNodeId(versionNodeId: string) {
    return this.prisma.pack.count({ where: { versionNodeId } });
  }

  countSecondariesByPrimaryId(primaryId: string) {
    return this.prisma.catalogSecondaryNode.count({ where: { primaryId } });
  }

  nextPrimarySortOrder() {
    return this.prisma.catalogPrimaryNode
      .aggregate({ _max: { sortOrder: true } })
      .then((result) => (result._max.sortOrder ?? 0) + 1);
  }

  nextSecondarySortOrder(primaryId: string) {
    return this.prisma.catalogSecondaryNode
      .aggregate({ where: { primaryId }, _max: { sortOrder: true } })
      .then((result) => (result._max.sortOrder ?? 0) + 1);
  }

  nextVersionSortOrder() {
    return this.prisma.catalogVersionNode
      .aggregate({ _max: { sortOrder: true } })
      .then((result) => (result._max.sortOrder ?? 0) + 1);
  }
}
