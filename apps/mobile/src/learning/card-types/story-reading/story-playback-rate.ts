export const STORY_PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2] as const;

export type StoryPlaybackRate = (typeof STORY_PLAYBACK_RATES)[number];

export function cycleStoryPlaybackRate(rate: StoryPlaybackRate): StoryPlaybackRate {
  const index = STORY_PLAYBACK_RATES.indexOf(rate);
  const nextIndex = index < 0 ? 0 : (index + 1) % STORY_PLAYBACK_RATES.length;
  return STORY_PLAYBACK_RATES[nextIndex] ?? 1;
}

export function storyPlaybackRateLabel(rate: StoryPlaybackRate): string {
  if (Number.isInteger(rate)) {
    return `${String(rate)}×`;
  }
  return `${String(rate)}×`;
}

export function storyPlaybackRateAccessibilityLabel(rate: StoryPlaybackRate): string {
  return `播放语速 ${storyPlaybackRateLabel(rate)}`;
}
