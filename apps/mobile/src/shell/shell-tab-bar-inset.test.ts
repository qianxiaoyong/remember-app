import { describe, expect, it } from 'vitest';
import { resolveShellTabBarInset } from './shell-tab-bar-inset';
import { spacing } from '../theme/spacing';

describe('resolveShellTabBarInset', () => {
  it('includes tab bar height and minimum bottom padding', () => {
    expect(resolveShellTabBarInset(0)).toBe(spacing.sm + spacing.tabBarHeight + spacing.sm);
  });

  it('uses larger safe area inset when present', () => {
    expect(resolveShellTabBarInset(34)).toBe(spacing.sm + spacing.tabBarHeight + 34);
  });
});
