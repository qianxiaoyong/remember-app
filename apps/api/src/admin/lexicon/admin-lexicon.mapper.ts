import type {
  ContentLemma,
  ContentLemmaAsset,
  ContentLemmaForm,
  ContentLemmaFragment,
  ContentTag,
} from '@prisma/client';
import {
  adminLexiconDetailSchema,
  adminLexiconSummarySchema,
  type AdminLexiconDetail,
  type AdminLexiconSummary,
} from '@remember/contracts';

type LemmaWithRelations = ContentLemma & {
  fragments: ContentLemmaFragment[];
  forms: ContentLemmaForm[];
  assets: ContentLemmaAsset[];
  tagLinks: { tag: ContentTag }[];
};

function mapOptionalString(value: string | null | undefined): string | undefined {
  return value && value.length > 0 ? value : undefined;
}

function mapSummary(lemma: ContentLemma): AdminLexiconSummary {
  return adminLexiconSummarySchema.parse({
    lemmaKey: lemma.lemmaKey,
    headword: lemma.headword,
    status: lemma.status,
    source: lemma.source,
    ...(mapOptionalString(lemma.ipa) ? { ipa: lemma.ipa } : {}),
    ...(mapOptionalString(lemma.pos) ? { pos: lemma.pos } : {}),
    ...(lemma.cefrLevel ? { cefrLevel: lemma.cefrLevel } : {}),
    ...(lemma.difficultyLevel != null ? { difficultyLevel: lemma.difficultyLevel } : {}),
  });
}

export function mapLemmaToSummary(lemma: ContentLemma): AdminLexiconSummary {
  return mapSummary(lemma);
}

export function mapLemmaToDetail(lemma: LemmaWithRelations): AdminLexiconDetail {
  return adminLexiconDetailSchema.parse({
    ...mapSummary(lemma),
    id: lemma.id,
    ...(lemma.frequencyBnc != null ? { frequencyBnc: lemma.frequencyBnc } : {}),
    ...(lemma.frequencyFrq != null ? { frequencyFrq: lemma.frequencyFrq } : {}),
    ...(lemma.collinsStar != null ? { collinsStar: lemma.collinsStar } : {}),
    ...(lemma.oxfordCore != null ? { oxfordCore: lemma.oxfordCore } : {}),
    ...(lemma.importBatchId ? { importBatchId: lemma.importBatchId } : {}),
    ...(lemma.publishedAt ? { publishedAt: lemma.publishedAt.toISOString() } : {}),
    ...(lemma.publishedByAdminId ? { publishedByAdminId: lemma.publishedByAdminId } : {}),
    createdAt: lemma.createdAt.toISOString(),
    updatedAt: lemma.updatedAt.toISOString(),
    fragments: lemma.fragments.map((fragment) => ({
      id: fragment.id,
      fragmentType: fragment.fragmentType,
      content: fragment.content as Record<string, unknown>,
      sortOrder: fragment.sortOrder,
      source: fragment.source,
      createdAt: fragment.createdAt.toISOString(),
      updatedAt: fragment.updatedAt.toISOString(),
    })),
    forms: lemma.forms.map((form) => ({
      formKey: form.formKey,
      formType: form.formType,
      displayForm: form.displayForm,
      source: form.source,
      createdAt: form.createdAt.toISOString(),
    })),
    assets: lemma.assets.map((asset) => ({
      id: asset.id,
      assetKind: asset.assetKind,
      storageKind: asset.storageKind,
      pathOrKey: asset.pathOrKey,
      ...(mapOptionalString(asset.sha256) ? { sha256: asset.sha256 } : {}),
      ...(asset.durationMs != null ? { durationMs: asset.durationMs } : {}),
      ...(mapOptionalString(asset.mimeType) ? { mimeType: asset.mimeType } : {}),
      ...(mapOptionalString(asset.voiceId) ? { voiceId: asset.voiceId } : {}),
      ...(mapOptionalString(asset.ttsText) ? { ttsText: asset.ttsText } : {}),
      createdAt: asset.createdAt.toISOString(),
    })),
    tags: lemma.tagLinks.map(({ tag }) => ({
      tagKey: tag.tagKey,
      labelZh: tag.labelZh,
    })),
  });
}
