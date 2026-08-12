import type { ReactElement, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { cardShadow } from '../../theme/shadows';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface SurfaceCardProps {
  children: ReactNode;
  /** 首页等紧凑卡片：减小内边距。 */
  compact?: boolean;
  borderRadius?: number;
  contentPadding?: number;
}

export function SurfaceCard(props: SurfaceCardProps): ReactElement {
  return (
    <View
      style={[
        styles.card,
        props.compact ? styles.compact : null,
        props.borderRadius !== undefined ? { borderRadius: props.borderRadius } : null,
        props.contentPadding !== undefined ? { padding: props.contentPadding } : null,
      ]}
    >
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(32, 34, 40, 0.05)',
    borderRadius: spacing.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    ...cardShadow,
  },
  compact: {
    padding: spacing.sm,
  },
});
