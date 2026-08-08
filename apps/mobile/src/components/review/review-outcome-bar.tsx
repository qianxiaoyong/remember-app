import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ReviewOutcomeBarProps {
  disabled?: boolean;
  failedIntervalLabel?: string;
  onPassed: () => void;
  onFailed: () => void;
  passedIntervalLabel?: string;
}

export function ReviewOutcomeBar(props: ReviewOutcomeBarProps): ReactElement {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <Pressable
        accessibilityRole="button"
        disabled={props.disabled}
        onPress={props.onFailed}
        style={[styles.failedButton, props.disabled ? styles.disabled : null]}
      >
        <Text style={styles.failedLabel}>还不熟</Text>
        {props.failedIntervalLabel ? (
          <Text style={styles.failedInterval}>{props.failedIntervalLabel}</Text>
        ) : null}
      </Pressable>
      <Pressable
        accessibilityRole="button"
        disabled={props.disabled}
        onPress={props.onPassed}
        style={[styles.passedButton, props.disabled ? styles.disabled : null]}
      >
        <Text style={styles.passedLabel}>记住了</Text>
        {props.passedIntervalLabel ? (
          <Text style={styles.passedInterval}>{props.passedIntervalLabel}</Text>
        ) : null}
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
  failedButton: {
    alignItems: 'center',
    backgroundColor: '#FFF0ED',
    borderColor: colors.studyRatingForgot,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: spacing.xs,
  },
  passedButton: {
    alignItems: 'center',
    backgroundColor: colors.studyHeaderBackground,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: spacing.xs,
  },
  disabled: {
    opacity: 0.6,
  },
  failedLabel: {
    color: colors.studyRatingForgot,
    fontSize: 15,
    fontWeight: '700',
  },
  failedInterval: {
    color: colors.studyRatingForgot,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  passedLabel: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  passedInterval: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
});
