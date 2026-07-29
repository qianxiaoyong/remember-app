import type { ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface MarketSecondarySidebarProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function MarketSecondarySidebar(props: MarketSecondarySidebarProps): ReactElement {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {props.options.map((option) => {
        const isActive = props.value === option;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            key={option}
            onPress={() => {
              props.onChange(option);
            }}
            style={[styles.item, isActive ? styles.itemActive : null]}
          >
            {isActive ? <View style={styles.accentBar} /> : null}
            <Text style={[styles.label, isActive ? styles.labelActive : null]}>{option}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
  item: {
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: 'relative',
  },
  itemActive: {
    backgroundColor: colors.surface,
  },
  accentBar: {
    backgroundColor: colors.accent,
    borderRadius: 2,
    bottom: spacing.sm,
    left: 0,
    position: 'absolute',
    top: spacing.sm,
    width: 3,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  labelActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
