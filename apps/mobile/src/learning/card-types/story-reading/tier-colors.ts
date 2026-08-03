import type { StoryTier } from '@remember/contracts';
import { colors } from '../../../theme/colors';

export const tierChipBackgrounds: Record<StoryTier, string> = {
  high: '#FCE4E1',
  mid: '#E0EBFA',
  low: '#DCF0E3',
};

export function tierAccentColor(tier: StoryTier): string {
  if (tier === 'high') {
    return colors.studyRatingForgot;
  }
  if (tier === 'mid') {
    return '#5A8FD4';
  }
  return colors.studyRatingGood;
}

export function tierWordColorStyle(tier: StoryTier): { color: string } {
  return { color: tierAccentColor(tier) };
}

export const storyFollowAlongTextColor = colors.accent;
