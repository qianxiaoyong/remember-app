import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MenuIcon } from '../ui/shell-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export function LibrarySectionHeader(): ReactElement {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>已安装资料</Text>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.filterButton}>
        <MenuIcon color={colors.accent} size="sm" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: '#EEEFF8',
    borderRadius: 8,
    height: 28,
    justifyContent: 'center',
    opacity: 0.55,
    width: 28,
  },
});
