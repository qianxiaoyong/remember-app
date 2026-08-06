import type { ReactElement } from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ReviewSourcePackLabelProps {
  displayName: string;
}

export function ReviewSourcePackLabel(props: ReviewSourcePackLabelProps): ReactElement {
  return <Text style={styles.label}>来自《{props.displayName}》</Text>;
}

const styles = StyleSheet.create({
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
});
