import { colors } from './colors';

const baseScreenOptions = {
  contentStyle: {
    backgroundColor: colors.background,
  },
  headerShown: false,
  /** 使用 card 避免 modal 在 Android 上的放大缩放效果 */
  presentation: 'card' as const,
};

/** 首页 ↔ 资料：左右滑入（具体方向由 shell-tab-transition 决定） */
export const shellTabScreenOptions = {
  ...baseScreenOptions,
  animation: 'slide_from_right' as const,
};

/** 搜索页：从左侧滑入 */
export const searchScreenOptions = {
  ...baseScreenOptions,
  animation: 'slide_from_left' as const,
};
