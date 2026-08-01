import { Injectable } from '@nestjs/common';
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

export type AdminPackRecord = NonNullable<
  Awaited<ReturnType<AdminPacksRepository['findPackById']>>
>;

export type AdminPackListRecord = Awaited<ReturnType<AdminPacksRepository['listPacks']>>[number];
