import type { CatalogPackItem } from '../catalog/catalog-seed';
import { normalizeSamplePreviewAudioFields } from '../catalog/normalize-sample-preview-audio';
import type { PackSamplePreview } from '../catalog/pack-sample-preview';

export function resolvePackSamplePreviews(item: CatalogPackItem): PackSamplePreview[] {
  const previews = item.samplePreviews ?? [];
  return previews.map(normalizeSamplePreviewAudioFields);
}
