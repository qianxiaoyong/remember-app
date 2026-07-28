import { cacheLexiconAudio, getCachedLexiconAudioPath } from '../data/pack/lexicon-audio-cache';

export async function playOrCacheLexiconAudio(input: {
  surfaceForm: string;
  audioUrl: string | null;
}): Promise<{ status: 'no-audio' | 'cached' | 'downloaded'; localPath?: string }> {
  if (!input.audioUrl) {
    return { status: 'no-audio' };
  }

  const cachedPath = await getCachedLexiconAudioPath(input.surfaceForm);
  if (cachedPath) {
    return { status: 'cached', localPath: cachedPath };
  }

  const localPath = await cacheLexiconAudio(input.audioUrl, input.surfaceForm);
  return { status: 'downloaded', localPath };
}
