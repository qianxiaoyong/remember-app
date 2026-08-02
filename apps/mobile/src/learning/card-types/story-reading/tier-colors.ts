import type { StoryTier } from '@remember/contracts';
import { colors } from '../../../theme/colors';

/** 正文注释词：轻量底色，避免整块抢视线 */
export const tierBackgroundColors: Record<StoryTier, string> = {
  high: '#FDEEEC',
  mid: '#EBF2FC',
  low: '#E8F6EC',
};

/** 词频图例 chip 底色（略深于正文高亮） */
export const tierChipBackgrounds: Record<StoryTier, string> = {
  high: '#FCE4E1',
  mid: '#E0EBFA',
  low: '#DCF0E3',
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
