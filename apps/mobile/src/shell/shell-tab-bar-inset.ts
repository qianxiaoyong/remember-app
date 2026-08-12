import { spacing } from '../theme/spacing';

/** 与 ShellTabBar 布局一致：bar.paddingTop + 项高 + wrapper.paddingBottom。 */
export function resolveShellTabBarInset(bottomSafeInset: number): number {
  return spacing.xs + spacing.tabBarHeight + Math.max(bottomSafeInset, spacing.sm);
}
