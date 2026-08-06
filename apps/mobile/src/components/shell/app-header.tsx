import type { ReactElement, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CircleIconButton } from '../ui/circle-icon-button';
import { BackChevronIcon, MenuIcon, SearchIcon } from '../ui/shell-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export type AppHeaderVariant = 'shell' | 'back' | 'study';

interface AppHeaderProps {
  variant: AppHeaderVariant;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  onBackPress?: () => void;
  onMorePress?: () => void;
  centerContent?: ReactNode;
}

export function AppHeader(props: AppHeaderProps): ReactElement {
  const { variant, onMenuPress, onSearchPress, onBackPress, onMorePress, centerContent } = props;

  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {variant === 'shell' ? (
          <CircleIconButton
            accessibilityLabel="菜单"
            {...(onMenuPress ? { onPress: onMenuPress } : {})}
          >
            <MenuIcon size="sm" />
          </CircleIconButton>
        ) : null}
        {variant === 'back' ? (
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
