import {
  catalogPackDetailSchema,
  catalogPackSummarySchema,
  catalogPackTaxonomySchema,
  includedHighlightSchema,
  introMediaItemSchema,
  packSamplePreviewSchema,
  type CatalogPackDetail,
  type CatalogPackSummary,
} from '@remember/contracts';
import type { PackWithCatalogVersion } from './catalog.repository.js';

function toIsoString(value: Date): string {
  return value.toISOString();
}

function parseStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  return value.filter((item): item is string => typeof item === 'string');
}

function mapPackTaxonomy(pack: PackWithCatalogVersion) {
  if (!pack.primaryNode || !pack.secondaryNode || !pack.versionNode) {
    return undefined;
  }

  return catalogPackTaxonomySchema.parse({
    primaryNodeId: pack.primaryNode.id,
    secondaryNodeId: pack.secondaryNode.id,
    versionNodeId: pack.versionNode.id,
    primaryLabel: pack.primaryNode.label,
    secondaryLabel: pack.secondaryNode.label,
    versionLabel: pack.versionNode.label,
    primarySlug: pack.primaryNode.slug,
  });
}

function parseIncludedHighlights(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const items = value.map((item) => includedHighlightSchema.parse(item));
  return items.length > 0 ? items : undefined;
}

function mapPackSummary(pack: PackWithCatalogVersion): CatalogPackSummary {
  const taxonomy = mapPackTaxonomy(pack);
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
    ...(() => {
      const highlights = parseIncludedHighlights(pack.includedHighlights);
      return highlights ? { includedHighlights: highlights } : {};
    })(),
    ...(pack.isBundledTestPack ? { isBundledTestPack: true } : {}),
    ...(pack.currentVersion
      ? {
          currentPackVersion: pack.currentVersion.packVersion,
          protocolVersion: pack.currentVersion.protocolVersion,
        }
      : {}),
    ...(taxonomy ? { taxonomy } : {}),
  });
}

export function mapPackDetail(pack: PackWithCatalogVersion): CatalogPackDetail {
  const samplePreviewsRaw = Array.isArray(pack.samplePreviews) ? pack.samplePreviews : [];
  const samplePreviews = samplePreviewsRaw.map((item) => packSamplePreviewSchema.parse(item));
  const introMediaRaw = Array.isArray(pack.introMedia) ? pack.introMedia : undefined;
  const introMedia = introMediaRaw?.map((item) => introMediaItemSchema.parse(item));

  return catalogPackDetailSchema.parse({
    ...mapPackSummary(pack),
    summary: pack.summary,
    samplePreviews,
    introMedia: introMedia ?? [],
  });
}

export function mapPackSummaries(packs: PackWithCatalogVersion[]): CatalogPackSummary[] {
  return packs.map((pack) => mapPackSummary(pack));
}
