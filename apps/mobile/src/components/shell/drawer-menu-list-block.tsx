import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import type { DrawerMenuItem } from '../../shell/drawer-menu-config';
import { DrawerMenuRow } from './drawer-menu-row';
import { drawerCardStyle } from '../../theme/drawer-styles';
import { spacing } from '../../theme/spacing';

interface DrawerMenuListBlockProps {
  items: DrawerMenuItem[];
  onItemPress: (item: DrawerMenuItem) => void;
}

export function DrawerMenuListBlock(props: DrawerMenuListBlockProps): ReactElement {
  return (
    <View style={[styles.card, drawerCardStyle]}>
      {props.items.map((item) => (
        <DrawerMenuRow
          item={item}
          key={item.id}
          onPress={() => {
            props.onItemPress(item);
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
