import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { DrawerMenuItem } from '../../shell/drawer-menu-config';
import { DrawerMenuIcon } from './drawer-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface DrawerMenuRowProps {
  item: DrawerMenuItem;
  onPress: () => void;
}

export function DrawerMenuRow(props: DrawerMenuRowProps): ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={props.onPress}
      style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
    >
      <DrawerMenuIcon itemId={props.item.id} />
      <Text style={styles.label}>{props.item.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: spacing.touchTarget,
    paddingHorizontal: spacing.md,
  },
  rowPressed: {
    backgroundColor: colors.background,
  },
  label: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 15,
  },
});
