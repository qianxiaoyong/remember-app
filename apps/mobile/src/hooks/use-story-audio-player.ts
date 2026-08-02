import { useCallback, useEffect, useRef, useState } from 'react';
import {
  pausePreparedExpoAudio,
  playPreparedExpoAudio,
  prepareExpoAudioUri,
  seekPreparedExpoAudio,
  subscribeExpoAudioPosition,
  type ExpoAudioPositionState,
} from '../use-cases/play-expo-audio-uri';

export interface StoryAudioPlayerState {
  positionMs: number;
  durationMs: number;
  playing: boolean;
  isReady: boolean;
  play: () => void;
  pause: () => void;
  seek: (positionMs: number) => void;
}

export function useStoryAudioPlayer(input: {
  uri: string | null;
  isActive: boolean;
  initialPositionMs?: number;
}): StoryAudioPlayerState {
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const wasActiveRef = useRef(input.isActive);
  const initialSeekAppliedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!input.uri) {
      setIsReady(false);
      setPositionMs(0);
      setDurationMs(0);
      setPlaying(false);
      initialSeekAppliedRef.current = null;
      return;
    }

    let cancelled = false;
    void prepareExpoAudioUri(input.uri).then((result) => {
      if (cancelled) {
        return;
      }
      setIsReady(result === 'loaded');
    });

    return () => {
      cancelled = true;
    };
  }, [input.uri]);

  useEffect(() => {
    if (!input.uri || !isReady) {
      return;
    }
    if (initialSeekAppliedRef.current === input.uri) {
      return;
    }
    initialSeekAppliedRef.current = input.uri;
    const initialPositionMs = input.initialPositionMs ?? 0;
    if (initialPositionMs > 0) {
      void seekPreparedExpoAudio(initialPositionMs);
    }
  }, [input.initialPositionMs, input.uri, isReady]);

  useEffect(() => {
    const handlePosition = (state: ExpoAudioPositionState): void => {
      setPositionMs(state.positionMs);
      setDurationMs(state.durationMs);
      setPlaying(state.playing);
    };
    return subscribeExpoAudioPosition(handlePosition);
  }, []);

  useEffect(() => {
    if (wasActiveRef.current && !input.isActive) {
      pausePreparedExpoAudio();
    }
    wasActiveRef.current = input.isActive;
  }, [input.isActive]);

  const play = useCallback(() => {
    playPreparedExpoAudio();
  }, []);

  const pause = useCallback(() => {
    pausePreparedExpoAudio();
  }, []);

  const seek = useCallback((nextPositionMs: number) => {
    void seekPreparedExpoAudio(nextPositionMs);
  }, []);

  return {
    positionMs,
    durationMs,
    playing,
    isReady,
    play,
    pause,
    seek,
  };
}
