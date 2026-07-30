import { getInfoAsync } from 'expo-file-system/legacy';
import { resolvePackAssetUri } from './resolve-pack-asset-uri';

export type PackSamplePreviewPlayResult = 'not-installed' | 'no-audio' | 'missing-file' | 'ready';

export async function resolvePackSamplePreviewPlay(input: {
  packId: string;
  previewAudio?: string;
  isInstalled: boolean;
}): Promise<PackSamplePreviewPlayResult> {
  if (!input.isInstalled) {
    return 'not-installed';
  }
  if (!input.previewAudio) {
    return 'no-audio';
  }

  const uri = resolvePackAssetUri(input.packId, input.previewAudio);
  if (!uri) {
    return 'not-installed';
  }

  const info = await getInfoAsync(uri);
  return info.exists && info.size >= 128 ? 'ready' : 'missing-file';
}
