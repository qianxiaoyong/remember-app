import { describe, expect, it } from 'vitest';
import {
  cycleStoryLoopMode,
  resolveLoopSeekMs,
  storyLoopModeLabel,
} from './story-loop-mode.js';

const paragraphs = [
  { runs: [{ kind: 'text' as const, text: 'A' }], audioStartMs: 0, audioEndMs: 1000 },
  { runs: [{ kind: 'text' as const, text: 'B' }], audioStartMs: 1000, audioEndMs: 2500 },
];

describe('story-loop-mode', () => {
  it('cycleStoryLoopMode 在三种模式间轮换', () => {
    expect(cycleStoryLoopMode('none')).toBe('paragraph');
    expect(cycleStoryLoopMode('paragraph')).toBe('lesson');
    expect(cycleStoryLoopMode('lesson')).toBe('none');
  });

  it('storyLoopModeLabel 返回短标签', () => {
    expect(storyLoopModeLabel('none')).toBe('关');
    expect(storyLoopModeLabel('paragraph')).toBe('段');
    expect(storyLoopModeLabel('lesson')).toBe('篇');
  });

  it('本篇循环在接近结尾时回到 0', () => {
    expect(
      resolveLoopSeekMs({
        mode: 'lesson',
        positionMs: 9950,
        durationMs: 10000,
        paragraphs,
      }),
    ).toBe(0);
  });

  it('本段循环在段末回到段起点', () => {
    expect(
      resolveLoopSeekMs({
        mode: 'paragraph',
        positionMs: 990,
        durationMs: 10000,
        paragraphs,
      }),
    ).toBe(0);
    expect(
      resolveLoopSeekMs({
        mode: 'paragraph',
        positionMs: 2400,
        durationMs: 10000,
        paragraphs,
      }),
    ).toBe(1000);
  });

  it('不循环时不 seek', () => {
    expect(
      resolveLoopSeekMs({
        mode: 'none',
        positionMs: 9990,
        durationMs: 10000,
        paragraphs,
      }),
    ).toBeNull();
  });
});
