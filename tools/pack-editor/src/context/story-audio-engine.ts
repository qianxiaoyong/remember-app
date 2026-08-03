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

const HAVE_METADATA = 1;
const SEEK_TOLERANCE_MS = 350;
const MAX_SEEK_ATTEMPTS = 12;

type Listener = () => void;

export class StoryAudioEngine {
  private audio: HTMLAudioElement | null = null;
  private subscribers = new Set<Listener>();
  private isScrubbing = false;
  private segmentEndMs: number | null = null;
  private segmentPreview: SegmentPreview | null = null;
  private pendingSeekMs: number | null = null;
  private frozenGlobalMs: number | null = null;

  private snapshot: StoryAudioSnapshot = {
    currentMs: 0,
    isPlaying: false,
    durationMs: 0,
    loadError: null,
    segmentPreview: null,
  };

  subscribe(listener: Listener): () => void {
    this.subscribers.add(listener);
    return () => {
      this.subscribers.delete(listener);
    };
  }

  getSnapshot(): StoryAudioSnapshot {
    return this.snapshot;
  }

  setDurationMs(durationMs: number): void {
    this.patch({ durationMs });
  }

  bindElement(element: HTMLAudioElement | null): void {
    if (this.audio === element) {
      return;
    }

    this.unbindElement();
    this.audio = element;

    if (!element) {
      if (this.snapshot.isPlaying) {
        this.patch({ isPlaying: false });
      }
      return;
    }

    element.addEventListener('timeupdate', this.onTimeUpdate);
    element.addEventListener('play', this.onPlay);
    element.addEventListener('pause', this.onPause);
    element.addEventListener('ended', this.onEnded);
    element.addEventListener('loadedmetadata', this.onLoadedMetadata);
    element.addEventListener('error', this.onError);

    const isPlaying = !element.paused;
    if (this.snapshot.isPlaying !== isPlaying) {
      this.patch({ isPlaying });
    }

    const restoreMs = this.pendingSeekMs ?? this.snapshot.currentMs;
    if (restoreMs > 0 || this.pendingSeekMs !== null) {
      void this.ensureSeekTo(restoreMs);
    }
  }

  private unbindElement(): void {
    const element = this.audio;
    if (!element) {
      return;
    }
    element.removeEventListener('timeupdate', this.onTimeUpdate);
    element.removeEventListener('play', this.onPlay);
    element.removeEventListener('pause', this.onPause);
    element.removeEventListener('ended', this.onEnded);
    element.removeEventListener('loadedmetadata', this.onLoadedMetadata);
    element.removeEventListener('error', this.onError);
  }

  private patch(partial: Partial<StoryAudioSnapshot>): void {
    const next: StoryAudioSnapshot = { ...this.snapshot, ...partial };
    if (
      next.currentMs === this.snapshot.currentMs &&
      next.isPlaying === this.snapshot.isPlaying &&
      next.durationMs === this.snapshot.durationMs &&
      next.loadError === this.snapshot.loadError &&
      next.segmentPreview === this.snapshot.segmentPreview
    ) {
      return;
    }
    this.snapshot = next;
    for (const listener of this.subscribers) {
      listener();
    }
  }

  private readElementMs(): number {
    const element = this.audio;
    if (!element) {
      return 0;
    }
    return Math.round(element.currentTime * 1000);
  }

  private isAtTargetMs(targetMs: number): boolean {
    return Math.abs(this.readElementMs() - targetMs) <= SEEK_TOLERANCE_MS;
  }

  private waitForEvent(eventName: string, timeoutMs: number): Promise<void> {
    const element = this.audio;
    if (!element) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let settled = false;
      const finish = (): void => {
        if (settled) {
          return;
        }
        settled = true;
        element.removeEventListener(eventName, finish);
        resolve();
      };
      element.addEventListener(eventName, finish, { once: true });
      globalThis.setTimeout(finish, timeoutMs);
    });
  }

  private waitForMetadata(): Promise<void> {
    const element = this.audio;
    if (!element || element.readyState >= HAVE_METADATA) {
      return Promise.resolve();
    }
    return this.waitForEvent('loadedmetadata', 5000);
  }

  /** 确保 audio 元素真正 seek 到目标位置后再继续（避免 seeked 在旧位置触发就 play）。 */
  ensureSeekTo(ms: number): Promise<boolean> {
    const element = this.audio;
    const clampedMs = Math.max(0, Math.round(ms));
    if (!element) {
      this.pendingSeekMs = clampedMs;
      this.patch({ currentMs: clampedMs });
      return Promise.resolve(false);
    }

    this.pendingSeekMs = clampedMs;

    return this.waitForMetadata().then(async () => {
      for (let attempt = 0; attempt < MAX_SEEK_ATTEMPTS; attempt += 1) {
        element.currentTime = clampedMs / 1000;
        await this.waitForEvent('seeked', 150);

        if (this.isAtTargetMs(clampedMs)) {
          this.pendingSeekMs = null;
          return true;
        }

        await this.waitForEvent('canplay', 200);
      }

      this.pendingSeekMs = null;
      return this.isAtTargetMs(clampedMs);
    });
  }

  private applySeek(ms: number): void {
    const clampedMs = Math.max(0, Math.round(ms));
    this.patch({ currentMs: clampedMs });
    void this.ensureSeekTo(clampedMs);
  }

  private playAfterSeek(startMs: number, syncSlider: boolean): void {
    const element = this.audio;
    if (!element) {
      return;
    }

    const clampedMs = Math.max(0, Math.round(startMs));
    if (syncSlider) {
      this.patch({ currentMs: clampedMs });
    }

    void this.ensureSeekTo(clampedMs).then((seeked) => {
      if (!seeked && !this.isAtTargetMs(clampedMs)) {
        element.currentTime = clampedMs / 1000;
      }
      void element.play();
    });
  }

  private finishSegmentPreview(): void {
    const element = this.audio;
    const restoreMs = this.frozenGlobalMs;
    this.segmentEndMs = null;
    this.segmentPreview = null;
    this.frozenGlobalMs = null;
    this.patch({ segmentPreview: null, isPlaying: false });

    if (element && restoreMs !== null) {
      void this.ensureSeekTo(restoreMs);
    }
  }

  private onTimeUpdate = (): void => {
    const element = this.audio;
    if (!element || this.isScrubbing) {
      return;
    }

    const ms = this.readElementMs();

    if (this.segmentEndMs !== null) {
      if (ms >= this.segmentEndMs) {
        element.pause();
        this.finishSegmentPreview();
      }
      return;
    }

    if (element.paused) {
      return;
    }

    this.patch({ currentMs: ms });
  };

  private onPlay = (): void => {
    this.patch({ isPlaying: true });
  };

  private onPause = (): void => {
    this.patch({ isPlaying: false });
  };

  private onEnded = (): void => {
    if (this.segmentEndMs !== null) {
      this.finishSegmentPreview();
      return;
    }
    this.patch({ isPlaying: false, segmentPreview: null });
  };

  private onLoadedMetadata = (): void => {
    if (this.pendingSeekMs !== null) {
      void this.ensureSeekTo(this.pendingSeekMs);
    }
  };

  private onError = (): void => {
    this.patch({ loadError: '主音频加载失败，请检查 assets 路径' });
  };

  seekToMs(ms: number): void {
    this.segmentEndMs = null;
    this.segmentPreview = null;
    this.frozenGlobalMs = null;
    this.patch({ segmentPreview: null });
    this.applySeek(ms);
  }

  seekToParagraphStart(startMs: number): void {
    const element = this.audio;
    if (element && !element.paused) {
      element.pause();
    }
    this.segmentEndMs = null;
    this.segmentPreview = null;
    this.frozenGlobalMs = null;
    this.patch({ segmentPreview: null });
    this.applySeek(startMs);
  }

  beginScrub(): void {
    this.isScrubbing = true;
    this.segmentEndMs = null;
    this.segmentPreview = null;
    this.frozenGlobalMs = null;
    this.patch({ segmentPreview: null });
    const element = this.audio;
    if (element && !element.paused) {
      element.pause();
    }
  }

  endScrub(ms: number): void {
    this.isScrubbing = false;
    this.applySeek(ms);
  }

  scrubToMs(ms: number): void {
    this.patch({ currentMs: Math.max(0, Math.round(ms)) });
    if (!this.isScrubbing) {
      void this.ensureSeekTo(ms);
    }
  }

  togglePlayPause(fromMs?: number): void {
    const element = this.audio;
    if (!element) {
      return;
    }

    if (!element.paused) {
      element.pause();
      if (this.segmentEndMs !== null) {
        this.finishSegmentPreview();
      }
      return;
    }

    this.segmentEndMs = null;
    this.segmentPreview = null;
    this.frozenGlobalMs = null;
    this.patch({ segmentPreview: null });

    const startMs = fromMs ?? this.snapshot.currentMs;
    this.playAfterSeek(startMs, true);
  }

  getPlaybackMs(): number | null {
    if (this.segmentEndMs !== null) {
      return this.snapshot.currentMs;
    }
    const element = this.audio;
    if (!element) {
      return this.snapshot.currentMs;
    }
    return this.readElementMs();
  }

  toggleSegmentPreview(startMs: number, endMs: number): void {
    const element = this.audio;
    if (!element) {
      return;
    }

    const clampedStart = Math.max(0, Math.round(startMs));
    const clampedEnd = Math.max(clampedStart, Math.round(endMs));
    const active = this.segmentPreview;
    const isSame =
      active !== null && active.startMs === clampedStart && active.endMs === clampedEnd;

    if (isSame && !element.paused) {
      element.pause();
      this.finishSegmentPreview();
      return;
    }

    if (!element.paused) {
      element.pause();
    }

    this.frozenGlobalMs = this.snapshot.currentMs;
    this.segmentEndMs = clampedEnd;
    this.segmentPreview = { startMs: clampedStart, endMs: clampedEnd };
    this.patch({ segmentPreview: { startMs: clampedStart, endMs: clampedEnd } });
    this.playAfterSeek(clampedStart, false);
  }
}
