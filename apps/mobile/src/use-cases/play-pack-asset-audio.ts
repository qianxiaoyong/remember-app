import { getInfoAsync } from 'expo-file-system/legacy';
import { playExpoAudioUri } from './play-expo-audio-uri';
import { resolvePackAssetUri } from './resolve-pack-asset-uri';

export type PlayPackAssetAudioResult = 'missing-pack' | 'missing-file' | 'played' | 'failed';

const MIN_PLAYABLE_AUDIO_BYTES = 128;

export async function playPackAssetAudio(input: {
  packId: string;
  relativePath: string;
}): Promise<PlayPackAssetAudioResult> {
  const uri = resolvePackAssetUri(input.packId, input.relativePath);
  if (!uri) {
    return 'missing-pack';
  }

  const info = await getInfoAsync(uri);
  if (!info.exists || info.size < MIN_PLAYABLE_AUDIO_BYTES) {
    return 'missing-file';
  }

  const result = await playExpoAudioUri(uri);
  return result === 'played' ? 'played' : 'failed';
}
