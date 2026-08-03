import type { StoryLegendTier, StoryTier } from '@remember/contracts';
import { colors } from '../../../theme/colors';

export const tierChipBackgrounds: Record<StoryLegendTier, string> = {
  high: '#FCE4E1',
  mid: '#E0EBFA',
  low: '#DCF0E3',
};

export function tierAccentColor(tier: StoryTier): string {
  if (tier === 'normal') {
    return colors.border;
  }
  if (tier === 'high') {
    return colors.studyRatingForgot;
  }
  if (tier === 'mid') {
    return '#5A8FD4';
  }
  return colors.studyRatingGood;
}

export function tierWordColorStyle(tier: StoryTier): {
  color?: string;
  fontWeight?: '400' | '600';
} {
  if (tier === 'normal') {
    return { fontWeight: '400' };
  }
  return { color: tierAccentColor(tier), fontWeight: '600' };
}

export const storyFollowAlongTextColor = colors.accent;
