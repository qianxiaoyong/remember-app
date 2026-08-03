import { useEffect, useRef, useState, type RefObject } from 'react';
import { fetchAudioDurationMs, packAssetUrl } from '../api/local-api-client.js';

export interface StoryTimelineAudio {
  audioRef: RefObject<HTMLAudioElement | null>;
  audioUrl: string;
  durationMs: number;
  currentMs: number;
  loadError: string | null;
  setCurrentMs: (ms: number) => void;
  togglePlayPause: () => void;
  seekToMs: (ms: number) => void;
  getPlaybackMs: () => number | null;
  playSegment: (startMs: number, endMs: number) => void;
}

export function useStoryTimelineAudio(packId: string, primaryAudio: string): StoryTimelineAudio {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [currentMs, setCurrentMs] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const trimmed = primaryAudio.trim();
  const audioUrl = trimmed ? packAssetUrl(packId, trimmed) : '';

  useEffect(() => {
    if (!trimmed) {
      setDurationMs(0);
      return;
    }
    let cancelled = false;
    void fetchAudioDurationMs(packId, trimmed)
      .then((value) => {
        if (!cancelled) {
          setDurationMs(value);
          setLoadError(null);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : String(error));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [packId, trimmed]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    const onTimeUpdate = (): void => {
      setCurrentMs(Math.round(audio.currentTime * 1000));
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [audioUrl]);

  function togglePlayPause(): void {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  }

  function seekToMs(ms: number): void {
    const audio = audioRef.current;
    setCurrentMs(ms);
    if (audio) {
      audio.currentTime = ms / 1000;
    }
  }

  function getPlaybackMs(): number | null {
    const audio = audioRef.current;
    if (!audio) {
      return null;
    }
    return Math.round(audio.currentTime * 1000);
  }

  function playSegment(startMs: number, endMs: number): void {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.currentTime = startMs / 1000;
    void audio.play();
    const onTimeUpdate = (): void => {
      if (Math.round(audio.currentTime * 1000) >= endMs) {
        audio.pause();
        audio.removeEventListener('timeupdate', onTimeUpdate);
      }
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
  }

  return {
    audioRef,
    audioUrl,
    durationMs,
    currentMs,
    loadError,
    setCurrentMs,
    togglePlayPause,
    seekToMs,
    getPlaybackMs,
    playSegment,
  };
}
