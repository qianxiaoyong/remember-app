import { memo, useMemo, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import type { CatalogPackItem } from '../../catalog/catalog-seed';
import { catalogPackRowCoverWidth } from '../../catalog/catalog-cover-layout';
import { resolveCatalogCover } from '../../catalog/resolve-catalog-cover';
import { CatalogPackCover } from '../catalog/catalog-pack-cover';

interface MarketPackCoverProps {
  item: CatalogPackItem;
}

function marketPackCoverPropsAreEqual(
  prev: MarketPackCoverProps,
  next: MarketPackCoverProps,
): boolean {
  const prevItem = prev.item;
  const nextItem = next.item;
  return (
    prevItem.packId === nextItem.packId &&
    prevItem.coverUrl === nextItem.coverUrl &&
    prevItem.coverBadge === nextItem.coverBadge &&
    prevItem.title === nextItem.title &&
    prevItem.version === nextItem.version &&
    prevItem.secondaryCategory === nextItem.secondaryCategory &&
    prevItem.isBundledTestPack === nextItem.isBundledTestPack &&
    (prevItem.coverLines ?? []).join('\0') === (nextItem.coverLines ?? []).join('\0') &&
    prevItem.contentTags.join('\0') === nextItem.contentTags.join('\0')
  );
}

function MarketPackCoverInner(props: MarketPackCoverProps): ReactElement {
  const cover = useMemo(() => resolveCatalogCover(props.item), [props.item]);

  return (
    <View style={styles.frame}>
      <CatalogPackCover
        badgeSize="xs"
        cover={cover}
        variant="market-list"
        width={catalogPackRowCoverWidth()}
      />
    </View>
  );
}

export const MarketPackCover = memo(MarketPackCoverInner, marketPackCoverPropsAreEqual);

const styles = StyleSheet.create({
  frame: {
    height: '100%',
  },
});
