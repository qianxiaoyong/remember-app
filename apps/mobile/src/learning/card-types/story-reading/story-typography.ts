import { Platform } from 'react-native';

export const storyBodyFontSize = 16;
export const storyBodyLineHeight = 28;
export const storyParagraphGap = 20;
export const storyGlossFontSize = 13;

export const storyBodyFontFamily = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'serif',
});
