import { describe, expect, it } from 'vitest';
import {
  cycleStoryPlaybackRate,
  storyPlaybackRateLabel,
  type StoryPlaybackRate,
} from './story-playback-rate.js';

describe('story-playback-rate', () => {
  it('cycleStoryPlaybackRate 在预设语速间轮换', () => {
    expect(cycleStoryPlaybackRate(0.75)).toBe(1);
    expect(cycleStoryPlaybackRate(1)).toBe(1.25);
    expect(cycleStoryPlaybackRate(1.25)).toBe(1.5);
    expect(cycleStoryPlaybackRate(1.5)).toBe(2);
    expect(cycleStoryPlaybackRate(2)).toBe(0.75);
  });

  it('storyPlaybackRateLabel 显示倍速', () => {
    expect(storyPlaybackRateLabel(1)).toBe('1×');
    expect(storyPlaybackRateLabel(1.25)).toBe('1.25×');
  });

  it('未知语速从 0.75 开始', () => {
    expect(cycleStoryPlaybackRate(999 as StoryPlaybackRate)).toBe(0.75);
  });
});
