import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { getInfoAsync } from 'expo-file-system/legacy';
import { resolvePackAssetUri } from './resolve-pack-asset-uri';

export type PlayPackAssetAudioResult = 'missing-pack' | 'missing-file' | 'played' | 'failed';

let sharedPlayer: ReturnType<typeof createAudioPlayer> | null = null;
let audioModeConfigured = false;

export async function playPackAssetAudio(input: {
  packId: string;
  relativePath: string;
}): Promise<PlayPackAssetAudioResult> {
  const uri = resolvePackAssetUri(input.packId, input.relativePath);
  if (!uri) {
    return 'missing-pack';
  }

  const info = await getInfoAsync(uri);
  if (!info.exists) {
    return 'missing-file';
  }

  try {
    if (!audioModeConfigured) {
      await setAudioModeAsync({ playsInSilentMode: true });
      audioModeConfigured = true;
    }

    if (sharedPlayer) {
      sharedPlayer.replace({ uri });
      await sharedPlayer.seekTo(0);
      sharedPlayer.play();
    } else {
      sharedPlayer = createAudioPlayer({ uri });
      sharedPlayer.play();
    }

    return 'played';
  } catch {
    return 'failed';
  }
}
