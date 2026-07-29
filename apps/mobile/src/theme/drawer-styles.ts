import type { ViewStyle } from 'react-native';
import { Platform, StatusBar, StyleSheet } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';
import { cardShadow } from './shadows';
import { colors } from './colors';

export const drawerBlockRadius = 12;

/** 状态栏安全区之下、抽屉内容顶部的额外留白（dp） */
export const drawerAccountHeaderTopPadding = 48;

/** Android 状态栏高度保底（insets 为 0 时的兜底） */
export const drawerAndroidStatusBarMin = 44;

export function resolveDrawerTopInset(insetsTop: number): number {
  const bootInset = initialWindowMetrics?.insets.top ?? 0;
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  return Math.max(insetsTop, bootInset, statusBarHeight, drawerAndroidStatusBarMin);
}

/** 抽屉内容区距屏幕顶部的内边距（状态栏 + 账号区留白） */
export function drawerContentPaddingTop(insetsTop: number): number {
  return resolveDrawerTopInset(insetsTop) + drawerAccountHeaderTopPadding;
}

export const drawerCardStyle: ViewStyle = {
  backgroundColor: colors.surface,
  borderColor: 'rgba(32, 34, 40, 0.05)',
  borderRadius: drawerBlockRadius,
  borderWidth: StyleSheet.hairlineWidth,
  overflow: 'hidden',
  ...cardShadow,
};
