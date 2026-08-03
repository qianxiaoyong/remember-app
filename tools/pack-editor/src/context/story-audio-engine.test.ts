import { describe, expect, it, vi } from 'vitest';
import { StoryAudioEngine } from './story-audio-engine.js';

function createMockAudio(initial: { currentTime?: number; paused?: boolean; readyState?: number }) {
  let currentTime = initial.currentTime ?? 0;
  const listeners = new Map<string, Set<(event: Event) => void>>();

  const audio = {
    readyState: initial.readyState ?? 1,
    paused: initial.paused ?? true,
    get currentTime() {
      return currentTime;
    },
    set currentTime(value: number) {
      currentTime = value;
    },
    addEventListener(type: string, listener: (event: Event) => void) {
      const set = listeners.get(type) ?? new Set();
      set.add(listener);
      listeners.set(type, set);
    },
    removeEventListener(type: string, listener: (event: Event) => void) {
      listeners.get(type)?.delete(listener);
    },
    dispatchEvent(type: string) {
      const event = new Event(type);
      listeners.get(type)?.forEach((listener) => {
        listener(event);
      });
      return true;
    },
    play: vi.fn().mockImplementation(() => {
      audio.paused = false;
      return Promise.resolve();
    }),
  };

  return audio;
}

describe('StoryAudioEngine', () => {
  it('bindElement 后 seek 更新 currentMs', async () => {
    const engine = new StoryAudioEngine();
    const audio = createMockAudio({ currentTime: 0 });

    engine.bindElement(audio as unknown as HTMLAudioElement);
    engine.seekToParagraphStart(45682);
    audio.dispatchEvent('seeked');
    await Promise.resolve();

    expect(engine.getSnapshot().currentMs).toBe(45682);
    expect(audio.currentTime).toBeCloseTo(45.682, 3);
  });

  it('暂停时不被 timeupdate 覆盖 seek 结果', () => {
    const engine = new StoryAudioEngine();
    const audio = createMockAudio({ currentTime: 0.7, paused: true });

    engine.bindElement(audio as unknown as HTMLAudioElement);
    engine.seekToParagraphStart(45682);

    audio.dispatchEvent('timeupdate');

    expect(engine.getSnapshot().currentMs).toBe(45682);
  });

  it('seek 不因 element.currentTime 读回旧值而回退', () => {
    const engine = new StoryAudioEngine();
    const storedTime = 1.8;
    const audio = createMockAudio({ paused: true });
    Object.defineProperty(audio, 'currentTime', {
      configurable: true,
      get() {
        return storedTime;
      },
      set() {
        // 模拟 seek 尚未生效，读回仍是旧位置
      },
    });

    engine.bindElement(audio as unknown as HTMLAudioElement);
    engine.seekToParagraphStart(45682);

    expect(engine.getSnapshot().currentMs).toBe(45682);
  });

  it('toggleSegmentPreview 不移动全局滑块', async () => {
    const engine = new StoryAudioEngine();
    const audio = createMockAudio({ currentTime: 0, paused: true });

    engine.bindElement(audio as unknown as HTMLAudioElement);
    engine.scrubToMs(56900);
    engine.endScrub(56900);
    audio.dispatchEvent('seeked');
    await Promise.resolve();

    engine.toggleSegmentPreview(36373, 45682);
    audio.dispatchEvent('seeked');
    await new Promise((resolve) => {
      globalThis.setTimeout(resolve, 200);
    });

    expect(audio.play).toHaveBeenCalled();
    expect(engine.getSnapshot().currentMs).toBe(56900);
    expect(audio.currentTime).toBeCloseTo(36.373, 3);
  });

  it('togglePlayPause 使用传入的滑块位置播放', async () => {
    const engine = new StoryAudioEngine();
    const audio = createMockAudio({ currentTime: 0, paused: true });

    engine.bindElement(audio as unknown as HTMLAudioElement);
    engine.togglePlayPause(28500);
    audio.dispatchEvent('seeked');
    await new Promise((resolve) => {
      globalThis.setTimeout(resolve, 200);
    });

    expect(audio.play).toHaveBeenCalled();
    expect(engine.getSnapshot().currentMs).toBe(28500);
    expect(audio.currentTime).toBeCloseTo(28.5, 3);
  });
});
