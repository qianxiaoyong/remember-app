import type { ReactElement } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

export function PrimaryButton(props: PrimaryButtonProps): ReactElement {
  const variant = props.variant ?? 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={props.disabled || props.loading}
      onPress={props.onPress}
      style={[
        styles.button,
        variant === 'secondary' ? styles.secondary : styles.primary,
        props.disabled || props.loading ? styles.disabled : null,
      ]}
    >
      {props.loading ? (
        <ActivityIndicator color={variant === 'secondary' ? colors.textPrimary : colors.surface} />
      ) : (
        <Text style={[styles.label, variant === 'secondary' ? styles.secondaryLabel : null]}>
          {props.label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 12,
    minHeight: spacing.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryLabel: {
    color: colors.textPrimary,
  },
});
