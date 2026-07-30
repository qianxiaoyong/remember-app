import type { ReactElement } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface PackDetailActionBarProps {
  actionLabel: string;
  isBusy: boolean;
  priceLabel: string;
  purchaseHint: string;
  onActionPress: () => void;
}

export function PackDetailActionBar(props: PackDetailActionBarProps): ReactElement {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      <View style={styles.priceBlock}>
        <Text style={styles.purchaseHint}>{props.purchaseHint}</Text>
        <Text style={styles.price}>{props.priceLabel}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={props.isBusy}
        onPress={props.onActionPress}
        style={[styles.actionButton, props.isBusy ? styles.actionButtonDisabled : null]}
      >
        {props.isBusy ? (
          <ActivityIndicator color={colors.surface} />
        ) : (
          <Text style={styles.actionLabel}>{props.actionLabel}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  priceBlock: {
    flex: 1,
    gap: 2,
  },
  purchaseHint: {
    color: colors.textMuted,
    fontSize: 11,
  },
  price: {
    color: colors.price,
    fontSize: 22,
    fontWeight: '700',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.textPrimary,
    borderRadius: 24,
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 140,
    paddingHorizontal: spacing.xl,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionLabel: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});
