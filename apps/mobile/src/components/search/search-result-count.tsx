import type { ReactElement } from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface SearchResultCountProps {
  count: number;
  label: string;
}

export function SearchResultCount(props: SearchResultCountProps): ReactElement {
  return (
    <Text style={styles.label}>
      {props.label} ({props.count})
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
});
