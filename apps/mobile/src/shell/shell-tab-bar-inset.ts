import { spacing } from '../theme/spacing';

/** 与 ShellTabBar 布局一致：顶内边距 + 项高 + 底安全区。 */
export function resolveShellTabBarInset(bottomSafeInset: number): number {
  return spacing.sm + spacing.tabBarHeight + Math.max(bottomSafeInset, spacing.sm);
}
