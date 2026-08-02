import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StoryTier } from '@remember/contracts';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import type { TierStats } from './count-tier-stats';
import { formatTierLegend } from './count-tier-stats';
import { tierAccentColor, tierChipBackgrounds } from './tier-colors';

const TIERS: StoryTier[] = ['high', 'mid', 'low'];

interface TierLegendChipsProps {
  stats: TierStats;
}

export function TierLegendChips(props: TierLegendChipsProps): ReactElement {
  return (
    <View style={styles.row}>
      {TIERS.map((tier) => (
        <View
          key={tier}
          accessibilityLabel={formatTierLegend(props.stats, tier)}
          style={[styles.chip, { backgroundColor: tierChipBackgrounds[tier] }]}
        >
          <View style={[styles.dot, { backgroundColor: tierAccentColor(tier) }]} />
          <Text style={styles.label}>{formatTierLegend(props.stats, tier)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  dot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
});
