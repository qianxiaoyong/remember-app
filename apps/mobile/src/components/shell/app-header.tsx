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
  onMarketPress?: () => void;
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
    onMarketPress,
    onBackPress,
    onMorePress,
    centerContent,
  } = props;
  const onGradient = tone === 'onGradient';

  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {variant === 'shell' && onMenuPress && onGradient ? (
          <HeaderIconButton accessibilityLabel="菜单" onPress={onMenuPress}>
            <MenuIcon color={colors.surface} size="sm" />
          </HeaderIconButton>
        ) : null}
        {variant === 'shell' && onMenuPress && !onGradient ? (
          <CircleIconButton accessibilityLabel="菜单" onPress={onMenuPress}>
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
        {variant === 'shell' ? (
          <View style={styles.rightActions}>
            {onSearchPress ? (
              onGradient ? (
                <HeaderIconButton accessibilityLabel="搜索" onPress={onSearchPress}>
                  <SearchIcon color={colors.surface} size="sm" />
                </HeaderIconButton>
              ) : (
                <CircleIconButton accessibilityLabel="搜索" onPress={onSearchPress}>
                  <SearchIcon size="sm" />
                </CircleIconButton>
              )
            ) : null}
            {onMarketPress ? (
              <MarketCapsuleButton
                label="选书"
                onPress={onMarketPress}
                tone={onGradient ? 'onGradient' : 'default'}
              />
            ) : null}
          </View>
        ) : null}
        {variant === 'back' && onSearchPress ? (
          <HeaderIconButton accessibilityLabel="搜索" onPress={onSearchPress}>
            <SearchIcon size="sm" />
          </HeaderIconButton>
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

function MarketCapsuleButton(props: {
  label: string;
  onPress: () => void;
  tone: 'default' | 'onGradient';
}): ReactElement {
  const onGradient = props.tone === 'onGradient';
  const iconColor = onGradient ? colors.surface : colors.textPrimary;
  const textColor = onGradient ? colors.surface : colors.textPrimary;

  return (
    <Pressable
      accessibilityLabel={props.label}
      accessibilityRole="button"
      hitSlop={4}
      onPress={props.onPress}
      style={[styles.marketCapsule, onGradient ? styles.marketCapsuleOnGradient : null]}
    >
      <AppIcon color={iconColor} name="folder-outline" size="sm" />
      <Text style={[styles.marketCapsuleLabel, { color: textColor }]}>{props.label}</Text>
    </Pressable>
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
  rightActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
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
  marketCapsule: {
    alignItems: 'center',
    backgroundColor: colors.statTileBackground,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 4,
    minHeight: 32,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  marketCapsuleOnGradient: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  marketCapsuleLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
