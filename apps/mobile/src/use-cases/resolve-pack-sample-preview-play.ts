import { getInfoAsync } from 'expo-file-system/legacy';
import { getInstalledPack } from '../data/repositories/installed-pack-repository';

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

  const installed = getInstalledPack(input.packId);
  if (!installed || installed.installStatus !== 'installed') {
    return 'not-installed';
  }

  const relativePath = input.previewAudio.startsWith('assets/')
    ? input.previewAudio.slice('assets/'.length)
    : input.previewAudio;
  const fullPath = `${installed.assetsDir}${relativePath}`;
  const info = await getInfoAsync(fullPath);
  return info.exists ? 'ready' : 'missing-file';
}
