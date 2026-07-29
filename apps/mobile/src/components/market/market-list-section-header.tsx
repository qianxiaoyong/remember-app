import type { ReactElement } from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../../theme/colors';

interface MarketListSectionHeaderProps {
  count: number;
}

export function MarketListSectionHeader(props: MarketListSectionHeaderProps): ReactElement {
  return <Text style={styles.count}>{props.count} 个资料</Text>;
}

const styles = StyleSheet.create({
  count: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
