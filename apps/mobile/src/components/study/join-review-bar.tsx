import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface JoinReviewBarProps {
  inReviewPool: boolean;
  disabled?: boolean;
  onJoinReview: () => void;
  onOpenUpdateReview: () => void;
  onSkip: () => void;
}

export function JoinReviewBar(props: JoinReviewBarProps): ReactElement {
  const insets = useSafeAreaInsets();
  const skipLabel = props.inReviewPool ? '下一个词' : '不加复习';

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {props.inReviewPool ? (
        <Pressable
          accessibilityRole="button"
          disabled={props.disabled}
          onPress={props.onOpenUpdateReview}
          style={[styles.secondaryButton, props.disabled ? styles.disabled : null]}
        >
          <Text style={styles.secondaryLabel}>已加复习</Text>
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="button"
          disabled={props.disabled}
          onPress={props.onJoinReview}
          style={[styles.primaryButton, props.disabled ? styles.disabled : null]}
        >
          <Text style={styles.primaryLabel}>加入复习</Text>
        </Pressable>
      )}
      <Pressable
        accessibilityRole="button"
        disabled={props.disabled}
        onPress={props.onSkip}
        style={[styles.skipButton, props.disabled ? styles.disabled : null]}
      >
        <Text style={styles.skipLabel}>{skipLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.studyHeaderBackground,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: spacing.xs,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.studyHeaderBackground,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: spacing.xs,
  },
  skipButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: spacing.xs,
  },
  disabled: {
    opacity: 0.6,
  },
  primaryLabel: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryLabel: {
    color: colors.studyHeaderBackground,
    fontSize: 15,
    fontWeight: '700',
  },
  skipLabel: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
});
