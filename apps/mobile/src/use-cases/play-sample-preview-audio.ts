import { playPackAssetAudio } from './play-pack-asset-audio';
import { playPublicPreviewAudio } from './play-public-preview-audio';
import type { PackSamplePreview } from '../catalog/pack-sample-preview';

export type SamplePreviewPlayResult = 'no-audio' | 'missing-file' | 'played' | 'failed';

export async function playSamplePreviewAudio(input: {
  packId: string;
  isInstalled: boolean;
  sample: PackSamplePreview;
}): Promise<SamplePreviewPlayResult> {
  if (input.sample.previewAudioUrl) {
    const result = await playPublicPreviewAudio(input.sample.previewAudioUrl);
    return result === 'played' ? 'played' : 'failed';
  }

  if (!input.sample.previewAudio) {
    return 'no-audio';
  }

  if (!input.isInstalled) {
    return 'missing-file';
  }

  const relativePath = input.sample.previewAudio.startsWith('assets/')
    ? input.sample.previewAudio.slice('assets/'.length)
    : input.sample.previewAudio;

  const result = await playPackAssetAudio({
    packId: input.packId,
    relativePath,
  });

  if (result === 'missing-file') {
    return 'missing-file';
  }
  if (result === 'played') {
    return 'played';
  }
  return 'failed';
}
