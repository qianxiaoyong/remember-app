import type { CatalogPackItem } from '../catalog/catalog-seed';
import { findCatalogItem } from '../catalog/catalog-seed';
import { normalizeSamplePreviewAudioFields } from '../catalog/normalize-sample-preview-audio';
import type { PackSamplePreview } from '../catalog/pack-sample-preview';

function mergeBundledLocalPreviews(
  apiPreviews: PackSamplePreview[],
  packId: string,
): PackSamplePreview[] {
  const localItem = findCatalogItem(packId);
  const localPreviews = localItem?.samplePreviews ?? [];

  return apiPreviews.map((sample) => {
    const normalized = normalizeSamplePreviewAudioFields(sample);
    const localMatch = localPreviews.find((item) => item.headword === sample.headword);
    if (!localMatch?.previewAudio) {
      return normalized;
    }
    return { ...normalized, previewAudio: localMatch.previewAudio };
  });
}

export function resolvePackSamplePreviews(item: CatalogPackItem): PackSamplePreview[] {
  const previews =
    item.samplePreviews && item.samplePreviews.length > 0
      ? item.samplePreviews
      : item.sampleHeadwords.map((headword) => ({
          headword,
          zh: '—',
          exampleEn: '—',
          initial: headword.charAt(0).toUpperCase(),
        }));

  if (item.isBundledTestPack) {
    return mergeBundledLocalPreviews(previews, item.packId);
  }

  return previews.map(normalizeSamplePreviewAudioFields);
}
