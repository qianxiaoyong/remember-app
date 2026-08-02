import type { StoryTier } from '@remember/contracts';
import { colors } from '../../../theme/colors';

export const tierBackgroundColors: Record<StoryTier, string> = {
  high: '#FAD4D0',
  mid: '#D4E4FA',
  low: '#D4F0DC',
};

export const tierLegendLabels: Record<StoryTier, string> = {
  high: '红:高频',
  mid: '蓝:中频',
  low: '绿:低频',
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
