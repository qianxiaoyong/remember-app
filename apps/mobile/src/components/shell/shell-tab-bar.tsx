import type { ReactElement } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReviewTabBadge } from '../../hooks/use-review-tab-badge';
import type { ShellTab } from '../../shell/shell-tab-transition';
import { StudyTabIcon, ProfileTabIcon, RecordTabIcon, ReviewTabIcon } from '../ui/shell-tab-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ShellTabBarProps {
  activeTab: ShellTab;
  onTabPress: (tab: ShellTab) => void;
}

const TAB_CONFIG: { tab: ShellTab; label: string }[] = [
  { tab: 'library', label: '学习' },
  { tab: 'review', label: '复习' },
  { tab: 'record', label: '记录' },
  { tab: 'profile', label: '我的' },
];

export function ShellTabBar(props: ShellTabBarProps): ReactElement {
  const insets = useSafeAreaInsets();
  const reviewBadge = useReviewTabBadge();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}
    >
      <View style={styles.bar}>
        {TAB_CONFIG.map(({ tab, label }) => (
          <TabItem
            badgeCount={tab === 'review' ? reviewBadge : 0}
            isActive={props.activeTab === tab}
            key={tab}
            label={label}
            onPress={() => {
              props.onTabPress(tab);
            }}
            renderIcon={(active) => {
              if (tab === 'library') {
                return <StudyTabIcon active={active} />;
              }
              if (tab === 'review') {
                return <ReviewTabIcon active={active} />;
              }
              if (tab === 'record') {
                return <RecordTabIcon active={active} />;
              }
              return <ProfileTabIcon active={active} />;
            }}
          />
        ))}
      </View>
    </View>
  );
}

function TabItem(props: {
  label: string;
  isActive: boolean;
  badgeCount: number;
  onPress: () => void;
  renderIcon: (active: boolean) => ReactElement;
}): ReactElement {
  const tone = props.isActive ? colors.tabActive : colors.tabInactive;
  const showBadge = props.badgeCount > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: props.isActive }}
      onPress={props.onPress}
      style={styles.item}
    >
      <View style={styles.iconWrap}>
        {props.renderIcon(props.isActive)}
        {showBadge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{formatBadgeCount(props.badgeCount)}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.itemLabel, { color: tone }]}>{props.label}</Text>
    </Pressable>
  );
}

function formatBadgeCount(count: number): string {
  if (count > 99) {
    return '99+';
  }
  return String(count);
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 50,
    ...(Platform.OS === 'android' ? { elevation: 50 } : null),
  },
  bar: {
    flexDirection: 'row',
    paddingTop: spacing.xs,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: 1,
    justifyContent: 'center',
    minHeight: spacing.tabBarHeight,
    paddingHorizontal: spacing.xs,
  },
  iconWrap: {
    alignItems: 'center',
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  itemLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.price,
    borderRadius: 7,
    height: 14,
    justifyContent: 'center',
    minWidth: 14,
    paddingHorizontal: 3,
    position: 'absolute',
    right: -6,
    top: -2,
  },
  badgeText: {
    color: colors.surface,
    fontSize: 9,
    fontWeight: '700',
    includeFontPadding: false,
    lineHeight: 12,
  },
});
