import { Injectable, NotFoundException } from '@nestjs/common';
import {
  adminContentTagVocabularyListResponseSchema,
  type AdminContentTagVocabularyListResponse,
} from '@remember/contracts';
import { PrismaService } from '../../prisma/prisma.service.js';
import { normalizeContentTags } from './normalize-content-tags.js';

@Injectable()
export class AdminContentTagsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<AdminContentTagVocabularyListResponse> {
    const rows = await this.prisma.contentTagVocabulary.findMany({
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
    });

    return adminContentTagVocabularyListResponseSchema.parse({
      items: rows.map((row) => ({
        label: row.label,
        sortOrder: row.sortOrder,
        createdAt: row.createdAt.toISOString(),
      })),
    });
  }

  async delete(label: string): Promise<void> {
    const normalized = normalizeContentTags([label])[0];
    if (!normalized) {
      throw new NotFoundException({ code: 'CONTENT_TAG_NOT_FOUND', message: '标签不存在' });
    }

    const deleted = await this.prisma.contentTagVocabulary.deleteMany({
      where: { label: normalized },
    });
    if (deleted.count === 0) {
      throw new NotFoundException({ code: 'CONTENT_TAG_NOT_FOUND', message: '标签不存在' });
    }
  }

  async upsertLabels(labels: string[]): Promise<void> {
    const normalized = normalizeContentTags(labels);
    if (normalized.length === 0) {
      return;
    }

    const existing = await this.prisma.contentTagVocabulary.findMany({
      where: { label: { in: normalized } },
      select: { label: true },
    });
    const existingLabels = new Set(existing.map((row) => row.label));
    const missing = normalized.filter((label) => !existingLabels.has(label));
    if (missing.length === 0) {
      return;
    }

    const aggregate = await this.prisma.contentTagVocabulary.aggregate({
      _max: { sortOrder: true },
    });
    let nextSortOrder = (aggregate._max.sortOrder ?? 0) + 10;

    await this.prisma.contentTagVocabulary.createMany({
      data: missing.map((label) => ({
        label,
        sortOrder: nextSortOrder++,
      })),
      skipDuplicates: true,
    });
  }
}
