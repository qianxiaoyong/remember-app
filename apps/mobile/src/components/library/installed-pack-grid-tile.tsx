import type { ReactElement } from 'react';
import type { CatalogPackItem } from '../../catalog/catalog-seed';
import { resolveCatalogItemForPack } from '../../catalog/resolve-catalog-item-for-pack';
import { resolveCatalogCover } from '../../catalog/resolve-catalog-cover';
import type { InstalledPackSummary } from '../../use-cases/get-library-overview';
import { CoverTile } from '../catalog/cover-tile';

interface InstalledPackGridTileProps {
  pack: InstalledPackSummary;
  tileWidth: number;
  onDetailPress: () => void;
  onStudyPress: () => void;
}

function resolveProgressLabel(pack: InstalledPackSummary): string {
  const progressText = `${String(pack.learnedCount)} / ${String(pack.totalCards)}`;
  if (pack.libraryPresentation === 'reader') {
    return `阅读 ${progressText}`;
  }
  return progressText;
}

export function InstalledPackGridTile(props: InstalledPackGridTileProps): ReactElement {
  const { pack, tileWidth } = props;
  const catalogItem = resolveCatalogItemForPack(pack.packId, pack.displayName);
  const cover = resolveCatalogCover(catalogItem, { imageKind: 'list' });
  const progress = pack.totalCards > 0 ? pack.learnedCount / pack.totalCards : 0;
  const showProgress = pack.totalCards > 0;

  return (
    <CoverTile
      accessibilityLabel={pack.actionLabel}
      onDetailPress={props.onDetailPress}
      onPress={props.onStudyPress}
      source={cover.imageSource}
      width={tileWidth}
      {...(showProgress
        ? {
            progress,
            progressColor: cover.color,
            progressText: resolveProgressLabel(pack),
          }
        : {})}
    />
  );
}

export function resolveInstalledPackAccent(item: CatalogPackItem): string {
  return resolveCatalogCover(item, { imageKind: 'list' }).color;
}
