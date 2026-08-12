import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatLearningCount } from '../../use-cases/get-library-overview';
import { colors } from '../../theme/colors';

interface LibrarySectionHeaderProps {
  totalCards: number;
}

export function LibrarySectionHeader(props: LibrarySectionHeaderProps): ReactElement {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>已安装资料</Text>
      <Text style={styles.totalLabel}>共 {formatLearningCount(props.totalCards)} 条</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  totalLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
});
