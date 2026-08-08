import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import type { CatalogPackItem } from '../../catalog/catalog-seed';
import { catalogPackRowCoverWidth } from '../../catalog/catalog-cover-layout';
import { resolveCatalogCover } from '../../catalog/resolve-catalog-cover';
import { CatalogPackCover } from '../catalog/catalog-pack-cover';

interface MarketPackCoverProps {
  item: CatalogPackItem;
}

export function MarketPackCover(props: MarketPackCoverProps): ReactElement {
  return (
    <View style={styles.frame}>
      <CatalogPackCover
        badgeSize="xs"
        cover={resolveCatalogCover(props.item)}
        variant="market-list"
        width={catalogPackRowCoverWidth()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: '100%',
  },
});
