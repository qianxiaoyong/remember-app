import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CatalogPackItem } from '../../catalog/catalog-seed';
import { CATALOG_PACK_ROW_HEIGHT } from '../../catalog/catalog-cover-layout';
import { MarketPackCover } from './market-pack-cover';
import { cardShadow } from '../../theme/shadows';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface MarketPackCardProps {
  item: CatalogPackItem;
  highlighted?: boolean;
  onPress: () => void;
}

export function MarketPackCard(props: MarketPackCardProps): ReactElement {
  const { item, highlighted } = props;

  return (
    <Pressable accessibilityRole="button" onPress={props.onPress}>
      <View style={[styles.card, highlighted ? styles.highlighted : null]}>
        <MarketPackCover item={item} />
        <View style={styles.body}>
          <View style={styles.infoBlock}>
            <Text numberOfLines={2} style={styles.title}>
              {item.title}
            </Text>
            <View style={styles.tagRow}>
              {item.contentTags.slice(0, 2).map((tag) => (
                <Text key={tag} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          </View>
          <View style={styles.bottomRow}>
            <Text style={styles.count}>共 {item.cardCount} 条</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(32, 34, 40, 0.06)',
    borderRadius: spacing.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    height: CATALOG_PACK_ROW_HEIGHT,
    overflow: 'hidden',
    ...cardShadow,
  },
  highlighted: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  body: {
    flex: 1,
    height: CATALOG_PACK_ROW_HEIGHT,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  infoBlock: {
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.background,
    borderRadius: 999,
    color: colors.textSecondary,
    fontSize: 11,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  bottomRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  count: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
