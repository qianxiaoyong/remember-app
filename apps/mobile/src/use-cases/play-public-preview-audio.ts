import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

export type PlayPublicPreviewAudioResult = 'played' | 'failed';

let sharedPlayer: ReturnType<typeof createAudioPlayer> | null = null;
let audioModeConfigured = false;

export async function playPublicPreviewAudio(url: string): Promise<PlayPublicPreviewAudioResult> {
  try {
    if (!audioModeConfigured) {
      await setAudioModeAsync({ playsInSilentMode: true });
      audioModeConfigured = true;
    }

    if (sharedPlayer) {
      sharedPlayer.replace({ uri: url });
      await sharedPlayer.seekTo(0);
      sharedPlayer.play();
    } else {
      sharedPlayer = createAudioPlayer({ uri: url });
      sharedPlayer.play();
    }

    return 'played';
  } catch {
    return 'failed';
  }
}
