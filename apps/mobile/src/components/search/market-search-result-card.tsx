import type { ReactElement } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import type { CatalogPackItem } from '../../catalog/catalog-seed';
import { resolveCatalogCover } from '../../catalog/resolve-catalog-cover';
import { HighlightedText } from './highlighted-text';
import { cardShadow } from '../../theme/shadows';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface MarketSearchResultCardProps {
  item: CatalogPackItem;
  keyword: string;
  onPress: () => void;
}

export function MarketSearchResultCard(props: MarketSearchResultCardProps): ReactElement {
  const cover = resolveCatalogCover(props.item);

  return (
    <Pressable accessibilityRole="button" onPress={props.onPress} style={styles.wrap}>
      <View style={styles.card}>
        <ImageBackground
          imageStyle={styles.coverImage}
          resizeMode="cover"
          source={cover.imageSource}
          style={styles.cover}
        >
          <View style={styles.scrim} />
          <Text style={styles.badge}>{cover.badge}</Text>
        </ImageBackground>
        <View style={styles.body}>
          <HighlightedText
            keyword={props.keyword}
            numberOfLines={2}
            style={styles.title}
            text={props.item.title}
          />
          <Text numberOfLines={1} style={styles.meta}>
            {props.item.updatedAt.replace(/-/g, '/')} · {props.item.cardCount} 条
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexGrow: 0,
    width: '48%',
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(32, 34, 40, 0.05)',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...cardShadow,
  },
  cover: {
    height: 96,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  coverImage: {
    height: '100%',
    width: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  badge: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '700',
    padding: spacing.sm,
    zIndex: 1,
  },
  body: {
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
});
