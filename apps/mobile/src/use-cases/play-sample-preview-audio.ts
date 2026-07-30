import { playPackAssetAudio } from './play-pack-asset-audio';

import { playPublicPreviewAudio } from './play-public-preview-audio';

import { isDevPlaceholderPreviewUrl } from '../catalog/normalize-sample-preview-audio';

import type { PackSamplePreview } from '../catalog/pack-sample-preview';

export type SamplePreviewPlayResult = 'no-audio' | 'missing-file' | 'played' | 'failed';

export async function playSamplePreviewAudio(input: {
  packId: string;

  isInstalled: boolean;

  sample: PackSamplePreview;
}): Promise<SamplePreviewPlayResult> {
  if (input.isInstalled && input.sample.previewAudio) {
    const relativePath = input.sample.previewAudio.startsWith('assets/')
      ? input.sample.previewAudio.slice('assets/'.length)
      : input.sample.previewAudio;

    const localResult = await playPackAssetAudio({
      packId: input.packId,

      relativePath,
    });

    if (localResult === 'played') {
      return 'played';
    }

    if (localResult === 'missing-file' || localResult === 'missing-pack') {
      return 'missing-file';
    }

    return 'failed';
  }

  const publicUrl = input.sample.previewAudioUrl;

  if (publicUrl && !isDevPlaceholderPreviewUrl(publicUrl)) {
    const result = await playPublicPreviewAudio(publicUrl);

    if (result === 'played') {
      return 'played';
    }

    return 'missing-file';
  }

  if (!input.sample.previewAudio) {
    return 'no-audio';
  }

  return 'missing-file';
}
