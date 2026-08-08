import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

export type PackCoverBadgeSize = 'xs' | 'sm' | 'md';

interface PackCoverBadgeProps {
  label: string;
  size: PackCoverBadgeSize;
}

const BADGE_METRICS: Record<
  PackCoverBadgeSize,
  {
    fontSize: number;
    lineHeight: number;
    paddingHorizontal: number;
    paddingVertical: number;
    fontWeight: '400' | '700';
  }
> = {
  xs: { fontSize: 8, lineHeight: 10, paddingHorizontal: 4, paddingVertical: 1, fontWeight: '400' },
  sm: { fontSize: 9, lineHeight: 12, paddingHorizontal: 6, paddingVertical: 2, fontWeight: '400' },
  md: { fontSize: 11, lineHeight: 14, paddingHorizontal: 8, paddingVertical: 3, fontWeight: '700' },
};

export function PackCoverBadge(props: PackCoverBadgeProps): ReactElement | null {
  const label = props.label.trim();
  if (!label) {
    return null;
  }

  const metrics = BADGE_METRICS[props.size];

  return (
    <View
      style={[
        styles.chip,
        {
          paddingHorizontal: metrics.paddingHorizontal,
          paddingVertical: metrics.paddingVertical,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            fontSize: metrics.fontSize,
            fontWeight: metrics.fontWeight,
            lineHeight: metrics.lineHeight,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 999,
    zIndex: 1,
  },
  label: {
    color: colors.surface,
  },
});
