import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CatalogPackItem } from '../../catalog/catalog-seed';
import { resolveCatalogCover } from '../../catalog/resolve-catalog-cover';
import { CoverTile } from '../catalog/cover-tile';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface MarketCatalogGridTileProps {
  item: CatalogPackItem;
  tileWidth: number;
  highlighted?: boolean;
  onPress: () => void;
}

export function MarketCatalogGridTile(props: MarketCatalogGridTileProps): ReactElement {
  const cover = resolveCatalogCover(props.item, { imageKind: 'list' });

  return (
    <Pressable
      accessibilityRole="button"
      onPress={props.onPress}
      style={[styles.root, props.highlighted ? styles.highlighted : null]}
    >
      <CoverTile source={cover.imageSource} width={props.tileWidth} />
      <View style={styles.meta}>
        <Text numberOfLines={2} style={styles.title}>
          {props.item.title}
        </Text>
        <Text style={styles.count}>共 {props.item.cardCount} 条</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.xs,
  },
  highlighted: {
    backgroundColor: colors.surface,
    borderColor: colors.accent,
    borderRadius: 10,
    borderWidth: 2,
    padding: spacing.xs,
  },
  meta: {
    gap: 2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  count: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 14,
  },
});
