import { useCallback, useEffect, useRef, useState } from 'react';
import { getRecallAutoPlayCount } from '../data/repositories/user-preferences-repository';
import { playPackAssetAudio } from '../use-cases/play-pack-asset-audio';
import {
  beginPrimaryAudioPlayback,
  cancelExpoAudioPlayback,
  playExpoAudioUriRepeated,
  subscribeExpoAudioPosition,
} from '../use-cases/play-expo-audio-uri';
import { resolvePackAssetUri } from '../use-cases/resolve-pack-asset-uri';

type ActiveStudyAudio = 'primary' | { kind: 'example'; path: string };

export function useVocabularyStudyAudio(input: {
  packId: string | null;
  primaryAudioRelativePath: string | null;
  autoPlayActive: boolean;
  cardKey: string | null;
}) {
  const recallAutoPlayTokenRef = useRef(0);
  const activeStudyAudioRef = useRef<ActiveStudyAudio | null>(null);
  const [primaryAudioPlaying, setPrimaryAudioPlaying] = useState(false);
  const [playingExampleAudioPath, setPlayingExampleAudioPath] = useState<string | null>(null);

  const cancelRecallAutoPlay = useCallback(() => {
    recallAutoPlayTokenRef.current += 1;
    activeStudyAudioRef.current = null;
    cancelExpoAudioPlayback();
    setPrimaryAudioPlaying(false);
    setPlayingExampleAudioPath(null);
  }, []);

  useEffect(() => {
    return subscribeExpoAudioPosition((state) => {
      const active = activeStudyAudioRef.current;
      if (!active) {
        setPrimaryAudioPlaying(false);
        setPlayingExampleAudioPath(null);
        return;
      }
      if (active === 'primary') {
        setPrimaryAudioPlaying(state.playing);
        setPlayingExampleAudioPath(null);
        return;
      }
      setPrimaryAudioPlaying(false);
      setPlayingExampleAudioPath(state.playing ? active.path : null);
    });
  }, []);

  useEffect(() => {
    cancelRecallAutoPlay();

    if (!input.autoPlayActive || !input.packId || !input.primaryAudioRelativePath) {
      return;
    }

    const repeatCount = getRecallAutoPlayCount();
    if (repeatCount <= 0) {
      return;
    }

    const uri = resolvePackAssetUri(input.packId, input.primaryAudioRelativePath);
    if (!uri) {
      return;
    }

    const token = beginPrimaryAudioPlayback();
    recallAutoPlayTokenRef.current = token;
    activeStudyAudioRef.current = 'primary';
    void playExpoAudioUriRepeated(uri, repeatCount, token).finally(() => {
      if (recallAutoPlayTokenRef.current === token) {
        activeStudyAudioRef.current = null;
      }
    });

    return () => {
      if (recallAutoPlayTokenRef.current === token) {
        cancelRecallAutoPlay();
      }
    };
  }, [
    cancelRecallAutoPlay,
    input.autoPlayActive,
    input.cardKey,
    input.packId,
    input.primaryAudioRelativePath,
  ]);

  const playPrimaryAudio = useCallback(
    (relativePath: string) => {
      if (!input.packId) {
        return;
      }
      cancelRecallAutoPlay();
      activeStudyAudioRef.current = 'primary';
      void playPackAssetAudio({
        packId: input.packId,
        relativePath,
      });
    },
    [cancelRecallAutoPlay, input.packId],
  );

  const playExampleAudio = useCallback(
    (relativePath: string) => {
      if (!input.packId) {
        return;
      }
      cancelRecallAutoPlay();
      activeStudyAudioRef.current = { kind: 'example', path: relativePath };
      void playPackAssetAudio({
        packId: input.packId,
        relativePath,
      });
    },
    [cancelRecallAutoPlay, input.packId],
  );

  return {
    primaryAudioPlaying,
    playingExampleAudioPath,
    cancelRecallAutoPlay,
    playPrimaryAudio,
    playExampleAudio,
  };
}
