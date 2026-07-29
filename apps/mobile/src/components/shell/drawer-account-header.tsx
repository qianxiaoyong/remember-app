import type { ReactElement } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import logoImage from '../../../assets/images/icon_108x108.png';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export function DrawerAccountHeader(): ReactElement {
  return (
    <View style={styles.row}>
      <Image accessibilityLabel="记得" source={logoImage} style={styles.logo} />
      <View style={styles.textBlock}>
        <Text style={styles.accountName}>监护人账号</Text>
        <Text style={styles.accountHint}>登录功能将在阶段 5 开放</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  logo: {
    borderRadius: 12,
    height: 44,
    opacity: 0.72,
    width: 44,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  accountName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  accountHint: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
});
