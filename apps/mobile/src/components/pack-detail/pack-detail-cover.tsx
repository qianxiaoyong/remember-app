import type { ReactElement } from 'react';
import type { CatalogCoverPresentation } from '../../catalog/resolve-catalog-cover';
import { CATALOG_COVER_WIDTH_DETAIL } from '../../catalog/catalog-cover-layout';
import { CatalogPackCover } from '../catalog/catalog-pack-cover';

interface PackDetailCoverProps {
  cover: CatalogCoverPresentation;
}

export function PackDetailCover(props: PackDetailCoverProps): ReactElement {
  return (
    <CatalogPackCover cover={props.cover} variant="plain" width={CATALOG_COVER_WIDTH_DETAIL} />
  );
}
