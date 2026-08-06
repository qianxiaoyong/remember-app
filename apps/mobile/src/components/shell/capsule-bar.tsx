import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { countDueReviewItems } from '../../use-cases/count-due-review-items';
import { FolderTabIcon, HomeTabIcon, StarIcon } from '../ui/shell-icons';
import { colors } from '../../theme/colors';
import { capsuleShadow } from '../../theme/shadows';
import { spacing } from '../../theme/spacing';

export type CapsuleTab = 'library' | 'review' | 'market';

interface CapsuleBarProps {
  activeTab: CapsuleTab;
  onTabPress: (tab: CapsuleTab) => void;
}

export function CapsuleBar(props: CapsuleBarProps): ReactElement {
  const insets = useSafeAreaInsets();
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    setDueCount(countDueReviewItems());
  }, [props.activeTab]);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { bottom: insets.bottom + spacing.md }]}
    >
      <View style={styles.capsule}>
        <TabItem
          isActive={props.activeTab === 'library'}
          label="首页"
          onPress={() => {
            props.onTabPress('library');
          }}
          renderIcon={(active) => <HomeTabIcon active={active} />}
        />
        <ReviewTabButton
          badgeCount={dueCount}
          isActive={props.activeTab === 'review'}
          onPress={() => {
            props.onTabPress('review');
          }}
        />
        <TabItem
          isActive={props.activeTab === 'market'}
          label="资料"
          onPress={() => {
            props.onTabPress('market');
          }}
          renderIcon={(active) => <FolderTabIcon active={active} />}
        />
      </View>
    </View>
  );
}

function TabItem(props: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  renderIcon: (active: boolean) => ReactElement;
}): ReactElement {
  const tone = props.isActive ? colors.textPrimary : colors.tabInactive;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: props.isActive }}
      onPress={props.onPress}
      style={styles.item}
    >
      {props.renderIcon(props.isActive)}
      <Text style={[styles.itemLabel, { color: tone }]}>{props.label}</Text>
    </Pressable>
  );
}

function ReviewTabButton(props: {
  isActive: boolean;
  badgeCount: number;
  onPress: () => void;
}): ReactElement {
  return (
    <Pressable
      accessibilityLabel="复习"
      accessibilityRole="button"
      accessibilityState={{ selected: props.isActive }}
      onPress={props.onPress}
      style={styles.reviewItem}
    >
      <View style={styles.reviewCircle}>
        <StarIcon color={colors.surface} filled size="lg" />
        {props.badgeCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {props.badgeCount > 99 ? '99+' : String(props.badgeCount)}
            </Text>
          </View>
        ) : null}
      </View>
      <Text
        style={[
          styles.itemLabel,
          { color: props.isActive ? colors.textPrimary : colors.tabInactive },
        ]}
      >
        复习
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  capsule: {
    alignItems: 'flex-end',
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderColor: 'rgba(32, 34, 40, 0.05)',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    ...capsuleShadow,
  },
  item: {
    alignItems: 'center',
    gap: 2,
    justifyContent: 'flex-end',
    minHeight: 52,
    paddingHorizontal: spacing.md,
    width: 64,
  },
  itemLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  reviewItem: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: -18,
    width: 56,
  },
  reviewCircle: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
    ...capsuleShadow,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.studyRatingForgot,
    borderRadius: 10,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 4,
    position: 'absolute',
    right: -2,
    top: -2,
  },
  badgeText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '700',
  },
});
