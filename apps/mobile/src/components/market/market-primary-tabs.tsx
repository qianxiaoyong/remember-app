import type { ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { CatalogPrimaryCategory } from '../../catalog/catalog-seed';
import { CATALOG_PRIMARY_OPTIONS } from '../../catalog/catalog-seed';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface MarketPrimaryTabsProps {
  value: CatalogPrimaryCategory;
  onChange: (value: CatalogPrimaryCategory) => void;
  options?: { id: CatalogPrimaryCategory; label: string }[];
}

export function MarketPrimaryTabs(props: MarketPrimaryTabsProps): ReactElement {
  const tabOptions = props.options ?? CATALOG_PRIMARY_OPTIONS;
  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        contentContainerStyle={styles.row}
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
      >
        {tabOptions.map((option) => {
          const isActive = props.value === option.id;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              key={option.id}
              onPress={() => {
                props.onChange(option.id);
              }}
              style={styles.tab}
            >
              <Text style={[styles.label, isActive ? styles.labelActive : null]}>
                {option.label}
              </Text>
              {isActive ? (
                <View style={styles.underline} />
              ) : (
                <View style={styles.underlinePlaceholder} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexGrow: 0,
    flexShrink: 0,
  },
  scroll: {
    flexGrow: 0,
  },
  row: {
    alignItems: 'flex-end',
    gap: spacing.lg,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  tab: {
    alignItems: 'center',
    paddingBottom: spacing.xs,
  },
  label: {
    color: colors.tabInactive,
    fontSize: 15,
    lineHeight: 20,
  },
  labelActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  underline: {
    backgroundColor: colors.accent,
    borderRadius: 2,
    height: 3,
    marginTop: spacing.xs,
    width: 24,
  },
  underlinePlaceholder: {
    height: 3,
    marginTop: spacing.xs,
    width: 24,
  },
});
