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

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
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
        style={[styles.ghostButton, props.disabled ? styles.disabled : null]}
      >
        <Text style={styles.ghostLabel}>暂不</Text>
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
    paddingTop: spacing.md,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.accent,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
  },
  ghostButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  disabled: {
    opacity: 0.6,
  },
  primaryLabel: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryLabel: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  ghostLabel: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
});
