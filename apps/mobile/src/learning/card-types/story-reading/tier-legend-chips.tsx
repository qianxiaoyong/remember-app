import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StoryTier } from '@remember/contracts';
import { colors } from '../../../theme/colors';
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
          <Text numberOfLines={1} style={styles.label}>
            {formatTierLegend(props.stats, tier)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 4,
  },
  chip: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    flexShrink: 0,
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '500',
  },
});
