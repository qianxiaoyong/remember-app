import type { CatalogPackDetail, CatalogPackSummary } from '@remember/contracts';
import type { CatalogPackItem } from '../catalog/catalog-seed';
import type { PackSamplePreview } from '../catalog/pack-sample-preview';

export function formatPriceCents(priceCents: number): string {
  if (priceCents <= 0) {
    return '免费';
  }
  const yuan = priceCents / 100;
  return Number.isInteger(yuan) ? `¥${String(yuan)}` : `¥${yuan.toFixed(2)}`;
}

export function mapCatalogSummaryToItem(summary: CatalogPackSummary): CatalogPackItem {
  return {
    packId: summary.packId,
    title: summary.title,
    ...(summary.displayTitle ? { displayTitle: summary.displayTitle } : {}),
    primaryCategory: summary.primaryCategory,
    secondaryCategory: summary.secondaryCategory,
    version: summary.versionLabel,
    contentTags: summary.contentTags,
    cardCount: summary.cardCount,
    sizeLabel: summary.sizeLabel,
    updatedAt: summary.updatedAt.slice(0, 10),
    priceCents: summary.priceCents,
    priceLabel: formatPriceCents(summary.priceCents),
    summary: summary.summary,
    sampleHeadwords: [],
    ...(summary.coverUrl ? { coverUrl: summary.coverUrl } : {}),
    ...(summary.coverBadge ? { coverBadge: summary.coverBadge } : {}),
    ...(summary.coverLines ? { coverLines: summary.coverLines } : {}),
    ...(summary.includedHighlights ? { includedHighlights: summary.includedHighlights } : {}),
    ...(summary.isBundledTestPack ? { isBundledTestPack: true } : { isBundledTestPack: false }),
    ...(summary.currentPackVersion ? { currentPackVersion: summary.currentPackVersion } : {}),
    ...(summary.protocolVersion !== undefined ? { protocolVersion: summary.protocolVersion } : {}),
    ...(summary.taxonomy ? { taxonomy: summary.taxonomy } : {}),
  };
}

function mapSamplePreview(sample: CatalogPackDetail['samplePreviews'][number]): PackSamplePreview {
  return {
    headword: sample.headword,
    zh: sample.zh,
    exampleEn: sample.exampleEn,
    ...(sample.initial ? { initial: sample.initial } : {}),
    ...(sample.previewAudioUrl ? { previewAudioUrl: sample.previewAudioUrl } : {}),
  };
}

export function mapCatalogDetailToItem(detail: CatalogPackDetail): CatalogPackItem {
  const base = mapCatalogSummaryToItem(detail);
  return {
    ...base,
    sampleHeadwords: detail.samplePreviews.map((item) => item.headword),
    samplePreviews: detail.samplePreviews.map(mapSamplePreview),
    ...(detail.introMedia ? { introMedia: detail.introMedia } : {}),
    ...(detail.includedHighlights ? { includedHighlights: detail.includedHighlights } : {}),
  };
}
