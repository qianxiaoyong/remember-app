import type { ReactElement, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CircleIconButton } from '../ui/circle-icon-button';
import { HeaderIconButton } from '../ui/header-icon-button';
import { AppIcon } from '../ui/app-icon';
import { BackChevronIcon, MenuIcon, SearchIcon } from '../ui/shell-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export type AppHeaderVariant = 'shell' | 'back' | 'study';

interface AppHeaderProps {
  variant: AppHeaderVariant;
  /** 无背景圆形底，与学习页顶栏返回一致 */
  plainBack?: boolean;
  /** 渐变顶栏：透明底 + 白色图标 */
  tone?: 'default' | 'onGradient';
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  onBackPress?: () => void;
  onMorePress?: () => void;
  centerContent?: ReactNode;
}

export function AppHeader(props: AppHeaderProps): ReactElement {
  const {
    variant,
    plainBack,
    tone = 'default',
    onMenuPress,
    onSearchPress,
    onBackPress,
    onMorePress,
    centerContent,
  } = props;
  const onGradient = tone === 'onGradient';

  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {variant === 'shell' && onGradient ? (
          <HeaderIconButton
            accessibilityLabel="菜单"
            {...(onMenuPress ? { onPress: onMenuPress } : {})}
          >
            <MenuIcon color={colors.surface} size="sm" />
          </HeaderIconButton>
        ) : null}
        {variant === 'shell' && !onGradient ? (
          <CircleIconButton
            accessibilityLabel="菜单"
            {...(onMenuPress ? { onPress: onMenuPress } : {})}
          >
            <MenuIcon size="sm" />
          </CircleIconButton>
        ) : null}
        {variant === 'back' && plainBack ? (
          <HeaderIconButton
            accessibilityLabel="返回"
            {...(onBackPress ? { onPress: onBackPress } : {})}
          >
            <AppIcon color={colors.textPrimary} name="chevron-back" size="sm" />
          </HeaderIconButton>
        ) : null}
        {variant === 'back' && !plainBack ? (
          <CircleIconButton
            accessibilityLabel="返回"
            {...(onBackPress ? { onPress: onBackPress } : {})}
          >
            <BackChevronIcon size="sm" />
          </CircleIconButton>
        ) : null}
      </View>

      <View style={styles.center}>{centerContent}</View>

      <View style={[styles.side, styles.right]}>
        {variant === 'shell' && onGradient ? (
          <HeaderIconButton
            accessibilityLabel="搜索"
            {...(onSearchPress ? { onPress: onSearchPress } : {})}
          >
            <SearchIcon color={colors.surface} size="sm" />
          </HeaderIconButton>
        ) : null}
        {variant === 'shell' && !onGradient ? (
          <CircleIconButton
            accessibilityLabel="搜索"
            {...(onSearchPress ? { onPress: onSearchPress } : {})}
          >
            <SearchIcon size="sm" />
          </CircleIconButton>
        ) : null}
        {variant === 'study' ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={onMorePress ?? (() => undefined)}
            style={styles.moreButton}
          >
            <Text style={styles.moreLabel}>更多</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: spacing.touchTarget,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  side: {
    minWidth: 44,
  },
  right: {
    alignItems: 'flex-end',
  },
  center: {
    alignItems: 'center',
    flex: 1,
  },
  moreButton: {
    minHeight: spacing.touchTarget,
    justifyContent: 'center',
  },
  moreLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
});
