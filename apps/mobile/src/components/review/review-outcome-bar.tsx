import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ReviewOutcomeBarProps {
  disabled?: boolean;
  onPassed: () => void;
  onFailed: () => void;
}

export function ReviewOutcomeBar(props: ReviewOutcomeBarProps): ReactElement {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      <Pressable
        accessibilityRole="button"
        disabled={props.disabled}
        onPress={props.onFailed}
        style={[styles.failedButton, props.disabled ? styles.disabled : null]}
      >
        <Text style={styles.failedLabel}>还不熟</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        disabled={props.disabled}
        onPress={props.onPassed}
        style={[styles.passedButton, props.disabled ? styles.disabled : null]}
      >
        <Text style={styles.passedLabel}>记住了</Text>
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
  failedButton: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
  },
  passedButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
  },
  disabled: {
    opacity: 0.6,
  },
  failedLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  passedLabel: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});
