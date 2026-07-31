import type { Pack } from '@prisma/client';
import {
  catalogPackDetailSchema,
  catalogPackSummarySchema,
  introMediaItemSchema,
  packSamplePreviewSchema,
  type CatalogPackDetail,
  type CatalogPackSummary,
} from '@remember/contracts';

function toIsoString(value: Date): string {
  return value.toISOString();
}

function parseStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  return value.filter((item): item is string => typeof item === 'string');
}

function mapPackSummary(pack: Pack): CatalogPackSummary {
  return catalogPackSummarySchema.parse({
    packId: pack.packId,
    title: pack.title,
    ...(pack.displayTitle ? { displayTitle: pack.displayTitle } : {}),
    primaryCategory: pack.primaryCategory,
    secondaryCategory: pack.secondaryCategory,
    versionLabel: pack.versionLabel,
    contentTags: parseStringArray(pack.contentTags) ?? [],
    cardCount: pack.cardCount,
    sizeLabel: pack.sizeLabel,
    updatedAt: toIsoString(pack.updatedAt),
    priceCents: pack.priceCents,
    summary: pack.summary,
    ...(pack.coverUrl ? { coverUrl: pack.coverUrl } : {}),
    ...(pack.coverBadge ? { coverBadge: pack.coverBadge } : {}),
    ...(parseStringArray(pack.coverLines) ? { coverLines: parseStringArray(pack.coverLines) } : {}),
    ...(pack.isBundledTestPack ? { isBundledTestPack: true } : {}),
  });
}

export function mapPackDetail(pack: Pack): CatalogPackDetail {
  const samplePreviewsRaw = Array.isArray(pack.samplePreviews) ? pack.samplePreviews : [];
  const samplePreviews = samplePreviewsRaw.map((item) => packSamplePreviewSchema.parse(item));
  const introMediaRaw = Array.isArray(pack.introMedia) ? pack.introMedia : undefined;
  const introMedia = introMediaRaw?.map((item) => introMediaItemSchema.parse(item));

  return catalogPackDetailSchema.parse({
    ...mapPackSummary(pack),
    summary: pack.summary,
    samplePreviews,
    ...(introMedia && introMedia.length > 0 ? { introMedia } : {}),
  });
}

export function mapPackSummaries(packs: Pack[]): CatalogPackSummary[] {
  return packs.map((pack) => mapPackSummary(pack));
}
