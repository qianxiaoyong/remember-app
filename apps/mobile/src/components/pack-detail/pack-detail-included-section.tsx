import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { IncludedHighlight } from '@remember/contracts';
import { SurfaceCard } from '../ui/surface-card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface PackDetailIncludedSectionProps {
  subtitle: string;
  highlights: IncludedHighlight[];
}

const DEFAULT_INCLUDED_ITEMS: IncludedHighlight[] = [
  {
    title: '核心词汇',
    description: '教材单词、音标、释义和真人语音',
  },
  {
    title: '配套例句',
    description: '短句理解、任意英文单词点词解析',
  },
];

export function PackDetailIncludedSection(props: PackDetailIncludedSectionProps): ReactElement {
  const items =
    props.highlights.length > 0 ? props.highlights : DEFAULT_INCLUDED_ITEMS;

  return (
    <SurfaceCard>
      <View style={styles.header}>
        <Text style={styles.title}>包含内容</Text>
        <Text numberOfLines={1} style={styles.subtitle}>
          {props.subtitle}
        </Text>
      </View>
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.title} style={styles.itemCard}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
          </View>
        ))}
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 12,
    marginLeft: spacing.md,
    textAlign: 'right',
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  itemCard: {
    backgroundColor: colors.statTileBackground,
    borderRadius: 14,
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  itemTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  itemDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
});
