import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
} from 'react';
import { fetchAudioDurationMs, packAssetUrl } from '../api/local-api-client.js';
import { StoryAudioEngine, type SegmentPreview } from './story-audio-engine.js';

export type { SegmentPreview };

export interface StoryTimelineAudio {
  audioUrl: string;
  durationMs: number;
  currentMs: number;
  isPlaying: boolean;
  segmentPreview: SegmentPreview | null;
  loadError: string | null;
  togglePlayPause: (fromMs?: number) => void;
  beginScrub: () => void;
  endScrub: (ms: number) => void;
  scrubToMs: (ms: number) => void;
  seekToParagraphStart: (startMs: number) => void;
  getPlaybackMs: () => number | null;
  toggleSegmentPreview: (startMs: number, endMs: number) => void;
}

const StoryAudioContext = createContext<StoryTimelineAudio | null>(null);

export function useStoryAudio(): StoryTimelineAudio {
  const value = useContext(StoryAudioContext);
  if (!value) {
    throw new Error('useStoryAudio must be used within StoryAudioProvider');
  }
  return value;
}

interface StoryAudioProviderProps {
  packId: string;
  primaryAudio: string;
  children: ReactNode;
}

export function StoryAudioProvider({
  packId,
  primaryAudio,
  children,
}: StoryAudioProviderProps): ReactElement {
  const engineRef = useRef<StoryAudioEngine | null>(null);
  if (engineRef.current === null) {
    engineRef.current = new StoryAudioEngine();
  }
  const engine = engineRef.current;

  const trimmed = primaryAudio.trim();
  const audioUrl = trimmed ? packAssetUrl(packId, trimmed) : '';

  const snapshot = useSyncExternalStore(
    (listener) => engine.subscribe(listener),
    () => engine.getSnapshot(),
    () => engine.getSnapshot(),
  );

  useEffect(() => {
    if (!trimmed) {
      engine.setDurationMs(0);
      return;
    }
    let cancelled = false;
    void fetchAudioDurationMs(packId, trimmed)
      .then((value) => {
        if (!cancelled) {
          engine.setDurationMs(value);
        }
      })
      .catch(() => {
        if (!cancelled) {
          engine.setDurationMs(0);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [engine, packId, trimmed]);

  const actions = useMemo(
    () => ({
      togglePlayPause: (fromMs?: number) => {
        engine.togglePlayPause(fromMs);
      },
      beginScrub: () => {
        engine.beginScrub();
      },
      endScrub: (ms: number) => {
        engine.endScrub(ms);
      },
      scrubToMs: (ms: number) => {
        engine.scrubToMs(ms);
      },
      seekToParagraphStart: (startMs: number) => {
        engine.seekToParagraphStart(startMs);
      },
      getPlaybackMs: () => {
        return engine.getPlaybackMs();
      },
      toggleSegmentPreview: (startMs: number, endMs: number) => {
        engine.toggleSegmentPreview(startMs, endMs);
      },
    }),
    [engine],
  );

  const api: StoryTimelineAudio = useMemo(
    () => ({
      audioUrl,
      durationMs: snapshot.durationMs,
      currentMs: snapshot.currentMs,
      isPlaying: snapshot.isPlaying,
      segmentPreview: snapshot.segmentPreview,
      loadError: snapshot.loadError,
      ...actions,
    }),
    [
      actions,
      audioUrl,
      snapshot.currentMs,
      snapshot.durationMs,
      snapshot.isPlaying,
      snapshot.loadError,
      snapshot.segmentPreview,
    ],
  );

  const attachAudioElement = useCallback(
    (element: HTMLAudioElement | null) => {
      engine.bindElement(element);
    },
    [engine],
  );

  return (
    <StoryAudioContext.Provider value={api}>
      {audioUrl ? (
        <audio
          ref={attachAudioElement}
          src={audioUrl}
          preload="auto"
          className="story-audio-element-hidden"
        />
      ) : null}
      {children}
    </StoryAudioContext.Provider>
  );
}
