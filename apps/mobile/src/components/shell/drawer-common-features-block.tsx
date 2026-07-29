import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DrawerCommonFeatureItem } from '../../shell/drawer-menu-config';
import { DrawerCommonFeatureIcon } from './drawer-common-feature-icons';
import { drawerCardStyle } from '../../theme/drawer-styles';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface DrawerCommonFeaturesBlockProps {
  items: DrawerCommonFeatureItem[];
  onItemPress: (item: DrawerCommonFeatureItem) => void;
}

export function DrawerCommonFeaturesBlock(props: DrawerCommonFeaturesBlockProps): ReactElement {
  return (
    <View style={[styles.card, drawerCardStyle]}>
      <Text style={styles.headerTitle}>常用功能</Text>
      <View style={styles.grid}>
        {props.items.map((item) => (
          <Pressable
            accessibilityRole="button"
            key={item.id}
            onPress={() => {
              props.onItemPress(item);
            }}
            style={({ pressed }) => [styles.gridItem, pressed ? styles.gridItemPressed : null]}
          >
            <View style={styles.iconWell}>
              <DrawerCommonFeatureIcon featureId={item.id} />
            </View>
            <Text style={styles.gridLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
  },
  gridItem: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
    paddingHorizontal: 2,
    paddingVertical: spacing.xs,
  },
  gridItemPressed: {
    opacity: 0.72,
  },
  iconWell: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  gridLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    width: '100%',
  },
});
