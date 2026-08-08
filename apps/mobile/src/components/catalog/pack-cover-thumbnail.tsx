import type { ReactElement } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import type { CatalogPackItem } from '../../catalog/catalog-seed';
import { CATALOG_COVER_WIDTH_HOME, catalogCoverHeight } from '../../catalog/catalog-cover-layout';
import { resolveCatalogCover } from '../../catalog/resolve-catalog-cover';

interface PackCoverThumbnailProps {
  item: CatalogPackItem;
  /** 封面宽度；高度按 3:4 推导。 */
  size?: number;
}

export function PackCoverThumbnail(props: PackCoverThumbnailProps): ReactElement {
  const width = props.size ?? CATALOG_COVER_WIDTH_HOME;
  const height = catalogCoverHeight(width);
  const cover = resolveCatalogCover(props.item);

  return (
    <ImageBackground
      imageStyle={styles.image}
      resizeMode="cover"
      source={cover.imageSource}
      style={[styles.root, { height, width }]}
    >
      <View style={styles.scrim} />
    </ImageBackground>
  );
}

export function resolvePackCoverAccent(item: CatalogPackItem): string {
  return resolveCatalogCover(item).color;
}

const styles = StyleSheet.create({
  root: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
});
