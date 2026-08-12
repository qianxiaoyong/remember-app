import type { ReactElement, ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import {
  CATALOG_COVER_GRID_COLUMNS,
  CATALOG_COVER_GRID_GAP,
  catalogCoverGridTileWidth,
} from '../../catalog/catalog-cover-layout';

interface CoverGridProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, tileWidth: number) => ReactNode;
  /** 内容区宽度；默认整屏宽（首页）。资料页需扣除侧栏。 */
  contentWidth?: number;
  horizontalPadding?: number;
}

export function CoverGrid<T>(props: CoverGridProps<T>): ReactElement {
  const { width: windowWidth } = useWindowDimensions();
  const containerWidth = props.contentWidth ?? windowWidth;
  const horizontalPadding = props.horizontalPadding ?? 0;
  const tileWidth = catalogCoverGridTileWidth(containerWidth, {
    columns: CATALOG_COVER_GRID_COLUMNS,
    gap: CATALOG_COVER_GRID_GAP,
    horizontalPadding,
  });

  return (
    <View style={[styles.grid, { gap: CATALOG_COVER_GRID_GAP }]}>
      {props.items.map((item) => (
        <View key={props.keyExtractor(item)} style={{ width: tileWidth }}>
          {props.renderItem(item, tileWidth)}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
