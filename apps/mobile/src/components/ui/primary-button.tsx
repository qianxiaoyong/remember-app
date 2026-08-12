import type { ReactElement } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'surface';
  borderRadius?: number;
}

export function PrimaryButton(props: PrimaryButtonProps): ReactElement {
  const variant = props.variant ?? 'primary';
  const borderRadius = props.borderRadius ?? 12;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={(props.disabled ?? false) || (props.loading ?? false)}
      onPress={props.onPress}
      style={[
        styles.button,
        { borderRadius },
        variant === 'secondary'
          ? styles.secondary
          : variant === 'surface'
            ? styles.surface
            : styles.primary,
        props.disabled || props.loading ? styles.disabled : null,
      ]}
    >
      {props.loading ? (
        <ActivityIndicator
          color={
            variant === 'secondary' || variant === 'surface' ? colors.textPrimary : colors.surface
          }
        />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'secondary' ? styles.secondaryLabel : null,
            variant === 'surface' ? styles.surfaceLabel : null,
          ]}
        >
          {props.label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
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
  surface: {
    backgroundColor: colors.surface,
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
  surfaceLabel: {
    color: colors.accent,
  },
});
