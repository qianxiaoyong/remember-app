import type { CatalogPackItem } from '../catalog/catalog-seed';
import type { PackSamplePreview } from '../catalog/pack-sample-preview';

export function resolvePackSamplePreviews(item: CatalogPackItem): PackSamplePreview[] {
  if (item.samplePreviews && item.samplePreviews.length > 0) {
    return item.samplePreviews;
  }

  return item.sampleHeadwords.map((headword) => ({
    headword,
    zh: '—',
    exampleEn: '—',
    initial: headword.charAt(0).toUpperCase(),
  }));
}
