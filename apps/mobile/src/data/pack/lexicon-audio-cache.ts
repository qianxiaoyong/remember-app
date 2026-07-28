import { cacheDirectory, downloadAsync, getInfoAsync } from 'expo-file-system/legacy';

export async function cacheLexiconAudio(audioUrl: string, surfaceForm: string): Promise<string> {
  const cacheRoot = `${cacheDirectory ?? ''}lexicon-audio/`;
  const localPath = `${cacheRoot}${surfaceForm}.mp3`;
  const existing = await getInfoAsync(localPath);
  if (existing.exists) {
    return localPath;
  }

  await downloadAsync(audioUrl, localPath);
  return localPath;
}

export async function getCachedLexiconAudioPath(surfaceForm: string): Promise<string | null> {
  const localPath = `${cacheDirectory ?? ''}lexicon-audio/${surfaceForm}.mp3`;
  const info = await getInfoAsync(localPath);
  return info.exists ? localPath : null;
}
