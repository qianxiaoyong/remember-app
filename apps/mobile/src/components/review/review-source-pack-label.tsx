import type { ReactElement } from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../../theme/colors';

interface ReviewSourcePackLabelProps {
  displayName: string;
}

export function formatReviewSourcePackLabel(displayName: string): string {
  return `来自《${displayName}》`;
}

export function ReviewSourcePackLabel(props: ReviewSourcePackLabelProps): ReactElement {
  return <Text style={styles.label}>{formatReviewSourcePackLabel(props.displayName)}</Text>;
}

const styles = StyleSheet.create({
  label: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
