import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CatalogTaxonomyRepository {
  constructor(private readonly prisma: PrismaService) {}

  listActiveTaxonomy() {
    return this.prisma.catalogPrimaryNode.findMany({
      where: { status: 'active' },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          where: { status: 'active' },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  listActiveVersions() {
    return this.prisma.catalogVersionNode.findMany({
      where: { status: 'active' },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
