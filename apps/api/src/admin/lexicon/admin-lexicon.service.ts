import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type {
  AdminLexiconBatchGetRequest,
  AdminLexiconEnrichRequest,
  AdminLexiconLemmaPatch,
  AdminLexiconPatchRequest,
  AdminLexiconSearchQuery,
} from '@remember/contracts';
import {
  adminLexiconBatchGetResponseSchema,
  adminLexiconByFormResponseSchema,
  adminLexiconEnrichResponseSchema,
  adminLexiconPatchResponseSchema,
  adminLexiconSearchResponseSchema,
  lemmaStatusSchema,
} from '@remember/contracts';
import { normalizeFormKey, normalizeLemmaKey } from '@remember/domain';
import { AuditService } from '../../audit/audit.service.js';
import { mapLemmaToDetail, mapLemmaToSummary } from './admin-lexicon.mapper.js';
import { AdminLexiconEnrichService } from './admin-lexicon-enrich.service.js';
import { AdminLexiconRepository } from './admin-lexicon.repository.js';
import { parseFragmentType, validateFragmentContent } from './validate-fragment-content.js';

@Injectable()
export class AdminLexiconService {
  constructor(
    private readonly repository: AdminLexiconRepository,
    private readonly enrichService: AdminLexiconEnrichService,
    private readonly auditService: AuditService,
  ) {}

  async search(query: AdminLexiconSearchQuery) {
    const { ids, total } = await this.repository.searchLemmaIds({
      ...(query.q !== undefined ? { q: query.q } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.sortBy ? { sortBy: query.sortBy } : {}),
      ...(query.sortOrder ? { sortOrder: query.sortOrder } : {}),
      limit: query.limit,
      offset: query.offset,
    });

    const rows = await this.repository.findSummariesByIds(ids);
    const rowById = new Map(rows.map((row) => [row.id, row]));
    const items = ids
      .map((id) => rowById.get(id))
      .filter((row): row is NonNullable<typeof row> => row !== undefined)
      .map(mapLemmaToSummary);

    return adminLexiconSearchResponseSchema.parse({
      items,
      total,
      limit: query.limit,
      offset: query.offset,
    });
  }

  async getDetail(lemmaKey: string) {
    const normalizedKey = this.requireLemmaKey(lemmaKey);
    const lemma = await this.repository.findDetailByLemmaKey(normalizedKey);
    if (!lemma) {
      throw new NotFoundException({ code: 'LEXICON_LEMMA_NOT_FOUND', message: '词条不存在' });
    }
    return mapLemmaToDetail(lemma);
  }

  async getByForm(formKey: string) {
    const normalizedFormKey = this.requireFormKey(formKey);
    const lemma = await this.repository.findDetailByFormKey(normalizedFormKey);
    if (!lemma) {
      throw new NotFoundException({ code: 'LEXICON_FORM_NOT_FOUND', message: '词形未收录' });
    }
    return adminLexiconByFormResponseSchema.parse({
      formKey: normalizedFormKey,
      lemma: mapLemmaToDetail(lemma),
    });
  }

  async batchGet(input: AdminLexiconBatchGetRequest) {
    const normalizedKeys = input.lemmaKeys.map((key) => this.requireLemmaKey(key));
    const uniqueKeys = [...new Set(normalizedKeys)];
    const rows = await this.repository.findDetailsByLemmaKeys(uniqueKeys);
    const foundKeys = new Set(rows.map((row) => row.lemmaKey));
    const missingLemmaKeys = uniqueKeys.filter((key) => !foundKeys.has(key));

    return adminLexiconBatchGetResponseSchema.parse({
      items: rows.map(mapLemmaToDetail),
      missingLemmaKeys,
    });
  }

  async patch(actorAdminUserId: string, input: AdminLexiconPatchRequest) {
    const updatedLemmaKeys: string[] = [];

    await this.repository.runTransaction(async (tx) => {
      for (const patch of input.patches) {
        const lemmaKey = this.requireLemmaKey(patch.lemmaKey);
        updatedLemmaKeys.push(lemmaKey);
        await this.applyPatch(tx, actorAdminUserId, lemmaKey, patch);
      }
    });

    return adminLexiconPatchResponseSchema.parse({
      updatedLemmaKeys: [...new Set(updatedLemmaKeys)],
    });
  }

  async enrich(input: AdminLexiconEnrichRequest) {
    this.requireLemmaKey(input.lemmaKey);
    const draftFragments = await this.enrichService.enrich(input);
    return adminLexiconEnrichResponseSchema.parse({
      lemmaKey: input.lemmaKey,
      draftFragments,
    });
  }

  private async applyPatch(
    tx: Prisma.TransactionClient,
    actorAdminUserId: string,
    lemmaKey: string,
    patch: AdminLexiconLemmaPatch,
  ): Promise<void> {
    const existing = await tx.contentLemma.findUnique({ where: { lemmaKey } });
    const previousStatus = existing?.status;
    const lemma =
      existing ??
      (await tx.contentLemma.create({
        data: {
          lemmaKey,
          headword: patch.headword ?? lemmaKey,
          source: patch.source ?? 'manual',
          status: patch.status ?? 'draft',
        },
      }));

    const nextStatus = patch.status ?? lemma.status;
    lemmaStatusSchema.parse(nextStatus);

    const updateData: Prisma.ContentLemmaUpdateInput = {
      ...(patch.headword !== undefined ? { headword: patch.headword } : {}),
      ...(patch.ipa !== undefined ? { ipa: patch.ipa } : {}),
      ...(patch.pos !== undefined ? { pos: patch.pos } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.source !== undefined ? { source: patch.source } : {}),
      ...(patch.difficultyLevel !== undefined ? { difficultyLevel: patch.difficultyLevel } : {}),
      ...(patch.cefrLevel !== undefined ? { cefrLevel: patch.cefrLevel } : {}),
    };

    if (nextStatus === 'published') {
      updateData.publishedAt = new Date();
      updateData.publishedByAdmin = { connect: { id: actorAdminUserId } };
    }

    await tx.contentLemma.update({
      where: { id: lemma.id },
      data: updateData,
    });

    if (patch.fragments) {
      for (const fragmentPatch of patch.fragments) {
        await this.applyFragmentPatch(tx, lemma.id, fragmentPatch);
      }
    }

    if (patch.forms) {
      for (const formPatch of patch.forms) {
        const formKey = this.requireFormKey(formPatch.formKey);
        if (formPatch.delete) {
          await tx.contentLemmaForm.delete({ where: { formKey } });
          continue;
        }

        await tx.contentLemmaForm.upsert({
          where: { formKey },
          create: {
            formKey,
            lemmaId: lemma.id,
            formType: formPatch.formType,
            displayForm: formPatch.displayForm,
            source: formPatch.source,
          },
          update: {
            lemmaId: lemma.id,
            formType: formPatch.formType,
            displayForm: formPatch.displayForm,
            source: formPatch.source,
          },
        });
      }
    }

    if (patch.assets) {
      for (const assetPatch of patch.assets) {
        await this.applyAssetPatch(tx, lemma.id, assetPatch);
      }
    }

    if (patch.tagKeys) {
      await tx.contentLemmaTagLink.deleteMany({ where: { lemmaId: lemma.id } });
      for (const tagKey of patch.tagKeys) {
        const tag = await tx.contentTag.upsert({
          where: { tagKey },
          create: { tagKey, labelZh: tagKey },
          update: {},
        });
        await tx.contentLemmaTagLink.create({
          data: { lemmaId: lemma.id, tagId: tag.id },
        });
      }
    }

    const action =
      nextStatus === 'published' && previousStatus !== 'published'
        ? 'lexicon.publish'
        : 'lexicon.patch';

    await this.auditService.writeAuditLog(
      {
        actorAdminUserId,
        action,
        targetType: 'content_lemma',
        targetId: lemmaKey,
        payloadSummary: {
          lemmaKey,
          ...(patch.status ? { status: patch.status } : {}),
          ...(patch.fragments ? { fragmentCount: patch.fragments.length } : {}),
        },
        result: 'success',
      },
      tx,
    );
  }

  private async applyFragmentPatch(
    tx: Prisma.TransactionClient,
    lemmaId: string,
    fragmentPatch: NonNullable<AdminLexiconLemmaPatch['fragments']>[number],
  ): Promise<void> {
    if (fragmentPatch.delete) {
      const fragmentId = fragmentPatch.id;
      if (!fragmentId) {
        throw new BadRequestException({
          code: 'LEXICON_FRAGMENT_DELETE_INVALID',
          message: '删除片段需要 id',
        });
      }
      await tx.contentLemmaFragment.delete({ where: { id: fragmentId } });
      return;
    }

    const fragmentType = parseFragmentType(fragmentPatch.fragmentType);
    const content = validateFragmentContent(
      fragmentType,
      fragmentPatch.content,
    ) as Prisma.InputJsonValue;

    if (fragmentPatch.id) {
      await tx.contentLemmaFragment.update({
        where: { id: fragmentPatch.id },
        data: {
          fragmentType,
          content,
          sortOrder: fragmentPatch.sortOrder,
          source: fragmentPatch.source,
        },
      });
      return;
    }

    await tx.contentLemmaFragment.create({
      data: {
        lemmaId,
        fragmentType,
        content,
        sortOrder: fragmentPatch.sortOrder,
        source: fragmentPatch.source,
      },
    });
  }

  private async applyAssetPatch(
    tx: Prisma.TransactionClient,
    lemmaId: string,
    assetPatch: NonNullable<AdminLexiconLemmaPatch['assets']>[number],
  ): Promise<void> {
    if (assetPatch.delete) {
      const assetId = assetPatch.id;
      if (!assetId) {
        throw new BadRequestException({
          code: 'LEXICON_ASSET_DELETE_INVALID',
          message: '删除资源需要 id',
        });
      }
      await tx.contentLemmaAsset.delete({ where: { id: assetId } });
      return;
    }

    const assetData = {
      assetKind: assetPatch.assetKind,
      storageKind: assetPatch.storageKind,
      pathOrKey: assetPatch.pathOrKey,
      sha256: assetPatch.sha256 ?? null,
      durationMs: assetPatch.durationMs ?? null,
      mimeType: assetPatch.mimeType ?? null,
      voiceId: assetPatch.voiceId ?? null,
      ttsText: assetPatch.ttsText ?? null,
    };

    if (assetPatch.id) {
      await tx.contentLemmaAsset.update({
        where: { id: assetPatch.id },
        data: assetData,
      });
      return;
    }

    await tx.contentLemmaAsset.create({
      data: {
        lemmaId,
        ...assetData,
      },
    });
  }

  private requireLemmaKey(raw: string): string {
    const normalized = normalizeLemmaKey(raw);
    if (!normalized) {
      throw new BadRequestException({
        code: 'LEXICON_INVALID_LEMMA_KEY',
        message: '词条键格式无效',
      });
    }
    return normalized;
  }

  private requireFormKey(raw: string): string {
    const normalized = normalizeFormKey(raw);
    if (!normalized) {
      throw new BadRequestException({
        code: 'LEXICON_INVALID_FORM_KEY',
        message: '词形键格式无效',
      });
    }
    return normalized;
  }
}
