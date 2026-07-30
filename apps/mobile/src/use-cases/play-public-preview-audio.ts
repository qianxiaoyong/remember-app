import { playExpoAudioUri } from './play-expo-audio-uri';

export type PlayPublicPreviewAudioResult = 'played' | 'failed';

export async function playPublicPreviewAudio(url: string): Promise<PlayPublicPreviewAudioResult> {
  return playExpoAudioUri(url);
}
