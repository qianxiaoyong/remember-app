export interface SegmentPreview {
  startMs: number;
  endMs: number;
}

export interface StoryAudioSnapshot {
  currentMs: number;
  isPlaying: boolean;
  durationMs: number;
  loadError: string | null;
  segmentPreview: SegmentPreview | null;
}

export const HAVE_METADATA = 1;
export const SEEK_TOLERANCE_MS = 350;
export const MAX_SEEK_ATTEMPTS = 12;
