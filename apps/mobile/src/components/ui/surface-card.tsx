import type { ReactElement, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { cardShadow } from '../../theme/shadows';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface SurfaceCardProps {
  children: ReactNode;
}

export function SurfaceCard(props: SurfaceCardProps): ReactElement {
  return <View style={styles.card}>{props.children}</View>;
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
});
