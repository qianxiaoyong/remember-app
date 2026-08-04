import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { LemmaStatus } from '@remember/contracts';
import { PrismaService } from '../../prisma/prisma.service.js';

const DETAIL_INCLUDE = {
  fragments: {
    orderBy: [{ fragmentType: 'asc' as const }, { sortOrder: 'asc' as const }],
  },
  forms: {
    orderBy: { formKey: 'asc' as const },
  },
  assets: {
    orderBy: { createdAt: 'asc' as const },
  },
  tagLinks: {
    include: { tag: true },
  },
} satisfies Prisma.ContentLemmaInclude;

type LexiconSortField = 'headword' | 'lemmaKey' | 'status' | 'ipa' | 'pos' | 'source';
type LexiconSortOrder = 'asc' | 'desc';

function buildLexiconOrderClause(
  sortBy?: LexiconSortField,
  sortOrder?: LexiconSortOrder,
): Prisma.Sql {
  if (!sortBy) {
    return Prisma.sql`ORDER BY CASE status
      WHEN 'published' THEN 0
      WHEN 'draft' THEN 1
      ELSE 2
    END,
    headword ASC`;
  }

  const direction = sortOrder === 'desc' ? Prisma.sql`DESC` : Prisma.sql`ASC`;
  switch (sortBy) {
    case 'headword':
      return Prisma.sql`ORDER BY headword ${direction} NULLS LAST, lemma_key ASC`;
    case 'lemmaKey':
      return Prisma.sql`ORDER BY lemma_key ${direction} NULLS LAST`;
    case 'status':
      return Prisma.sql`ORDER BY status ${direction} NULLS LAST, headword ASC`;
    case 'ipa':
      return Prisma.sql`ORDER BY ipa ${direction} NULLS LAST, headword ASC`;
    case 'pos':
      return Prisma.sql`ORDER BY pos ${direction} NULLS LAST, headword ASC`;
    case 'source':
      return Prisma.sql`ORDER BY source ${direction} NULLS LAST, headword ASC`;
    default:
      return Prisma.sql`ORDER BY headword ASC`;
  }
}

@Injectable()
export class AdminLexiconRepository {
  constructor(private readonly prisma: PrismaService) {}

  async searchLemmaIds(input: {
    q?: string;
    status?: LemmaStatus;
    sortBy?: LexiconSortField;
    sortOrder?: LexiconSortOrder;
    limit: number;
    offset: number;
  }): Promise<{ ids: string[]; total: number }> {
    const statusFilter = input.status ? Prisma.sql`AND status = ${input.status}` : Prisma.empty;
    const trimmedQuery = input.q?.trim();
    const textFilter = trimmedQuery
      ? Prisma.sql`AND (lemma_key ILIKE ${`%${trimmedQuery}%`} OR headword ILIKE ${`%${trimmedQuery}%`})`
      : Prisma.empty;
    const orderClause = buildLexiconOrderClause(input.sortBy, input.sortOrder);

    const idRows = await this.prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
      SELECT id
      FROM content_lemmas
      WHERE true
      ${textFilter}
      ${statusFilter}
      ${orderClause}
      LIMIT ${input.limit}
      OFFSET ${input.offset}
    `);

    const countRows = await this.prisma.$queryRaw<{ count: bigint }[]>(Prisma.sql`
      SELECT COUNT(*)::bigint AS count
      FROM content_lemmas
      WHERE true
      ${textFilter}
      ${statusFilter}
    `);

    return {
      ids: idRows.map((row) => row.id),
      total: Number(countRows[0]?.count ?? 0n),
    };
  }

  findSummariesByIds(ids: string[]) {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }
    return this.prisma.contentLemma.findMany({
      where: { id: { in: ids } },
    });
  }

  findDetailByLemmaKey(lemmaKey: string) {
    return this.prisma.contentLemma.findUnique({
      where: { lemmaKey },
      include: DETAIL_INCLUDE,
    });
  }

  findDetailByFormKey(formKey: string) {
    return this.prisma.contentLemmaForm
      .findUnique({
        where: { formKey },
        include: {
          lemma: {
            include: DETAIL_INCLUDE,
          },
        },
      })
      .then((row) => row?.lemma ?? null);
  }

  findDetailsByLemmaKeys(lemmaKeys: string[]) {
    if (lemmaKeys.length === 0) {
      return Promise.resolve([]);
    }
    return this.prisma.contentLemma.findMany({
      where: { lemmaKey: { in: lemmaKeys } },
      include: DETAIL_INCLUDE,
    });
  }

  findLemmaByKey(lemmaKey: string) {
    return this.prisma.contentLemma.findUnique({ where: { lemmaKey } });
  }

  createLemma(data: Prisma.ContentLemmaCreateInput) {
    return this.prisma.contentLemma.create({ data });
  }

  updateLemma(lemmaId: string, data: Prisma.ContentLemmaUpdateInput) {
    return this.prisma.contentLemma.update({
      where: { id: lemmaId },
      data,
    });
  }

  replaceLemmaTags(lemmaId: string, tagKeys: string[]) {
    return this.prisma.$transaction(async (tx) => {
      await tx.contentLemmaTagLink.deleteMany({ where: { lemmaId } });
      if (tagKeys.length === 0) {
        return;
      }

      for (const tagKey of tagKeys) {
        const tag = await tx.contentTag.upsert({
          where: { tagKey },
          create: { tagKey, labelZh: tagKey },
          update: {},
        });
        await tx.contentLemmaTagLink.create({
          data: { lemmaId, tagId: tag.id },
        });
      }
    });
  }

  deleteFragment(fragmentId: string, client: Prisma.TransactionClient = this.prisma) {
    return client.contentLemmaFragment.delete({ where: { id: fragmentId } });
  }

  createFragment(
    data: Prisma.ContentLemmaFragmentCreateInput,
    client: Prisma.TransactionClient = this.prisma,
  ) {
    return client.contentLemmaFragment.create({ data });
  }

  updateFragment(
    fragmentId: string,
    data: Prisma.ContentLemmaFragmentUpdateInput,
    client: Prisma.TransactionClient = this.prisma,
  ) {
    return client.contentLemmaFragment.update({ where: { id: fragmentId }, data });
  }

  deleteForm(formKey: string, client: Prisma.TransactionClient = this.prisma) {
    return client.contentLemmaForm.delete({ where: { formKey } });
  }

  upsertForm(
    formKey: string,
    lemmaId: string,
    data: Omit<Prisma.ContentLemmaFormCreateInput, 'formKey' | 'lemma' | 'lemmaId'>,
    client: Prisma.TransactionClient = this.prisma,
  ) {
    return client.contentLemmaForm.upsert({
      where: { formKey },
      create: {
        formKey,
        lemmaId,
        ...data,
      },
      update: {
        lemmaId,
        ...data,
      },
    });
  }

  deleteAsset(assetId: string, client: Prisma.TransactionClient = this.prisma) {
    return client.contentLemmaAsset.delete({ where: { id: assetId } });
  }

  createAsset(
    data: Prisma.ContentLemmaAssetCreateInput,
    client: Prisma.TransactionClient = this.prisma,
  ) {
    return client.contentLemmaAsset.create({ data });
  }

  updateAsset(
    assetId: string,
    data: Prisma.ContentLemmaAssetUpdateInput,
    client: Prisma.TransactionClient = this.prisma,
  ) {
    return client.contentLemmaAsset.update({ where: { id: assetId }, data });
  }

  runTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
    return this.prisma.$transaction(fn);
  }
}
