import type { ReactElement } from 'react';
import { ImageBackground, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import type { CatalogCoverPresentation } from '../../catalog/resolve-catalog-cover';
import {
  CATALOG_COVER_ASPECT_HEIGHT,
  CATALOG_COVER_ASPECT_WIDTH,
  catalogCoverHeight,
} from '../../catalog/catalog-cover-layout';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { PackCoverBadge, type PackCoverBadgeSize } from './pack-cover-badge';

export type CatalogPackCoverVariant = 'market-list' | 'plain';

/** 资料列表封面叠字区：2 行 9/12 + 上下 padding。 */
const MARKET_LIST_SCRIM_HEIGHT = spacing.xs * 2 + 12 * 2 + 1;

interface CatalogPackCoverProps {
  cover: CatalogCoverPresentation;
  variant: CatalogPackCoverVariant;
  badgeSize?: PackCoverBadgeSize;
  /** 固定宽度（详情等场景）；与 fillHeight 二选一。 */
  width?: number;
  /** 高度随父容器拉伸，宽度按 3:4 推导（资料列表卡片）。 */
  fillHeight?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function CatalogPackCover(props: CatalogPackCoverProps): ReactElement {
  const fillHeight = props.fillHeight ?? false;
  const width = props.width;
  const sizeStyle = fillHeight
    ? styles.fillHeight
    : {
        height: catalogCoverHeight(width ?? 0),
        width,
      };

  if (props.variant === 'plain') {
    return (
      <ImageBackground
        imageStyle={styles.coverImage}
        resizeMode="cover"
        source={props.cover.imageSource}
        style={[styles.cover, sizeStyle, props.style]}
      />
    );
  }

  return (
    <ImageBackground
      imageStyle={styles.coverImage}
      resizeMode="cover"
      source={props.cover.imageSource}
      style={[styles.cover, sizeStyle, props.style]}
    >
      <View style={styles.scrimTop} />
      <View style={styles.scrimBottomMarket} />
      <View style={styles.contentMarket}>
        <PackCoverBadge label={props.cover.badge} size={props.badgeSize ?? 'xs'} />
        <View style={styles.titleBlock}>
          {props.cover.lines.map((line) => (
            <Text key={line} numberOfLines={2} style={styles.titleLine}>
              {line}
            </Text>
          ))}
        </View>
      </View>
    </ImageBackground>
  );
}

/** 资料列表：封面随卡片高度拉伸，宽度保持 3:4。 */
export function catalogPackCoverFillHeightFrameStyle(): ViewStyle {
  return {
    alignSelf: 'stretch',
    aspectRatio: CATALOG_COVER_ASPECT_WIDTH / CATALOG_COVER_ASPECT_HEIGHT,
  };
}

const styles = StyleSheet.create({
  cover: {
    overflow: 'hidden',
  },
  fillHeight: {
    height: '100%',
    width: '100%',
  },
  coverImage: {
    height: '100%',
    width: '100%',
  },
  scrimTop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  scrimBottom: {
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    bottom: 0,
    height: '58%',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  scrimBottomMarket: {
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    bottom: 0,
    height: MARKET_LIST_SCRIM_HEIGHT,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  contentMarket: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.xs,
  },
  titleBlock: {
    gap: 1,
    zIndex: 1,
  },
  titleLine: {
    color: colors.surface,
    fontSize: 9,
    fontWeight: '400',
    lineHeight: 12,
  },
});
