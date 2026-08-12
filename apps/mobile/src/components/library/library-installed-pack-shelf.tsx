import type { ReactElement } from 'react';
import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { catalogCoverHeight, catalogCoverShelfWidth } from '../../catalog/catalog-cover-layout';
import { resolveCatalogItemForPack } from '../../catalog/resolve-catalog-item-for-pack';
import { resolveCatalogCover } from '../../catalog/resolve-catalog-cover';
import type { InstalledPackSummary } from '../../use-cases/get-library-overview';
import { CoverTile } from '../catalog/cover-tile';
import { AppIcon } from '../ui/app-icon';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface LibraryInstalledPackShelfProps {
  packs: InstalledPackSummary[];
  onPackPress: (pack: InstalledPackSummary) => void;
  onDetailPress: (pack: InstalledPackSummary) => void;
}

interface ShelfNavButtonProps {
  direction: 'back' | 'forward';
  onPress: () => void;
}

function resolveProgressText(pack: InstalledPackSummary): string {
  return `${String(pack.learnedCount)} / ${String(pack.totalCards)}`;
}

function resolveProgressHint(pack: InstalledPackSummary): string | undefined {
  if (pack.statusHint === '尚未开始') {
    return undefined;
  }
  return pack.statusHint;
}

function ShelfNavButton(props: ShelfNavButtonProps): ReactElement {
  const iconName = props.direction === 'back' ? 'chevron-back' : 'chevron-forward';
  const label = props.direction === 'back' ? '上一本' : '下一本';

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={8}
      onPress={props.onPress}
      style={styles.navButton}
    >
      <AppIcon color={colors.textSecondary} name={iconName} size="md" />
    </Pressable>
  );
}

function resolvePageIndex(
  event: NativeSyntheticEvent<NativeScrollEvent>,
  pageWidth: number,
): number {
  return Math.round(event.nativeEvent.contentOffset.x / pageWidth);
}

export function LibraryInstalledPackShelf(props: LibraryInstalledPackShelfProps): ReactElement {
  const { width: windowWidth } = useWindowDimensions();
  const coverWidth = catalogCoverShelfWidth(windowWidth);
  const coverHeight = catalogCoverHeight(coverWidth);
  const pageWidth = windowWidth;
  const sideInset = Math.max(0, Math.round((pageWidth - coverWidth) / 2));
  const listRef = useRef<FlatList<InstalledPackSummary>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= props.packs.length) {
        return;
      }
      setCurrentIndex(index);
      listRef.current?.scrollToIndex({ animated: true, index });
    },
    [props.packs.length],
  );

  const handleScrollSettled = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = resolvePageIndex(event, pageWidth);
      if (index >= 0 && index < props.packs.length) {
        setCurrentIndex(index);
      }
    },
    [pageWidth, props.packs.length],
  );

  const currentPack = props.packs[currentIndex] ?? props.packs[0];
  const showPrev = currentIndex > 0;
  const showNext = currentIndex < props.packs.length - 1;

  return (
    <View style={styles.root}>
      <View style={[styles.carouselHost, { height: coverHeight, width: pageWidth }]}>
        <FlatList
          ref={listRef}
          data={props.packs}
          decelerationRate="fast"
          getItemLayout={(_, index) => ({
            index,
            length: pageWidth,
            offset: pageWidth * index,
          })}
          horizontal
          keyExtractor={(pack) => pack.packId}
          onMomentumScrollEnd={handleScrollSettled}
          onScrollEndDrag={handleScrollSettled}
          onScrollToIndexFailed={(info) => {
            listRef.current?.scrollToOffset({
              animated: true,
              offset: info.averageItemLength * info.index,
            });
          }}
          renderItem={({ item }) => {
            const catalogItem = resolveCatalogItemForPack(item.packId, item.displayName);
            const cover = resolveCatalogCover(catalogItem, { imageKind: 'detail' });
            const progress = item.totalCards > 0 ? item.learnedCount / item.totalCards : 0;
            const showProgress = item.totalCards > 0;
            const progressHint = resolveProgressHint(item);

            return (
              <View style={[styles.page, { width: pageWidth }]}>
                <CoverTile
                  align="center"
                  accessibilityLabel={item.actionLabel}
                  onDetailPress={() => {
                    props.onDetailPress(item);
                  }}
                  onPress={() => {
                    props.onPackPress(item);
                  }}
                  progressVariant="shelf"
                  source={cover.imageSource}
                  width={coverWidth}
                  {...(showProgress
                    ? {
                        progress,
                        progressColor: cover.color,
                        progressText: resolveProgressText(item),
                        ...(progressHint ? { progressHint } : {}),
                      }
                    : {})}
                />
              </View>
            );
          }}
          showsHorizontalScrollIndicator={false}
          snapToAlignment="start"
          snapToInterval={pageWidth}
          style={styles.list}
        />

        {showPrev ? (
          <View
            pointerEvents="box-none"
            style={[styles.navSlot, styles.navLeft, { width: sideInset }]}
          >
            <ShelfNavButton
              direction="back"
              onPress={() => {
                scrollToIndex(currentIndex - 1);
              }}
            />
          </View>
        ) : null}

        {showNext ? (
          <View
            pointerEvents="box-none"
            style={[styles.navSlot, styles.navRight, { width: sideInset }]}
          >
            <ShelfNavButton
              direction="forward"
              onPress={() => {
                scrollToIndex(currentIndex + 1);
              }}
            />
          </View>
        ) : null}
      </View>

      {currentPack ? (
        <Text
          ellipsizeMode="tail"
          numberOfLines={1}
          style={[styles.packTitle, { maxWidth: coverWidth }]}
        >
          {currentPack.displayName}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: spacing.md,
  },
  carouselHost: {
    position: 'relative',
  },
  list: {
    flexGrow: 0,
  },
  page: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navSlot: {
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    zIndex: 2,
  },
  navLeft: {
    alignItems: 'center',
    left: 0,
  },
  navRight: {
    alignItems: 'center',
    right: 0,
  },
  navButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  packTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },
});
